// constants.js

export const STRIPE_STATUS = {
  NOT_CREATED: 'not_created',
  CREATED: 'created',
  PENDING: 'pending',
  ACTIVE: 'active',
  ERROR: 'error',
};

export const AUTH_ERRORS = {
  INVALID_EMAIL: 'auth/invalid-email',
  USER_DISABLED: 'auth/user-disabled',
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
  WEAK_PASSWORD: 'auth/weak-password',
  OPERATION_NOT_ALLOWED: 'auth/operation-not-allowed',
  POPUP_CLOSED_BY_USER: 'auth/popup-closed-by-user',
};

export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logout successful',
  LOGIN_ERROR: 'Login failed',
  REGISTER_ERROR: 'Registration failed',
  LOGOUT_ERROR: 'Logout failed',
  USER_DATA_ERROR: 'Failed to load user data',
};
