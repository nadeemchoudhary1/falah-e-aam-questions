/**
 * Centralized Multi-Exam Storage Manager
 * - Scopes all active quiz states using User ID / Exam ID prefix (e.g. user123_progress, user123_timer)
 * - Manages persistent submitted_exams_ledger for instant frontend pre-flight validation
 * - Stores rich submission records to persist candidate details across reloads & navigation
 * - Handles post-submission selective cleanup of heavy data keys
 * - Throttle-optimized timer synchronization (once every 60s)
 */

export const STORAGE_KEYS = {
  USER: 'user',
  SUBMITTED_EXAMS_LEDGER: 'submitted_exams_ledger',
  LAST_SUBMISSION_RESULT: 'last_submission_result'
};

const safeJsonParse = (str, fallback = null) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('Error parsing JSON from storage:', e);
    return fallback;
  }
};

export const quizStorage = {
  // -------------------------------------------------------------
  // User ID / Exam ID Scoping Helpers
  // -------------------------------------------------------------
  getUserPrefix: (userOrId) => {
    if (!userOrId) {
      // Fallback to currently stored user if not passed explicitly
      const currentUser = quizStorage.getStoredUser();
      const id = currentUser?.id || 'anonymous';
      return `user${id}_`;
    }
    const id = typeof userOrId === 'object' ? userOrId.id : userOrId;
    return `user${id}_`;
  },

  getScopedKey: (keyName, userOrId) => {
    const prefix = quizStorage.getUserPrefix(userOrId);
    return `${prefix}${keyName}`;
  },

  // -------------------------------------------------------------
  // Current Authenticated User Storage
  // -------------------------------------------------------------
  getStoredUser: () => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.USER), null);
  },
  saveStoredUser: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  // -------------------------------------------------------------
  // Persistent Submission History Ledger
  // Minimal ledger structure:
  // {
  //   "user_1": true, "1": true, ... (fast index lookups)
  //   "records": { "1": { candidateName, email, subject, ... } },
  //   "lastSubmitted": { ... }
  // }
  // -------------------------------------------------------------
  getSubmissionLedger: () => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.SUBMITTED_EXAMS_LEDGER), {}) || {};
  },

  recordExamSubmissionInLedger: (user, resultData = null) => {
    if (!user) return;
    const ledger = quizStorage.getSubmissionLedger();
    ledger.records = ledger.records || {};

    const userIdStr = String(user.id);
    ledger[`user_${userIdStr}`] = true;
    ledger[`user${userIdStr}`] = true;
    ledger[userIdStr] = true;

    const emailLower = user.email ? user.email.trim().toLowerCase() : '';
    if (emailLower) {
      ledger[emailLower] = true;
      if (user.password) {
        ledger[`${emailLower}:${user.password}`] = true;
      }
    }

    if (user.questionSet) {
      ledger[`exam_${user.questionSet}`] = true;
      ledger[`user_${userIdStr}_exam_${user.questionSet}`] = true;
    }

    // Prepare complete result summary
    const summary = resultData || {
      userId: user.id,
      candidateName: user.name || 'Candidate',
      email: user.email || '',
      subject: user.subject || 'Examination',
      submittedAt: new Date().toISOString()
    };

    // Store in records dictionary indexed by userId and email
    ledger.records[userIdStr] = summary;
    ledger.records[`user_${userIdStr}`] = summary;
    if (emailLower) {
      ledger.records[emailLower] = summary;
    }
    ledger.lastSubmitted = summary;

    localStorage.setItem(STORAGE_KEYS.SUBMITTED_EXAMS_LEDGER, JSON.stringify(ledger));

    // Also persist globally and user-scoped
    localStorage.setItem(STORAGE_KEYS.LAST_SUBMISSION_RESULT, JSON.stringify(summary));
    const scopedResultKey = quizStorage.getScopedKey('submission_result', user);
    localStorage.setItem(scopedResultKey, JSON.stringify(summary));
  },

  /**
   * Retrieves a submission record by identifier (User ID or email) from the ledger
   */
  getSubmissionRecord: (identifier) => {
    if (!identifier) return null;
    const ledger = quizStorage.getSubmissionLedger();
    if (!ledger.records) return null;

    const idStr = String(identifier).trim();
    const idLower = idStr.toLowerCase();

    return (
      ledger.records[idLower] ||
      ledger.records[idStr] ||
      ledger.records[`user_${idStr}`] ||
      ledger.records[`user${idStr}`] ||
      null
    );
  },

  /**
   * Sets the last active submission view result
   */
  setLastActiveSubmission: (resultData) => {
    if (resultData) {
      localStorage.setItem(STORAGE_KEYS.LAST_SUBMISSION_RESULT, JSON.stringify(resultData));
    }
  },

  /**
   * Gets the last active submission result
   */
  getLastActiveSubmission: () => {
    const direct = safeJsonParse(localStorage.getItem(STORAGE_KEYS.LAST_SUBMISSION_RESULT), null);
    if (direct) return direct;

    const ledger = quizStorage.getSubmissionLedger();
    if (ledger && ledger.lastSubmitted) return ledger.lastSubmitted;

    if (ledger && ledger.records) {
      const keys = Object.keys(ledger.records);
      if (keys.length > 0) return ledger.records[keys[0]];
    }

    return null;
  },

  /**
   * Resilient Submission Result Getter:
   * Resolves submission data across scoped storage, ledger records, and last submitted cache.
   * Never returns empty if submission has occurred!
   */
  getStoredSubmissionResult: (userOrId = null) => {
    // 1. Try explicit userOrId scoped key
    if (userOrId) {
      const key = quizStorage.getScopedKey('submission_result', userOrId);
      const scopedResult = safeJsonParse(localStorage.getItem(key), null);
      if (scopedResult) return scopedResult;

      const record = quizStorage.getSubmissionRecord(
        typeof userOrId === 'object' ? userOrId.id || userOrId.email : userOrId
      );
      if (record) return record;
    }

    // 2. Try currently stored user
    const currentUser = quizStorage.getStoredUser();
    if (currentUser) {
      const key = quizStorage.getScopedKey('submission_result', currentUser);
      const scopedResult = safeJsonParse(localStorage.getItem(key), null);
      if (scopedResult) return scopedResult;

      const record = quizStorage.getSubmissionRecord(currentUser.id || currentUser.email);
      if (record) return record;
    }

    // 3. Fallback to last active submission
    return quizStorage.getLastActiveSubmission();
  },

  /**
   * Immediate Frontend Pre-Flight Check:
   * Instantly queries the local submitted_exams_ledger during login/personal details.
   * Returns true if the typed User ID/Password or email has already submitted.
   */
  isSubmittedInLedger: (identifier, password = '') => {
    const ledger = quizStorage.getSubmissionLedger();
    if (!ledger || Object.keys(ledger).length === 0) return false;

    if (!identifier) return false;

    const idStr = String(identifier).trim();
    const idLower = idStr.toLowerCase();
    const passStr = String(password || '').trim();

    // Check direct identifier (email, user ID string, user_id format)
    if (ledger[idLower] === true || ledger[idStr] === true) return true;
    if (ledger[`user_${idStr}`] === true || ledger[`user${idStr}`] === true) return true;

    // Check credential pair
    if (passStr && ledger[`${idLower}:${passStr}`] === true) return true;

    // Check if recorded in ledger.records
    if (ledger.records && (ledger.records[idLower] || ledger.records[idStr])) return true;

    return false;
  },

  isUserSubmitted: (user) => {
    if (!user) return false;
    const ledger = quizStorage.getSubmissionLedger();
    const userIdStr = String(user.id);
    if (ledger[userIdStr] === true || ledger[`user_${userIdStr}`] === true || ledger[`user${userIdStr}`] === true) {
      return true;
    }
    if (user.email && ledger[user.email.trim().toLowerCase()] === true) {
      return true;
    }
    if (ledger.records && (ledger.records[userIdStr] || (user.email && ledger.records[user.email.trim().toLowerCase()]))) {
      return true;
    }
    return false;
  },

  // -------------------------------------------------------------
  // Scoped Personal Details Storage
  // -------------------------------------------------------------
  getStoredPersonalDetails: (userOrId) => {
    const key = quizStorage.getScopedKey('personal_details', userOrId);
    return safeJsonParse(localStorage.getItem(key), null);
  },
  savePersonalDetails: (details, userOrId) => {
    if (details) {
      const key = quizStorage.getScopedKey('personal_details', userOrId);
      localStorage.setItem(key, JSON.stringify(details));
    }
  },

  // -------------------------------------------------------------
  // Scoped Question Set Storage
  // -------------------------------------------------------------
  getStoredQuestionSet: (userOrId) => {
    const key = quizStorage.getScopedKey('question_set', userOrId);
    return safeJsonParse(localStorage.getItem(key), null);
  },
  saveQuestionSet: (questionSet, userOrId) => {
    if (questionSet) {
      const key = quizStorage.getScopedKey('question_set', userOrId);
      localStorage.setItem(key, JSON.stringify(questionSet));
    }
  },

  // -------------------------------------------------------------
  // Scoped Progress & Real-Time Answers Storage
  // -------------------------------------------------------------
  getStoredAnswers: (userOrId) => {
    const answersKey = quizStorage.getScopedKey('answers', userOrId);
    return safeJsonParse(localStorage.getItem(answersKey), {});
  },

  getStoredAttendedQuestions: (userOrId) => {
    const attendedKey = quizStorage.getScopedKey('attended_questions', userOrId);
    return safeJsonParse(localStorage.getItem(attendedKey), []);
  },

  saveAnswersRealTime: (answers, userOrId) => {
    if (!answers) return;
    const answersKey = quizStorage.getScopedKey('answers', userOrId);
    const progressKey = quizStorage.getScopedKey('progress', userOrId);
    const optionsKey = quizStorage.getScopedKey('selected_options', userOrId);
    const attendedKey = quizStorage.getScopedKey('attended_questions', userOrId);

    localStorage.setItem(answersKey, JSON.stringify(answers));
    localStorage.setItem(optionsKey, JSON.stringify(answers));

    // Real-time attended questions array
    const attendedArray = Object.entries(answers)
      .filter(([_, opt]) => opt !== null && opt !== undefined && opt !== '')
      .map(([questionId, selectedOption]) => ({
        questionId: isNaN(Number(questionId)) ? questionId : Number(questionId),
        selectedOption
      }));

    localStorage.setItem(attendedKey, JSON.stringify(attendedArray));
    localStorage.setItem(progressKey, JSON.stringify(attendedArray));
  },

  // -------------------------------------------------------------
  // Scoped Current Question Storage
  // -------------------------------------------------------------
  getStoredCurrentQuestion: (userOrId) => {
    const key = quizStorage.getScopedKey('current_question', userOrId);
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  },
  saveCurrentQuestion: (index, userOrId) => {
    const key = quizStorage.getScopedKey('current_question', userOrId);
    localStorage.setItem(key, String(index));
  },

  // -------------------------------------------------------------
  // Scoped Throttle-Optimized Timer Sync (user123_timer)
  // -------------------------------------------------------------
  getStoredTimer: (defaultSeconds = 70 * 60, userOrId) => {
    const key = quizStorage.getScopedKey('timer', userOrId);
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return defaultSeconds;
  },
  saveTimerSync: (seconds, userOrId) => {
    const key = quizStorage.getScopedKey('timer', userOrId);
    localStorage.setItem(key, String(seconds));
  },

  // -------------------------------------------------------------
  // Scoped Active Quiz Session Status
  // -------------------------------------------------------------
  isQuizActive: (userOrId) => {
    const key = quizStorage.getScopedKey('session_status', userOrId);
    return localStorage.getItem(key) === 'active';
  },
  setQuizActive: (active = true, userOrId) => {
    const key = quizStorage.getScopedKey('session_status', userOrId);
    if (active) {
      localStorage.setItem(key, 'active');
    } else {
      localStorage.removeItem(key);
    }
  },

  // -------------------------------------------------------------
  // Scoped Resilient Payload Cache
  // -------------------------------------------------------------
  cacheSubmissionPayload: (payload, userOrId) => {
    if (payload) {
      const key = quizStorage.getScopedKey('cached_payload', userOrId);
      localStorage.setItem(key, JSON.stringify(payload));
    }
  },
  getCachedSubmissionPayload: (userOrId) => {
    const key = quizStorage.getScopedKey('cached_payload', userOrId);
    return safeJsonParse(localStorage.getItem(key), null);
  },

  // -------------------------------------------------------------
  // Post-Submission Selective Cleanup
  // Wipes active heavy keys for this user, preserves ledger & submission result
  // -------------------------------------------------------------
  clearActiveUserHeavyKeys: (userOrId) => {
    const prefix = quizStorage.getUserPrefix(userOrId);
    const heavyKeys = [
      'progress',
      'timer',
      'answers',
      'selected_options',
      'attended_questions',
      'current_question',
      'question_set',
      'personal_details',
      'cached_payload',
      'session_status'
    ];

    heavyKeys.forEach((keyName) => {
      localStorage.removeItem(`${prefix}${keyName}`);
    });
  }
};

export default quizStorage;
