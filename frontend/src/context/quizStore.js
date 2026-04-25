import create from 'zustand';

const useQuizStore = create((set) => ({
  // User state
  user: null,
  isAuthenticated: false,
  
  // Quiz state
  personalDetails: null,
  currentQuestion: 0,
  answers: {},
  questionSet: null,
  timeRemaining: 70 * 60, // 70 minutes in seconds
  isQuizSubmitted: false,
  submissionLoading: false,
  
  // UI state
  showTimerWarning: false,
  loading: false,
  error: null,
  
  // Actions
  setUser: (user) => set({ user, isAuthenticated: true }),
  setPersonalDetails: (details) => set({ personalDetails: details }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setAnswer: (questionId, answer) => set((state) => ({
    answers: { ...state.answers, [questionId]: answer }
  })),
  setQuestionSet: (questionSet) => set({ questionSet }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setShowTimerWarning: (show) => set({ showTimerWarning: show }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSubmissionLoading: (loading) => set({ submissionLoading: loading }),
  setQuizSubmitted: (submitted) => set({ isQuizSubmitted: submitted }),
  
  logout: () => set({
    user: null,
    isAuthenticated: false,
    personalDetails: null,
    currentQuestion: 0,
    answers: {},
    questionSet: null,
    isQuizSubmitted: false
  })
}));

export default useQuizStore;
