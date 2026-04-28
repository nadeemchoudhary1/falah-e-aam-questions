import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useQuizStore from '../context/quizStore';
import { formatTime, handleBeforeUnload } from '../utils/helpers';

const Timer = ({ timeRemaining, onTimeEnd }) => {
  const setShowTimerWarning = useQuizStore((state) => state.setShowTimerWarning);
  const showWarning = timeRemaining <= 300; // 5 minutes

  useEffect(() => {
    setShowTimerWarning(showWarning);
  }, [showWarning, setShowTimerWarning]);

  const isWarning = timeRemaining <= 300;
  const isCritical = timeRemaining <= 60;

  return (
    <div className={`w-28 shrink-0 p-3 rounded-lg text-center transition-colors duration-300 ${
      isCritical ? 'bg-danger text-white' : isWarning ? 'bg-warning text-white' : 'bg-light text-primary'
    }`}>
      <p className="text-[10px] md:text-xs font-semibold mb-1 leading-tight">TIME REMAINING</p>
      <p className={`text-xl md:text-3xl font-bold leading-none ${
        isCritical ? 'animate-pulse' : ''
      }`}>
        {formatTime(timeRemaining)}
      </p>
      {isWarning && (
        <p className="text-[10px] md:text-xs mt-1 leading-tight">
          {isCritical ? '⚠️ HURRY UP!' : '⏰ Finish soon'}
        </p>
      )}
    </div>
  );
};

const Quiz = () => {
  const navigate = useNavigate();
  const questionSet = useQuizStore((state) => state.questionSet);
  const currentQuestion = useQuizStore((state) => state.currentQuestion);
  const answers = useQuizStore((state) => state.answers);
  const personalDetails = useQuizStore((state) => state.personalDetails);
  const setCurrentQuestion = useQuizStore((state) => state.setCurrentQuestion);
  const setAnswer = useQuizStore((state) => state.setAnswer);
  
  const setTimeRemaining = useQuizStore((state) => state.setTimeRemaining);
  const timeRemaining = useQuizStore((state) => state.timeRemaining);
  
  const [localTime, setLocalTime] = useState(timeRemaining);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime((prev) => Math.max(prev - 1, 0));
    }, 1000);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleBackNavigation);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleBackNavigation);
    };
  }, []);

  useEffect(() => {
    setTimeRemaining(localTime);

    if (localTime <= 0 && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      alert('Time is up! Your quiz has been auto-submitted.');
      navigate('/submission', { state: { answers, personalDetails } });
    }
  }, [localTime, setTimeRemaining, navigate, answers, personalDetails]);

  const handleBackNavigation = (e) => {
    e.preventDefault();
    alert('You cannot go back during the quiz!');
  };

  const handleAnswerSelect = (option) => {
    const question = questionSet.questions[currentQuestion];
    setAnswer(question.id, option);
  };

  const handleNext = () => {
    if (currentQuestion < questionSet.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Navigate to submission
    navigate('/submission', { state: { answers, personalDetails } });
  };

  if (!questionSet || !personalDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <p className="text-white text-xl">Loading quiz...</p>
      </div>
    );
  }

  const question = questionSet.questions[currentQuestion];
  const selectedAnswer = answers[question.id];
  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = questionSet.questions.length;

  return (
    <div className="min-h-screen bg-light" style={{paddingBottom:'1rem'}}>
      {/* Sticky Header */}
      <div className="fixed top-0 left-0 right-0 bg-primary text-white shadow-lg z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 pt-1">
              <h2 className="font-bold text-base md:text-lg leading-snug break-words line-clamp-2">
                {questionSet.subject}
              </h2>
              <p className="text-sm text-light">Question {currentQuestion + 1} of {totalQuestions}</p>
            </div>
            <Timer timeRemaining={localTime} />
          </div>
          <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pt-40 md:pt-28">
        {/* Question Card */}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentQuestion}
        >
          <h3 className="text-xl md:text-2xl font-bold text-primary mb-6">
            {question.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedAnswer === option
                    ? 'border-secondary bg-secondary bg-opacity-10 text-primary'
                    : 'border-light hover:border-secondary text-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      selectedAnswer === option
                        ? 'bg-secondary border-secondary'
                        : 'border-gray-400'
                    }`}
                  >
                    {selectedAnswer === option && <span className="text-white text-sm">✓</span>}
                  </div>
                  <span>{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>


        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1 bg-light hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-primary font-bold py-3 rounded-lg transition"
          >
            ← Previous
          </button>
          
          {currentQuestion === totalQuestions - 1 ? (
            <button
              onClick={() => setShowSubmitDialog(true)}
              className="flex-1 bg-success hover:bg-opacity-90 text-white font-bold py-3 rounded-lg transition"
            >
              Submit Quiz ({answeredQuestions}/{totalQuestions})
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 bg-secondary hover:bg-primary text-white font-bold py-3 rounded-lg transition"
            >
              Next →
            </button>
          )}
        </div>


        {/* Question Navigator */}
 <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,1fr))] gap-2 mb-8">
  {questionSet.questions.map((q, index) => (
    <motion.button
      key={index}
      onClick={() => setCurrentQuestion(index)}
      className={`aspect-square rounded-lg font-bold transition ${
        index === currentQuestion
          ? 'bg-secondary text-white'
          : answers[q.id]
          ? 'bg-success text-white'
          : 'bg-light text-primary hover:bg-gray-300'
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {index + 1}
    </motion.button>
  ))}
</div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow p-4 text-center mb-8">
          <p className="text-gray-600">
            Answered: <span className="font-bold text-secondary">{answeredQuestions}</span> / {totalQuestions}
          </p>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitDialog && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-lg p-8 max-w-sm"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h3 className="text-2xl font-bold text-primary mb-4">Submit Quiz?</h3>
            <p className="text-gray-600 mb-2">
              You have answered <strong>{answeredQuestions} out of {totalQuestions}</strong> questions.
            </p>
            {answeredQuestions < totalQuestions && (
              <p className="text-warning font-semibold mb-4">
                ⚠️ {totalQuestions - answeredQuestions} questions are unanswered.
              </p>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitDialog(false)}
                className="flex-1 bg-light hover:bg-gray-400 text-primary font-bold py-2 rounded-lg transition"
              >
                Continue
              </button>
              <button
                onClick={handleSubmitQuiz}
                className="flex-1 bg-success hover:bg-opacity-90 text-white font-bold py-2 rounded-lg transition"
              >
                Submit
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Quiz;
