import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import useQuizStore from '../context/quizStore';
import { quizStorage } from '../utils/quizStorage';
import institutionLogo from '../assets/logo.png';
import { detectAllowedStudent, performClearStorageAndLogin } from '../utils/studentReset';

const AlreadySubmitted = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useQuizStore((state) => state.user);
  const currentUser = user || quizStorage.getStoredUser();
  const logout = useQuizStore((state) => state.logout);

  // Multi-tier resilient data resolution:
  // 1. Navigation state
  // 2. Scoped submission result
  // 3. Persistent ledger record / last active submission
  const storedResult =
    location.state?.submissionResult ||
    quizStorage.getStoredSubmissionResult(currentUser) ||
    quizStorage.getLastActiveSubmission();

  const candidateName =
    storedResult?.candidateName ||
    storedResult?.name ||
    currentUser?.name ||
    'Registered Candidate';

  const candidateEmail =
    storedResult?.email ||
    currentUser?.email ||
    '';

  const subjectName =
    storedResult?.subject ||
    currentUser?.subject ||
    'Online Examination';

  const attendedCount = storedResult?.attendedCount;
  const totalQuestions = storedResult?.totalQuestions;
  const submittedAt = storedResult?.submittedAt
    ? new Date(storedResult.submittedAt).toLocaleString()
    : 'Verified & Recorded in System';

  // Check if candidate is authorized for reset & re-examination
  const authorizedStudent = detectAllowedStudent({
    user: currentUser,
    submissionResult: storedResult
  });

  const handleDifferentExamLogin = () => {
    // Preserve the current submission result so returning or reloading retains data
    if (storedResult) {
      quizStorage.setLastActiveSubmission(storedResult);
    }
    logout();
    navigate('/login', { replace: true });
  };

  const handleAuthorizedClearStorage = async () => {
    const studentName = authorizedStudent?.displayName || authorizedStudent?.name || candidateName;
    const confirmed = window.confirm(
      `Clear local storage and log in again for ${studentName}?\n\nThis will remove your previous examination records and allow you to take the exam again.`
    );
    if (!confirmed) return;
    await performClearStorageAndLogin(authorizedStudent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-slate-800 to-primary flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4 p-2 shadow-inner border border-gray-200">
              <img
                src={institutionLogo}
                alt="Institution Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 mb-3">
              <span>🔒</span> Duplicate Attempt Restricted
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-primary mb-2">
              Exam Submitted
            </h1>
            <p className="text-danger font-semibold text-xs md:text-sm bg-red-50 p-2.5 rounded-lg border border-red-200">
              This exam has been submitted using these credentials. Please log in with credentials for a different exam.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-medium">Candidate Name:</span>
              <span className="font-semibold text-primary">{candidateName}</span>
            </div>

            {candidateEmail && (
              <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Email / ID:</span>
                <span className="font-semibold text-gray-800">{candidateEmail}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-medium">Subject / Course:</span>
              <span className="font-semibold text-secondary">{subjectName}</span>
            </div>

            {attendedCount !== undefined && totalQuestions !== undefined && (
              <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Questions Attended:</span>
                <span className="font-bold text-success">
                  {attendedCount} / {totalQuestions}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Submission Record:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <span>✓</span> Verified &amp; Recorded
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
              <span>Recorded At:</span>
              <span>{submittedAt}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDifferentExamLogin}
              className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>Log in with Credentials for a Different Exam</span>
              <span>→</span>
            </button>

            {authorizedStudent && (
              <button
                type="button"
                onClick={handleAuthorizedClearStorage}
                className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold py-3.5 px-4 rounded-xl transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                <span>🔄 Clear Local Storage &amp; Login Again ({authorizedStudent.displayName || authorizedStudent.name})</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AlreadySubmitted;
