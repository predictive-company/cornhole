// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            window.location.href = 'login.html';
            return;
        }
        
        // Check admin status directly (don't use checkAuth function)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
            
        if (profileError) {
            console.error('Error checking admin status:', profileError);
            window.location.href = 'profile.html';
            return;
        }
        
        if (!profile || !profile.is_admin) {
            console.log('User is not an admin');
            window.location.href = 'profile.html';
            return;
        }
        
        console.log('User is confirmed admin, loading admin functionality');
        
        // Load all admin data
        loadTournaments();
        loadPlayers();
        loadTeams();
        setupTabs();
        setupEventListeners();
        
    } catch (err) {
        console.error('Error in admin initialization:', err);
        window.location.href = 'profile.html';
    }
});

// Setup tab switching
function setupTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and sections
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show corresponding section
            const sectionId = `${tab.dataset.tab}-section`;
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// Setup event listeners for modals and buttons
function setupEventListeners() {
    // Tournament related
    document.getElementById('addTournamentBtn').addEventListener('click', () => {
        document.getElementById('addTournamentModal').style.display = 'block';
    });
    
    document.getElementById('closeTournamentModal').addEventListener('click', () => {
        document.getElementById('addTournamentModal').style.display = 'none';
    });
    
    document.getElementById('closeEditTournamentModal').addEventListener('click', () => {
        document.getElementById('editTournamentModal').style.display = 'none';
    });
    
    document.getElementById('addTournamentForm').addEventListener('submit', handleAddTournament);
    document.getElementById('editTournamentForm').addEventListener('submit', handleUpdateTournament);
    
    // Player related
    document.getElementById('addPlayerBtn').addEventListener('click', () => {
        document.getElementById('addPlayerModal').style.display = 'block';
    });
    
    document.getElementById('closePlayerModal').addEventListener('click', () => {
        document.getElementById('addPlayerModal').style.display = 'none';
    });
    
    document.getElementById('closeEditPlayerModal').addEventListener('click', () => {
        document.getElementById('editPlayerModal').style.display = 'none';
    });
    
    document.getElementById('addPlayerForm').addEventListener('submit', handleAddPlayer);
    document.getElementById('editPlayerForm').addEventListener('submit', handleUpdatePlayer);
    
    // Team related
    document.getElementById('closeWinnersModal').addEventListener('click', () => {
        document.getElementById('setWinnersModal').style.display = 'none';
    });
    
    document.getElementById('closeViewTeamModal').addEventListener('click', () => {
        document.getElementById('viewTeamModal').style.display = 'none';
    });
    
    document.getElementById('saveWinnersBtn').addEventListener('click', handleSaveWinners);
    
    // Filters
    document.getElementById('tournamentStatusFilter').addEventListener('change', filterTournaments);
    document.getElementById('tournamentSearch').addEventListener('input', filterTournaments);
    document.getElementById('playerRankFilter').addEventListener('change', filterPlayers);
    document.getElementById('playerSearch').addEventListener('input', filterPlayers);
    document.getElementById('teamTournamentFilter').addEventListener('change', filterTeams);
    document.getElementById('teamSearch').addEventListener('input', filterTeams);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await logoutUser();
        window.location.href = 'login.html';
    });
}

