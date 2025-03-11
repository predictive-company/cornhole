// Initialize Supabase client
const supabaseUrl = 'https://ungxxrxwfbftlcsrmexl.supabase.co'; // Replace with your URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZ3h4cnh3ZmJmdGxjc3JtZXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NTQ2MjAsImV4cCI6MjA1NjMzMDYyMH0.mpZepE3mgF4EMNIoe2k5_7LhNLWqAwv7se1amsHLYiA'; // Replace with your key

// Create the client properly
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Sign up a new user
async function signupUser(email, password, metadata = {}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata // Store additional user metadata
      }
    });
    
    return { data, error };
  } catch (err) {
    console.error('Signup error:', err);
    throw err;
  }
}

// Log in an existing user
async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
}

// Log out the current user
async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    console.error('Logout error:', err);
    throw err;
  }
}

// Get the current user
// In auth.js, modify the getCurrentUser function
async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Get user error:', error);
      return null;
    }
    
    console.log("getCurrentUser returned user with ID:", data.user.id);
    return data.user;
  } catch (err) {
    console.error('Get user error:', err);
    return null;
  }
}

// Check if user is authenticated and redirect if not
async function checkAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  
  return user;
}
