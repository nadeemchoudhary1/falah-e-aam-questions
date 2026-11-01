import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useQuizStore from './context/quizStore';
import Splash from './components/Splash';
import Login from './components/Login';
import PersonalDetailsForm from './components/PersonalDetailsForm';
import Quiz from './components/Quiz';
import Submission from './components/Submission';
import AlreadySubmitted from './components/AlreadySubmitted';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/index.css';

function App() {
  const hydrateFromStorage = useQuizStore((state) => state.hydrateFromStorage);

  useEffect(() => {
    // Hydrate store from localStorage on application mount
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />

        {/* Public login route guarded from active exam & duplicate attempts */}
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false} blockIfActive={true} blockIfSubmitted={true}>
              <Login />
            </ProtectedRoute>
          }
        />

        {/* Personal details guarded against active examination backward navigation */}
        <Route
          path="/personal-details"
          element={
            <ProtectedRoute requireAuth={true} blockIfActive={true} blockIfSubmitted={true}>
              <PersonalDetailsForm />
            </ProtectedRoute>
          }
        />

        {/* Active Quiz route */}
        <Route
          path="/quiz"
          element={
            <ProtectedRoute
              requireAuth={true}
              blockIfActive={false}
              blockIfSubmitted={true}
              requirePersonalDetails={true}
            >
              <Quiz />
            </ProtectedRoute>
          }
        />

        {/* Submission route */}
        <Route
          path="/submission"
          element={
            <ProtectedRoute
              requireAuth={true}
              blockIfActive={false}
              blockIfSubmitted={true}
              requirePersonalDetails={true}
            >
              <Submission />
            </ProtectedRoute>
          }
        />

        {/* Landing page for duplicate attempt restriction */}
        <Route path="/already-submitted" element={<AlreadySubmitted />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
