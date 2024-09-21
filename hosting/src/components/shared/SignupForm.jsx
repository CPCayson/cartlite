import React, { useState, useEffect, useCallback } from 'react';
import './SignupForm.css';
import { useAuth } from '@context/AuthContext';
import { useToast, Progress } from '@chakra-ui/react';
import zxcvbn from 'zxcvbn';
import { useNavigate } from 'react-router-dom';
import { useStripeIntegration } from '@hooks/auth/useStripeIntegration';
import { useUserData } from '@hooks/auth/useUserData';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@hooks/firebase/firebaseConfig';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import { PhoneIcon } from '@chakra-ui/icons';

const SignupForm = ({ onClose, isSignup: initialIsSignup, handleToggle: externalHandleToggle }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [isFlipped, setIsFlipped] = useState(initialIsSignup);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});

  const {
    login,
    register,
    googleSignIn,
    facebookSignIn,
    twitterSignIn,
    phoneSignIn,
    resetPassword,
    authStatus,
    authError,
    user,
  } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { initializeUserStripeAccount } = useStripeIntegration();
  const { updateUserData } = useUserData();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsFlipped(initialIsSignup);
  }, [initialIsSignup]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') {
      const result = zxcvbn(value);
      setPasswordStrength(result.score);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (isFlipped && !formData.fullName) newErrors.fullName = 'Full name is required';
    if (isFlipped && passwordStrength < 3) newErrors.password = 'Password is too weak';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Form Error',
        description: 'Please correct the errors in the form.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      if (isFlipped) {
        const userCredential = await register(formData.email, formData.password, {
          fullName: formData.fullName,
        });
        toast({
          title: 'Account Created',
          description: "You've successfully signed up!",
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        const newUser = userCredential.user;

        await updateUserData(newUser, {
          email: formData.email,
          fullName: formData.fullName,
          createdAt: new Date().toISOString(),
          isNew: true,
        });

        const stripeData = await initializeUserStripeAccount(newUser.uid, formData.email);

        const userDocRef = doc(db, 'users', newUser.uid);
        await updateDoc(userDocRef, {
          stripeConnectedAccountId: stripeData.stripeConnectedAccountId,
          stripeCustomerId: stripeData.stripeCustomerId,
          stripeAccountStatus: stripeData.stripeAccountStatus,
          stripeAccountLink: stripeData.stripeAccountLink,
          stripeLastUpdated: stripeData.stripeLastUpdated,
        });

        if (stripeData.stripeAccountLink) {
          window.location.href = stripeData.stripeAccountLink;
        } else {
          navigate('/host');
        }
      } else {
        await login(formData.email, formData.password);
        toast({
          title: 'Login Successful',
          description: "You've been logged in.",
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/host');
      }
      onClose();
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'Authentication Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSocialSignIn = async (provider) => {
    try {
      let result;
      switch (provider) {
        case 'google':
          result = await googleSignIn();
          break;
        case 'facebook':
          result = await facebookSignIn();
          break;
        case 'twitter':
          result = await twitterSignIn();
          break;
        default:
          throw new Error('Invalid provider');
      }
      toast({
        title: 'Login Successful',
        description: `You've been logged in with ${provider}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      navigate('/host');
    } catch (error) {
      console.error(`${provider} sign-in error:`, error);
      toast({
        title: 'Authentication Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePhoneSignIn = async () => {
    try {
      await phoneSignIn(formData.phoneNumber);
      toast({
        title: 'Phone Verification Sent',
        description: 'Please check your phone for the verification code.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      // You might want to navigate to a verification page here
      // navigate('/verify-phone');
    } catch (error) {
      console.error('Phone sign-in error:', error);
      toast({
        title: 'Phone Sign-In Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setErrors({ email: 'Email is required for password reset' });
      toast({
        title: 'Error',
        description: 'Email is required for password reset',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await resetPassword(formData.email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for password reset instructions.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Password Reset Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleToggle = () => {
    setIsFlipped(!isFlipped);
    if (externalHandleToggle) {
      externalHandleToggle();
    }
  };

  if (showSplash) {
    return (
      <div className="splash-screen flex items-center justify-center">
        <img src="/assets/your-logo.png" alt="Logo" className="logo" />
      </div>
    );
  }

  return (
    <div className="card-3d-wrap">
      <div className={`card-3d-wrapper ${isFlipped ? 'card-flip' : ''}`}>
        {/* Front Side - Login */}
        <div className="center-wrap">
          {!isFlipped && (
            <form onSubmit={handleSubmit} className="form-container">
              <h2 className="form-title">Log In</h2>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  className="form-style"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Your Password"
                  className="form-style"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe" className="checkbox-label">Remember me</label>
              </div>
              <button type="submit" className="btn">Log In</button>
              <button type="button" className="btn switch-btn" onClick={handleToggle}>Switch to Sign Up</button>
              
              <div className="social-signin">
                <button type="button" className="social-btn google" onClick={() => handleSocialSignIn('google')}>
                  <FcGoogle size={20} /> Google
                </button>
                <button type="button" className="social-btn facebook" onClick={() => handleSocialSignIn('facebook')}>
                  <FaFacebook size={20} color="#3b5998" /> Facebook
                </button>
                <button type="button" className="social-btn twitter" onClick={() => handleSocialSignIn('twitter')}>
                  <FaTwitter size={20} color="#1da1f2" /> Twitter
                </button>
              </div>
              
              <div className="form-group">
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Your Phone Number"
                  className="form-style"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              <button
                type="button"
                className="btn phone-signin-btn"
                onClick={handlePhoneSignIn}
              >
                <PhoneIcon /> Sign in with Phone
              </button>
              
              <button
                type="button"
                className="btn link-btn"
                onClick={handlePasswordReset}
              >
                Forgot Password?
              </button>
            </form>
          )}
        </div>

        {/* Back Side - Signup */}
        <div className="center-wrap back">
          {isFlipped && (
            <form onSubmit={handleSubmit} className="form-container">
              <h2 className="form-title">Sign Up</h2>
              <div className="form-group">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Your Full Name"
                  className="form-style"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  className="form-style"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Your Password"
                  className="form-style"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              <Progress
                value={(passwordStrength + 1) * 20}
                className="password-progress"
                colorScheme={passwordStrength < 3 ? "red" : "green"}
              />
              <button type="submit" className="btn">Sign Up</button>
              <button type="button" className="btn switch-btn" onClick={handleToggle}>Switch to Log In</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupForm;

