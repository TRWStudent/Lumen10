import { supabase } from './supabase.js';

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  successMessage.classList.remove('show');
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.add('show');
  errorMessage.classList.remove('show');
}

function hideMessages() {
  errorMessage.classList.remove('show');
  successMessage.classList.remove('show');
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  signupBtn.disabled = isLoading;
  emailInput.disabled = isLoading;
  passwordInput.disabled = isLoading;

  if (isLoading) {
    loginBtn.textContent = 'Signing in...';
    signupBtn.textContent = 'Creating...';
  } else {
    loginBtn.textContent = 'Sign In';
    signupBtn.textContent = 'Create Account';
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessages();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError('Please enter both email and password');
    return;
  }

  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    showSuccess('Successfully signed in!');

    console.log('User signed in:', data.user);
  } catch (error) {
    console.error('Login error:', error);

    if (error.message.includes('Invalid login credentials')) {
      showError('Invalid email or password');
    } else if (error.message.includes('Email not confirmed')) {
      showError('Please confirm your email before signing in');
    } else {
      showError(error.message || 'Failed to sign in. Please try again.');
    }
  } finally {
    setLoading(false);
  }
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessages();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError('Please enter both email and password');
    return;
  }

  if (password.length < 6) {
    showError('Password must be at least 6 characters long');
    return;
  }

  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });

    if (error) {
      throw error;
    }

    showSuccess('Account created successfully! You can now sign in.');

    passwordInput.value = '';

    console.log('User signed up:', data.user);
  } catch (error) {
    console.error('Signup error:', error);

    if (error.message.includes('already registered')) {
      showError('This email is already registered. Please sign in instead.');
    } else {
      showError(error.message || 'Failed to create account. Please try again.');
    }
  } finally {
    setLoading(false);
  }
});

(async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    console.log('User is already logged in:', session.user);
    showSuccess('You are already signed in!');
  }
})();

supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session);

  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});
