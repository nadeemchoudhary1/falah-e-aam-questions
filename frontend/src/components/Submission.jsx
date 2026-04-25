import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import useQuizStore from '../context/quizStore';
import { quizAPI } from '../utils/api';

const Submission = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useQuizStore((state) => state.user);
  const questionSet = useQuizStore((state) => state.questionSet);
  const setQuizSubmitted = useQuizStore((state) => state.setQuizSubmitted);
  const setSubmissionLoading = useQuizStore((state) => state.setSubmissionLoading);
  const logout = useQuizStore((state) => state.logout);

  const { answers, personalDetails } = location.state || {};

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setSubmissionLoading(true);

    try {
      const answerArray = questionSet.questions.map((question) => ({
        questionId: question.id,
        question: question.question,
        selectedAnswer: answers[question.id] || null
      }));

      const submissionData = {
        userId: user.id,
        questionSetId: user.questionSet,
        answers: answerArray,
        personalDetails: {
          fullName: personalDetails.fullName,
          phoneNumber: personalDetails.phoneNumber,
          courseName: personalDetails.courseName,
          age: personalDetails.age,
          address: personalDetails.address,
          email: user.email,
          subject: questionSet.subject
        }
      };

      const response = await quizAPI.submitQuiz(submissionData);
      
      if (response.data.success) {
        setQuizSubmitted(true);
        setSubmitted(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting quiz. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
      setSubmissionLoading(false);
    }
  };

  const handleBackToLogin = () => {
    logout();
    localStorage.removeItem('user');
    localStorage.removeItem('personalDetails');
    navigate('/login');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success to-primary flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <motion.div
              className="mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <span className="text-6xl">🎉</span>
            </motion.div>

            <h1 className="text-3xl font-bold text-primary mb-2">Quiz Submitted!</h1>
            <p className="text-gray-600 mb-8">Your submission has been received</p>

            <p className="text-gray-600 mb-8">
              Your answers have been sent for admin review.
            </p>

            <button
              onClick={handleBackToLogin}
              className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95"
            >
              Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!questionSet || !personalDetails || !answers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-primary mb-6">Review Your Answers</h1>

          <div className="space-y-4 mb-8">
            {questionSet.questions.map((question, index) => (
              <div key={question.id} className="border-l-4 border-secondary pl-4 py-2">
                <p className="font-bold text-primary mb-2">Q{index + 1}: {question.question}</p>
                <p className="text-gray-700">
                  <strong>Your Answer:</strong> {answers[question.id] || 'Not answered'}
                </p>
              </div>
            ))}
          </div>

          {error && (
            <motion.div
              className="p-4 bg-danger bg-opacity-10 border border-danger text-danger rounded-lg mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/quiz')}
              disabled={submitting}
              className="flex-1 bg-light hover:bg-gray-400 disabled:opacity-50 text-primary font-bold py-3 rounded-lg transition"
            >
              Back to Quiz
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={submitting}
              className="flex-1 bg-success hover:bg-opacity-90 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95"
            >
              {submitting ? 'Submitting...' : 'Final Submit'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Submission;
