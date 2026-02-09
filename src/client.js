import { supabase } from './supabase.js';

const contentDiv = document.getElementById('content');
const errorMessageDiv = document.getElementById('error-message');
const logoutBtn = document.getElementById('logout-btn');

function showError(message) {
  errorMessageDiv.textContent = message;
  errorMessageDiv.classList.add('show');
}

function redirectToLogin() {
  window.location.href = '/login.html';
}

async function checkAccess() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      redirectToLogin();
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      showError('Failed to verify access permissions');
      setTimeout(redirectToLogin, 2000);
      return;
    }

    if (!profileData || profileData.role !== 'client') {
      showError('Access denied. This page is restricted to clients only.');
      setTimeout(redirectToLogin, 2000);
      return;
    }

    contentDiv.innerHTML = '<h1>Client Dashboard Loaded</h1>';
    logoutBtn.style.display = 'inline-block';
  } catch (error) {
    console.error('Access check error:', error);
    showError('An error occurred. Redirecting to login...');
    setTimeout(redirectToLogin, 2000);
  }
}

logoutBtn.addEventListener('click', async () => {
  logoutBtn.disabled = true;
  logoutBtn.textContent = 'Signing out...';

  try {
    await supabase.auth.signOut();
    redirectToLogin();
  } catch (error) {
    console.error('Logout error:', error);
    showError('Failed to sign out');
    logoutBtn.disabled = false;
    logoutBtn.textContent = 'Sign Out';
  }
});

checkAccess();
