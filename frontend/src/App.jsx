import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useQuizStore from './context/quizStore';
import Splash from './components/Splash';
import Login from './components/Login';
import PersonalDetailsForm from './components/PersonalDetailsForm';
import Quiz from './components/Quiz';
import Submission from './components/Submission';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/index.css';

function App() {
  const user = useQuizStore((state) => state.user);
  const setUser = useQuizStore((state) => state.setUser);

  useEffect(() => {
    // Restore user from localStorage on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser && !user) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error restoring user:', error);
        localStorage.removeItem('user');
      }
    }

    // Prevent unauthorized page refresh
    const handleBeforeUnload = (e) => {
      if (user) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, setUser]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/personal-details"
          element={
            <ProtectedRoute>
              <PersonalDetailsForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submission"
          element={
            <ProtectedRoute>
              <Submission />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
