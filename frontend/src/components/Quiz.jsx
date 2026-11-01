import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useQuizStore from '../context/quizStore';
import { formatTime } from '../utils/helpers';
import { quizStorage } from '../utils/quizStorage';
import { quizAPI } from '../utils/api';

const Timer = ({ timeRemaining }) => {
  const setShowTimerWarning = useQuizStore((state) => state.setShowTimerWarning);
  const showWarning = timeRemaining <= 300; // 5 minutes
  const isCritical = timeRemaining <= 60; // 1 minute

  useEffect(() => {
    setShowTimerWarning(showWarning);
  }, [showWarning, setShowTimerWarning]);

  return (
    <div
      className={`w-28 shrink-0 p-3 rounded-lg text-center transition-colors duration-300 shadow-md ${
        isCritical
          ? 'bg-danger text-white animate-pulse'
          : showWarning
          ? 'bg-warning text-white'
          : 'bg-light text-primary'
      }`}
    >
      <p className="text-[10px] md:text-xs font-semibold mb-1 leading-tight tracking-wider">
        TIME REMAINING
      </p>
      <p className="text-xl md:text-2xl font-black leading-none font-mono">
        {formatTime(timeRemaining)}
      </p>
      {showWarning && (
        <p className="text-[10px] font-bold mt-1 leading-tight">
          {isCritical ? '⚠️ FINAL MINUTE' : '⏰ 5m REMAINING'}
        </p>
      )}
    </div>
  );
};

