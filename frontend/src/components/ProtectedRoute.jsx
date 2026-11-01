import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useQuizStore from '../context/quizStore';
import { quizStorage } from '../utils/quizStorage';

/**
 * Enhanced ProtectedRoute & Navigation Guard:
 * - Duplicate Attempt Block: Reroutes submitted candidates to /already-submitted
 * - Forward-Only Lockdown: Blocks backward access to login & personal details during active quiz
 * - User-scoped authentication & prerequisite validation
 */
const ProtectedRoute = ({
  children,
  requireAuth = true,
  blockIfActive = false,
  blockIfSubmitted = true,
  requirePersonalDetails = false
}) => {
  const location = useLocation();
  const user = useQuizStore((state) => state.user);
  const isAuthenticated = useQuizStore((state) => state.isAuthenticated);
  const personalDetails = useQuizStore((state) => state.personalDetails);
  const isQuizSubmitted = useQuizStore((state) => state.isQuizSubmitted);

  const storedUser = quizStorage.getStoredUser();
  const currentUser = user || storedUser;

  const isUserAuthenticated = isAuthenticated || Boolean(currentUser);
  const isSubmittedState = isQuizSubmitted || (currentUser ? quizStorage.isUserSubmitted(currentUser) : false);
  const activeQuiz = currentUser ? quizStorage.isQuizActive(currentUser) : false;

  // 1. Duplicate Attempt Block
  if (blockIfSubmitted && isSubmittedState) {
    if (location.pathname !== '/already-submitted') {
      return <Navigate to="/already-submitted" replace />;
    }
  }

  // 2. Authentication Guard
  if (requireAuth && !isUserAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Forward-Only Lockdown:
  // If user has transitioned to active examination, block backward access to login or personal details
  if (blockIfActive && isUserAuthenticated && activeQuiz && !isSubmittedState) {
    return <Navigate to="/quiz" replace />;
  }

  // 4. Prerequisite Check for Quiz/Submission
  if (requirePersonalDetails) {
    const hasDetails = Boolean(
      personalDetails || (currentUser && quizStorage.getStoredPersonalDetails(currentUser))
    );
    if (!hasDetails) {
      return <Navigate to="/personal-details" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
