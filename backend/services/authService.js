const fs = require('fs');
const path = require('path');
const { users } = require('../config/users');
const { questionSets } = require('../config/questions');

const submissionStorePath = path.join(__dirname, '..', 'data', 'submittedCredentials.json');

const readSubmittedCredentials = () => {
  try {
    if (!fs.existsSync(submissionStorePath)) {
      return [];
    }

    return JSON.parse(fs.readFileSync(submissionStorePath, 'utf8'));
  } catch (error) {
    console.error('Error reading submitted credentials:', error);
    return [];
  }
};

const writeSubmittedCredentials = (submissions) => {
  fs.mkdirSync(path.dirname(submissionStorePath), { recursive: true });
  fs.writeFileSync(submissionStorePath, JSON.stringify(submissions, null, 2));
};

class AuthService {
  validateCredentials(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          questionSet: user.questionSet,
          subject: user.subject
        }
      };
    }
    return {
      success: false,
      message: 'Invalid email or password'
    };
  }

  getCredentialKey(userId, password) {
    return `${userId}:${password}`;
  }

  hasSubmitted(userId, password) {
    const credentialKey = this.getCredentialKey(userId, password);
    return readSubmittedCredentials().some((submission) => submission.credentialKey === credentialKey);
  }

  markSubmitted(userId, email, password) {
    const submissions = readSubmittedCredentials();
    const credentialKey = this.getCredentialKey(userId, password);

    if (submissions.some((submission) => submission.credentialKey === credentialKey)) {
      return;
    }

    submissions.push({
      credentialKey,
      userId,
      email,
      password,
      submittedAt: new Date().toISOString()
    });

    writeSubmittedCredentials(submissions);
  }

  clearSubmission(userId, email) {
    const submissions = readSubmittedCredentials();
    const idNum = userId !== undefined && userId !== null ? Number(userId) : null;
    const idStr = userId !== undefined && userId !== null ? String(userId) : null;
    const emailLower = email ? String(email).trim().toLowerCase() : '';

    const initialLength = submissions.length;
    const filtered = submissions.filter((sub) => {
      if (idNum !== null && !isNaN(idNum) && (Number(sub.userId) === idNum || String(sub.userId) === idStr)) {
        return false;
      }
      if (emailLower && sub.email && sub.email.trim().toLowerCase() === emailLower) {
        return false;
      }
      return true;
    });

    if (filtered.length !== initialLength) {
      writeSubmittedCredentials(filtered);
    }
    return true;
  }

  getUserQuestions(questionSetId) {
    const questionSet = questionSets.find(qs => qs.id === questionSetId);
    if (questionSet) {
      // Return questions without correct answers (for security)
      return {
        id: questionSet.id,
        subject: questionSet.subject,
        totalMarks: questionSet.totalMarks,
        questions: questionSet.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options
          // Note: correct answer is NOT sent to frontend
        }))
      };
    }
    return null;
  }

  getCorrectAnswers(questionSetId) {
    const questionSet = questionSets.find(qs => qs.id === questionSetId);
    if (questionSet) {
      return questionSet.questions.map(q => ({
        id: q.id,
        correct: q.correct
      }));
    }
    return null;
  }

  calculateScore(questionSetId, answers) {
    const questionSet = questionSets.find(qs => qs.id === questionSetId);
    if (!questionSet) return null;

    const answerMap = new Map(
      answers.map(answer => [answer.questionId, answer.selectedAnswer])
    );

    let correctCount = 0;
    const detailedAnswers = questionSet.questions.map(question => {
      const selectedAnswer = answerMap.get(question.id) || null;
      const isCorrect = selectedAnswer === question.correct;

      if (isCorrect) correctCount++;

      return {
        questionId: question.id,
        question: question.question,
        isCorrect,
        selectedAnswer,
        correctAnswer: question.correct
      };
    });

    const totalQuestions = questionSet.questions.length;
    const percentage = (correctCount / totalQuestions) * 100;

    return {
      correct: correctCount,
      total: totalQuestions,
      percentage,
      detailedAnswers
    };
  }
}

module.exports = new AuthService();
