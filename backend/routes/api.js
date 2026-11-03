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
      const isSubmitted = authService.hasSubmitted(result.user.id, password);
      res.json({
        success: true,
        user: {
          ...result.user,
          isSubmitted
        },
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

    // Send submission report email via Resend HTTP API
    const adminEmail = process.env.ADMIN_EMAIL || 'onboarding@resend.dev';
    const emailSubject = `Quiz Submission: ${personalDetails.fullName} - ${personalDetails.subject}`;
    const htmlContent = emailService.generateHTMLEmail(submissionData);

    await emailService.sendSubmissionEmail(adminEmail, emailSubject, htmlContent);
    authService.markSubmitted(userId, personalDetails.email, password);

    const attendedCount = answers.filter(a => a.selectedAnswer !== null && a.selectedAnswer !== undefined && a.selectedAnswer !== '').length;
    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      attendedCount,
      totalQuestions: score.total
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing submission'
    });
  }
});


// Whitelist of allowed student IDs and name keywords for clearing submission & retaking exam
const ALLOWED_RESET_STUDENT_IDS = [54, 55, 66, 67, 68, 69, 70, 71, 76, 77, 94, 95, 660, 770];
const ALLOWED_RESET_KEYWORDS = ['sifatullah', 'altamash', 'farheen', 'saqiba', 'khan mohd', 'khanmohd'];

// Reset student submission endpoint (strictly restricted to authorized student IDs only)
router.post('/reset-student-submission', (req, res) => {
  try {
    const { userId, email } = req.body;
    const idNum = userId !== undefined && userId !== null ? Number(userId) : null;
    const emailLower = email ? String(email).trim().toLowerCase() : '';

    const isAllowedId = idNum !== null && !isNaN(idNum) && ALLOWED_RESET_STUDENT_IDS.includes(idNum);
    const isAllowedEmail = emailLower && ALLOWED_RESET_KEYWORDS.some((kw) => emailLower.includes(kw));

    if (!isAllowedId && !isAllowedEmail) {
      return res.status(403).json({
        success: false,
        message: 'Reset submission is restricted to authorized student IDs only.'
      });
    }

    authService.clearSubmission(idNum, emailLower);
    res.json({
      success: true,
      message: 'Student submission records cleared successfully.'
    });
  } catch (error) {
    console.error('Submission reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting student submission.'
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

module.exports = router;
