document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Check if user is authenticated
    const user = await checkAuth();
    
    if (user) {
      // Initialize the draft page
      const tournamentId = new URLSearchParams(window.location.search).get('tournamentId') || '1';
      
      // Setup UI interactivity
      setupDraftButtons();
      setupSearchFilter();
      
      // Add user info to the page
      addUserInfoToUI(user);
      
      // Handle form submission
      document.getElementById('submitTeam').addEventListener('click', async function() {
        const selectedPlayers = Array.from(document.querySelectorAll('.team-player')).map(el => ({
          id: el.dataset.playerId,
          price: parseInt(el.dataset.playerPrice)
        }));
        
        if (selectedPlayers.length === 4) {
          const result = await submitTeam(user.id, tournamentId, selectedPlayers);
          
          if (result) {
            showToast('Team submitted successfully!');
            setTimeout(() => {
              window.location.href = 'profile.html';
            }, 1500);
          } else {
            showToast('Error submitting team. Please try again.', 'error');
          }
        } else {
          showToast('Please select exactly 4 players', 'error');
        }
      });
    }
  } catch (error) {
    console.error('Error initializing app:', error);
    showToast('An error occurred while loading the application.', 'error');
  }
});

// Add user info to the UI
function addUserInfoToUI(user) {
  const header = document.querySelector('header');
  
  if (header) {
    // Check if the user menu already exists
    if (!document.querySelector('.user-menu')) {
      const userMenu = document.createElement('div');
      userMenu.className = 'user-menu';
      userMenu.innerHTML = `
        <a href="profile.html">${user.email}</a>
        <button id="logoutBtn" class="logout-btn">Logout</button>
      `;
      header.appendChild(userMenu);
      
      // Add logout event listener
      document.getElementById('logoutBtn').addEventListener('click', async function() {
        const { error } = await logoutUser();
        if (!error) {
          window.location.href = 'login.html';
        }
      });
    }
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  
  if (!toast) return;
  
  toast.textContent = message;
  toast.style.backgroundColor = type === 'success' ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)';
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}
