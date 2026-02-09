import { supabase } from './supabase.js';

const contentDiv = document.getElementById('content');
const adminDashboard = document.getElementById('admin-dashboard');
const logoutBtn = document.getElementById('logout-btn');

function redirectToLogin() {
  window.location.href = '/login.html';
}

function showError(message) {
  contentDiv.innerHTML = `<div class="error-message">${message}</div>`;
}

async function checkAdminAccess() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      showError('Access denied. Please log in.');
      setTimeout(redirectToLogin, 2000);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      showError('Failed to verify access permissions.');
      return;
    }

    if (!profile) {
      showError('User profile not found.');
      setTimeout(redirectToLogin, 2000);
      return;
    }

    if (profile.role !== 'admin') {
      showError('Access denied. Admin privileges required.');
      setTimeout(redirectToLogin, 2000);
      return;
    }

    contentDiv.style.display = 'none';
    adminDashboard.style.display = 'block';
  } catch (error) {
    console.error('Access check error:', error);
    showError('An error occurred. Redirecting to login...');
    setTimeout(redirectToLogin, 2000);
  }
}

logoutBtn.addEventListener('click', async () => {
  try {
    await supabase.auth.signOut();
    redirectToLogin();
  } catch (error) {
    console.error('Logout error:', error);
    alert('Failed to sign out');
  }
});

checkAdminAccess();