// TOURNAMENT FUNCTIONS
// Load all tournaments
async function loadTournaments() {
    try {
        const { data: tournaments, error } = await supabase
            .from('tournaments')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Error loading tournaments:', error);
            showToast('Failed to load tournaments', 'error');
            return;
        }
        
        const tableBody = document.querySelector('#tournamentsTable tbody');
        tableBody.innerHTML = '';
        
        tournaments.forEach(tournament => {
            const row = document.createElement('tr');
            
            // Determine status based on dates
            const now = new Date();
            const startDate = new Date(tournament.start_date);
            const endDate = new Date(tournament.end_date);
            
            let status = tournament.status || 'upcoming';
            if (!tournament.status) {
                if (now < startDate) {
                    status = 'upcoming';
                } else if (now >= startDate && now <= endDate) {
                    status = 'active';
                } else {
                    status = 'completed';
                }
            }
            
            row.innerHTML = `
                <td>${tournament.name}</td>
                <td>${formatDate(tournament.start_date)}</td>
                <td>${formatDate(tournament.end_date)}</td>
                <td>$${tournament.prize_pool.toLocaleString()}</td>
                <td>${tournament.team_size}</td>
                <td><span class="status-badge status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                <td class="actions-cell">
                    <div class="btn-group">
                        <button class="btn btn-small edit-tournament-btn" data-id="${tournament.id}">Edit</button>
                        ${status === 'completed' ? 
                            `<button class="btn btn-small winners-btn" data-id="${tournament.id}">Set Winners</button>` : 
                            ''}
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-tournament-btn').forEach(btn => {
            btn.addEventListener('click', () => openEditTournamentModal(btn.dataset.id));
        });
        
        document.querySelectorAll('.winners-btn').forEach(btn => {
            btn.addEventListener('click', () => openSetWinnersModal(btn.dataset.id));
        });
        
        // Populate tournament dropdown in team section
        const tournamentSelect = document.getElementById('teamTournamentFilter');
        tournamentSelect.innerHTML = '<option value="all">All Tournaments</option>';
        
        tournaments.forEach(tournament => {
            const option = document.createElement('option');
            option.value = tournament.id;
            option.textContent = tournament.name;
            tournamentSelect.appendChild(option);
        });
        
    } catch (err) {
        console.error('Error in loadTournaments:', err);
        showToast('Failed to load tournaments', 'error');
    }
}

// Filter tournaments based on search and status
function filterTournaments() {
    const statusFilter = document.getElementById('tournamentStatusFilter').value;
    const searchTerm = document.getElementById('tournamentSearch').value.toLowerCase();
    
    const rows = document.querySelectorAll('#tournamentsTable tbody tr');
    
    rows.forEach(row => {
        const tournamentName = row.cells[0].textContent.toLowerCase();
        const status = row.cells[5].textContent.toLowerCase();
        
        const matchesStatus = statusFilter === 'all' || status.includes(statusFilter);
        const matchesSearch = tournamentName.includes(searchTerm);
        
        row.style.display = matchesStatus && matchesSearch ? '' : 'none';
    });
}

// Handle adding a new tournament
async function handleAddTournament(e) {
    e.preventDefault();
    
    try {
        const newTournament = {
            name: document.getElementById('tournamentName').value,
            start_date: document.getElementById('startDate').value,
            end_date: document.getElementById('endDate').value,
            draft_close_date: document.getElementById('draftCloseDate').value,
            prize_pool: parseInt(document.getElementById('prizePool').value),
            team_size: parseInt(document.getElementById('teamSize').value),
            status: document.getElementById('tournamentStatus').value,
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('tournaments')
            .insert([newTournament])
            .select();
            
        if (error) {
            console.error('Error adding tournament:', error);
            showToast('Failed to add tournament', 'error');
            return;
        }
        
        showToast('Tournament added successfully');
        document.getElementById('addTournamentForm').reset();
        document.getElementById('addTournamentModal').style.display = 'none';
        loadTournaments();
        
    } catch (err) {
        console.error('Error in handleAddTournament:', err);
        showToast('Failed to add tournament', 'error');
    }
}

// Open edit tournament modal with data
async function openEditTournamentModal(tournamentId) {
    try {
        const { data: tournament, error } = await supabase
            .from('tournaments')
            .select('*')
            .eq('id', tournamentId)
            .single();
            
        if (error) {
            console.error('Error fetching tournament details:', error);
            showToast('Failed to load tournament details', 'error');
            return;
        }
        
        // Format dates for input fields (remove Z and seconds)
        const formatDateForInput = (dateString) => {
            return dateString ? dateString.substring(0, 16) : '';
        };
        
        // Populate form fields
        document.getElementById('editTournamentId').value = tournament.id;
        document.getElementById('editTournamentName').value = tournament.name;
        document.getElementById('editStartDate').value = formatDateForInput(tournament.start_date);
        document.getElementById('editEndDate').value = formatDateForInput(tournament.end_date);
        document.getElementById('editDraftCloseDate').value = formatDateForInput(tournament.draft_close_date);
        document.getElementById('editPrizePool').value = tournament.prize_pool;
        document.getElementById('editTeamSize').value = tournament.team_size;
        document.getElementById('editTournamentStatus').value = tournament.status || 'upcoming';
        
        // Show the modal
        document.getElementById('editTournamentModal').style.display = 'block';
        
    } catch (err) {
        console.error('Error in openEditTournamentModal:', err);
        showToast('Failed to load tournament details', 'error');
    }
}

// Handle updating a tournament
async function handleUpdateTournament(e) {
    e.preventDefault();
    
    try {
        const tournamentId = document.getElementById('editTournamentId').value;
        const updatedTournament = {
            name: document.getElementById('editTournamentName').value,
            start_date: document.getElementById('editStartDate').value,
            end_date: document.getElementById('editEndDate').value,
            draft_close_date: document.getElementById('editDraftCloseDate').value,
            prize_pool: parseInt(document.getElementById('editPrizePool').value),
            team_size: parseInt(document.getElementById('editTeamSize').value),
            status: document.getElementById('editTournamentStatus').value
        };
        
        const { error } = await supabase
            .from('tournaments')
            .update(updatedTournament)
            .eq('id', tournamentId);
            
        if (error) {
            console.error('Error updating tournament:', error);
            showToast('Failed to update tournament', 'error');
            return;
        }
        
        showToast('Tournament updated successfully');
        document.getElementById('editTournamentModal').style.display = 'none';
        loadTournaments();
        
    } catch (err) {
        console.error('Error in handleUpdateTournament:', err);
        showToast('Failed to update tournament', 'error');
    }
}

// Open set winners modal
async function openSetWinnersModal(tournamentId) {
    try {
        // Get tournament details
        const { data: tournament, error: tournamentError } = await supabase
            .from('tournaments')
            .select('*')
            .eq('id', tournamentId)
            .single();
            
        if (tournamentError) {
            console.error('Error fetching tournament:', tournamentError);
            showToast('Failed to load tournament details', 'error');
            return;
        }
        
        // Display tournament info
        const tournamentInfo = document.getElementById('tournamentInfo');
        tournamentInfo.innerHTML = `
            <div class="admin-card">
                <h3>${tournament.name}</h3>
                <p>Start: ${formatDate(tournament.start_date)} | End: ${formatDate(tournament.end_date)}</p>
                <p>Prize Pool: $${tournament.prize_pool.toLocaleString()}</p>
            </div>
        `;
        
        // Get teams for this tournament
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select(`
                *,
                profiles:user_id(username, email),
                team_players(
                    *,
                    players:player_id(name)
                )
            `)
            .eq('tournament_id', tournamentId);
            
        if (teamsError) {
            console.error('Error fetching teams:', teamsError);
            showToast('Failed to load teams', 'error');
            return;
        }
        
        // Populate table with teams
        const tableBody = document.querySelector('#teamsForRankingTable tbody');
        tableBody.innerHTML = '';
        
        teams.forEach(team => {
            const playerNames = team.team_players
                .map(tp => tp.players?.name || 'Unknown Player')
                .join(', ');
                
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${team.id}</td>
                <td>${team.profiles?.username || 'Unknown'}</td>
                <td>${playerNames}</td>
                <td>
                    <input type="number" class="team-rank" data-team-id="${team.id}" 
                           value="${team.final_rank || ''}" min="1" style="width: 60px;">
                </td>
                <td>
                    <input type="number" class="team-winnings" data-team-id="${team.id}" 
                           value="${team.winnings || 0}" min="0" style="width: 100px;">
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Show the modal
        document.getElementById('setWinnersModal').style.display = 'block';
        // Store tournament ID for save function
        document.getElementById('saveWinnersBtn').dataset.tournamentId = tournamentId;
        
    } catch (err) {
        console.error('Error in openSetWinnersModal:', err);
        showToast('Failed to load winners modal', 'error');
    }
}

// Handle saving winners
async function handleSaveWinners() {
    try {
        const tournamentId = document.getElementById('saveWinnersBtn').dataset.tournamentId;
        const teamRanks = document.querySelectorAll('.team-rank');
        const teamWinnings = document.querySelectorAll('.team-winnings');
        
        const updates = [];
        
        // Prepare updates for each team
        for (let i = 0; i < teamRanks.length; i++) {
            const teamId = teamRanks[i].dataset.teamId;
            const finalRank = teamRanks[i].value ? parseInt(teamRanks[i].value) : null;
            const winnings = teamWinnings[i].value ? parseInt(teamWinnings[i].value) : 0;
            
            if (finalRank || winnings) {
                updates.push(
                    supabase
                        .from('teams')
                        .update({ final_rank: finalRank, winnings: winnings })
                        .eq('id', teamId)
                );
            }
        }
        
        // Execute all updates
        if (updates.length > 0) {
            await Promise.all(updates);
            
            // Update tournament status to completed
            await supabase
                .from('tournaments')
                .update({ status: 'completed' })
                .eq('id', tournamentId);
                
            showToast('Winners saved successfully');
            document.getElementById('setWinnersModal').style.display = 'none';
            loadTournaments();
            loadTeams(); // Refresh teams list
        } else {
            showToast('No changes to save');
        }
        
    } catch (err) {
        console.error('Error in handleSaveWinners:', err);
        showToast('Failed to save winners', 'error');
    }
}

// PLAYER FUNCTIONS
// Load all players
async function loadPlayers() {
    try {
        const { data: players, error } = await supabase
            .from('players')
            .select('*')
            .order('rank', { ascending: true });
            
        if (error) {
            console.error('Error loading players:', error);
            showToast('Failed to load players', 'error');
            return;
        }
        
        const tableBody = document.querySelector('#playersTable tbody');
        tableBody.innerHTML = '';
        
        players.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.name}</td>
                <td>${player.rank}</td>
                <td>${player.win_rate.toFixed(1)}%</td>
                <td>${player.airmail_percentage.toFixed(1)}%</td>
                <td>${player.push_percentage.toFixed(1)}%</td>
                <td>${player.potential_points}</td>
                <td class="actions-cell">
                    <div class="btn-group">
                        <button class="btn btn-small edit-player-btn" data-id="${player.id}">Edit</button>
                        <button class="btn btn-small delete-player-btn" data-id="${player.id}">Delete</button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-player-btn').forEach(btn => {
            btn.addEventListener('click', () => openEditPlayerModal(btn.dataset.id));
        });
        
        document.querySelectorAll('.delete-player-btn').forEach(btn => {
            btn.addEventListener('click', () => deletePlayer(btn.dataset.id));
        });
        
    } catch (err) {
        console.error('Error in loadPlayers:', err);
        showToast('Failed to load players', 'error');
    }
}

// Filter players based on search and rank
function filterPlayers() {
    const rankFilter = document.getElementById('playerRankFilter').value;
    const searchTerm = document.getElementById('playerSearch').value.toLowerCase();
    
    const rows = document.querySelectorAll('#playersTable tbody tr');
    
    rows.forEach(row => {
        const playerName = row.cells[0].textContent.toLowerCase();
        const rank = parseInt(row.cells[1].textContent);
        
        let matchesRank = true;
        if (rankFilter === '1-10') {
            matchesRank = rank >= 1 && rank <= 10;
        } else if (rankFilter === '11-20') {
            matchesRank = rank >= 11 && rank <= 20;
        } else if (rankFilter === '21+') {
            matchesRank = rank >= 21;
        }
        
        const matchesSearch = playerName.includes(searchTerm);
        
        row.style.display = matchesRank && matchesSearch ? '' : 'none';
    });
}

// Handle adding a new player
async function handleAddPlayer(e) {
    e.preventDefault();
    
    try {
        const newPlayer = {
            name: document.getElementById('playerName').value,
            rank: parseInt(document.getElementById('playerRank').value),
            win_rate: parseFloat(document.getElementById('winRate').value),
            airmail_percentage: parseFloat(document.getElementById('airmailPercentage').value),
            push_percentage: parseFloat(document.getElementById('pushPercentage').value),
            potential_points: parseInt(document.getElementById('potentialPoints').value),
            profile_picture: document.getElementById('profilePicture').value,
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('players')
            .insert([newPlayer])
            .select();
            
        if (error) {
            console.error('Error adding player:', error);
            showToast('Failed to add player', 'error');
            return;
        }
        
        showToast('Player added successfully');
        document.getElementById('addPlayerForm').reset();
        document.getElementById('addPlayerModal').style.display = 'none';
        loadPlayers();
        
    } catch (err) {
        console.error('Error in handleAddPlayer:', err);
        showToast('Failed to add player', 'error');
    }
}

// Open edit player modal with data
async function openEditPlayerModal(playerId) {
    try {
        const { data: player, error } = await supabase
            .from('players')
            .select('*')
            .eq('id', playerId)
            .single();
            
        if (error) {
            console.error('Error fetching player details:', error);
            showToast('Failed to load player details', 'error');
            return;
        }
        
        // Populate form fields
        document.getElementById('editPlayerId').value = player.id;
        document.getElementById('editPlayerName').value = player.name;
        document.getElementById('editPlayerRank').value = player.rank;
        document.getElementById('editWinRate').value = player.win_rate;
        document.getElementById('editAirmailPercentage').value = player.airmail_percentage;
        document.getElementById('editPushPercentage').value = player.push_percentage;
        document.getElementById('editPotentialPoints').value = player.potential_points;
        document.getElementById('editProfilePicture').value = player.profile_picture || '';
        
        // Show the modal
        document.getElementById('editPlayerModal').style.display = 'block';
        
    } catch (err) {
        console.error('Error in openEditPlayerModal:', err);
        showToast('Failed to load player details', 'error');
    }
}

// Handle updating a player
async function handleUpdatePlayer(e) {
    e.preventDefault();
    
    try {
        const playerId = document.getElementById('editPlayerId').value;
        const updatedPlayer = {
            name: document.getElementById('editPlayerName').value,
            rank: parseInt(document.getElementById('editPlayerRank').value),
            win_rate: parseFloat(document.getElementById('editWinRate').value),
            airmail_percentage: parseFloat(document.getElementById('editAirmailPercentage').value),
            push_percentage: parseFloat(document.getElementById('editPushPercentage').value),
            potential_points: parseInt(document.getElementById('editPotentialPoints').value),
            profile_picture: document.getElementById('editProfilePicture').value
        };
        
        const { error } = await supabase
            .from('players')
            .update(updatedPlayer)
            .eq('id', playerId);
            
        if (error) {
            console.error('Error updating player:', error);
            showToast('Failed to update player', 'error');
            return;
        }
        
        showToast('Player updated successfully');
        document.getElementById('editPlayerModal').style.display = 'none';
        loadPlayers();
        
    } catch (err) {
        console.error('Error in handleUpdatePlayer:', err);
        showToast('Failed to update player', 'error');
    }
}

// Delete a player
async function deletePlayer(playerId) {
    try {
        // Ask for confirmation
        if (!confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
            return;
        }
        
        // Check if player is used in any teams
        const { data: teamPlayers, error: checkError } = await supabase
            .from('team_players')
            .select('id')
            .eq('player_id', playerId);
            
        if (checkError) {
            console.error('Error checking player usage:', checkError);
            showToast('Failed to check if player is in use', 'error');
            return;
        }
        
        if (teamPlayers && teamPlayers.length > 0) {
            showToast('Cannot delete player: Player is used in one or more teams', 'error');
            return;
        }
        
        // Delete the player
        const { error } = await supabase
            .from('players')
            .delete()
            .eq('id', playerId);
            
        if (error) {
            console.error('Error deleting player:', error);
            showToast('Failed to delete player', 'error');
            return;
        }
        
        showToast('Player deleted successfully');
        loadPlayers();
        
    } catch (err) {
        console.error('Error in deletePlayer:', err);
        showToast('Failed to delete player', 'error');
    }
}

// Load all teams
async function loadTeams() {
    try {
      console.log("Attempting to load teams...");
      
      // Use an explicit join approach instead of foreign key syntax
      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          *,
          user_id,
          tournament_id
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error loading teams:', error);
        showToast('Failed to load teams', 'error');
        return;
      }
      
      // Now get user and tournament details separately
      const tableBody = document.querySelector('#teamsTable tbody');
      tableBody.innerHTML = '';
      
      // Process and display each team
      for (const team of teams) {
        // Get user data
        let username = 'Unknown';
        
        if (team.user_id) {
          const { data: user } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', team.user_id)
            .single();
            
          if (user && user.username) {
            username = user.username;
          }
        }
        
        // Get tournament data
        let tournamentName = 'Unknown Tournament';
        
        if (team.tournament_id) {
          const { data: tournament } = await supabase
            .from('tournaments')
            .select('name')
            .eq('id', team.tournament_id)
            .single();
            
          if (tournament && tournament.name) {
            tournamentName = tournament.name;
          }
        }
        
        // Create the table row
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${team.id}</td>
          <td>${username}</td>
          <td>${tournamentName}</td>
          <td>${formatDate(team.created_at)}</td>
          <td>${team.final_rank || 'Not Ranked'}</td>
          <td>${team.winnings ? '$' + team.winnings.toLocaleString() : '$0'}</td>
          <td class="actions-cell">
            <div class="btn-group">
              <button class="btn btn-small view-team-btn" data-id="${team.id}">View</button>
            </div>
          </td>
        `;
        
        tableBody.appendChild(row);
      }
      
      // Add event listeners
      document.querySelectorAll('.view-team-btn').forEach(btn => {
        btn.addEventListener('click', () => viewTeamDetails(btn.dataset.id));
      });
      
    } catch (err) {
      console.error('Error in loadTeams:', err);
      showToast('Failed to load teams', 'error');
    }
  }

