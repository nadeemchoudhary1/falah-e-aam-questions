import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import useQuizStore from '../context/quizStore';
import { detectAllowedStudent, performClearStorageAndLogin } from '../utils/studentReset';

/**
 * Top-Right Button for Clearing Local Storage and Re-logging in.
 * STRICTLY restricted to authorized students:
 * 1. Sifatullah
 * 2. Altamash
 * 3. Farheen
 * 4. Saqiba
 * 5. Khan Mohd
 */
const ClearStorageButton = () => {
  const location = useLocation();
  const user = useQuizStore((state) => state.user);
  const loginInputEmail = useQuizStore((state) => state.loginInputEmail);
  const isQuizSubmitted = useQuizStore((state) => state.isQuizSubmitted);

  const [matchedStudent, setMatchedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Re-evaluate authorization on route change, user change, or typing in login
  useEffect(() => {
    const student = detectAllowedStudent({
      user,
      inputIdentifier: loginInputEmail,
      submissionResult: location.state?.submissionResult
    });
    setMatchedStudent(student);
  }, [location, user, loginInputEmail, isQuizSubmitted]);

  // Periodic poll to detect local storage changes in background or across tabs
  useEffect(() => {
    const interval = setInterval(() => {
      const student = detectAllowedStudent({
        user,
        inputIdentifier: loginInputEmail,
        submissionResult: location.state?.submissionResult
      });
      setMatchedStudent(student);
    }, 1500);

    return () => clearInterval(interval);
  }, [user, loginInputEmail, location]);

  // Do not render anything if current context does not match an authorized student
  if (!matchedStudent) {
    return null;
  }

  const isQuizPage = location.pathname === '/quiz';
  const positionClasses = isQuizPage
    ? 'fixed top-24 right-4 z-30 sm:top-20 sm:right-6'
    : 'fixed top-4 right-4 z-50';

  const handleClear = async () => {
    const studentName = matchedStudent.displayName || matchedStudent.name;
    const confirmed = window.confirm(
      `Clear local storage and log in again for ${studentName}?\n\nThis will clear all local examination session data, timer, answers, and duplicate attempt blocks, and redirect you to login.`
    );

    if (!confirmed) return;

    setLoading(true);
    await performClearStorageAndLogin(matchedStudent);
  };

  return (
    <AnimatePresence>
      <div className={`${positionClasses} pointer-events-auto`}>
        <motion.button
          type="button"
          onClick={handleClear}
          disabled={loading}
          initial={{ opacity: 0, scale: 0.85, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -12 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-bold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-2xl border-2 border-white/80 text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all duration-200"
          title={`Clear Local Storage and Login Again (${matchedStudent.name})`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Resetting Storage...</span>
            </>
          ) : (
            <>
              <span className="text-base sm:text-lg">🔄</span>
              <span className="font-bold tracking-tight">Clear Local Storage &amp; Login Again</span>
              <span className="hidden sm:inline-block bg-black/25 text-white/95 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-white/20">
                {matchedStudent.displayName || matchedStudent.name}
              </span>
            </>
          )}
        </motion.button>
      </div>
    </AnimatePresence>
  );
};

export default ClearStorageButton;
