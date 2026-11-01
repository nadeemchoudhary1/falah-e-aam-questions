import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import useQuizStore from '../context/quizStore';
import { quizAPI } from '../utils/api';
import { quizStorage } from '../utils/quizStorage';

const Submission = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useQuizStore((state) => state.user);
  const currentUser = user || quizStorage.getStoredUser();

  const storeQuestionSet = useQuizStore((state) => state.questionSet);
  const storeAnswers = useQuizStore((state) => state.answers);
  const storePersonalDetails = useQuizStore((state) => state.personalDetails);
  const setQuizSubmitted = useQuizStore((state) => state.setQuizSubmitted);
  const setSubmissionLoading = useQuizStore((state) => state.setSubmissionLoading);
  const clearActiveUserExamSession = useQuizStore((state) => state.clearActiveUserExamSession);
  const logout = useQuizStore((state) => state.logout);

  // Restore from navigation state or scoped localStorage fallback
  const locationState = location.state || {};
  const answers = locationState.answers || storeAnswers || (currentUser ? quizStorage.getStoredAnswers(currentUser) : {});
  const questionSet = storeQuestionSet || (currentUser ? quizStorage.getStoredQuestionSet(currentUser) : null);
  const personalDetails = locationState.personalDetails || storePersonalDetails || (currentUser ? quizStorage.getStoredPersonalDetails(currentUser) : null);

  // Submission lifecycle states: 'idle' | 'submitting' | 'retrying' | 'failed' | 'success'
  const [submissionStatus, setSubmissionStatus] = useState('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [summaryMetrics, setSummaryMetrics] = useState(() => (currentUser ? quizStorage.getStoredSubmissionResult(currentUser) : null));

  // Duplicate Attempt check via ledger
  useEffect(() => {
    if (currentUser && quizStorage.isUserSubmitted(currentUser) && submissionStatus !== 'success') {
      navigate('/already-submitted', { replace: true });
    }
  }, [currentUser, navigate, submissionStatus]);

  // Hardware Back-button guard on submission review page
  useEffect(() => {
    if (submissionStatus !== 'success') {
      window.history.pushState({ page: 'review-submission' }, '', window.location.href);

      const handlePopState = () => {
        window.history.pushState({ page: 'review-submission' }, '', window.location.href);
      };

      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'Submission is pending. Leaving or reloading may delay your submission.';
        return e.returnValue;
      };

      window.addEventListener('popstate', handlePopState);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [submissionStatus]);

  if (!questionSet || !personalDetails || !answers || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-secondary text-white p-4">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold">Loading Review Data...</h2>
        <p className="text-sm text-gray-200 mt-1">Preserving your session state</p>
      </div>
    );
  }

  // Format payload and compute dynamic metrics
  const answerArray = questionSet.questions.map((question) => ({
    questionId: question.id,
    question: question.question,
    selectedAnswer: answers[question.id] || null
  }));

  const attendedCount = answerArray.filter(
    (a) => a.selectedAnswer !== null && a.selectedAnswer !== undefined && a.selectedAnswer !== ''
  ).length;
  const totalQuestions = questionSet.questions.length;

  const buildSubmissionPayload = () => {
    return {
      userId: currentUser.id,
      password: currentUser.password,
      questionSetId: currentUser.questionSet,
      answers: answerArray,
      personalDetails: {
        fullName: personalDetails.fullName,
        phoneNumber: personalDetails.phoneNumber,
        courseName: personalDetails.courseName,
        address: personalDetails.address,
        email: currentUser.email,
        subject: questionSet.subject
      }
    };
  };

  const handleFinalSubmit = async (isRetry = false) => {
    setSubmissionStatus(isRetry ? 'retrying' : 'submitting');
    setSubmissionLoading(true);
    setErrorMessage('');

    const payload = buildSubmissionPayload();

    // Cache payload locally under scoped key to prevent data loss on network failure
    quizStorage.cacheSubmissionPayload(payload, currentUser);

    try {
      const response = await quizAPI.submitQuiz(payload);

      // Verify HTTP 200 or 201 response status
      if ((response.status === 200 || response.status === 201) && response.data?.success) {
        onSubmissionSuccess(response.data);
      } else {
        throw new Error(response.data?.message || 'Server returned an invalid status code.');
      }
    } catch (err) {
      console.error('Final Submission Error:', err);

      // If user is already marked submitted on backend
      if (err.response?.status === 409) {
        onSubmissionSuccess({ alreadySubmitted: true });
        return;
      }

      // Optimistic UI & failure resilience:
      // Do NOT wipe UI state or local storage!
      setRetryCount((prev) => prev + 1);
      setSubmissionStatus('failed');
      const errText =
        err.response?.data?.message ||
        err.message ||
        'Submission failed due to a network issue or server timeout. Your answers remain safely saved.';
      setErrorMessage(errText);
    } finally {
      setSubmissionLoading(false);
    }
  };

  const onSubmissionSuccess = (apiResponse) => {
    const summary = {
      attendedCount,
      totalQuestions,
      submittedAt: new Date().toISOString(),
      subject: questionSet.subject,
      candidateName: personalDetails.fullName,
      email: currentUser.email,
      apiMessage: apiResponse?.message
    };

    // 1. Post-Submission Selective Cleanup:
    // Wipe active heavy data keys (progress, timer, questions, selections) for this user to free storage
    clearActiveUserExamSession();

    // 2. Persistent Submission History Ledger:
    // Record user in minimal ledger to block future duplicate attempts via pre-flight check
    quizStorage.recordExamSubmissionInLedger(currentUser, summary);

    setQuizSubmitted(true, summary);
    setSummaryMetrics(summary);
    setSubmissionStatus('success');
  };

  const handleFinishAndExit = () => {
    if (summaryMetrics) {
      quizStorage.setLastActiveSubmission(summaryMetrics);
    }
    logout();
    navigate('/login', { replace: true });
  };

  // SUCCESS CONFIRMATION VIEW
  if (submissionStatus === 'success') {
    const finalAttended = summaryMetrics?.attendedCount ?? attendedCount;
    const finalTotal = summaryMetrics?.totalQuestions ?? totalQuestions;

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-700 via-primary to-slate-900 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
            <motion.div
              className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner text-4xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              🎉
            </motion.div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-primary mb-2">
              Quiz Submitted Successfully!
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Your examination responses have been securely verified and submitted.
            </p>

            {/* Dynamic Summary Metrics Confirmation Box */}
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-5 mb-6 text-center">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1">
                ATTENDANCE CONFIRMATION
              </p>
              <h2 className="text-xl md:text-2xl font-black text-emerald-900">
                You have successfully attended {finalAttended} out of {finalTotal} total questions.
              </h2>
            </div>

            {/* Metrics Breakdown Details */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-2.5 text-left text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Candidate:</span>
                <span className="font-semibold text-gray-800">{personalDetails.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Subject:</span>
                <span className="font-semibold text-secondary">{questionSet.subject}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Total Questions:</span>
                <span className="font-bold text-gray-800">{finalTotal}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Questions Attended:</span>
                <span className="font-bold text-success">{finalAttended}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Questions Unanswered:</span>
                <span className="font-bold text-gray-500">{finalTotal - finalAttended}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 pt-1">
                <span>Submitted At:</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <button
              onClick={handleFinishAndExit}
              className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition duration-300 shadow-lg hover:shadow-xl"
            >
              Exit Portal / Take Another Exam
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // REVIEW & SUBMISSION VIEW
  const isSubmitting = submissionStatus === 'submitting' || submissionStatus === 'retrying';

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-12">
      <div className="max-w-3xl mx-auto pt-6">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6 border border-gray-200"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-gray-200 gap-4">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                FINAL SUBMISSION REVIEW
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-primary">
                Review Your Answers
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Subject: <span className="font-semibold text-gray-700">{questionSet.subject}</span>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-right">
              <p className="text-xs text-gray-500 font-semibold uppercase">Questions Answered</p>
              <p className="text-2xl font-black text-secondary">
                {attendedCount} <span className="text-sm font-normal text-gray-500">/ {totalQuestions}</span>
              </p>
            </div>
          </div>

          {/* Failure Alert with Prominent Retry Action */}
          {submissionStatus === 'failed' && (
            <motion.div
              className="p-5 bg-red-50 border-2 border-red-400 rounded-xl mb-6 shadow-sm"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 text-base mb-1">
                    Submission Attempt Failed
                  </h3>
                  <p className="text-red-700 text-sm mb-3">
                    {errorMessage}
                  </p>
                  <p className="text-xs text-red-800 font-medium bg-red-100 p-2 rounded-lg mb-4">
                    🛡️ <strong>Data Protected:</strong> Your responses are safely cached locally. No answers have been lost. Click the retry button below to re-attempt transmission.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleFinalSubmit(true)}
                      disabled={isSubmitting}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition shadow flex items-center gap-2"
                    >
                      <span>🔄 Retry Submission</span>
                      {retryCount > 0 && <span className="text-xs opacity-80">(Attempt {retryCount + 1})</span>}
                    </button>
                    <button
                      onClick={() => navigate('/quiz')}
                      disabled={isSubmitting}
                      className="bg-white border border-red-300 text-red-700 hover:bg-red-50 font-semibold py-2.5 px-4 rounded-lg text-sm transition"
                    >
                      Back to Quiz
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Review Question List */}
          <div className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto pr-2">
            {questionSet.questions.map((question, index) => {
              const answer = answers[question.id];
              const isAnswered = answer !== undefined && answer !== null && answer !== '';

              return (
                <div
                  key={question.id}
                  className={`border-l-4 rounded-r-xl p-4 transition ${
                    isAnswered
                      ? 'border-emerald-500 bg-emerald-50/40'
                      : 'border-amber-400 bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-bold text-primary text-sm md:text-base">
                      Q{index + 1}: {question.question}
                    </p>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isAnswered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isAnswered ? 'Answered' : 'Unanswered'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong className="text-gray-500">Your Selection:</strong>{' '}
                    <span className={isAnswered ? 'font-semibold text-gray-900' : 'italic text-gray-400'}>
                      {answer || 'None (Question skipped)'}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate('/quiz')}
              disabled={isSubmitting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-primary font-bold py-3.5 rounded-xl border border-gray-300 transition text-sm flex items-center justify-center gap-2"
            >
              <span>← Back to Questions</span>
            </button>

            <button
              onClick={() => handleFinalSubmit(false)}
              disabled={isSubmitting}
              className="flex-1 bg-success hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Examination...</span>
                </>
              ) : (
                <>
                  <span>Confirm Final Submission</span>
                  <span>({attendedCount}/{totalQuestions})</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Submission;
