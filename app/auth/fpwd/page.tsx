"use client";

import { useState, ChangeEvent, FormEvent, MouseEvent, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react'; // Lucide icons for password visibility

// --- Popup Component (Reused from LoginPage) ---
interface PopupProps {
  message: string;
  onClose: () => void;
  onOverlayClick: (e: MouseEvent) => void;
  isOpen: boolean;
}

const Popup = ({ message, onClose, onOverlayClick, isOpen }: PopupProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="popup-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onOverlayClick}
    >
      <div className="popup-content bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform scale-95 animate-pop-in border border-gray-300 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
          onClick={onClose}
          aria-label="Close message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-gray-800 text-center mt-4">{message}</h2>
      </div>
    </div>
  );
};
// --- End Popup Component ---

// Custom type for the allowed characters for better readability
const ALLOWED_CHARS_REGEX = /^[~!@#$%&_{}[\].;<>a-zA-Z0-9]*$/;

// Define states for the multi-step process
type ProcessStep = 'enterEmail' | 'enterToken' | 'resetPwd';

function ForgotPasswordPage() { // Renamed component for clarity

  // --- State for Form Inputs ---
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- State for Validation Feedback ---
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [isNewPasswordValid, setIsNewPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true); // New state for password match

  // --- State for Password Visibility Toggle ---
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- State for Popup Message ---
  const [message, setMessage] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // --- State for Multi-Step Process Control ---
  const [processStep, setProcessStep] = useState<ProcessStep>('enterEmail');

  // --- Utility Functions ---

  // Handler to close the popup message
  const handleClosePopup = useCallback(() => {
    setIsPopupOpen(false);
    setMessage('');
  }, []);

  // Handler for overlay click to close popup
  const handleOverlayClick = useCallback((e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('popup-overlay')) {
      handleClosePopup();
    }
  }, [handleClosePopup]);

  // General character validation for inputs
  const isValidInputChars = useCallback((str: string): boolean => {
    // Length check and allowed characters regex test
    return str.length <= 50 && ALLOWED_CHARS_REGEX.test(str);
  }, []);

  // --- Input Change Handlers ---

  const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    // Real-time validation for email
    const isValid = newEmail.length >= 6 && newEmail.includes('@') && newEmail.includes('.') && isValidInputChars(newEmail);
    setIsEmailValid(isValid);
  }, [isValidInputChars]);

  const handleTokenChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newToken = e.target.value;
    setToken(newToken);
    // Real-time validation for token (must be exactly 6 chars and valid)
    const isValid = newToken.length === 6 && isValidInputChars(newToken);
    setIsTokenValid(isValid);
  }, [isValidInputChars]);

  const handleNewPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newPwd = e.target.value;
    setNewPassword(newPwd);
    // Real-time validation for new password
    const isValid = newPwd.length >= 6 && isValidInputChars(newPwd);
    setIsNewPasswordValid(isValid);
    // Also check if passwords match if confirmPassword already has a value
    if (confirmPassword.length > 0) {
      setPasswordsMatch(newPwd === confirmPassword);
    }
  }, [isValidInputChars, confirmPassword]);

  const handleConfirmPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const confPwd = e.target.value;
    setConfirmPassword(confPwd);
    // Real-time validation for confirm password
    const isValid = confPwd.length >= 6 && isValidInputChars(confPwd);
    setIsConfirmPasswordValid(isValid);
    // Check if passwords match
    setPasswordsMatch(newPassword === confPwd);
  }, [isValidInputChars, newPassword]);

  // --- Form Submission Handler ---

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let formValid = true; // Flag to track overall form validity for the current step
    let displayMessage = '';

    // --- Step 1: Enter Email ---
    if (processStep === 'enterEmail') {
      const finalEmailValid = email.length >= 6 && email.includes('@') && email.includes('.') && isValidInputChars(email);
      setIsEmailValid(finalEmailValid);

      if (!finalEmailValid) {
        displayMessage = 'Please enter a valid email address (min 6 chars, contains "@" and ".").';
        formValid = false;
      } else if (email === '') {
        displayMessage = 'Email field cannot be empty.';
        formValid = false;
      }

      if (!formValid) {
        setMessage(displayMessage);
        setIsPopupOpen(true);
        return;
      }

      try {
        const response = await axios.post('/api/sendtok', { email });
        setMessage(response.data.message || 'Token sent to your email!');
        setIsPopupOpen(true);
        setProcessStep('enterToken'); // Move to the next step
      } catch {
        setMessage('Failed to send token. Please try again.');
        setIsPopupOpen(true);
      }
    }

    // --- Step 2: Enter Token ---
    else if (processStep === 'enterToken') {
      const finalTokenValid = token.length === 6 && isValidInputChars(token);
      setIsTokenValid(finalTokenValid);

      if (!finalTokenValid) {
        displayMessage = 'Please enter a valid 6-character token.';
        formValid = false;
      } else if (token === '') {
        displayMessage = 'Token field cannot be empty.';
        formValid = false;
      }

      if (!formValid) {
        setMessage(displayMessage);
        setIsPopupOpen(true);
        return;
      }

      try {
        const response = await axios.post('/api/checktok', { token, email });
        setMessage(response.data.message || 'Token verified successfully!');
        setIsPopupOpen(true);
        setProcessStep('resetPwd'); // Move to the next step
      } catch {
        setMessage('Failed to verify token. Please try again.');
        setIsPopupOpen(true);
      }
    }

    // --- Step 3: Reset Password ---
    else if (processStep === 'resetPwd') {
      const finalNewPasswordValid = newPassword.length >= 6 && isValidInputChars(newPassword);
      const finalConfirmPasswordValid = confirmPassword.length >= 6 && isValidInputChars(confirmPassword);
      const passwordsDoMatch = newPassword === confirmPassword;

      setIsNewPasswordValid(finalNewPasswordValid);
      setIsConfirmPasswordValid(finalConfirmPasswordValid);
      setPasswordsMatch(passwordsDoMatch);

      if (!finalNewPasswordValid) {
        displayMessage = 'New password must be at least 6 characters and contain only allowed symbols.';
        formValid = false;
      } else if (!finalConfirmPasswordValid) {
        displayMessage = 'Confirm password must be at least 6 characters and contain only allowed symbols.';
        formValid = false;
      } else if (!passwordsDoMatch) {
        displayMessage = 'New password and confirm password do not match.';
        formValid = false;
      } else if (newPassword === '' || confirmPassword === '') {
        displayMessage = 'Please fill in both new password and confirm password fields.';
        formValid = false;
      }

      if (!formValid) {
        setMessage(displayMessage);
        setIsPopupOpen(true);
        return;
      }

      try {
        const authHeader = btoa(`${email}:${newPassword}`); // Encode credentials
        const response = await axios.post('/api/resetpwd', {
          token,
          auth_header: authHeader,
        });

        setMessage(response.data.message || 'Password reset successfully!');
        setIsPopupOpen(true);
        // Reset form and go back to email entry or redirect to login
        setEmail('');
        setToken('');
        setNewPassword('');
        setConfirmPassword('');
        setProcessStep('enterEmail'); // Or router.push('/auth/login');
      } catch {
        setMessage('Failed to reset password. Please try again.');
        setIsPopupOpen(true);
      }
    }
  }, [
    processStep,
    email,
    token,
    newPassword,
    confirmPassword,
    isValidInputChars,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
        <h2 className="text-4xl font-extrabold text-green-700 mb-6 text-center">
          {processStep === 'enterEmail' && 'Forgot Password'}
          {processStep === 'enterToken' && 'Verify Token'}
          {processStep === 'resetPwd' && 'Reset Password'}
        </h2>

        <p className="text-gray-600 text-sm mb-6 text-center">
          {processStep === 'enterEmail' && 'Enter your email to receive a password reset token.'}
          {processStep === 'enterToken' && 'Enter the 6-digit token sent to your email.'}
          {processStep === 'resetPwd' && 'Enter and confirm your new password.'}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {processStep === 'enterEmail' && (
            <div className="mb-5">
              <label className="block text-gray-800 text-sm font-semibold mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className={`w-full text-gray-600 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200
                  ${isEmailValid ? 'border-gray-300' : 'border-red-500 ring-red-300'}`}
                id="email"
                type="email"
                placeholder="you@example.com"
                name="email"
                value={email}
                onChange={handleEmailChange}
                required
                aria-invalid={!isEmailValid}
                aria-describedby="email-error"
              />
              {!isEmailValid && (
                <p id="email-error" className="text-red-500 text-xs mt-1">
                  Please enter a valid email (min 6 chars, includes @ and .).
                </p>
              )}
              <span className="block text-gray-500 text-xs mt-1">
                Allowed symbols: ~!@#$%&amp;\_{}\[].;&lt;&gt;
              </span>
            </div>
          )}

          {processStep === 'enterToken' && (
            <div className="mb-5">
              <label className="block text-gray-800 text-sm font-semibold mb-2" htmlFor="token">
                Verification Token
              </label>
              <input
                className={`w-full text-gray-600 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200
                  ${isTokenValid ? 'border-gray-300' : 'border-red-500 ring-red-300'}`}
                id="token"
                type="text"
                placeholder="Enter 6-digit token"
                name="token"
                value={token}
                onChange={handleTokenChange}
                required
                maxLength={6} // Enforce 6 characters
                aria-invalid={!isTokenValid}
                aria-describedby="token-error"
              />
              {!isTokenValid && (
                <p id="token-error" className="text-red-500 text-xs mt-1">
                  Please enter a valid 6-digit token.
                </p>
              )}
            </div>
          )}

          {processStep === 'resetPwd' && (
            <>
              <div className="mb-5">
                <label className="block text-gray-800 text-sm font-semibold mb-2" htmlFor="newPassword">
                  New Password
                </label>
                <div className="relative">
                  <input
                    className={`w-full text-gray-600 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 pr-10
                      ${isNewPasswordValid && passwordsMatch ? 'border-gray-300' : 'border-red-500 ring-red-300'}`}
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    name="newPassword"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    required
                    aria-invalid={!isNewPasswordValid || !passwordsMatch}
                    aria-describedby="new-password-error"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {!isNewPasswordValid && (
                  <p id="new-password-error" className="text-red-500 text-xs mt-1">
                    Password must be at least 6 characters and contain only allowed symbols.
                  </p>
                )}
                {!passwordsMatch && newPassword.length > 0 && confirmPassword.length > 0 && (
                  <p className="text-red-500 text-xs mt-1">
                    Passwords do not match.
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-gray-800 text-sm font-semibold mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    className={`w-full text-gray-600 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 pr-10
                      ${isConfirmPasswordValid && passwordsMatch ? 'border-gray-300' : 'border-red-500 ring-red-300'}`}
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    aria-invalid={!isConfirmPasswordValid || !passwordsMatch}
                    aria-describedby="confirm-password-error"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {!isConfirmPasswordValid && (
                  <p id="confirm-password-error" className="text-red-500 text-xs mt-1">
                    Password must be at least 6 characters and contain only allowed symbols.
                  </p>
                )}
                {!passwordsMatch && newPassword.length > 0 && confirmPassword.length > 0 && (
                  <p className="text-red-500 text-xs mt-1">
                    Passwords do not match.
                  </p>
                )}
              </div>
            </>
          )}

          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300 transform hover:scale-105"
            type="submit"
          >
            {processStep === 'enterEmail' && 'Send Token'}
            {processStep === 'enterToken' && 'Verify Token'}
            {processStep === 'resetPwd' && 'Reset Password'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          <Link href={'/auth/login'} className="text-green-600 hover:text-green-800 font-semibold transition-colors duration-200">
            Back to Login
          </Link>
        </p>
      </div>

      <Popup
        message={message}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onOverlayClick={handleOverlayClick}
      />
    </div>
  );
}

export default ForgotPasswordPage;