const Quiz = () => {
  const navigate = useNavigate();
  const user = useQuizStore((state) => state.user);
  const currentUser = user || quizStorage.getStoredUser();

  const storeQuestionSet = useQuizStore((state) => state.questionSet);
  const storeCurrentQuestion = useQuizStore((state) => state.currentQuestion);
  const storeAnswers = useQuizStore((state) => state.answers);
  const storePersonalDetails = useQuizStore((state) => state.personalDetails);

  const setCurrentQuestion = useQuizStore((state) => state.setCurrentQuestion);
  const setAnswer = useQuizStore((state) => state.setAnswer);
  const setQuestionSet = useQuizStore((state) => state.setQuestionSet);
  const setTimeRemaining = useQuizStore((state) => state.setTimeRemaining);

  // Scoped hydration from localStorage using active User ID
  const questionSet = storeQuestionSet || (currentUser ? quizStorage.getStoredQuestionSet(currentUser) : null);
  const personalDetails = storePersonalDetails || (currentUser ? quizStorage.getStoredPersonalDetails(currentUser) : null);
  const answers = useMemo(() => {
    if (storeAnswers && Object.keys(storeAnswers).length > 0) return storeAnswers;
    return currentUser ? quizStorage.getStoredAnswers(currentUser) : {};
  }, [storeAnswers, currentUser]);
  const currentQuestion = storeCurrentQuestion ?? (currentUser ? quizStorage.getStoredCurrentQuestion(currentUser) : 0);

  // Scoped throttle-optimized timer (user123_timer)
  // On reload, resumes from the last saved 60-second block (max error: 1 minute)
  const initialTimer = currentUser ? quizStorage.getStoredTimer(70 * 60, currentUser) : 70 * 60;
  const [localTime, setLocalTime] = useState(initialTimer);
  const lastSavedTimerRef = useRef(initialTimer);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showBackWarning, setShowBackWarning] = useState(false);
  const hasAutoSubmitted = useRef(false);

  // 1. Duplicate Attempt Block on Quiz View
  useEffect(() => {
    if (currentUser && quizStorage.isUserSubmitted(currentUser)) {
      navigate('/already-submitted', { replace: true });
    }
  }, [currentUser, navigate]);

  // 2. Hardware Back-Button Guard & BeforeUnload Guard
  useEffect(() => {
    // Push state into browser history to trap hardware/browser back clicks
    window.history.pushState({ page: 'active-quiz' }, '', window.location.href);

    const handlePopState = () => {
      // Re-push history immediately to keep user on quiz
      window.history.pushState({ page: 'active-quiz' }, '', window.location.href);
      setShowBackWarning(true);
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Examination is active. Reloading or navigating away may disrupt your exam session.';
      return e.returnValue;
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 3. Fallback QuestionSet Fetcher (scoped to user)
  useEffect(() => {
    if (!questionSet && currentUser?.questionSet) {
      quizAPI.getQuestions(currentUser.questionSet)
        .then((res) => {
          if (res.data.success) {
            setQuestionSet(res.data.questions);
            quizStorage.saveQuestionSet(res.data.questions, currentUser);
          }
        })
        .catch((err) => console.error('Error fetching questions:', err));
    }
  }, [questionSet, currentUser, setQuestionSet]);

  // 4. Throttle-Optimized Countdown Timer (scoped to user123_timer)
  useEffect(() => {
    if (!currentUser) return;

    // Ensure initial timer block is saved if missing for this user
    const existing = quizStorage.getStoredTimer(null, currentUser);
    if (existing === null) {
      quizStorage.saveTimerSync(initialTimer, currentUser);
      lastSavedTimerRef.current = initialTimer;
    }

    const timer = setInterval(() => {
      setLocalTime((prev) => {
        const nextTime = Math.max(prev - 1, 0);

        // Throttle-optimized sync: update user-scoped timer exactly once every 60s or at 0
        if (lastSavedTimerRef.current - nextTime >= 60 || nextTime === 0) {
          quizStorage.saveTimerSync(nextTime, currentUser);
          lastSavedTimerRef.current = nextTime;
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser, initialTimer]);

  // 5. Keep Zustand store synchronized with local time & handle timeout auto-submit
  useEffect(() => {
    setTimeRemaining(localTime);

    if (localTime <= 0 && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      if (currentUser) {
        quizStorage.saveTimerSync(0, currentUser);
      }
      alert('Time is up! Your examination has reached the time limit and will be auto-submitted.');
      navigate('/submission', { state: { answers, personalDetails } });
    }
  }, [localTime, setTimeRemaining, navigate, answers, personalDetails, currentUser]);

  // Answer Selection with Real-Time User-Scoped Persistence
  const handleAnswerSelect = (option) => {
    if (!questionSet?.questions?.[currentQuestion]) return;
    const question = questionSet.questions[currentQuestion];

    // Updates store and synchronously updates user-scoped localStorage
    setAnswer(question.id, option);
  };

  const handleNext = () => {
    if (questionSet && currentQuestion < questionSet.questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      if (currentUser) {
        quizStorage.saveCurrentQuestion(nextIndex, currentUser);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const prevIndex = currentQuestion - 1;
      setCurrentQuestion(prevIndex);
      if (currentUser) {
        quizStorage.saveCurrentQuestion(prevIndex, currentUser);
      }
    }
  };

  const handleSelectQuestion = (index) => {
    setCurrentQuestion(index);
    if (currentUser) {
      quizStorage.saveCurrentQuestion(index, currentUser);
    }
  };

  const handleProceedToReview = () => {
    navigate('/submission', { state: { answers, personalDetails } });
  };

  // Prevent blank loading cycle by checking cached state
  if (!questionSet || !personalDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-secondary text-white p-4">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold">Restoring Examination Session...</h2>
        <p className="text-sm text-gray-200 mt-2">Retrieving your questions and saved progress</p>
      </div>
    );
  }

  const question = questionSet.questions[currentQuestion] || questionSet.questions[0];
  const selectedAnswer = answers[question.id];
  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = questionSet.questions.length;

  return (
    <div className="min-h-screen bg-slate-100 pb-8">
      {/* Sticky Top Header */}
      <div className="fixed top-0 left-0 right-0 bg-primary text-white shadow-lg z-40 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary text-white uppercase tracking-wider">
                  Active Exam
                </span>
                <span className="text-xs text-gray-300 font-medium truncate">
                  Candidate: {personalDetails.fullName}
                </span>
              </div>
              <h2 className="font-bold text-base md:text-lg leading-snug truncate">
                {questionSet.subject}
              </h2>
              <p className="text-xs text-gray-300">
                Question {currentQuestion + 1} of {totalQuestions}
              </p>
            </div>
            <Timer timeRemaining={localTime} />
          </div>

          {/* Progress Bar */}
          <div className="mt-3 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 pt-36 md:pt-32">
        {/* Question Card */}
        <motion.div
          className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentQuestion}
          transition={{ duration: 0.2 }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Question {currentQuestion + 1}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                selectedAnswer ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {selectedAnswer ? '✓ Answered' : 'Not Yet Answered'}
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-primary mb-6 leading-relaxed">
            {question.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-150 flex items-center justify-between ${
                    isSelected
                      ? 'border-secondary bg-secondary/10 text-primary shadow-sm'
                      : 'border-gray-200 hover:border-secondary/60 hover:bg-slate-50 text-gray-800'
                  }`}
                >
                  <div className="flex items-center min-w-0 pr-3">
                    <div
                      className={`w-6 h-6 shrink-0 rounded-full border-2 mr-3 flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? 'bg-secondary border-secondary text-white'
                          : 'border-gray-300 text-gray-400'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-sm md:text-base font-medium break-words leading-snug">
                      {option}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="text-secondary font-bold text-lg shrink-0">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Previous / Next / Review Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-primary font-bold py-3 rounded-xl border border-gray-300 transition shadow-sm"
          >
            ← Previous
          </button>

          {currentQuestion === totalQuestions - 1 ? (
            <button
              onClick={() => setShowSubmitDialog(true)}
              className="flex-1 bg-success hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition shadow-md"
            >
              Review & Submit ({answeredQuestions}/{totalQuestions})
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 bg-secondary hover:bg-primary text-white font-bold py-3 rounded-xl transition shadow-md"
            >
              Next →
            </button>
          )}
        </div>

        {/* Quick Question Navigator Palette */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Question Navigator
            </h4>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" /> Answered
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" /> Pending
              </span>
            </div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {questionSet.questions.map((q, index) => {
              const isCurrent = index === currentQuestion;
              const hasAnswered = answers[q.id] !== undefined;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectQuestion(index)}
                  className={`aspect-square rounded-lg font-bold text-xs md:text-sm transition-all duration-150 flex items-center justify-center border ${
                    isCurrent
                      ? 'bg-secondary text-white border-secondary ring-2 ring-secondary/30 scale-105'
                      : hasAnswered
                      ? 'bg-success text-white border-success hover:bg-emerald-600'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Attended:{' '}
            <span className="font-extrabold text-secondary">{answeredQuestions}</span> of{' '}
            <span className="font-bold text-gray-800">{totalQuestions}</span> questions
          </p>
          <button
            onClick={() => setShowSubmitDialog(true)}
            className="text-xs font-bold text-secondary hover:text-primary underline"
          >
            Go to Final Submission
          </button>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-success flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-primary text-center mb-2">Proceed to Submission?</h3>
            <p className="text-gray-600 text-center text-sm mb-4">
              You have answered <strong>{answeredQuestions} out of {totalQuestions}</strong> questions.
            </p>

            {answeredQuestions < totalQuestions && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs mb-4">
                ⚠️ You have <strong>{totalQuestions - answeredQuestions} unanswered questions</strong>. You can still return to answer them.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitDialog(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl transition text-sm"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleProceedToReview}
                className="flex-1 bg-success hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition text-sm shadow-md"
              >
                Review Answers →
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hardware Back Button Interception Warning Modal */}
      {showBackWarning && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-200 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Backward Navigation Locked</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Browser back-button navigation and swipe gestures are disabled during an active examination. Your progress and remaining time are securely preserved.
            </p>
            <button
              onClick={() => setShowBackWarning(false)}
              className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition duration-200 shadow-md"
            >
              Resume Examination
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
