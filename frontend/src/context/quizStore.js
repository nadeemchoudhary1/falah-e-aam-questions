import create from 'zustand';
import { quizStorage } from '../utils/quizStorage';

// Hydrate initial state using active user scope if user is stored
const initialUser = quizStorage.getStoredUser();
const initialPersonalDetails = initialUser ? quizStorage.getStoredPersonalDetails(initialUser) : null;
const initialQuestionSet = initialUser ? quizStorage.getStoredQuestionSet(initialUser) : null;
const initialAnswers = initialUser ? quizStorage.getStoredAnswers(initialUser) : {};
const initialCurrentQuestion = initialUser ? quizStorage.getStoredCurrentQuestion(initialUser) : 0;
const initialTimeRemaining = initialUser ? quizStorage.getStoredTimer(70 * 60, initialUser) : 70 * 60;
const initialIsSubmitted = initialUser ? quizStorage.isUserSubmitted(initialUser) : false;

const useQuizStore = create((set, get) => ({
  // User state
  user: initialUser,
  isAuthenticated: Boolean(initialUser),

  // Scoped Quiz state
  personalDetails: initialPersonalDetails,
  currentQuestion: initialCurrentQuestion,
  answers: initialAnswers,
  questionSet: initialQuestionSet,
  timeRemaining: initialTimeRemaining,
  isQuizSubmitted: initialIsSubmitted,
  submissionLoading: false,

  // UI state
  showTimerWarning: false,
  loading: false,
  error: null,

  // Actions
  setUser: (user) => {
    quizStorage.saveStoredUser(user);
    if (user) {
      const isSub = quizStorage.isUserSubmitted(user) || Boolean(user.isSubmitted);
      const personalDetails = quizStorage.getStoredPersonalDetails(user);
      const questionSet = quizStorage.getStoredQuestionSet(user);
      const answers = quizStorage.getStoredAnswers(user);
      const currentQuestion = quizStorage.getStoredCurrentQuestion(user);
      const timeRemaining = quizStorage.getStoredTimer(70 * 60, user);

      set({
        user,
        isAuthenticated: true,
        isQuizSubmitted: isSub,
        personalDetails,
        questionSet,
        answers,
        currentQuestion,
        timeRemaining
      });
    } else {
      set({
        user: null,
        isAuthenticated: false,
        isQuizSubmitted: false,
        personalDetails: null,
        questionSet: null,
        answers: {},
        currentQuestion: 0
      });
    }
  },

  setPersonalDetails: (details) => {
    const user = get().user;
    quizStorage.savePersonalDetails(details, user);
    set({ personalDetails: details });
  },

  setCurrentQuestion: (question) => {
    const user = get().user;
    quizStorage.saveCurrentQuestion(question, user);
    set({ currentQuestion: question });
  },

  setAnswer: (questionId, answer) => {
    const user = get().user;
    const currentAnswers = get().answers || {};
    const newAnswers = { ...currentAnswers, [questionId]: answer };
    quizStorage.saveAnswersRealTime(newAnswers, user);
    set({ answers: newAnswers });
  },

  setQuestionSet: (questionSet) => {
    const user = get().user;
    quizStorage.saveQuestionSet(questionSet, user);
    set({ questionSet });
  },

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  setShowTimerWarning: (show) => set({ showTimerWarning: show }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setSubmissionLoading: (loading) => set({ submissionLoading: loading }),

  setQuizSubmitted: (submitted, resultData = null) => {
    const user = get().user;
    if (submitted && user) {
      quizStorage.recordExamSubmissionInLedger(user, resultData);
    }
    set({ isQuizSubmitted: submitted });
  },

  hydrateFromStorage: () => {
    const user = quizStorage.getStoredUser();
    if (user) {
      const isSubmitted = quizStorage.isUserSubmitted(user) || Boolean(user.isSubmitted);
      const personalDetails = quizStorage.getStoredPersonalDetails(user);
      const questionSet = quizStorage.getStoredQuestionSet(user);
      const answers = quizStorage.getStoredAnswers(user);
      const currentQuestion = quizStorage.getStoredCurrentQuestion(user);
      const timeRemaining = quizStorage.getStoredTimer(70 * 60, user);

      set({
        user,
        isAuthenticated: true,
        personalDetails,
        questionSet,
        answers,
        currentQuestion,
        timeRemaining,
        isQuizSubmitted: isSubmitted
      });
    }
  },

  // Selective cleanup of active heavy data keys upon verified final submission
  clearActiveUserExamSession: () => {
    const user = get().user;
    if (user) {
      quizStorage.clearActiveUserHeavyKeys(user);
    }
    set({
      answers: {},
      currentQuestion: 0,
      timeRemaining: 70 * 60,
      showTimerWarning: false
    });
  },

  logout: () => {
    quizStorage.saveStoredUser(null);
    set({
      user: null,
      isAuthenticated: false,
      personalDetails: null,
      currentQuestion: 0,
      answers: {},
      questionSet: null,
      isQuizSubmitted: false
    });
  }
}));

export default useQuizStore;