// Filter teams based on search and tournament
function filterTeams() {
    const tournamentFilter = document.getElementById('teamTournamentFilter').value;
    const searchTerm = document.getElementById('teamSearch').value.toLowerCase();
    
    const rows = document.querySelectorAll('#teamsTable tbody tr');
    
    rows.forEach(row => {
        const username = row.cells[1].textContent.toLowerCase();
        const teamId = row.cells[0].textContent.toLowerCase();
        const tournamentName = row.cells[2].textContent.toLowerCase();
        
        const matchesTournament = tournamentFilter === 'all' || row.cells[2].textContent.includes(tournamentFilter);
        const matchesSearch = username.includes(searchTerm) || teamId.includes(searchTerm);
        
        row.style.display = matchesTournament && matchesSearch ? '' : 'none';
    });
}

async function viewTeamDetails(teamId) {
    try {
      // Get team data
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();
        
      if (teamError) {
        console.error('Error fetching team details:', teamError);
        showToast('Failed to load team details', 'error');
        return;
      }
      
      // Get user data
      let username = 'Unknown';
      let email = '';
      
      if (team.user_id) {
        const { data: user } = await supabase
          .from('profiles')
          .select('username, email')
          .eq('id', team.user_id)
          .single();
          
        if (user) {
          username = user.username || 'Unknown';
          email = user.email || '';
        }
      }
      
      // Get tournament data
      let tournamentName = 'Unknown';
      
      if (team.tournament_id) {
        const { data: tournament } = await supabase
          .from('tournaments')
          .select('name')
          .eq('id', team.tournament_id)
          .single();
          
        if (tournament) {
          tournamentName = tournament.name;
        }
      }
      
      // Get team players
      const { data: teamPlayers } = await supabase
        .from('team_players')
        .select('player_id')
        .eq('team_id', teamId);
      
      // Create player cards
      let playerCards = '';
      
      if (teamPlayers && teamPlayers.length > 0) {
        // Get each player's details
        for (const tp of teamPlayers) {
          const { data: player } = await supabase
            .from('players')
            .select('*')
            .eq('id', tp.player_id)
            .single();
            
          if (player) {
            playerCards += `
              <div class="admin-card" style="margin-bottom: 15px;">
                <h4>${player.name}</h4>
                <div style="display: flex; justify-content: space-between;">
                  <div>Rank: ${player.rank}</div>
                  <div>Win Rate: ${player.win_rate.toFixed(1)}%</div>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <div>Airmail: ${player.airmail_percentage.toFixed(1)}%</div>
                  <div>Push: ${player.push_percentage.toFixed(1)}%</div>
                </div>
                <div>Potential Points: ${player.potential_points}</div>
              </div>
            `;
          }
        }
      }
      
      // Create team details HTML
      const detailsContainer = document.getElementById('teamDetailsContainer');
      detailsContainer.innerHTML = `
        <div class="admin-card" style="margin-bottom: 20px;">
          <h3>Team Information</h3>
          <p><strong>Tournament:</strong> ${tournamentName}</p>
          <p><strong>User:</strong> ${username} (${email || 'No email'})</p>
          <p><strong>Created:</strong> ${formatDate(team.created_at)}</p>
          <p><strong>Final Rank:</strong> ${team.final_rank || 'Not Ranked'}</p>
          <p><strong>Winnings:</strong> ${team.winnings ? '$' + team.winnings.toLocaleString() : '$0'}</p>
        </div>
        
        <h3>Team Players</h3>
        ${playerCards || '<p>No players found for this team.</p>'}
      `;
      
      // Show the modal
      document.getElementById('viewTeamModal').style.display = 'block';
      
    } catch (err) {
      console.error('Error in viewTeamDetails:', err);
      showToast('Failed to load team details', 'error');
    }
  }

// UTILITY FUNCTIONS
// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = type === 'success' ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}