// Initialize Supabase client
const supabaseUrl = 'https://ungxxrxwfbftlcsrmexl.supabase.co'; // Your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZ3h4cnh3ZmJmdGxjc3JtZXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NTQ2MjAsImV4cCI6MjA1NjMzMDYyMH0.mpZepE3mgF4EMNIoe2k5_7LhNLWqAwv7se1amsHLYiA'; // Your Supabase key
// Create the client properly
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Sign up a new user and create a profile
async function signupUser(email, password, metadata = {}) {
  try {
    // First, create the auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // Store additional user metadata
        emailRedirectTo: `${window.location.origin}/login.html?verified=true`
      }
    });
    
    if (error) {
      return { data, error };
    }
    
    // Then create a profile in the profiles table
    if (data.user) {
      const userId = data.user.id;
      
      // Create the profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId, // Use the auth user id as the profile id
            username: metadata.username || '',
            email: email,
            full_name: metadata.full_name || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_admin: false
          }
        ]);
        
      if (profileError) {
        console.error("Error creating profile:", profileError);
        // We continue even if profile creation fails, as the user can complete profile later
      }
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Signup error:', err);
    return { data: null, error: err };
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
async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Get user error:', error);
      return null;
    }
    
    return data.user;
  } catch (err) {
    console.error('Get user error:', err);
    return null;
  }
}

// Get user profile data
async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Get profile error:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Get profile error:', err);
    return null;
  }
}

// Update user profile
async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    return { data, error };
  } catch (err) {
    console.error('Update profile error:', err);
    throw err;
  }
}

// Check if username exists
async function checkUsernameExists(username) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username);
      
    if (error) {
      throw error;
    }
    
    return { exists: data && data.length > 0, error: null };
  } catch (err) {
    console.error('Check username error:', err);
    return { exists: false, error: err };
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

// Handle password reset
async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`,
    });
    
    return { error };
  } catch (err) {
    console.error('Reset password error:', err);
    throw err;
  }
}

// Update user password
async function updatePassword(newPassword) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    return { data, error };
  } catch (err) {
    console.error('Update password error:', err);
    throw err;
  }
}