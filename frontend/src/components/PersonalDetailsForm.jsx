import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useQuizStore from '../context/quizStore';
import { quizAPI } from '../utils/api';
import { quizStorage } from '../utils/quizStorage';

const PersonalDetailsForm = () => {
  const navigate = useNavigate();
  const user = useQuizStore((state) => state.user);
  const setPersonalDetails = useQuizStore((state) => state.setPersonalDetails);
  const setQuestionSet = useQuizStore((state) => state.setQuestionSet);
  const setLoading = useQuizStore((state) => state.setLoading);
  const setError = useQuizStore((state) => state.setError);

  const activeUser = user || quizStorage.getStoredUser();
  const storedDetails = activeUser ? quizStorage.getStoredPersonalDetails(activeUser) : null;

  const [formData, setFormData] = useState({
    fullName: activeUser?.name || storedDetails?.fullName || '',
    phoneNumber: storedDetails?.phoneNumber || '',
    courseName: activeUser?.subject || storedDetails?.courseName || '',
    address: storedDetails?.address || ''
  });

  const [errors, setErrors] = useState({});
  const [submissionBlockError, setSubmissionBlockError] = useState('');
  const [loading, setLoadingState] = useState(false);

  useEffect(() => {
    if (!activeUser) {
      navigate('/login', { replace: true });
      return;
    }

    // Pre-flight check: If this exam has already been submitted, block access immediately
    if (quizStorage.isUserSubmitted(activeUser)) {
      setSubmissionBlockError(
        'This exam has already been submitted using these credentials. Please log in with credentials for a different exam.'
      );
      return;
    }

    // Forward-only lockdown: if examination is already active for this user, lock access to personal details
    if (quizStorage.isQuizActive(activeUser)) {
      navigate('/quiz', { replace: true });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      fullName: activeUser.name || prev.fullName,
      courseName: activeUser.subject || prev.courseName
    }));
  }, [activeUser, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Pre-flight check before initiating quiz
    if (quizStorage.isUserSubmitted(activeUser)) {
      setSubmissionBlockError(
        'This exam has already been submitted using these credentials. Please log in with credentials for a different exam.'
      );
      return;
    }

    if (!validateForm()) return;

    setLoadingState(true);
    setLoading(true);

    try {
      if (!activeUser || !activeUser.questionSet) {
        throw new Error('User session invalid. Please log in again.');
      }

      // Fetch questions if not already cached under user scope
      let questions = quizStorage.getStoredQuestionSet(activeUser);
      if (!questions || !questions.questions || questions.id !== activeUser.questionSet) {
        const questionResponse = await quizAPI.getQuestions(activeUser.questionSet);
        if (questionResponse.data.success) {
          questions = questionResponse.data.questions;
          setQuestionSet(questions);
          quizStorage.saveQuestionSet(questions, activeUser);
        } else {
          throw new Error('Could not load question set.');
        }
      }

      const detailedFormData = {
        ...formData,
        fullName: activeUser.name || formData.fullName,
        courseName: activeUser.subject || formData.courseName,
        email: activeUser.email,
        subject: questions.subject
      };

      setPersonalDetails(detailedFormData);
      quizStorage.savePersonalDetails(detailedFormData, activeUser);

      // Initialize scoped timer if not already saved (user123_timer)
      const existingTimer = quizStorage.getStoredTimer(null, activeUser);
      if (existingTimer === null) {
        quizStorage.saveTimerSync(70 * 60, activeUser);
      }

      // Activate user-scoped quiz session (forward-only lockdown)
      quizStorage.setQuizActive(true, activeUser);

      // Replace route so user cannot press browser back into registration/personal details
      navigate('/quiz', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to load quiz questions. Please try again.');
      console.error('Error starting quiz:', err);
    } finally {
      setLoadingState(false);
      setLoading(false);
    }
  };

  if (submissionBlockError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            🔒
          </div>
          <h2 className="text-xl font-bold text-primary mb-3">Examination Already Submitted</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {submissionBlockError}
          </p>
          <button
            onClick={() => {
              quizStorage.saveStoredUser(null);
              navigate('/login', { replace: true });
            }}
            className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition"
          >
            Log in with Different Credentials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-4 flex items-center justify-center">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Personal Details</h1>
          <p className="text-gray-600 mb-8">Please verify your details before starting</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                  errors.fullName ? 'border-danger' : 'border-light focus:border-secondary'
                }`}
                disabled={loading}
                readOnly
              />
              {errors.fullName && <p className="text-danger text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="9876543210"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                  errors.phoneNumber ? 'border-danger' : 'border-light focus:border-secondary'
                }`}
                disabled={loading}
              />
              {errors.phoneNumber && <p className="text-danger text-sm mt-1">{errors.phoneNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Course Name *
              </label>
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                  errors.courseName ? 'border-danger' : 'border-light focus:border-secondary'
                }`}
                disabled={loading}
                readOnly
              />
              {errors.courseName && <p className="text-danger text-sm mt-1">{errors.courseName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                rows="3"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition resize-none ${
                  errors.address ? 'border-danger' : 'border-light focus:border-secondary'
                }`}
                disabled={loading}
              />
              {errors.address && <p className="text-danger text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="pt-2">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg mb-4">
                <strong>Attention:</strong> Once you click "Start Quiz", navigation back to registration or personal details will be locked for security.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary hover:bg-primary text-white font-bold py-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {loading ? 'Starting Examination...' : 'Start Quiz →'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalDetailsForm;
