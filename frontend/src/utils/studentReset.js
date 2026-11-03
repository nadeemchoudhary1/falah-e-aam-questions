import { quizStorage } from './quizStorage';
import { authAPI } from './api';
import useQuizStore from '../context/quizStore';

/**
 * Whitelist Configuration for Authorized Re-take & Local Storage Reset
 * Restricted strictly to:
 * 1. Sifatullah
 * 2. Altamash
 * 3. Farheen
 * 4. Saqiba
 * 5. Khan Mohd
 */
export const ALLOWED_RESET_STUDENTS = [
  {
    name: 'Sifatullah Sidd',
    displayName: 'Sifatullah',
    ids: [70, 71],
    emails: ['sifatullahsidd_set1@fpmi.net', 'sifatullahsidd_set2@fpmi.net'],
    keywords: ['sifatullah']
  },
  {
    name: 'Altamash',
    displayName: 'Altamash',
    ids: [54, 55, 76, 77, 770],
    emails: [
      'altamash_dtbs_set1@fpmi.net',
      'altamash_dtbs_set2@fpmi.net',
      'altamash_dpt_set1@fpmi.net',
      'altamash_dpt_set2@fpmi.net',
      'altamash_dpt_set3@fpmi.net'
    ],
    keywords: ['altamash']
  },
  {
    name: 'Farheen Khan',
    displayName: 'Farheen',
    ids: [68, 69],
    emails: ['farheenkhan_set1@fpmi.net', 'farheenkhan_set2@fpmi.net'],
    keywords: ['farheen']
  },
  {
    name: 'Saqiba',
    displayName: 'Saqiba',
    ids: [94, 95],
    emails: ['saqiba_set1@fpmi.net', 'saqiba_set2@fpmi.net'],
    keywords: ['saqiba']
  },
  {
    name: 'Khan Mohd',
    displayName: 'Khan Mohd',
    ids: [66, 67, 660],
    emails: [
      'khanmohd_set3@fpmi.net',
      'khanmohd_set4@fpmi.net',
      'khanmohd_set2@fpmi.net'
    ],
    keywords: ['khan mohd', 'khanmohd']
  }
];

export const ALL_ALLOWED_IDS = ALLOWED_RESET_STUDENTS.flatMap((s) => s.ids);
export const ALL_ALLOWED_EMAILS = ALLOWED_RESET_STUDENTS.flatMap((s) => s.emails);
export const ALL_ALLOWED_KEYWORDS = ALLOWED_RESET_STUDENTS.flatMap((s) => s.keywords);

/**
 * Checks if a given user object, ID, email, or name matches any of the authorized students.
 * Returns the matched student definition, or null if unauthorized.
 */
export const matchAllowedStudent = (input) => {
  if (!input) return null;

  // Handle object structure (user, submission record, personal details)
  if (typeof input === 'object') {
    const rawId = input.id !== undefined ? input.id : input.userId;
    if (rawId !== undefined && rawId !== null) {
      const numId = Number(rawId);
      if (!isNaN(numId)) {
        const found = ALLOWED_RESET_STUDENTS.find((s) => s.ids.includes(numId));
        if (found) return found;
      }
    }

    const email = input.email ? String(input.email).trim().toLowerCase() : '';
    if (email) {
      const found = ALLOWED_RESET_STUDENTS.find(
        (s) => s.emails.includes(email) || s.keywords.some((kw) => email.includes(kw))
      );
      if (found) return found;
    }

    const name = (input.name || input.candidateName || input.fullName || '').trim().toLowerCase();
    if (name) {
      const found = ALLOWED_RESET_STUDENTS.find((s) =>
        s.keywords.some((kw) => name.includes(kw))
      );
      if (found) return found;
    }

    return null;
  }

  // Handle scalar input (string or number: ID, email, or name snippet)
  const str = String(input).trim().toLowerCase();
  if (!str) return null;

  // Direct numeric ID comparison
  const numId = Number(str);
  if (!isNaN(numId)) {
    const found = ALLOWED_RESET_STUDENTS.find((s) => s.ids.includes(numId));
    if (found) return found;
  }

  // Email exact comparison or keyword check
  const found = ALLOWED_RESET_STUDENTS.find(
    (s) => s.emails.includes(str) || s.keywords.some((kw) => str.includes(kw))
  );
  if (found) return found;

  return null;
};

/**
 * Probes the entire application environment (context, store, localStorage, ledger, inputs)
 * to detect if an authorized student is currently active or has leftover data on this machine.
 */
export const detectAllowedStudent = (context = {}) => {
  // 1. Explicitly provided context properties
  if (context.user) {
    const match = matchAllowedStudent(context.user);
    if (match) return match;
  }
  if (context.inputIdentifier) {
    const match = matchAllowedStudent(context.inputIdentifier);
    if (match) return match;
  }
  if (context.submissionResult) {
    const match = matchAllowedStudent(context.submissionResult);
    if (match) return match;
  }

  // 2. Active Zustand store user
  try {
    const storeState = useQuizStore.getState();
    if (storeState.user) {
      const match = matchAllowedStudent(storeState.user);
      if (match) return match;
    }
    if (storeState.loginInputEmail) {
      const match = matchAllowedStudent(storeState.loginInputEmail);
      if (match) return match;
    }
  } catch (e) {
    // ignore
  }

  // 3. Stored user in localStorage
  try {
    const storedUser = quizStorage.getStoredUser();
    if (storedUser) {
      const match = matchAllowedStudent(storedUser);
      if (match) return match;
    }
  } catch (e) {
    // ignore
  }

  // 4. Last active submission record in localStorage
  try {
    const lastSubmission = quizStorage.getLastActiveSubmission();
    if (lastSubmission) {
      const match = matchAllowedStudent(lastSubmission);
      if (match) return match;
    }
  } catch (e) {
    // ignore
  }

  // 5. Stored ledger records in localStorage
  try {
    const ledger = quizStorage.getSubmissionLedger();
    if (ledger && ledger.records) {
      for (const key of Object.keys(ledger.records)) {
        const record = ledger.records[key];
        const match = matchAllowedStudent(record);
        if (match) return match;
      }
    }
  } catch (e) {
    // ignore
  }

  // 6. User-scoped keys in localStorage (e.g. user70_progress, user54_timer)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user')) {
        for (const student of ALLOWED_RESET_STUDENTS) {
          if (student.ids.some((id) => key.startsWith(`user${id}_`))) {
            return student;
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
};

/**
 * Resets backend submission record (if present), wipes all local storage and session data,
 * cleans up store state, and redirects to /login.
 */
export const performClearStorageAndLogin = async (matchedStudent = null) => {
  try {
    const activeUser = quizStorage.getStoredUser() || useQuizStore.getState().user;
    const lastSub = quizStorage.getLastActiveSubmission();
    const candidateId = activeUser?.id || lastSub?.userId || matchedStudent?.ids?.[0];
    const candidateEmail = activeUser?.email || lastSub?.email || matchedStudent?.emails?.[0];

    // Attempt backend reset
    if (candidateId || candidateEmail) {
      try {
        await authAPI.resetStudentSubmission(candidateId, candidateEmail);
      } catch (err) {
        console.warn('Backend submission reset failed (proceeding with local clear):', err);
      }
    }
  } catch (err) {
    console.error('Error prior to clearing local storage:', err);
  } finally {
    try {
      localStorage.clear();
      sessionStorage.clear();
      useQuizStore.getState().logout();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
    // Hard reload navigation to /login with empty storage
    window.location.href = '/login';
  }
};
