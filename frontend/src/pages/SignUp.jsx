import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;

    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(
        name.trim(),
        email.trim(),
        password,
        confirmPassword
      );

      if (result.success) {
        setSuccessMsg('Account created successfully! Redirecting to dashboard...');

        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1000);
      } else {
        setError(
          result.error || 'Registration failed. Please try again.'
        );
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="brand-header">
          <div className="brand-logo">
            <Wallet size={28} />
          </div>

          <h1 className="brand-title">BillBuddy</h1>

          <p className="brand-subtitle">
            Create your BillBuddy account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="alert alert-success" role="status">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleRegister} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name-input">
              Full Name
            </label>

            <div className="input-container">
              <User size={18} className="input-icon" />

              <input
                id="name-input"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label
              className="form-label"
              htmlFor="signup-email-input"
            >
              Email Address
            </label>

            <div className="input-container">
              <Mail size={18} className="input-icon" />

              <input
                id="signup-email-input"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label
              className="form-label"
              htmlFor="signup-password-input"
            >
              Password
            </label>

            <div className="input-container">
              <Lock size={18} className="input-icon" />

              <input
                id="signup-password-input"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label
              className="form-label"
              htmlFor="confirm-password-input"
            >
              Confirm Password
            </label>

            <div className="input-container">
              <Lock size={18} className="input-icon" />

              <input
                id="confirm-password-input"
                type="password"
                className="form-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <span>Already have an account?</span>

          <Link to="/login" className="auth-footer-link">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;