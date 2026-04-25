const { users } = require('../config/users');
const { questionSets } = require('../config/questions');

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
          questionSet: user.questionSet
        }
      };
    }
    return {
      success: false,
      message: 'Invalid email or password'
    };
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
