import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useQuizStore from '../context/quizStore';
import { quizAPI } from '../utils/api';

const PersonalDetailsForm = () => {
  const navigate = useNavigate();
  const user = useQuizStore((state) => state.user);
  const setPersonalDetails = useQuizStore((state) => state.setPersonalDetails);
  const setQuestionSet = useQuizStore((state) => state.setQuestionSet);
  const setLoading = useQuizStore((state) => state.setLoading);
  const setError = useQuizStore((state) => state.setError);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phoneNumber: '',
    courseName: user?.subject || '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoadingState] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || '',
        courseName: user.subject || ''
      }));
    }
  }, [user]);

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

    if (!validateForm()) return;

    setLoadingState(true);
    setLoading(true);

    try {
      // Fetch questions
      const questionResponse = await quizAPI.getQuestions(user.questionSet);
      if (questionResponse.data.success) {
        setQuestionSet(questionResponse.data.questions);
        const detailedFormData = {
          ...formData,
          fullName: user.name,
          courseName: user.subject,
          email: user.email,
          subject: questionResponse.data.questions.subject
        };
        setPersonalDetails(detailedFormData);
        localStorage.setItem('personalDetails', JSON.stringify(detailedFormData));
        
        setTimeout(() => {
          navigate('/quiz');
        }, 500);
      }
    } catch (error) {
      setError('Failed to load quiz questions. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoadingState(false);
      setLoading(false);
    }
  };

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
          <p className="text-gray-600 mb-8">Please fill in your information to proceed</p>

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
                placeholder="Enter your full address"
                rows="3"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition resize-none ${
                  errors.address ? 'border-danger' : 'border-light focus:border-secondary'
                }`}
                disabled={loading}
              />
              {errors.address && <p className="text-danger text-sm mt-1">{errors.address}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-primary text-white font-bold py-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 mt-6"
            >
              {loading ? 'Loading...' : 'Start Quiz'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalDetailsForm;
