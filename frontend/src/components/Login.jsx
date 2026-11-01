import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useQuizStore from '../context/quizStore';
import { authAPI } from '../utils/api';
import { quizStorage } from '../utils/quizStorage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useQuizStore((state) => state.setUser);

  useEffect(() => {
    const storedUser = quizStorage.getStoredUser();
    if (storedUser) {
      if (quizStorage.isUserSubmitted(storedUser)) {
        navigate('/already-submitted', { replace: true });
        return;
      }
      // Forward-only lockdown: if user already has an active quiz session, lock access to login
      if (quizStorage.isQuizActive(storedUser)) {
        navigate('/quiz', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmittedRecord(null);

    // Immediate Frontend Pre-Flight Check:
    // Instantly query submitted_exams_ledger. If typed credentials match an entry,
    // throw validation error immediately without hitting the server API.
    if (quizStorage.isSubmittedInLedger(email, password)) {
      const record = quizStorage.getSubmissionRecord(email);
      if (record) {
        quizStorage.setLastActiveSubmission(record);
        setSubmittedRecord(record);
      }
      setError(
        'This exam has already been submitted using these credentials. Please log in with credentials for a different exam.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      if (response.data.success) {
        const authenticatedUser = {
          ...response.data.user,
          password
        };

        // Check if server or local history marks user as submitted
        if (response.data.user?.isSubmitted || quizStorage.isUserSubmitted(authenticatedUser)) {
          const userSummary = {
            userId: authenticatedUser.id,
            candidateName: authenticatedUser.name || 'Candidate',
            email: authenticatedUser.email,
            subject: authenticatedUser.subject || 'Examination',
            submittedAt: new Date().toISOString()
          };
          quizStorage.recordExamSubmissionInLedger(authenticatedUser, userSummary);
          quizStorage.setLastActiveSubmission(userSummary);
          setSubmittedRecord(userSummary);
          setError(
            'This exam has already been submitted using these credentials. Please log in with credentials for a different exam.'
          );
          setLoading(false);
          return;
        }

        setUser(authenticatedUser);

        // Check if candidate already has an active quiz session underway for their ID
        if (quizStorage.isQuizActive(authenticatedUser)) {
          navigate('/quiz', { replace: true });
        } else {
          navigate('/personal-details', { replace: true });
        }
      }
    } catch (err) {
      if (err.response?.status === 409) {
        const fallbackSummary = {
          userId: email,
          email,
          candidateName: 'Candidate',
          subject: 'Examination',
          submittedAt: new Date().toISOString()
        };
        quizStorage.recordExamSubmissionInLedger({ id: email, email, password }, fallbackSummary);
        quizStorage.setLastActiveSubmission(fallbackSummary);
        setSubmittedRecord(fallbackSummary);
        setError(
          'This exam has already been submitted using these credentials. Please log in with credentials for a different exam.'
        );
        return;
      }
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">Candidate Login</h1>
            <p className="text-gray-600">Enter your examination credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                User ID / Email Address
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-light rounded-lg focus:outline-none focus:border-secondary transition"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-light rounded-lg focus:outline-none focus:border-secondary transition"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <motion.div
                className="p-4 bg-danger bg-opacity-10 border border-danger text-danger rounded-lg text-sm leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p>{error}</p>
                {submittedRecord && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/already-submitted', {
                        state: { submissionResult: submittedRecord }
                      })
                    }
                    className="mt-2.5 text-xs font-bold text-red-900 underline hover:text-primary flex items-center gap-1"
                  >
                    <span>View Submission Details ({submittedRecord.candidateName || submittedRecord.email}) →</span>
                  </button>
                )}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-primary text-white font-bold py-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-md"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
