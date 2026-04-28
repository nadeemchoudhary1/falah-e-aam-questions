const express = require('express');
const authService = require('../services/authService');
const emailService = require('../services/emailService');
const {
  validateLogin,
  validatePersonalDetails,
  validateSubmission,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// Login endpoint
router.post('/login', validateLogin, handleValidationErrors, (req, res) => {
  try {
    const { email, password } = req.body;
    const result = authService.validateCredentials(email, password);

    if (result.success) {
      res.json({
        success: true,
        user: result.user,
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get questions for a specific question set
router.get('/questions/:questionSetId', (req, res) => {
  try {
    const { questionSetId } = req.params;
    const questions = authService.getUserQuestions(parseInt(questionSetId));

    if (questions) {
      res.json({
        success: true,
        questions
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Question set not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching questions'
    });
  }
});

// Submit quiz answers
router.post('/submit', validateSubmission, handleValidationErrors, async (req, res) => {
  try {
    const { userId, password, questionSetId, answers, personalDetails } = req.body;

    // Validate required fields
    if (!userId || !password || !questionSetId || !answers || !personalDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const credentialCheck = authService.validateCredentials(personalDetails.email, password);
    if (!credentialCheck.success || credentialCheck.user.id !== Number(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid submission credentials'
      });
    }

    if (credentialCheck.user.questionSet !== Number(questionSetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question set for this user'
      });
    }

    if (authService.hasSubmitted(userId, password)) {
      return res.status(409).json({
        success: false,
        message: 'This user has already submitted the quiz'
      });
    }

    // Calculate score
    const score = authService.calculateScore(questionSetId, answers);
    if (!score) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question set'
      });
    }

    // Prepare submission data with detailed answers
    const detailedAnswers = score.detailedAnswers.map(da => ({
      question: da.question,
      selectedAnswer: da.selectedAnswer || 'Not answered',
      correctAnswer: da.correctAnswer,
      isCorrect: da.isCorrect
    }));

    const submissionData = {
      personalDetails,
      userDetails: {
        id: userId,
        email: personalDetails.email,
        subject: personalDetails.subject
      },
      questionsAndAnswers: detailedAnswers,
      score: {
        correct: score.correct,
        total: score.total,
        percentage: score.percentage
      }
    };

    // Send email
    await emailService.sendSubmissionEmail(submissionData);
    authService.markSubmitted(userId, personalDetails.email, password);

    res.json({
      success: true,
      message: 'Quiz submitted successfully'
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing submission'
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

module.exports = router;
