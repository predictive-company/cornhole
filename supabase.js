// Initialize Supabase client
const supabaseUrl = 'https://ungxxrxwfbftlcsrmexl.supabase.co'; // Replace with your URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZ3h4cnh3ZmJmdGxjc3JtZXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NTQ2MjAsImV4cCI6MjA1NjMzMDYyMH0.mpZepE3mgF4EMNIoe2k5_7LhNLWqAwv7se1amsHLYiA'; // Replace with your key
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Function to fetch players from Supabase
async function fetchPlayers() {
  try {
    // Query the players table
    const { data: players, error } = await supabase
      .from('players')
      .select('*')
      .order('rank', { ascending: true });
      
    if (error) {
      console.error('Error fetching players:', error);
      return [];
    }
    
    return players;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

// Function to fetch tournament data
async function fetchTournament(tournamentId) {
  try {
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();
      
    if (error) {
      console.error('Error fetching tournament:', error);
      return null;
    }
    
    return tournament;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
}

// This should be in your supabase.js file
async function submitTeam(userId, tournamentId, players) {
  try {
    console.log('Submitting team:', {
      userId,
      tournamentId,
      players
    });
    
    // Calculate total spent
    const totalSpent = players.reduce((sum, player) => sum + player.price, 0);
    
    // First create the team entry
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([
        { 
          user_id: userId,
          tournament_id: tournamentId,
          total_spent: totalSpent,
          created_at: new Date().toISOString()
        }
      ])
      .select();
      
    if (teamError) {
      console.error('Error creating team:', teamError);
      return false;
    }
    
    console.log('Team created:', team);
    
    // Then add the team players
    const teamId = team[0].id;
    const teamPlayers = players.map(player => ({
      team_id: teamId,
      player_id: player.id,
      price: player.price
    }));
    
    console.log('Adding team players:', teamPlayers);
    
    const { error: playersError } = await supabase
      .from('team_players')
      .insert(teamPlayers);
      
    if (playersError) {
      console.error('Error adding team players:', playersError);
      return false;
    }
    
    console.log('Team players added successfully');
    return true;
  } catch (err) {
    console.error('Unexpected error in submitTeam:', err);
    return false;
  }
}

// Function to initialize the draft page
async function initializeDraftPage(tournamentId, userId) {
  // For demo purposes, use mock data if Supabase isn't connected yet
  const useMockData = true;
  
  if (!useMockData) {
    // Get tournament data
    const tournament = await fetchTournament(tournamentId);
    if (!tournament) {
      showToast('Could not load tournament data', 'error');
      return;
    }
    
    // Update UI with tournament info
    document.querySelector('.tournament-info h2').textContent = tournament.name;
    document.querySelector('.tournament-info p').textContent = 
      `${formatDate(tournament.start_date)} • $${tournament.prize_pool.toLocaleString()} Prize Pool • Draft ${tournament.team_size} Players`;
    
    // Set timer
    updateDraftTimer(tournament.draft_close_date);
    
    // Get available players
    const players = await fetchPlayers();
    document.getElementById('playerCount').textContent = `${players.length} players`;
    
    // Check if user already has a team for this tournament
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('*, team_players(*, players(*))')
      .eq('user_id', userId)
      .eq('tournament_id', tournamentId)
      .single();
    
    if (existingTeam) {
      // Load existing team
      loadExistingTeam(existingTeam);
    } else {
      // Render available players
      renderPlayerList(players);
    }
  }
  
  // Add event listeners for draft buttons
  setupDraftButtons();
}

// Setup draft buttons functionality
function setupDraftButtons() {
  const playerList = document.getElementById('playerList');
  
  playerList.addEventListener('click', function(e) {
    if (!e.target.classList.contains('draft-btn')) return;
    
    const draftButton = e.target;
    const playerCard = draftButton.closest('.player-card');
    const playerId = playerCard.dataset.playerId;
    const playerName = playerCard.querySelector('h4').textContent;
    const playerPrice = playerCard.querySelector('.player-info div div').textContent;
    const priceValue = parseInt(playerCard.dataset.playerPrice);
    
    // Add player to team
    addPlayerToTeam(playerId, playerName, playerPrice, priceValue);
    
    // Disable the draft button
    draftButton.disabled = true;
    playerCard.style.opacity = '0.6';
  });
}

// Add player to team
function addPlayerToTeam(playerId, playerName, playerPrice, priceValue) {
  const teamList = document.getElementById('selectedPlayers');
  const teamCount = document.querySelectorAll('.team-player').length;
  const maxTeamSize = 4;
  
  if (teamCount >= maxTeamSize) {
    showToast('Your team is full! Remove a player to add another.', 'error');
    return;
  }
  
  // Remove empty state message if first player
  if (teamCount === 0) {
    const emptyMessage = document.getElementById('emptyTeamMessage');
    if (emptyMessage) emptyMessage.remove();
  }
  
  // Create team player element
  const teamPlayer = document.createElement('div');
  teamPlayer.className = 'team-player';
  teamPlayer.dataset.playerId = playerId;
  teamPlayer.dataset.playerPrice = priceValue;
  teamPlayer.innerHTML = `
    <div>
      <strong>${playerName}</strong>
      <div>${playerPrice}</div>
    </div>
    <button class="remove-player">×</button>
  `;
  
  // Add remove functionality
  const removeButton = teamPlayer.querySelector('.remove-player');
  removeButton.addEventListener('click', function() {
    teamPlayer.remove();
    
    // Re-enable the draft button
    const playerCard = document.querySelector(`.player-card[data-player-id="${playerId}"]`);
    if (playerCard) {
      playerCard.querySelector('.draft-btn').disabled = false;
      playerCard.style.opacity = '1';
    }
    
    updateTeamSummary();
    
    // Show empty state if no players
    if (document.querySelectorAll('.team-player').length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.id = 'emptyTeamMessage';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.color = 'rgba(255,255,255,0.5)';
      emptyMessage.textContent = 'Select players from the available pool to build your team';
      teamList.appendChild(emptyMessage);
    }
  });
  
  teamList.appendChild(teamPlayer);
  updateTeamSummary();
}

// Update team summary
function updateTeamSummary() {
  const teamPlayers = document.querySelectorAll('.team-player');
  const teamCount = teamPlayers.length;
  const maxTeamSize = 4;
  const totalChips = 10000;
  
  let chipsSpent = 0;
  teamPlayers.forEach(player => {
    chipsSpent += parseInt(player.dataset.playerPrice);
  });
  
  // Update UI elements
  document.getElementById('teamCount').textContent = `${teamCount}/${maxTeamSize} Selected`;
  document.getElementById('totalPlayers').textContent = `${teamCount}/${maxTeamSize}`;
  document.getElementById('chipsSpent').textContent = chipsSpent;
  document.getElementById('chipsRemaining').textContent = totalChips - chipsSpent;
  
  // Enable/disable submit button
  const submitButton = document.getElementById('submitTeam');
  submitButton.disabled = teamCount !== maxTeamSize;
}

// Function to set up search and filter
function setupSearchFilter() {
  const searchInput = document.getElementById('playerSearch');
  const sortSelect = document.getElementById('playerSort');
  
  // Add event listeners for search and sort
  searchInput.addEventListener('input', filterPlayers);
  sortSelect.addEventListener('change', filterPlayers);
  
  function filterPlayers() {
    const searchTerm = searchInput.value.toLowerCase();
    const playerCards = document.querySelectorAll('.player-card');
    
    playerCards.forEach(card => {
      const playerName = card.querySelector('h4').textContent.toLowerCase();
      const isVisible = playerName.includes(searchTerm);
      card.style.display = isVisible ? 'block' : 'none';
    });
  }
}

// Helper function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

// Function to update draft timer
function updateDraftTimer(closeDate) {
  const timerElement = document.getElementById('draftTimer').querySelector('span:last-child');
  
  // For demo purposes, just show a static time
  timerElement.textContent = '23:45:12';
  
  // In a real implementation, you would calculate the time difference
  // and update the timer every second
}

// Function to show toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.backgroundColor = type === 'success' ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)';
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// Helper function to load existing team
function loadExistingTeam(team) {
  // This would be implemented to load a user's existing team
  // from the database
}
