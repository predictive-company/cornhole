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

// Function to calculate potential points based on rank
function calculatePotentialPoints(rank) {
    // If rank is null or undefined, return null for potential points
    if (rank === null || rank === undefined) {
      return null;
    }
    
    // Use the appropriate rank
    const effectiveRank = rank || 999; // Default to high rank if value is 0
    
    if (effectiveRank <= 10) {
      // Top 10 players: 30-50 points (rank 1 = 30 points, rank 10 = 50 points)
      return 30 + ((effectiveRank - 1) * 2);
    } else if (effectiveRank <= 30) {
      // Rank 11-30: 50-70 points
      return 50 + ((effectiveRank - 10) * 1);
    } else {
      // Rank 31+: 70-100 points (capped at 100)
      return Math.min(100, Math.round(70 + ((effectiveRank - 30) * 0.8)));
    }
  }

// Setup event listeners for modals and buttons
function setupEventListeners() {
    // Tournament related
    const addTournamentBtn = document.getElementById('addTournamentBtn');
    if (addTournamentBtn) {
        addTournamentBtn.addEventListener('click', () => {
            document.getElementById('addTournamentModal').style.display = 'block';
        });
    }
    
    const closeTournamentPlayersModal = document.getElementById('closeTournamentPlayersModal');
    if (closeTournamentPlayersModal) {
        closeTournamentPlayersModal.addEventListener('click', () => {
            document.getElementById('tournamentPlayersModal').style.display = 'none';
        });
    }

    const closeTournamentModal = document.getElementById('closeTournamentModal');
    if (closeTournamentModal) {
        closeTournamentModal.addEventListener('click', () => {
            document.getElementById('addTournamentModal').style.display = 'none';
        });
    }
    
    const closeEditTournamentModal = document.getElementById('closeEditTournamentModal');
    if (closeEditTournamentModal) {
        closeEditTournamentModal.addEventListener('click', () => {
            document.getElementById('editTournamentModal').style.display = 'none';
        });
    }
    
    const addTournamentForm = document.getElementById('addTournamentForm');
    if (addTournamentForm) {
        addTournamentForm.addEventListener('submit', handleAddTournament);
    }
    
    const editTournamentForm = document.getElementById('editTournamentForm');
    if (editTournamentForm) {
        editTournamentForm.addEventListener('submit', handleUpdateTournament);
    }
    
    // Player related
    const addPlayerBtn = document.getElementById('addPlayerBtn');
    if (addPlayerBtn) {
        addPlayerBtn.addEventListener('click', () => {
            document.getElementById('addPlayerModal').style.display = 'block';
        });
    }
    
    const closePlayerModal = document.getElementById('closePlayerModal');
    if (closePlayerModal) {
        closePlayerModal.addEventListener('click', () => {
            document.getElementById('addPlayerModal').style.display = 'none';
        });
    }
    
    const closeEditPlayerModal = document.getElementById('closeEditPlayerModal');
    if (closeEditPlayerModal) {
        closeEditPlayerModal.addEventListener('click', () => {
            document.getElementById('editPlayerModal').style.display = 'none';
        });
    }
    
    const addPlayerForm = document.getElementById('addPlayerForm');
    if (addPlayerForm) {
        addPlayerForm.addEventListener('submit', handleAddPlayer);
    }
    
    const editPlayerForm = document.getElementById('editPlayerForm');
    if (editPlayerForm) {
        editPlayerForm.addEventListener('submit', handleUpdatePlayer);
    }
    
    // Team related
    const closeWinnersModal = document.getElementById('closeWinnersModal');
    if (closeWinnersModal) {
        closeWinnersModal.addEventListener('click', () => {
            document.getElementById('setWinnersModal').style.display = 'none';
        });
    }
    
    const closeViewTeamModal = document.getElementById('closeViewTeamModal');
    if (closeViewTeamModal) {
        closeViewTeamModal.addEventListener('click', () => {
            document.getElementById('viewTeamModal').style.display = 'none';
        });
    }
    
    const saveWinnersBtn = document.getElementById('saveWinnersBtn');
    if (saveWinnersBtn) {
        saveWinnersBtn.addEventListener('click', handleSaveWinners);
    }
    
    // Filters
    const tournamentStatusFilter = document.getElementById('tournamentStatusFilter');
    if (tournamentStatusFilter) {
        tournamentStatusFilter.addEventListener('change', filterTournaments);
    }
    
    const tournamentSearch = document.getElementById('tournamentSearch');
    if (tournamentSearch) {
        tournamentSearch.addEventListener('input', filterTournaments);
    }
    
    const playerRankFilter = document.getElementById('playerRankFilter');
    if (playerRankFilter) {
        playerRankFilter.addEventListener('change', filterPlayers);
    }
    
    const playerSearch = document.getElementById('playerSearch');
    if (playerSearch) {
        playerSearch.addEventListener('input', filterPlayers);
    }
    
    const teamTournamentFilter = document.getElementById('teamTournamentFilter');
    if (teamTournamentFilter) {
        teamTournamentFilter.addEventListener('change', filterTeams);
    }
    
    const teamSearch = document.getElementById('teamSearch');
    if (teamSearch) {
        teamSearch.addEventListener('input', filterTeams);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logoutUser();
            window.location.href = 'login.html';
        });
    }

    // Setup tab switching for tournament players modal
    const tabButtons = document.querySelectorAll('.tab-button');
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all tabs
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding content
                const tabId = this.dataset.tab + 'Tab';
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            });
        });
    }
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
        if (!tableBody) {
            console.error('Tournaments table body not found');
            return;
        }
        
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
            <td>${tournament.top_players_count || 4} players</td>
            <td>${tournament.team_size}</td>
            <td><span class="status-badge status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
            <td class="actions-cell">
                <div class="btn-group">
                    <button class="btn btn-small edit-tournament-btn" data-id="${tournament.id}">Edit</button>
                    <button class="btn btn-small manage-players-btn" data-id="${tournament.id}">Manage Players</button>

                    ${status === 'completed' ? 
                        `<button class="btn btn-small player-results-btn" data-id="${tournament.id}">Player Results</button>` : 
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
        
        document.querySelectorAll('.player-results-btn').forEach(btn => {
            btn.addEventListener('click', () => openPlayerResultsModal(btn.dataset.id));
        });

        document.querySelectorAll('.manage-players-btn').forEach(btn => {
            btn.addEventListener('click', () => openTournamentPlayersModal(btn.dataset.id));
        });
        
        // Populate tournament dropdown in team section
        const tournamentSelect = document.getElementById('teamTournamentFilter');
        if (tournamentSelect) {
            tournamentSelect.innerHTML = '<option value="all">All Tournaments</option>';
            
            tournaments.forEach(tournament => {
                const option = document.createElement('option');
                option.value = tournament.id;
                option.textContent = tournament.name;
                tournamentSelect.appendChild(option);
            });
        }
        
    } catch (err) {
        console.error('Error in loadTournaments:', err);
        showToast('Failed to load tournaments', 'error');
    }
}

// Add CSS for the player results interface
function addPlayerResultsStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Styles for player results modal */
        #playerResultsModal .modal-content {
            max-height: 90vh;
            overflow-y: auto;
        }
        
        #playerResultsContainer table {
            margin-top: 20px;
        }
        
        #playerResultsContainer .points-calculation {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 5px;
        }
        
        /* Highlight top placements */
        #playerResultsContainer select[data-value="1"] {
            border-color: #f1c40f;
        }
        
        #playerResultsContainer select[data-value="2"] {
            border-color: #bdc3c7;
        }
        
        #playerResultsContainer select[data-value="3"] {
            border-color: #cd7f32;
        }

        /* Tournament players modal styles */
        #tournamentPlayersModal .modal-content {
            max-width: 90%;
            min-width: 800px;
        }
        
        .tab-button {
            padding: 8px 16px;
            border: none;
            background-color: #2c3e50;
            color: white;
            cursor: pointer;
            border-radius: 4px 4px 0 0;
            margin-right: 4px;
        }
        
        .tab-button.active {
            background-color: #3498db;
            font-weight: bold;
        }
        
        .tab-content {
            display: none;
            padding: 15px;
            background-color: #1a1a2e;
            border-radius: 0 4px 4px 4px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .search-box {
            margin-bottom: 15px;
        }
        
        .search-box input {
            width: 100%;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #3a3a5a;
            background-color: #1f1f3a;
            color: white;
        }
        
        .status-new {
            color: #2ecc71;
        }
        
        .status-existing {
            color: #3498db;
        }
        
        .status-duplicate {
            color: #e74c3c;
        }
    `;
    document.head.appendChild(style);
}

// Filter tournaments based on search and status
function filterTournaments() {
    const statusFilter = document.getElementById('tournamentStatusFilter')?.value || 'all';
    const searchTerm = document.getElementById('tournamentSearch')?.value?.toLowerCase() || '';
    
    const rows = document.querySelectorAll('#tournamentsTable tbody tr');
    if (rows.length === 0) return;
    
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
        // Validate form fields exist
        const nameInput = document.getElementById('tournamentName');
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        const draftCloseDateInput = document.getElementById('draftCloseDate');
        const topPlayersCountInput = document.getElementById('topPlayersCount');
        const teamSizeInput = document.getElementById('teamSize');
        const statusInput = document.getElementById('tournamentStatus');
        
        if (!nameInput || !startDateInput || !endDateInput || !draftCloseDateInput || 
            !topPlayersCountInput || !teamSizeInput || !statusInput) {
            showToast('Error: Form fields missing', 'error');
            return;
        }
        
        const newTournament = {
            name: nameInput.value,
            start_date: startDateInput.value,
            end_date: endDateInput.value,
            draft_close_date: draftCloseDateInput.value,
            top_players_count: parseInt(topPlayersCountInput.value),
            team_size: parseInt(teamSizeInput.value),
            status: statusInput.value,
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
        const form = document.getElementById('addTournamentForm');
        if (form) form.reset();
        const modal = document.getElementById('addTournamentModal');
        if (modal) modal.style.display = 'none';
        await loadTournaments();
        
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
        
        // Check if all form elements exist
        const editIdInput = document.getElementById('editTournamentId');
        const editNameInput = document.getElementById('editTournamentName');
        const editStartDateInput = document.getElementById('editStartDate');
        const editEndDateInput = document.getElementById('editEndDate');
        const editDraftCloseDateInput = document.getElementById('editDraftCloseDate');
        const editTopPlayersCountInput = document.getElementById('editTopPlayersCount');
        const editTeamSizeInput = document.getElementById('editTeamSize');
        const editStatusInput = document.getElementById('editTournamentStatus');
        const editModal = document.getElementById('editTournamentModal');
        
        if (!editIdInput || !editNameInput || !editStartDateInput || !editEndDateInput || 
            !editDraftCloseDateInput || !editTopPlayersCountInput || !editTeamSizeInput || 
            !editStatusInput || !editModal) {
            showToast('Error: Edit form elements missing', 'error');
            return;
        }
        
        // Populate form fields
        editIdInput.value = tournament.id;
        editNameInput.value = tournament.name;
        editStartDateInput.value = formatDateForInput(tournament.start_date);
        editEndDateInput.value = formatDateForInput(tournament.end_date);
        editDraftCloseDateInput.value = formatDateForInput(tournament.draft_close_date);
        editTopPlayersCountInput.value = tournament.top_players_count || 4;
        editTeamSizeInput.value = tournament.team_size;
        editStatusInput.value = tournament.status || 'upcoming';
        
        // Show the modal
        editModal.style.display = 'block';
        
    } catch (err) {
        console.error('Error in openEditTournamentModal:', err);
        showToast('Failed to load tournament details', 'error');
    }
}

// Calculate and update tournament-specific player rankings
async function updateTournamentPlayerRanks(tournamentId) {
    try {
      // Get all players for this tournament
      const { data: tournamentPlayers, error: tpError } = await supabase
        .from('tournament_players')
        .select(`
          id,
          player_id,
          players (
            id,
            rank,
            player_cpi
          )
        `)
        .eq('tournament_id', tournamentId);
        
      if (tpError) {
        console.error('Error fetching tournament players:', tpError);
        showToast('Failed to fetch tournament players for ranking', 'error');
        return false;
      }
      
      if (!tournamentPlayers || tournamentPlayers.length === 0) {
        showToast('No players found for this tournament', 'info');
        return false;
      }
      
      // Sort players by their CPI in descending order (higher CPI is better)
      const sortedPlayers = [...tournamentPlayers]
        .filter(tp => tp.players && tp.players.player_cpi !== null)
        .sort((a, b) => b.players.player_cpi - a.players.player_cpi);
      
      console.log(`Updating tournament ranks for ${sortedPlayers.length} players in tournament ${tournamentId}`);
      
      // Update each player's tournament_rank and potential_points based on tournament rank
      for (let i = 0; i < sortedPlayers.length; i++) {
        const tournamentRank = i + 1; // Ranks start at 1
        const tournamentPlayerId = sortedPlayers[i].id;
        const potentialPoints = calculatePotentialPoints(tournamentRank);
        
        const { error: updateError } = await supabase
          .from('tournament_players')
          .update({ 
            tournament_rank: tournamentRank,
            potential_points: potentialPoints // Update potential_points based on new tournament_rank
          })
          .eq('id', tournamentPlayerId);
          
        if (updateError) {
          console.error(`Error updating tournament rank for player ${tournamentPlayerId}:`, updateError);
        }
      }
      
      showToast(`Updated tournament ranks and potential points for ${sortedPlayers.length} players`, 'success');
      return true;
    } catch (err) {
      console.error('Error in updateTournamentPlayerRanks:', err);
      showToast('Failed to update tournament player rankings', 'error');
      return false;
    }
  }

// Handle updating a tournament
async function handleUpdateTournament(e) {
    e.preventDefault();
    
    try {
        // Check if all form elements exist
        const editIdInput = document.getElementById('editTournamentId');
        const editNameInput = document.getElementById('editTournamentName');
        const editStartDateInput = document.getElementById('editStartDate');
        const editEndDateInput = document.getElementById('editEndDate');
        const editDraftCloseDateInput = document.getElementById('editDraftCloseDate');
        const editTopPlayersCountInput = document.getElementById('editTopPlayersCount');
        const editTeamSizeInput = document.getElementById('editTeamSize');
        const editStatusInput = document.getElementById('editTournamentStatus');
        const editModal = document.getElementById('editTournamentModal');
        
        if (!editIdInput || !editNameInput || !editStartDateInput || !editEndDateInput || 
            !editDraftCloseDateInput || !editTopPlayersCountInput || !editTeamSizeInput || 
            !editStatusInput || !editModal) {
            showToast('Error: Edit form elements missing', 'error');
            return;
        }
        
        const tournamentId = editIdInput.value;
        const updatedTournament = {
            name: editNameInput.value,
            start_date: editStartDateInput.value,
            end_date: editEndDateInput.value,
            draft_close_date: editDraftCloseDateInput.value,
            top_players_count: parseInt(editTopPlayersCountInput.value),
            team_size: parseInt(editTeamSizeInput.value),
            status: editStatusInput.value
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
        editModal.style.display = 'none';
        await loadTournaments();
        
    } catch (err) {
        console.error('Error in handleUpdateTournament:', err);
        showToast('Failed to update tournament', 'error');
    }
}

// Enhanced function to open set winners modal with player points calculation
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
        
        // Check if modal elements exist
        const tournamentInfo = document.getElementById('tournamentInfo');
        const setWinnersModal = document.getElementById('setWinnersModal');
        const saveWinnersBtn = document.getElementById('saveWinnersBtn');
        
        if (!tournamentInfo || !setWinnersModal || !saveWinnersBtn) {
            showToast('Error: Modal elements missing', 'error');
            return;
        }
        
        // Display tournament info
        tournamentInfo.innerHTML = `
            <div class="admin-card">
                <h3>${tournament.name}</h3>
                <p>Start: ${formatDate(tournament.start_date)} | End: ${formatDate(tournament.end_date)}</p>
                <p>Top Players: ${tournament.top_players_count || 4} players earn points</p>
            </div>
        `;
        
        // Get teams for this tournament
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .eq('tournament_id', tournamentId);
                
        if (teamsError) {
            console.error('Error fetching teams:', teamsError);
            showToast('Failed to load teams', 'error');
            return;
        }
        
        // Get the table body for teams ranking
        const tableBody = document.querySelector('#teamsForRankingTable tbody');
        if (!tableBody) {
            showToast('Error: Table element missing', 'error');
            return;
        }
        
        if (!teams || teams.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No teams found for this tournament</td></tr>';
            showToast('No teams found for this tournament', 'info');
            
            // Add explanation text anyway
            const explanation = document.createElement('div');
            explanation.className = 'winners-explanation';
            explanation.innerHTML = `
                <p>Set the final placement for each team. Points will be assigned to individual players based on their team's placement:</p>
                <ul>
                    <li>1st Place: 100% of player's potential points</li>
                    <li>2nd Place: 75% of player's potential points</li>
                    <li>3rd Place: 50% of player's potential points</li>
                    <li>4th Place: 25% of player's potential points</li>
                </ul>
                <p><strong>New System:</strong> Points are now awarded directly to players, not users or teams.</p>
            `;
            tournamentInfo.appendChild(explanation);
            
            // Show the modal even if empty
            setWinnersModal.style.display = 'block';
            saveWinnersBtn.dataset.tournamentId = tournamentId;
            return;
        }
        
        // Check if results already exist for this tournament
        const { data: existingResults, error: resultsError } = await supabase
            .from('tournament_results')
            .select('team_id, placement, points_earned')
            .eq('tournament_id', tournamentId);
                
        if (resultsError) {
            console.error('Error checking existing results:', resultsError);
        }
        
        // Create a map of existing results
        const resultsMap = {};
        if (existingResults && existingResults.length > 0) {
            existingResults.forEach(result => {
                resultsMap[result.team_id] = {
                    placement: result.placement,
                    points_earned: result.points_earned
                };
            });
        }
        
        // Manually build enhanced teams with user and player data
        const enhancedTeams = [];
        for (const team of teams) {
            // Get user data
            let userData = { username: 'Unknown', email: '' };
            if (team.user_id) {
                const { data: user } = await supabase
                    .from('profiles')
                    .select('username, email')
                    .eq('id', team.user_id)
                    .single();
                if (user) {
                    userData = user;
                }
            }
            
            // Get team players data
            const { data: teamPlayers } = await supabase
                .from('team_players')
                .select('*')
                .eq('team_id', team.id);
            
            const playersWithDetails = [];
            if (teamPlayers && teamPlayers.length > 0) {
                for (const tp of teamPlayers) {
                    const { data: playerData } = await supabase
                        .from('players')
                        .select('id, name, potential_points, actual_points')
                        .eq('id', tp.player_id)
                        .single();
                    
                    if (playerData) {
                        playersWithDetails.push({
                            ...tp,
                            player: playerData
                        });
                    }
                }
            }
            
            enhancedTeams.push({
                ...team,
                user: userData,
                players: playersWithDetails
            });
        }
        
        // Populate table with enhanced teams
        tableBody.innerHTML = '';
        
        enhancedTeams.forEach(team => {
            // Calculate total potential points for this team
            let totalPotentialPoints = 0;
            let playersList = '';
            
            if (team.players && team.players.length > 0) {
                team.players.forEach(tp => {
                    if (tp.player) {
                        totalPotentialPoints += tp.potential_points || 0;
                        playersList += `<div class="player-item">
                            ${tp.player.name} (${tp.player.potential_points} potential pts, currently has ${tp.player.actual_points || 0} pts)
                        </div>`;
                    }
                });
            }
            
            // Get existing results for this team if any
            const existingResult = resultsMap[team.id] || {};
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${team.id}</td>
                <td>${team.user?.username || 'Unknown'}</td>
                <td>
                    <div class="players-list">
                        ${playersList || 'No players'}
                    </div>
                    <div class="total-potential">Total: ${totalPotentialPoints} potential points</div>
                </td>
                <td>
                    <select class="team-placement" data-team-id="${team.id}" data-potential-points="${totalPotentialPoints}">
                        <option value="">Select Placement</option>
                        <option value="1" ${existingResult.placement === 1 ? 'selected' : ''}>1st Place</option>
                        <option value="2" ${existingResult.placement === 2 ? 'selected' : ''}>2nd Place</option>
                        <option value="3" ${existingResult.placement === 3 ? 'selected' : ''}>3rd Place</option>
                        <option value="4" ${existingResult.placement === 4 ? 'selected' : ''}>4th Place</option>
                        <option value="0" ${existingResult.placement === 0 ? 'selected' : ''}>Did Not Place</option>
                    </select>
                </td>
                <td>
                    <input type="number" class="team-points" data-team-id="${team.id}" 
                        value="${existingResult.points_earned || 0}" min="0" style="width: 100px;">
                    <div class="points-calculation"></div>
                </td>
                <td>
                    <input type="number" class="team-winnings" data-team-id="${team.id}" 
                        value="${team.winnings || 0}" min="0" style="width: 100px;">
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to calculate points automatically
        document.querySelectorAll('.team-placement').forEach(select => {
            select.addEventListener('change', function() {
                const placement = parseInt(this.value);
                const potentialPoints = parseInt(this.dataset.potentialPoints);
                const pointsInput = this.closest('tr').querySelector('.team-points');
                const calculationDiv = this.closest('tr').querySelector('.points-calculation');
                
                if (!pointsInput || !calculationDiv) return;
                
                // Calculate points based on placement
                let pointsEarned = 0;
                if (placement === 1) {
                    pointsEarned = potentialPoints; // 100% of potential points for 1st place
                } else if (placement === 2) {
                    pointsEarned = Math.round(potentialPoints * 0.75); // 75% for 2nd place
                } else if (placement === 3) {
                    pointsEarned = Math.round(potentialPoints * 0.5); // 50% for 3rd place
                } else if (placement === 4) {
                    pointsEarned = Math.round(potentialPoints * 0.25); // 25% for 4th place
                }
                
                pointsInput.value = pointsEarned;
                
                // Show calculation explanation
                if (placement > 0 && placement <= 4) {
                    const percentage = [100, 75, 50, 25][placement - 1];
                    calculationDiv.textContent = `${percentage}% of ${potentialPoints} = ${pointsEarned} (split among players)`;
                    calculationDiv.style.display = 'block';
                } else {
                    calculationDiv.style.display = 'none';
                }
                
                // Run validation
                validateTournamentResults();
            });
        });
        
        // Add some helpful explanation text
        const explanation = document.createElement('div');
        explanation.className = 'winners-explanation';
        explanation.innerHTML = `
            <p>Set the final placement for each team. Points will be assigned to individual players based on their team's placement:</p>
            <ul>
                <li>1st Place: 100% of player's potential points</li>
                <li>2nd Place: 75% of player's potential points</li>
                <li>3rd Place: 50% of player's potential points</li>
                <li>4th Place: 25% of player's potential points</li>
            </ul>
            <p><strong>New System:</strong> Points are now awarded directly to players, not users or teams.</p>
        `;
        
        tournamentInfo.appendChild(explanation);
        
        // Show the modal
        setWinnersModal.style.display = 'block';
        // Store tournament ID for save function
        saveWinnersBtn.dataset.tournamentId = tournamentId;
        
        // Set up validation
        enhanceTournamentResultsModal();
        
    } catch (err) {
        console.error('Error in openSetWinnersModal:', err);
        showToast('Failed to load winners modal', 'error');
    }
}

// Validate tournament results before saving
function validateTournamentResults() {
    const placements = document.querySelectorAll('.team-placement');
    const validationMessage = document.getElementById('placementValidationMessage');
    
    if (!validationMessage) {
        console.error('Validation message element not found');
        return false;
    }
    
    // Clear previous messages
    validationMessage.style.display = 'none';
    validationMessage.textContent = '';
    
    // Count placements
    const placementCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const placementTeams = { 1: null, 2: null, 3: null, 4: null };
    
    // Check for duplicate placements
    let hasError = false;
    
    placements.forEach(select => {
        const placement = parseInt(select.value);
        const teamId = select.dataset.teamId;
        
        if (placement >= 1 && placement <= 4) {
            placementCounts[placement]++;
            
            if (placementCounts[placement] > 1) {
                hasError = true;
            }
            
            // Store team ID for this placement
            placementTeams[placement] = teamId;
        }
    });
    
    // Check for sequential placements (shouldn't have 1st and 3rd without 2nd)
    for (let i = 1; i < 4; i++) {
        if (placementCounts[i] === 0 && placementCounts[i+1] > 0) {
            hasError = true;
            validationMessage.textContent = `Error: Cannot have ${getOrdinal(i+1)} place without ${getOrdinal(i)} place.`;
            validationMessage.style.display = 'block';
            return false;
        }
    }
    
    // Check for duplicate placements
    for (let i = 1; i <= 4; i++) {
        if (placementCounts[i] > 1) {
            validationMessage.textContent = `Error: Multiple teams assigned to ${getOrdinal(i)} place.`;
            validationMessage.style.display = 'block';
            return false;
        }
    }
    
    // If no errors found but no teams placed at all
    if (!hasError && placementCounts[1] === 0 && placementCounts[2] === 0 && 
        placementCounts[3] === 0 && placementCounts[4] === 0) {
        validationMessage.textContent = 'Warning: No teams have been given a placement.';
        validationMessage.style.display = 'block';
        // This is just a warning, so return true
        return true;
    }
    
    return !hasError;
}

// Enhanced function to save tournament results and update player points directly
async function handleSaveWinners() {
    try {
        // First validate the placements
        if (!validateTournamentResults()) {
            return; // Stop if validation fails
        }
        
        const saveWinnersBtn = document.getElementById('saveWinnersBtn');
        if (!saveWinnersBtn) {
            showToast('Error: Save button not found', 'error');
            return;
        }
        
        const tournamentId = saveWinnersBtn.dataset.tournamentId;
        if (!tournamentId) {
            showToast('Error: Tournament ID not found', 'error');
            return;
        }
        
        const placements = document.querySelectorAll('.team-placement');
        const pointsInputs = document.querySelectorAll('.team-points');
        const winningsInputs = document.querySelectorAll('.team-winnings');
        
        if (placements.length === 0 || pointsInputs.length === 0 || winningsInputs.length === 0) {
            showToast('Error: No team data found', 'error');
            return;
        }
        
        // Start a loading indicator
        saveWinnersBtn.textContent = 'Saving...';
        saveWinnersBtn.disabled = true;
        
        try {
            // First, delete any existing results for this tournament
            await supabase
                .from('tournament_results')
                .delete()
                .eq('tournament_id', tournamentId);
        } catch (deleteError) {
            console.error('Error deleting existing results:', deleteError);
            showToast('Error deleting existing results', 'error');
            saveWinnersBtn.textContent = 'Save Results';
            saveWinnersBtn.disabled = false;
            return;
        }
        
        // Prepare updates for tournament results, team winnings, and player points
        const tournamentResults = [];
        const teamUpdates = [];
        const playerPointsUpdates = [];
        
        // Process each team
        for (let i = 0; i < placements.length; i++) {
            const teamId = placements[i].dataset.teamId;
            const placement = parseInt(placements[i].value);
            const pointsEarned = parseInt(pointsInputs[i].value) || 0;
            const winnings = parseInt(winningsInputs[i].value) || 0;
            
            // Only add results for teams with valid placements
            if (placement > 0) {
                tournamentResults.push({
                    tournament_id: tournamentId,
                    team_id: teamId,
                    placement: placement,
                    points_earned: pointsEarned
                });
                
                // Fetch the players in this team to assign them points
                const { data: teamPlayers, error: teamPlayersError } = await supabase
                    .from('team_players')
                    .select('player_id, potential_points')
                    .eq('team_id', teamId);
                
                if (teamPlayersError) {
                    console.error('Error fetching team players:', teamPlayersError);
                    continue;
                }
                
                // Calculate points for each player based on placement
                if (teamPlayers && teamPlayers.length > 0) {
                    for (const teamPlayer of teamPlayers) {
                        let pointsForPlayer = 0;
                        
                        // Calculate player points based on placement
                        if (placement === 1) {
                            pointsForPlayer = teamPlayer.potential_points; // 100% for 1st place
                        } else if (placement === 2) {
                            pointsForPlayer = Math.round(teamPlayer.potential_points * 0.75); // 75% for 2nd place
                        } else if (placement === 3) {
                            pointsForPlayer = Math.round(teamPlayer.potential_points * 0.5); // 50% for 3rd place
                        } else if (placement === 4) {
                            pointsForPlayer = Math.round(teamPlayer.potential_points * 0.25); // 25% for 4th place
                        }
                        
                        // Only update if points were earned
                        if (pointsForPlayer > 0) {
                            // Get current player points
                            const { data: player, error: playerError } = await supabase
                                .from('players')
                                .select('actual_points')
                                .eq('id', teamPlayer.player_id)
                                .single();
                            
                            if (playerError) {
                                console.error('Error fetching player:', playerError);
                                continue;
                            }
                            
                            // Add tournament points to player's existing points
                            const currentPoints = player.actual_points || 0;
                            const newTotalPoints = currentPoints + pointsForPlayer;
                            
                            // Add to player updates
                            playerPointsUpdates.push({
                                playerId: teamPlayer.player_id,
                                points: newTotalPoints
                            });
                            
                            // Create a record in player_tournament_points table
                            try {
                                await supabase
                                    .from('player_tournament_points')
                                    .insert([{
                                        player_id: teamPlayer.player_id,
                                        tournament_id: tournamentId,
                                        team_id: teamId,
                                        points_earned: pointsForPlayer,
                                        placement: placement
                                    }]);
                            } catch (pointsRecordError) {
                                console.error('Error recording player tournament points:', pointsRecordError);
                            }
                        }
                    }
                }
            }
            
            // Update team winnings
            teamUpdates.push({
                teamId: teamId,
                finalRank: placement || null,
                winnings: winnings
            });
        }
        
        // Execute team updates
        if (teamUpdates.length > 0) {
            for (const update of teamUpdates) {
                try {
                    await supabase
                        .from('teams')
                        .update({ 
                            final_rank: update.finalRank,
                            winnings: update.winnings 
                        })
                        .eq('id', update.teamId);
                } catch (teamUpdateError) {
                    console.error('Error updating team:', teamUpdateError);
                }
            }
        }
        
        // Execute player points updates
        if (playerPointsUpdates.length > 0) {
            for (const update of playerPointsUpdates) {
                try {
                    await supabase
                        .from('players')
                        .update({ 
                            actual_points: update.points 
                        })
                        .eq('id', update.playerId);
                } catch (playerUpdateError) {
                    console.error('Error updating player points:', playerUpdateError);
                }
            }
        }
        
        // Insert tournament results
        if (tournamentResults.length > 0) {
            try {
                await supabase
                    .from('tournament_results')
                    .insert(tournamentResults);
            } catch (resultsError) {
                console.error('Error saving tournament results:', resultsError);
                showToast('Error saving tournament results', 'error');
                saveWinnersBtn.textContent = 'Save Results';
                saveWinnersBtn.disabled = false;
                return;
            }
        }
        
        // Update tournament status to completed
        try {
            await supabase
                .from('tournaments')
                .update({ status: 'completed' })
                .eq('id', tournamentId);
        } catch (statusError) {
            console.error('Error updating tournament status:', statusError);
        }
        
        showToast('Tournament results saved successfully. Player points have been updated.');
        const setWinnersModal = document.getElementById('setWinnersModal');
        if (setWinnersModal) {
            setWinnersModal.style.display = 'none';
        }
        
        // Refresh tournament and team lists
        await loadTournaments();
        await loadTeams();
        await loadPlayers(); // Also refresh the players list to show updated points
        
        // Reset button state
        saveWinnersBtn.textContent = 'Save Results';
        saveWinnersBtn.disabled = false;
        
    } catch (err) {
        console.error('Error in handleSaveWinners:', err);
        showToast('Failed to save tournament results', 'error');
        
        // Reset button in case of error
        const saveWinnersBtn = document.getElementById('saveWinnersBtn');
        if (saveWinnersBtn) {
            saveWinnersBtn.textContent = 'Save Results';
            saveWinnersBtn.disabled = false;
        }
    }
}

// Enhance the tournament results modal
function enhanceTournamentResultsModal() {
    // Add striped rows for better readability
    const rows = document.querySelectorAll('#teamsForRankingTable tbody tr');
    rows.forEach((row, index) => {
        if (index % 2 === 1) {
            row.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        }
    });
    
    // Setup validation
    setupPlacementValidation();
    
    // Add tooltips to the headers
    const headers = document.querySelectorAll('#teamsForRankingTable th');
    if (headers.length >= 6) {
        headers[3].title = 'Select the team\'s final placement in the tournament';
        headers[4].title = 'Points earned based on placement percentage';
        headers[5].title = 'Cash prize awarded to the team';
    }
}

// Add validation to the placement dropdowns
function setupPlacementValidation() {
    document.querySelectorAll('.team-placement').forEach(select => {
        select.addEventListener('change', function() {
            validateTournamentResults();
        });
    });
}

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
        if (!tableBody) {
            console.error('Players table body not found');
            return;
        }
        
        tableBody.innerHTML = '';
        
        players.forEach(player => {
            // Format skill level
            let skillLevelDisplay = "Unknown";
            if (player.skill_level) {
                switch(player.skill_level) {
                    case 'P': skillLevelDisplay = 'Pro'; break;
                    case 'E': skillLevelDisplay = 'Elite'; break;
                    case 'ACLS': skillLevelDisplay = 'Senior'; break;
                    case 'ACLJ': skillLevelDisplay = 'Junior'; break;
                    case 'ACLW': skillLevelDisplay = 'Women\'s'; break;
                    default: skillLevelDisplay = player.skill_level;
                }
            }
            
            // Handle null values with default values or dashes
            const skillLevel = skillLevelDisplay || '—';
            const playerPPR = player.player_ppr !== null ? player.player_ppr.toFixed(1) : '—';
            const playerCPI = player.player_cpi !== null ? player.player_cpi.toFixed(1) : '—';
            const potentialPoints = player.potential_points || 0;
            const actualPoints = player.actual_points || 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.name}</td>
                <td>${player.rank || 'N/A'}</td>
                <td>${skillLevel}</td>
                <td>${playerPPR}</td>
                <td>${playerCPI}</td>
                <td>${potentialPoints}</td>
                <td>${actualPoints}</td>
                <td class="actions-cell">
                    <div class="btn-group">
                        <button class="btn btn-small edit-player-btn" data-id="${player.id}">Edit</button>
                        <button class="btn btn-small delete-player-btn" data-id="${player.id}">Delete</button>
                        <button class="btn btn-small points-history-btn" data-id="${player.id}">Points History</button>
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
        
        document.querySelectorAll('.points-history-btn').forEach(btn => {
            btn.addEventListener('click', () => viewPlayerPointsHistory(btn.dataset.id));
        });
        
    } catch (err) {
        console.error('Error in loadPlayers:', err);
        showToast('Failed to load players', 'error');
    }
}


// Filter players based on search and rank
function filterPlayers() {
    const rankFilter = document.getElementById('playerRankFilter')?.value || 'all';
    const searchTerm = document.getElementById('playerSearch')?.value?.toLowerCase() || '';
    
    const rows = document.querySelectorAll('#playersTable tbody tr');
    if (rows.length === 0) return;
    
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

// Modified handleAddPlayer function to update ranks after adding a new player
async function handleAddPlayer(e) {
    e.preventDefault();
    
    try {
        // Check if form elements exist
        const nameInput = document.getElementById('playerName');
        const skillLevelInput = document.getElementById('skillLevel');
        const playerPPRInput = document.getElementById('playerPPR');
        const playerCPIInput = document.getElementById('playerCPI');
        const profilePictureInput = document.getElementById('profilePicture');
        const aclPlayerIdInput = document.getElementById('aclPlayerId');
        const form = document.getElementById('addPlayerForm');
        const modal = document.getElementById('addPlayerModal');
        
        if (!nameInput || !skillLevelInput || !playerPPRInput || 
            !playerCPIInput || !form || !modal) {
            showToast('Error: Form elements missing', 'error');
            return;
        }
        
        // Set a temporary high rank (will be updated properly by updatePlayerRanksByCPI)
        // A high rank number gives the maximum potential points as a safe default
        const temporaryRank = 999;
        
        const newPlayer = {
            name: nameInput.value,
            skill_level: skillLevelInput.value,
            player_ppr: parseFloat(playerPPRInput.value) || null,
            player_cpi: parseFloat(playerCPIInput.value) || null,
            acl_player_id: aclPlayerIdInput?.value || null,
            rank: temporaryRank,
            potential_points: calculatePotentialPoints(temporaryRank),
            profile_picture: profilePictureInput?.value || '',
            actual_points: 0, // Initialize with zero actual points
            created_at: new Date().toISOString()
        };
        
        // First add the player
        const { data, error } = await supabase
            .from('players')
            .insert([newPlayer])
            .select();
            
        if (error) {
            console.error('Error adding player:', error);
            showToast('Failed to add player', 'error');
            return;
        }
        
        // Close modal and reset form
        form.reset();
        modal.style.display = 'none';
        
        // Then update all player ranks based on CPI
        showToast('Player added, updating rankings...', 'success');
        await updatePlayerRanksByCPI();
        
        // Finally reload the players list to show the changes
        await loadPlayers();
        
    } catch (err) {
        console.error('Error in handleAddPlayer:', err);
        showToast('Failed to add player', 'error');
    }
}

// Modified openEditPlayerModal function to handle new fields
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
        
        // Check if form elements exist
        const idInput = document.getElementById('editPlayerId');
        const nameInput = document.getElementById('editPlayerName');
        const currentRankInput = document.getElementById('currentPlayerRank');
        const skillLevelInput = document.getElementById('editSkillLevel');
        const playerPPRInput = document.getElementById('editPlayerPPR');
        const playerCPIInput = document.getElementById('editPlayerCPI');
        const potentialPointsInput = document.getElementById('editPotentialPoints');
        const actualPointsInput = document.getElementById('editActualPoints');
        const profilePictureInput = document.getElementById('editProfilePicture');
        const aclPlayerIdInput = document.getElementById('editAclPlayerId');
        const modal = document.getElementById('editPlayerModal');
        
        if (!idInput || !nameInput || !skillLevelInput || !playerPPRInput || 
            !playerCPIInput || !actualPointsInput || !modal) {
            showToast('Error: Form elements missing', 'error');
            return;
        }
        
        // Populate form fields
        idInput.value = player.id;
        nameInput.value = player.name;
        
        // Show current rank (read-only)
        if (currentRankInput) {
            currentRankInput.value = player.rank || 'Unranked';
        }
        
        skillLevelInput.value = player.skill_level || 'P'; // Default to 'P' if missing
        playerPPRInput.value = player.player_ppr !== null ? player.player_ppr : '';
        playerCPIInput.value = player.player_cpi !== null ? player.player_cpi : '';
        
        // Show potential points (read-only)
        if (potentialPointsInput) {
            potentialPointsInput.value = player.potential_points || calculatePotentialPoints(player.rank);
        }
        
        actualPointsInput.value = player.actual_points || 0;
        
        // Set ACL Player ID if available
        if (aclPlayerIdInput) {
            aclPlayerIdInput.value = player.acl_player_id || '';
        }
        
        if (profilePictureInput) {
            profilePictureInput.value = player.profile_picture || '';
        }
        
        // Show the modal
        modal.style.display = 'block';
        
    } catch (err) {
        console.error('Error in openEditPlayerModal:', err);
        showToast('Failed to load player details', 'error');
    }
}

// Add "Update Rankings" button to the players section
function addUpdateRankingsButton() {
    // Find the filter options container in the players section
    const filterOptions = document.querySelector('#players-section .filter-options');
    
    if (!filterOptions) {
        console.error('Filter options container not found');
        return;
    }
    
    // Create the update rankings button
    const updateRankingsBtn = document.createElement('button');
    updateRankingsBtn.className = 'btn';
    updateRankingsBtn.id = 'updateRankingsBtn';
    updateRankingsBtn.textContent = 'Update Rankings';
    
    // Add button to the filter options container
    filterOptions.appendChild(updateRankingsBtn);
    
    // Add event listener
    updateRankingsBtn.addEventListener('click', async () => {
        updateRankingsBtn.disabled = true;
        updateRankingsBtn.textContent = 'Updating...';
        
        await updatePlayerRanksByCPI();
        
        // Reload players to show updated ranks
        await loadPlayers();
        
        updateRankingsBtn.disabled = false;
        updateRankingsBtn.textContent = 'Update Rankings';
    });
}

// Call this function after the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the admin.js scripts to initialize first
    setTimeout(() => {
        addUpdateRankingsButton();
    }, 500);
});

// Modified handleUpdatePlayer function to update ranks after editing a player
async function handleUpdatePlayer(e) {
    e.preventDefault();
    
    try {
        // Check if form elements exist
        const idInput = document.getElementById('editPlayerId');
        const nameInput = document.getElementById('editPlayerName');
        const skillLevelInput = document.getElementById('editSkillLevel');
        const playerPPRInput = document.getElementById('editPlayerPPR');
        const playerCPIInput = document.getElementById('editPlayerCPI');
        const actualPointsInput = document.getElementById('editActualPoints');
        const profilePictureInput = document.getElementById('editProfilePicture');
        const aclPlayerIdInput = document.getElementById('editAclPlayerId');
        const modal = document.getElementById('editPlayerModal');
        
        if (!idInput || !nameInput || !skillLevelInput || !playerPPRInput || 
            !playerCPIInput || !actualPointsInput || !modal) {
            showToast('Error: Form elements missing', 'error');
            return;
        }
        
        // Check if CPI was changed by getting the original value
        const playerId = idInput.value;
        const newCPIValue = playerCPIInput.value ? parseFloat(playerCPIInput.value) : null;
        let cpiChanged = false;
        
        // Get current player data to check if CPI changed
        const { data: originalPlayer, error: getError } = await supabase
            .from('players')
            .select('player_cpi')
            .eq('id', playerId)
            .single();
            
        if (!getError && originalPlayer) {
            cpiChanged = originalPlayer.player_cpi !== newCPIValue;
        }
        
        // Prepare player update object - without rank/potential_points as those will be set by updatePlayerRanksByCPI
        const updatedPlayer = {
            name: nameInput.value,
            skill_level: skillLevelInput.value,
            player_ppr: playerPPRInput.value ? parseFloat(playerPPRInput.value) : null,
            player_cpi: newCPIValue,
            acl_player_id: aclPlayerIdInput?.value || null,
            actual_points: parseInt(actualPointsInput.value || 0),
            profile_picture: profilePictureInput?.value || ''
        };
        
        // Update the player
        const { error } = await supabase
            .from('players')
            .update(updatedPlayer)
            .eq('id', playerId);
            
        if (error) {
            console.error('Error updating player:', error);
            showToast('Failed to update player', 'error');
            return;
        }
        
        // Close the modal
        modal.style.display = 'none';
        
        // Only update rankings if CPI was changed
        if (cpiChanged) {
            showToast('Player updated, recalculating rankings...', 'success');
            await updatePlayerRanksByCPI();
        } else {
            showToast('Player updated successfully', 'success');
        }
        
        // Reload the players list
        await loadPlayers();
        
    } catch (err) {
        console.error('Error in handleUpdatePlayer:', err);
        showToast('Failed to update player', 'error');
    }
}
// View player points history function
async function viewPlayerPointsHistory(playerId) {
    try {
        // Create a modal for displaying points history if it doesn't exist
        if (!document.getElementById('playerPointsHistoryModal')) {
            const modal = document.createElement('div');
            modal.id = 'playerPointsHistoryModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal" id="closePointsHistoryModal">&times;</span>
                    <h2>Player Points History</h2>
                    <div id="playerPointsHistoryContainer">
                        <div class="loading">Loading points history...</div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listener to close button
            document.getElementById('closePointsHistoryModal').addEventListener('click', () => {
                document.getElementById('playerPointsHistoryModal').style.display = 'none';
            });
        }
        
        // Show the modal
        document.getElementById('playerPointsHistoryModal').style.display = 'block';
        
        // Get player data
        const { data: player, error: playerError } = await supabase
            .from('players')
            .select('*')
            .eq('id', playerId)
            .single();
            
        if (playerError) {
            console.error('Error fetching player:', playerError);
            showToast('Failed to load player data', 'error');
            return;
        }
        
        // Get player's tournament points
        const { data: pointsHistory, error: pointsError } = await supabase
            .from('player_tournament_points')
            .select(`
                *,
                tournaments(name, start_date),
                teams(id)
            `)
            .eq('player_id', playerId)
            .order('created_at', { ascending: false });
            
        if (pointsError) {
            console.error('Error fetching points history:', pointsError);
        }
        
        // Prepare the container
        const container = document.getElementById('playerPointsHistoryContainer');
        if (!container) {
            showToast('Error: History container not found', 'error');
            return;
        }
        
        // Show player summary
        container.innerHTML = `
            <div class="admin-card" style="margin-bottom: 20px;">
                <h3>${player.name}</h3>
                <p><strong>Current Points:</strong> ${player.actual_points || 0}</p>
                <p><strong>Potential Points:</strong> ${player.potential_points}</p>
            </div>
            
            <h3>Tournament Points History</h3>
            
            ${pointsHistory && pointsHistory.length > 0 ? `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Tournament</th>
                            <th>Date</th>
                            <th>Placement</th>
                            <th>Points Earned</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pointsHistory.map(record => `
                            <tr>
                                <td>${record.tournaments?.name || 'Unknown Tournament'}</td>
                                <td>${formatDate(record.tournaments?.start_date || record.created_at)}</td>
                                <td>${record.placement ? getOrdinal(record.placement) : 'N/A'}</td>
                                <td>${record.points_earned}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="points-history-summary">
                    <p><strong>Total Points from Tournaments:</strong> ${pointsHistory.reduce((sum, record) => sum + record.points_earned, 0)}</p>
                </div>
            ` : '<p>No tournament points history found for this player.</p>'}
            
            <div class="points-history-chart">
                <!-- Add a simple bar chart representation of points -->
                <h4>Points by Tournament</h4>
                <div class="chart-container">
                    ${pointsHistory && pointsHistory.length > 0 ? 
                        pointsHistory.map(record => `
                            <div class="chart-bar-container">
                                <div class="chart-label">${truncateText(record.tournaments?.name || 'Unknown', 20)}</div>
                                <div class="chart-bar" style="width: ${Math.min(100, record.points_earned)}%;">
                                    <span class="chart-value">${record.points_earned}</span>
                                </div>
                            </div>
                        `).join('') : 
                        '<p>No data available for chart</p>'
                    }
                </div>
            </div>
            
            <style>
                .points-history-summary {
                    margin-top: 1rem;
                    background-color: rgba(74, 222, 128, 0.1);
                    padding: 1rem;
                    border-radius: 4px;
                }
                .points-history-chart {
                    margin-top: 2rem;
                }
                .chart-container {
                    padding: 10px 0;
                }
                .chart-bar-container {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .chart-label {
                    width: 150px;
                    text-align: right;
                    padding-right: 10px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .chart-bar {
                    height: 25px;
                    background-color: #4ade80;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    padding-left: 10px;
                    position: relative;
                    min-width: 40px;
                    transition: width 0.5s ease-in-out;
                }
                .chart-value {
                    color: #080a14;
                    position: absolute;
                    right: 10px;
                    font-weight: bold;
                }
            </style>
        `;
        
    } catch (err) {
        console.error('Error in viewPlayerPointsHistory:', err);
        const container = document.getElementById('playerPointsHistoryContainer');
        if (container) {
            container.innerHTML = '<p>An error occurred while loading player points history.</p>';
        }
    }
}

// Fix for the showPlayerLeaderboard function to use the new stats
async function showPlayerLeaderboard() {
    try {
        // Create modal if it doesn't exist
        if (!document.getElementById('leaderboardModal')) {
            const modal = document.createElement('div');
            modal.id = 'leaderboardModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="width: 90%; max-width: 800px;">
                    <span class="close-modal" id="closeLeaderboardModal">&times;</span>
                    <h2>Player Points Leaderboard</h2>
                    <div id="leaderboardContainer">
                        <div class="loading">Loading leaderboard...</div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listener to close button
            document.getElementById('closeLeaderboardModal').addEventListener('click', () => {
                document.getElementById('leaderboardModal').style.display = 'none';
            });
        }
        
        // Show the modal
        document.getElementById('leaderboardModal').style.display = 'block';
        
        // Get players sorted by actual points
        const { data: players, error } = await supabase
            .from('players')
            .select('*')
            .order('actual_points', { ascending: false });
            
        if (error) {
            console.error('Error fetching players for leaderboard:', error);
            const leaderboardContainer = document.getElementById('leaderboardContainer');
            if (leaderboardContainer) {
                leaderboardContainer.innerHTML = '<p>Error loading leaderboard data.</p>';
            }
            return;
        }
        
        // Create the leaderboard
        const leaderboardHtml = `
            <div class="leaderboard-header">
                <p>Showing top players ranked by total points earned across all tournaments.</p>
            </div>
            
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Total Points</th>
                        <th>Player Tag</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    ${players.map((player, index) => {
                        // Format skill level
                        let skillLevelDisplay = "Unknown";
                        if (player.skill_level) {
                            switch(player.skill_level) {
                                case 'P': skillLevelDisplay = 'Pro'; break;
                                case 'E': skillLevelDisplay = 'Elite'; break;
                                case 'ACLS': skillLevelDisplay = 'Senior'; break;
                                case 'ACLJ': skillLevelDisplay = 'Junior'; break;
                                case 'ACLW': skillLevelDisplay = 'Women\'s'; break;
                                default: skillLevelDisplay = player.skill_level;
                            }
                        }
                        
                        return `
                            <tr class="${index < 3 ? 'top-rank rank-' + (index + 1) : ''}">
                                <td><strong>${index + 1}</strong></td>
                                <td>${player.name}</td>
                                <td>${player.actual_points || 0}</td>
                                <td>${skillLevelDisplay}</td>
                                <td>
                                    <button class="btn btn-small points-history-btn" data-id="${player.id}">View History</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            
            <style>
                .leaderboard-header {
                    margin-bottom: 1rem;
                }
                .top-rank {
                    font-weight: bold;
                }
                .rank-1 {
                    background-color: rgba(241, 196, 15, 0.2);
                }
                .rank-2 {
                    background-color: rgba(189, 195, 199, 0.2);
                }
                .rank-3 {
                    background-color: rgba(205, 127, 50, 0.2);
                }
            </style>
        `;
        
        const leaderboardContainer = document.getElementById('leaderboardContainer');
        if (leaderboardContainer) {
            leaderboardContainer.innerHTML = leaderboardHtml;
            
            // Add event listeners to history buttons
            document.querySelectorAll('#leaderboardContainer .points-history-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    // First close the leaderboard modal
                    document.getElementById('leaderboardModal').style.display = 'none';
                    // Then open the points history modal
                    viewPlayerPointsHistory(btn.dataset.id);
                });
            });
        }
        
    } catch (err) {
        console.error('Error showing player leaderboard:', err);
        const leaderboardContainer = document.getElementById('leaderboardContainer');
        if (leaderboardContainer) {
            leaderboardContainer.innerHTML = '<p>An error occurred while loading the leaderboard.</p>';
        }
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
        await loadPlayers();
        
    } catch (err) {
        console.error('Error in deletePlayer:', err);
        showToast('Failed to delete player', 'error');
    }
}

// Updated loadTeams function for admin.js
async function loadTeams() {
  const teamsContainer = document.getElementById('teamsTable');
  
  try {
    // First, fetch basic team data - only select fields that definitely exist
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select(`
        id,
        created_at,
        tournament_id,
        user_id,
        team_points
      `)
      .order('created_at', { ascending: false });
      
      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        teamsContainer.innerHTML = '<p>Error loading teams. Please try again later.</p>';
        return;
      }
      
      if (!teams || teams.length === 0) {
        teamsContainer.innerHTML = '<p>No teams found.</p>';
        return;
      }
      
      console.log(`Found ${teams.length} teams`);
      
      // Create an array to hold all processed teams
      const processedTeams = [];
      
      // Process each team sequentially to avoid race conditions
      for (const team of teams) {
        try {
          // Get tournament details
          const { data: tournament, error: tournamentError } = await supabase
            .from('tournaments')
            .select('name, start_date, status')
            .eq('id', team.tournament_id)
            .single();
          
          if (tournamentError) {
            console.error(`Error fetching tournament for team ${team.id}:`, tournamentError);
            // Continue anyway, we'll just use placeholder text
          }
          
          // Get user details
          const { data: user, error: userError } = await supabase
            .from('profiles')
            .select('username, email')
            .eq('id', team.user_id)
            .maybeSingle();
            
          if (userError) {
            console.error(`Error fetching user for team ${team.id}:`, userError);
          }
          
          // Calculate team points from player_tournament_points
          let calculatedTeamPoints = 0;
          
          // Get player tournament points for this team
          const { data: playerPoints, error: pointsError } = await supabase
            .from('player_tournament_points')
            .select('points_earned')
            .eq('team_id', team.id)
            .eq('tournament_id', team.tournament_id);
            
          if (!pointsError && playerPoints && playerPoints.length > 0) {
            // Sum up all points earned by players on this team
            calculatedTeamPoints = playerPoints.reduce((sum, record) => sum + (record.points_earned || 0), 0);
            
            // If calculated points don't match database points, update the database
            if (calculatedTeamPoints !== (team.team_points || 0)) {
              console.log(`Team ${team.id}: Updating team_points from ${team.team_points} to ${calculatedTeamPoints}`);
              
              const { error: updateError } = await supabase
                .from('teams')
                .update({ team_points: calculatedTeamPoints })
                .eq('id', team.id);
                
              if (updateError) {
                console.error(`Error updating team_points for team ${team.id}:`, updateError);
              } else {
                // Update the local team object
                team.team_points = calculatedTeamPoints;
              }
            }
          }
          
          // Add team data to processed teams
          processedTeams.push({
            id: team.id,
            tournament: tournament || { name: 'Unknown Tournament', start_date: null, status: 'unknown' },
            user: user || { username: 'Unknown User', email: '' },
            created_at: team.created_at,
            team_points: team.team_points || calculatedTeamPoints,
            winnings: team.winnings
          });
        } catch (err) {
          console.error(`Error processing team ${team.id}:`, err);
          // Continue to next team
        }
      }
      
      // Group teams by tournament
      const teamsByTournament = {};
      processedTeams.forEach(team => {
        const tournamentId = team.tournament.id || 'unknown';
        if (!teamsByTournament[tournamentId]) {
          teamsByTournament[tournamentId] = [];
        }
        teamsByTournament[tournamentId].push(team);
      });
      
      // Build HTML for teams grouped by tournament
      let html = '';
    
      Object.keys(teamsByTournament).forEach(tournamentId => {
        const tournamentTeams = teamsByTournament[tournamentId];
        const tournamentName = tournamentTeams[0].tournament.name || 'Unknown Tournament';
        
        html += `
          <div class="tournament-section">
            <div class="tournament-header">
              <h3>${tournamentName}</h3>
              <span class="team-count">${tournamentTeams.length} teams</span>
            </div>
            <table class="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Team Points</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
        `;
        
        tournamentTeams.forEach(team => {
          html += `
            <tr>
              <td>${team.user.username}</td>
              <td>${team.user.email}</td>
              <td>${formatDate(team.created_at)}</td>
              <td>${team.team_points || 0}</td>
              <td class="actions-cell">
                <button class="btn btn-small view-team-btn" data-id="${team.id}">View Team</button>
              </td>
            </tr>
          `;
        });
        
        html += `
              </tbody>
            </table>
          </div>
        `;
      });
      
      // Update the teams container
      teamsContainer.innerHTML = html;
      
      // Add event listeners for view buttons
      document.querySelectorAll('.view-team-btn').forEach(btn => {
        btn.addEventListener('click', () => viewTeamDetails(btn.dataset.id));
      });
      
    } catch (err) {
      console.error('Error loading teams:', err);
      teamsContainer.innerHTML = '<p>Error loading teams. Please try again later.</p>';
      showToast('Error loading teams', 'error');
    }
  }

// Improved handleTournamentSelect function
async function handleTournamentSelect() {
    const selectedTournament = this.value;
    const tableContainer = document.querySelector('#teamsTable');
    
    // Show loading state
    tableContainer.innerHTML = '<div class="loading">Loading teams data...</div>';
    
    try {
        // Get tournaments for header update
        const { data: tournaments, error } = await supabase
            .from('tournaments')
            .select('id, name');
        
        if (error) throw error;
        
        // Update the section header
        updateTeamsSectionHeader(selectedTournament, tournaments);
        
        // Clear the search field when changing tournaments
        const searchInput = document.getElementById('teamSearch');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Load the appropriate teams
        if (selectedTournament === 'all') {
            await loadAllTeams();
        } else {
            await loadTeamsByTournament(selectedTournament);
        }
    } catch (err) {
        console.error('Error in tournament select handler:', err);
        if (tableContainer) {
            tableContainer.innerHTML = '<div class="error-message">Error loading teams. Please try again.</div>';
        }
    }
}

// Function to update the teams section header
function updateTeamsSectionHeader(tournamentId, tournaments) {
    const headerElement = document.querySelector('#teams-section .admin-card h2');
    if (!headerElement) return;
    
    if (tournamentId === 'all') {
        headerElement.textContent = 'Manage Teams (All Tournaments)';
    } else {
        const tournament = tournaments.find(t => t.id == tournamentId);
        if (tournament) {
            headerElement.textContent = `Manage Teams - ${tournament.name}`;
        }
    }
}

// Load all teams grouped by tournament
async function loadAllTeams() {
    try {
        // Get all tournaments first
        const { data: tournaments, error: tournamentError } = await supabase
            .from('tournaments')
            .select('id, name')
            .order('start_date', { ascending: false });
            
        if (tournamentError) {
            console.error('Error loading tournaments:', tournamentError);
            return;
        }
        
        // Get all teams
        const { data: allTeams, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (teamsError) {
            console.error('Error loading teams:', teamsError);
            return;
        }
        
        // Get the table container
        const tableContainer = document.querySelector('#teamsTable');
        if (!tableContainer) {
            console.error('Teams table container not found');
            return;
        }
        
        // Create a container for all tournaments
        const allTournamentsContainer = document.createElement('div');
        allTournamentsContainer.className = 'tournament-teams-container';
        
        // Process each tournament
        for (const tournament of tournaments) {
            // Filter teams for this tournament
            const tournamentTeams = allTeams.filter(team => team.tournament_id === tournament.id);
            
            if (tournamentTeams.length === 0) continue;
            
            // Create tournament section
            const tournamentSection = document.createElement('div');
            tournamentSection.className = 'tournament-section';
            tournamentSection.innerHTML = `
                <div class="tournament-header">
                    <h3>${tournament.name}</h3>
                    <span class="team-count">${tournamentTeams.length} teams</span>
                </div>
            `;
            
            // Create table for this tournament's teams
            const teamsTable = document.createElement('table');
            teamsTable.className = 'admin-table';
            teamsTable.innerHTML = `
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Created</th>
                        <th>Potential Points</th>
                        <th>Team Points</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;
            
            // Process and display each team within this tournament
            await populateTeamRows(tournamentTeams, teamsTable.querySelector('tbody'));
            
            // Add table to tournament section
            tournamentSection.appendChild(teamsTable);
            
            // Add tournament section to container
            allTournamentsContainer.appendChild(tournamentSection);
        }
        
        // Replace current table with new structure
        tableContainer.innerHTML = '';
        tableContainer.appendChild(allTournamentsContainer);
        
        // Add event listeners for view buttons
        document.querySelectorAll('.view-team-btn').forEach(btn => {
            btn.addEventListener('click', () => viewTeamDetails(btn.dataset.id));
        });
        
    } catch (err) {
        console.error('Error loading all teams:', err);
        showToast('Failed to load teams', 'error');
    }
}

async function loadTeamsByTournament(tournamentId) {
    try {
        // Get the table container
        const tableContainer = document.querySelector('#teamsTable');
        if (!tableContainer) {
            console.error('Teams table container not found');
            return;
        }
        
        // Show loading state if not already shown
        if (!tableContainer.querySelector('.loading')) {
            tableContainer.innerHTML = '<div class="loading">Loading teams data...</div>';
        }
        
        // Get teams for this tournament
        const { data: teams, error } = await supabase
            .from('teams')
            .select('*')
            .eq('tournament_id', tournamentId)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Error loading teams for tournament:', error);
            tableContainer.innerHTML = '<div class="error-message">Error loading teams. Please try again.</div>';
            return;
        }
        
        // Log teams for debugging
        console.log(`Found ${teams.length} teams for tournament ${tournamentId}`);
        
        if (teams.length === 0) {
            tableContainer.innerHTML = '<div class="text-center">No teams found for this tournament</div>';
            return;
        }
        
        // Create table structure
        const teamsTable = document.createElement('table');
        teamsTable.className = 'admin-table';
        teamsTable.innerHTML = `
            <thead>
                <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Created</th>
                    <th>Potential Points</th>
                    <th>Team Points</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;
        
        // Clear container and add table
        tableContainer.innerHTML = '';
        tableContainer.appendChild(teamsTable);
        
        // Process and display each team
        const tableBody = teamsTable.querySelector('tbody');
        
        if (teams.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No teams found for this tournament</td></tr>';
        } else {
            // Add temporary loading row
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading team details...</td></tr>';
            
            // Simplified team row population for debugging
            tableBody.innerHTML = teams.map(team => `
                <tr>
                    <td>User ID: ${team.user_id || 'None'}</td>
                    <td>-</td>
                    <td>${formatDate(team.created_at)}</td>
                    <td>-</td>
                    <td>${team.team_points || 0}</td>
                    <td>
                        <button class="btn btn-small view-team-btn" data-id="${team.id}">View Players</button>
                    </td>
                </tr>
            `).join('');
            
            // Attach event listeners
            document.querySelectorAll('.view-team-btn').forEach(btn => {
                btn.addEventListener('click', () => viewTeamDetails(btn.dataset.id));
            });
        }
    } catch (err) {
        console.error('Error loading teams by tournament:', err);
        
        const tableContainer = document.querySelector('#teamsTable');
        if (tableContainer) {
            tableContainer.innerHTML = '<div class="error-message">Error loading teams. Please try again.</div>';
        }
    }
}
async function populateTeamRows(teams, tableBody) {
    if (!teams || !tableBody) return;
    
    if (teams.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No teams found</td></tr>';
        return;
    }

    // Clear existing content first to avoid ID conflicts
    tableBody.innerHTML = '';
    
    // Process teams one by one, creating the complete row for each
    for (const team of teams) {
        try {
            console.log('Processing team:', team.id);
            
            // Create the row first
            const row = document.createElement('tr');
            row.id = `team-row-${team.id}`;
            
            // Start with a loading indicator
            row.innerHTML = '<td colspan="6" class="text-center">Loading team details...</td>';
            
            // Add the row to the DOM before manipulating it
            tableBody.appendChild(row);
            
            // Get user data
            let username = 'Unknown';
            let email = '';
            
            if (team.user_id) {
                try {
                    const { data: user, error: userError } = await supabase
                        .from('profiles')
                        .select('username, email')
                        .eq('id', team.user_id)
                        .maybeSingle(); // Use maybeSingle instead of single to avoid errors
                        
                    if (userError) {
                        console.error('Error fetching user data:', userError);
                    }
                    
                    if (user) {
                        username = user.username || 'Unknown';
                        email = user.email || '';
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
            
            // Calculate team points
            let potentialPoints = 0;
            let actualPoints = team.team_points || 0;
            
            try {
                // Get team players
                const { data: teamPlayers, error: teamPlayersError } = await supabase
                    .from('team_players')
                    .select('player_id')
                    .eq('team_id', team.id);
                
                if (teamPlayersError) {
                    console.error('Error fetching team players:', teamPlayersError);
                }
                
                if (teamPlayers && teamPlayers.length > 0) {
                    // Get player details for potential points calculation
                    const playerIds = teamPlayers.map(tp => tp.player_id);
                    
                    const { data: players, error: playersError } = await supabase
                        .from('players')
                        .select('potential_points')
                        .in('id', playerIds);
                    
                    if (playersError) {
                        console.error('Error fetching player points:', playersError);
                    }
                    
                    if (players && players.length > 0) {
                        potentialPoints = players.reduce((sum, player) => sum + (player.potential_points || 0), 0);
                    }
                }
            } catch (pointsError) {
                console.error('Error calculating points:', pointsError);
            }
            
            // Now update the row with all the data at once
            row.innerHTML = `
                <td>${username}</td>
                <td>${email}</td>
                <td>${formatDate(team.created_at)}</td>
                <td>${potentialPoints}</td>
                <td>${team.team_points}</td>
                <td class="actions-cell">
                    <button class="btn btn-small view-team-btn" data-id="${team.id}">View Team</button>
                </td>
            `;
            
            // Add click event to the button
            const viewButton = row.querySelector('.view-team-btn');
            if (viewButton) {
                viewButton.addEventListener('click', () => viewTeamDetails(team.id));
            }
            
        } catch (err) {
            console.error(`Error processing team ${team.id}:`, err);
            
            // Create an error row
            const errorRow = document.createElement('tr');
            errorRow.innerHTML = `
                <td colspan="6" class="text-center error-state">
                    Error loading team ${team.id}. <button class="btn-link retry-load-btn" data-team-id="${team.id}">Retry</button>
                </td>
            `;
            tableBody.appendChild(errorRow);
            
            // Add retry functionality
            const retryButton = errorRow.querySelector('.retry-load-btn');
            if (retryButton) {
                retryButton.addEventListener('click', function() {
                    const teamId = this.dataset.teamId;
                    const teamToRetry = teams.find(t => t.id === teamId);
                    if (teamToRetry) {
                        errorRow.innerHTML = '<td colspan="6" class="text-center">Loading team details...</td>';
                        populateTeamRows([teamToRetry], tableBody);
                    }
                });
            }
        }
    }
}
// Enhanced filter function for teams
function filterTeams() {
    const tournamentFilter = document.getElementById('teamTournamentFilter')?.value || 'all';
    const searchTerm = document.getElementById('teamSearch')?.value?.toLowerCase() || '';
    
    // If a specific tournament is selected, we're in a different view mode
    // so we only need to filter rows within that tournament's table
    if (tournamentFilter !== 'all') {
        const rows = document.querySelectorAll('#teamsTable tbody tr');
        if (rows.length === 0) return;
        
        rows.forEach(row => {
            const username = row.cells[0]?.textContent.toLowerCase() || '';
            const email = row.cells[1]?.textContent.toLowerCase() || '';
            
            const matchesSearch = username.includes(searchTerm) || email.includes(searchTerm);
            row.style.display = matchesSearch ? '' : 'none';
        });
    } 
    // If 'all tournaments' is selected, we need to filter at both tournament and team level
    else {
        const tournamentSections = document.querySelectorAll('.tournament-section');
        if (tournamentSections.length === 0) return;
        
        tournamentSections.forEach(section => {
            const teams = section.querySelectorAll('tbody tr');
            let visibleTeams = 0;
            
            teams.forEach(row => {
                const username = row.cells[0]?.textContent.toLowerCase() || '';
                const email = row.cells[1]?.textContent.toLowerCase() || '';
                
                const matchesSearch = username.includes(searchTerm) || email.includes(searchTerm);
                row.style.display = matchesSearch ? '' : 'none';
                
                if (matchesSearch) visibleTeams++;
            });
            
            // Hide entire tournament section if no teams match search
            section.style.display = visibleTeams > 0 ? '' : 'none';
            
            // Update team count to show filtered count
            const countElement = section.querySelector('.team-count');
            if (countElement && teams.length > 0) {
                countElement.textContent = `${visibleTeams} of ${teams.length} teams`;
            }
        });
    }
}
async function openPlayerResultsModal(tournamentId) {
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
      
      if (!document.getElementById('playerResultsModal')) {
        const modal = document.createElement('div');
        modal.id = 'playerResultsModal';
        modal.className = 'modal';
        modal.innerHTML = `
          <div class="modal-content" style="width: 90%; max-width: 900px;">
            <span class="close-modal" id="closePlayerResultsModal">&times;</span>
            <h2>Set Individual Player Results</h2>
            <div id="tournamentInfoContainer"></div>
            <div id="playerResultsContainer">
              <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading players...</p>
              </div>
            </div>
            <div id="savePlayerResultsBtnContainer" style="margin-top: 20px; text-align: right;">
              <button id="savePlayerResultsBtn" class="btn">Save Player Results</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listener to close button
        document.getElementById('closePlayerResultsModal').addEventListener('click', () => {
          document.getElementById('playerResultsModal').style.display = 'none';
        });
      }
      
      // Show the modal
      document.getElementById('playerResultsModal').style.display = 'block';
      
      // Display tournament info
      const tournamentInfoContainer = document.getElementById('tournamentInfoContainer');
      if (tournamentInfoContainer) {
        tournamentInfoContainer.innerHTML = `
          <div class="admin-card">
            <h3>${tournament.name}</h3>
            <p>Start: ${formatDate(tournament.start_date)} | End: ${formatDate(tournament.end_date)}</p>
            <p>Prize Pool: $${tournament.prize_pool?.toLocaleString() || '0'}</p>
          </div>
          <div class="winners-explanation">
            <p>Set the placement for each player. Points will be assigned based on placement:</p>
            <ul>
              <li>Any player who places in the top ${tournament.top_players_count || 4} will receive their full potential points.</li>
            </ul>
            <p><strong>Note:</strong> Points are awarded directly to individual players based on their performance.</p>
          </div>
        `;
      }
      const { data: tournamentPlayers, error: tpError } = await supabase
        .from('tournament_players')
        .select(`
          id,
          player_id,
          tournament_rank,
          potential_points,
          name
        `)
        .eq('tournament_id', tournamentId);
          
      if (tpError) {
        console.error('Error fetching tournament players:', tpError);
        showToast('Failed to load tournament players', 'error');
        return;
      }
      
      const playerResultsContainer = document.getElementById('playerResultsContainer');
      if (!playerResultsContainer) {
        showToast('Error: Player results container not found', 'error');
        return;
      }
      
      if (!tournamentPlayers || tournamentPlayers.length === 0) {
        playerResultsContainer.innerHTML = '<p>No players found for this tournament.</p>';
        return;
      }
      
      // Check for existing results for this tournament
      const { data: existingResults, error: resultsError } = await supabase
        .from('player_tournament_points')
        .select('player_id, placement, points_earned')
        .eq('tournament_id', tournamentId);
          
      // Create a map for existing results
      const resultsMap = {};
      if (existingResults && existingResults.length > 0) {
        existingResults.forEach(result => {
          resultsMap[result.player_id] = {
            placement: result.placement,
            points_earned: result.points_earned
          };
        });
      }
      
      // Fetch the basic player details for display
      const playerIds = tournamentPlayers.map(tp => tp.player_id);
      const { data: playerDetails, error: playerError } = await supabase
        .from('players')
        .select('id, name, skill_level, player_ppr, player_cpi')
        .in('id', playerIds);
        
      if (playerError) {
        console.error('Error fetching player details:', playerError);
      }
      
      // Combine tournament players with player details
      const playersWithDetails = tournamentPlayers.map(tp => {
        const player = playerDetails?.find(p => p.id === tp.player_id) || {};
        return {
          ...tp,
          skill_level: player.skill_level,
          player_ppr: player.player_ppr,
          player_cpi: player.player_cpi
        };
      });
      
      // Sort players by name for easier reference
      const sortedPlayers = [...playersWithDetails].sort((a, b) => a.name.localeCompare(b.name));
      
      // Create the player results table
      playerResultsContainer.innerHTML = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Tournament Rank</th>
              <th>Potential Points</th>
              <th>Placement</th>
              <th>Points Earned</th>
            </tr>
          </thead>
          <tbody>
            ${sortedPlayers.map(player => {
              const existingResult = resultsMap[player.player_id] || {};
              // Use potential_points directly from tournament_players data
              const potentialPoints = player.potential_points !== null ? player.potential_points : 'Not Ranked';
              
              return `
              <tr>
                <td>${player.name}</td>
                <td>${player.tournament_rank !== null ? player.tournament_rank : 'Not Ranked'}</td>
                <td>${player.potential_points !== null ? player.potential_points : 'Not Set'}</td>
                <td>
                  <select class="player-placement" data-player-id="${player.player_id}" data-potential-points="${player.potential_points}">
                    <option value="">Select Placement</option>
                    <option value="1" ${existingResult.placement === 1 ? 'selected' : ''}>1st Place</option>
                    <option value="2" ${existingResult.placement === 2 ? 'selected' : ''}>2nd Place</option>
                    <option value="3" ${existingResult.placement === 3 ? 'selected' : ''}>3rd Place</option>
                    <option value="4" ${existingResult.placement === 4 ? 'selected' : ''}>4th Place</option>
                    <option value="0" ${existingResult.placement === 0 ? 'selected' : ''}>Did Not Place</option>
                  </select>
                </td>
                <td>
                  <input type="number" class="player-points" data-player-id="${player.player_id}" 
                    value="${existingResult.points_earned || 0}" min="0" style="width: 100px;">
                  <div class="points-calculation"></div>
                </td>
              </tr>
            `;
            }).join('')}
          </tbody>
        </table>
      `;
      
      // Add event listeners to calculate points automatically
      document.querySelectorAll('.player-placement').forEach(select => {
        select.addEventListener('change', function() {
          const placement = parseInt(this.value);
          const potentialPoints = parseInt(this.dataset.potentialPoints);
          
          // Skip calculation if potential points is missing or NaN
          if (isNaN(potentialPoints)) {
            console.warn('Cannot calculate points: Invalid potential points value');
            return;
          }
          
          const pointsInput = this.closest('tr').querySelector('.player-points');
          const calculationDiv = this.closest('tr').querySelector('.points-calculation');
          
          if (!pointsInput || !calculationDiv) return;
          
          // Calculate points based on placement - now all top N get full points
          let pointsEarned = 0;
          if (placement >= 1 && placement <= (tournament.top_players_count || 4)) {
            pointsEarned = potentialPoints; // 100% of potential points for any top placement
            calculationDiv.textContent = `Full points awarded: ${pointsEarned}`;
            calculationDiv.style.display = 'block';
          } else {
            pointsInput.value = 0;
            calculationDiv.style.display = 'none';
          }
          
          pointsInput.value = pointsEarned;
        });
      });
        
        // Add event listener to save button
        const savePlayerResultsBtn = document.getElementById('savePlayerResultsBtn');
        if (savePlayerResultsBtn) {
            // Remove old event listeners
            const newBtn = savePlayerResultsBtn.cloneNode(true);
            savePlayerResultsBtn.parentNode.replaceChild(newBtn, savePlayerResultsBtn);
            
            // Add new event listener
            newBtn.addEventListener('click', function() {
                savePlayerResults(tournamentId);
            });
        }
        
    } catch (err) {
        console.error('Error in openPlayerResultsModal:', err);
        showToast('Failed to load player results modal', 'error');
    }
}

async function savePlayerResults(tournamentId) {
    try {
      // Get all player placements and points
      const playerPlacements = document.querySelectorAll('.player-placement');
      const playerPoints = document.querySelectorAll('.player-points');
      
      if (playerPlacements.length === 0 || playerPoints.length === 0) {
        showToast('Error: No player data found', 'error');
        return;
      }
      
      // Start a loading indicator
      const saveButton = document.getElementById('savePlayerResultsBtn');
      saveButton.textContent = 'Saving...';
      saveButton.disabled = true;
      
      // First, get all teams for this tournament
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id')
        .eq('tournament_id', tournamentId);
        
      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        showToast('Error fetching teams data', 'error');
        saveButton.textContent = 'Save Player Results';
        saveButton.disabled = false;
        return;
      }
      
      // Get all team IDs
      const allTeamIds = teams.map(team => team.id);
      
      // Create a map of player ID to team ID
      const playerTeamMap = {};
      
      // Process each team ID separately to get team_players
      for (const teamId of allTeamIds) {
        const { data: teamPlayers, error: teamPlayersError } = await supabase
          .from('team_players')
          .select('team_id, player_id')
          .eq('team_id', teamId);
          
        if (teamPlayersError) {
          console.error(`Error fetching players for team ${teamId}:`, teamPlayersError);
        } else if (teamPlayers) {
          // Map each player to their team
          teamPlayers.forEach(tp => {
            playerTeamMap[tp.player_id] = tp.team_id;
          });
        }
      }
      
      // Clear existing results
      try {
        await supabase
          .from('player_tournament_points')
          .delete()
          .eq('tournament_id', tournamentId);
      } catch (deleteError) {
        console.error('Error deleting existing results:', deleteError);
      }
      
      // Create a map to track team points
      const teamPointsMap = {};
      
      // Prepare records and updates
      const playerPointsRecords = [];
      const playerUpdates = [];
      
      // Process each player
      for (let i = 0; i < playerPlacements.length; i++) {
        const playerId = playerPlacements[i].dataset.playerId;
        const placement = parseInt(playerPlacements[i].value);
        const pointsEarned = parseInt(playerPoints[i].value) || 0;
        
        // Find the team ID for this player
        const teamId = playerTeamMap[playerId];
        
        // Only add results for players with valid placements and teams
        if (placement > 0 && teamId) {
          // Create record for player_tournament_points
          playerPointsRecords.push({
            player_id: playerId,
            tournament_id: tournamentId,
            team_id: teamId,
            placement: placement,
            points_earned: pointsEarned
          });
          
          // Update player actual points
          const { data: player, error: playerError } = await supabase
            .from('players')
            .select('actual_points')
            .eq('id', playerId)
            .single();
          
          if (playerError) {
            console.error('Error fetching player:', playerError);
            continue;
          }
          
          // Add tournament points to player's existing points
          const currentPoints = player.actual_points || 0;
          const newTotalPoints = currentPoints + pointsEarned;
          
          // Add to player updates
          playerUpdates.push({
            playerId,
            newTotalPoints
          });
          
          // Track team points
          if (!teamPointsMap[teamId]) {
            teamPointsMap[teamId] = 0;
          }
          teamPointsMap[teamId] += pointsEarned;
        }
      }
      
      // Execute player updates
      if (playerUpdates.length > 0) {
        for (const update of playerUpdates) {
          try {
            await supabase
              .from('players')
              .update({
                actual_points: update.newTotalPoints
              })
              .eq('id', update.playerId);
          } catch (updateError) {
            console.error('Error updating player points:', updateError);
          }
        }
      }
      
      // Insert player tournament points records
      if (playerPointsRecords.length > 0) {
        try {
          await supabase
            .from('player_tournament_points')
            .insert(playerPointsRecords);
        } catch (pointsRecordsError) {
          console.error('Error saving player tournament points:', pointsRecordsError);
        }
      }
      
      // Update team points for each team
      const updatedTeamIds = Object.keys(teamPointsMap);
      console.log('Updating team points for teams:', updatedTeamIds);
      console.log('Team points map:', teamPointsMap);
      
      if (updatedTeamIds.length > 0) {
        for (const teamId of updatedTeamIds) {
          const teamPoints = teamPointsMap[teamId];
          console.log(`Updating team ${teamId} with ${teamPoints} points`);
          
          try {
            const { data, error } = await supabase
              .from('teams')
              .update({ team_points: teamPoints })
              .eq('id', teamId)
              .select();
              
            if (error) {
              console.error(`Error updating team ${teamId}:`, error);
            } else {
              console.log(`Successfully updated team ${teamId}:`, data);
            }
          } catch (teamUpdateError) {
            console.error(`Error updating team ${teamId}:`, teamUpdateError);
          }
        }
      }
      
      // Update tournament status to completed
      await supabase
        .from('tournaments')
        .update({ status: 'completed' })
        .eq('id', tournamentId);
      
      showToast('Player results saved successfully.');
      document.getElementById('playerResultsModal').style.display = 'none';
      
      // Refresh data
      await loadTournaments();
      await loadPlayers();
      
      // Reset button
      saveButton.textContent = 'Save Player Results';
      saveButton.disabled = false;
      
    } catch (err) {
      console.error('Error in savePlayerResults:', err);
      showToast('Failed to save player results', 'error');
      
      const saveButton = document.getElementById('savePlayerResultsBtn');
      saveButton.textContent = 'Save Player Results';
      saveButton.disabled = false;
    }
  }
// Update the viewTeamDetails function in admin.js
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
      
      // Get user details
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
      
      // Get tournament details
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
      
      // Get team players with potential_points
      const { data: teamPlayers, error: tpError } = await supabase
        .from('team_players')
        .select('player_id, potential_points')
        .eq('team_id', teamId);
      
      if (tpError) {
        console.error('Error fetching team players:', tpError);
      }
      
      // Check for modal and container
      const teamDetailsContainer = document.getElementById('teamDetailsContainer');
      const viewTeamModal = document.getElementById('viewTeamModal');
      
      if (!teamDetailsContainer || !viewTeamModal) {
        showToast('Error: Team details modal not found', 'error');
        return;
      }
      
      // Show loading state
      teamDetailsContainer.innerHTML = '<div class="loading">Loading team details...</div>';
      viewTeamModal.style.display = 'block';
      
      // Create player cards and calculate total points
      let playerCards = '';
      let totalPotentialPoints = 0;
      let totalTeamPoints = 0;
      
      if (teamPlayers && teamPlayers.length > 0) {
        // Get each player's details
        const playerIds = teamPlayers.map(tp => tp.player_id);
        
        const { data: players } = await supabase
          .from('players')
          .select('*')
          .in('id', playerIds);
        
        // Get player tournament points
        const { data: playerPoints, error: pointsError } = await supabase
          .from('player_tournament_points')
          .select('player_id, points_earned, placement')
          .eq('tournament_id', team.tournament_id)
          .in('player_id', playerIds);
          
        if (pointsError) {
          console.error('Error fetching player points:', pointsError);
        }
        
        // Log player points for debugging
        console.log('Player tournament points:', playerPoints);
        
        if (players && players.length > 0) {
          for (const player of players) {
            // Find team_player entry for potential_points
            const teamPlayer = teamPlayers.find(tp => tp.player_id === player.id);
            // Get potential points from team_players
            const potentialPoints = teamPlayer ? teamPlayer.potential_points : 0;
            
            // Find player tournament points
            const playerResult = playerPoints?.find(pp => pp.player_id === player.id);
            const pointsEarned = playerResult ? playerResult.points_earned : 0;
            const placement = playerResult ? playerResult.placement : null;
            
            // Add to totals
            totalPotentialPoints += potentialPoints || 0;
            totalTeamPoints += pointsEarned || 0;
            
            // Format skill level
            let skillLevelDisplay = "Unknown";
            if (player.skill_level) {
              switch(player.skill_level) {
                case 'P': skillLevelDisplay = 'Pro'; break;
                case 'E': skillLevelDisplay = 'Elite'; break;
                case 'ACLS': skillLevelDisplay = 'Senior'; break;
                case 'ACLJ': skillLevelDisplay = 'Junior'; break;
                case 'ACLW': skillLevelDisplay = 'Women\'s'; break;
                default: skillLevelDisplay = player.skill_level;
              }
            }
            
            // Display player's PPR and CPI
            const ppr = player.player_ppr !== null ? player.player_ppr.toFixed(1) : '—';
            const cpi = player.player_cpi !== null ? player.player_cpi.toFixed(1) : '—';
            
            playerCards += `
              <div class="player-card">
                <div class="player-header">
                  <h4>${player.name}</h4>
                  <span class="player-rank">Rank: ${player.rank || 'N/A'}</span>
                </div>
                
                <div class="player-stats">
                  <div class="stat-row">
                    <div class="stat-item">
                      <div class="stat-label">Player Tag</div>
                      <div class="stat-value">${skillLevelDisplay}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">Potential Points</div>
                      <div class="stat-value">${potentialPoints || 0}</div>
                    </div>
                  </div>
                  
                  <div class="stat-row">
                    <div class="stat-item">
                      <div class="stat-label">PPR</div>
                      <div class="stat-value">${ppr}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">Tournament Points</div>
                      <div class="stat-value">${pointsEarned || 0}</div>
                    </div>
                  </div>
                  
                  <div class="stat-row">
                    <div class="stat-item">
                      <div class="stat-label">CPI</div>
                      <div class="stat-value">${cpi}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">Placement</div>
                      <div class="stat-value">${placement ? getOrdinal(placement) : 'Not placed'}</div>
                    </div>
                  </div>
                </div>
                
                <div class="player-footer">
                  <span>Total Career Points: ${player.actual_points || 0}</span>
                </div>
              </div>
            `;
          }
        }
      }
      
      // Log the calculated total points
      console.log(`Team ${teamId} - Calculated points: ${totalTeamPoints}, DB points: ${team.team_points}`);
      
      // Update team points in database if they don't match calculated points
      if ((team.team_points || 0) !== totalTeamPoints && totalTeamPoints > 0) {
        console.log(`Updating team points in database from ${team.team_points} to ${totalTeamPoints}`);
        
        try {
          await supabase
            .from('teams')
            .update({ team_points: totalTeamPoints })
            .eq('id', teamId);
            
          // Update the local team object
          team.team_points = totalTeamPoints;
        } catch (updateError) {
          console.error('Error updating team points:', updateError);
        }
      }
      
      // Create team details HTML with delete button
      teamDetailsContainer.innerHTML = `
        <div class="team-details-header">
          <div class="team-info">
            <h3>${username}'s Team</h3>
            <p class="team-meta">
              <span class="team-tournament">${tournamentName}</span>
              <span class="team-created">Created: ${formatDate(team.created_at)}</span>
            </p>
            <p class="team-email">${email || 'No email'}</p>
          </div>
          
          <div class="team-points-summary">
            <div class="points-item">
              <div class="points-label">Potential Points</div>
              <div class="points-value">${totalPotentialPoints}</div>
            </div>
            <div class="points-item">
              <div class="points-label">Team Points</div>
              <div class="points-value">${totalTeamPoints}</div>
            </div>
          </div>
        </div>
        
        <div class="team-actions" style="text-align: right; margin: 15px 0;">
          <button id="deleteTeamBtn" class="btn btn-danger" data-team-id="${team.id}" data-user-id="${team.user_id}" data-tournament-id="${team.tournament_id}">
            Delete Team
          </button>
        </div>
        
        <h3 class="players-header">Team Players (${teamPlayers?.length || 0})</h3>
        
        <div class="players-grid">
          ${playerCards || '<p class="no-players">No players found for this team.</p>'}
        </div>
      `;
      
      // Add delete button event listener
      const deleteTeamBtn = document.getElementById('deleteTeamBtn');
      if (deleteTeamBtn) {
        deleteTeamBtn.addEventListener('click', deleteTeam);
      }
      
      // Add styles for the team details view
      addTeamDetailsStyles();
      
      // Add danger button style
      addDangerButtonStyle();
      
    } catch (err) {
      console.error('Error in viewTeamDetails:', err);
      showToast('Failed to load team details', 'error');
      
      const teamDetailsContainer = document.getElementById('teamDetailsContainer');
      if (teamDetailsContainer) {
        teamDetailsContainer.innerHTML = '<p>Error loading team details. Please try again.</p>';
      }
    }
  }

// Function to delete a team
async function deleteTeam() {
    const teamId = this.dataset.teamId;
    const userId = this.dataset.userId;
    const tournamentId = this.dataset.tournamentId;
    
    if (!teamId) {
        showToast('Error: Team ID not found', 'error');
        return;
    }
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
        return;
    }
    
    try {
        // Disable the button to prevent multiple clicks
        this.disabled = true;
        this.textContent = 'Deleting...';
        
        // 1. First delete any tournament results for this team
        const { error: resultsError } = await supabase
            .from('tournament_results')
            .delete()
            .eq('team_id', teamId);
            
        if (resultsError) {
            console.error('Error deleting tournament results:', resultsError);
            // Continue with deletion even if this fails
        }
        
        // 2. Delete any player tournament points records
        const { error: pointsError } = await supabase
            .from('player_tournament_points')
            .delete()
            .eq('team_id', teamId);
            
        if (pointsError) {
            console.error('Error deleting player tournament points:', pointsError);
            // Continue with deletion even if this fails
        }
        
        // 3. Delete team players
        const { error: teamPlayersError } = await supabase
            .from('team_players')
            .delete()
            .eq('team_id', teamId);
            
        if (teamPlayersError) {
            console.error('Error deleting team players:', teamPlayersError);
            showToast('Failed to delete team players', 'error');
            this.disabled = false;
            this.textContent = 'Delete Team';
            return;
        }
        
        // 4. Finally delete the team itself
        const { error: teamError } = await supabase
            .from('teams')
            .delete()
            .eq('id', teamId);
            
        if (teamError) {
            console.error('Error deleting team:', teamError);
            showToast('Failed to delete team', 'error');
            this.disabled = false;
            this.textContent = 'Delete Team';
            return;
        }
        
        showToast('Team deleted successfully');
        
        // Close the modal
        const viewTeamModal = document.getElementById('viewTeamModal');
        if (viewTeamModal) {
            viewTeamModal.style.display = 'none';
        }
        
        // Refresh the teams list
        loadTeams();
        
    } catch (err) {
        console.error('Error deleting team:', err);
        showToast('Failed to delete team', 'error');
        
        // Re-enable button
        this.disabled = false;
        this.textContent = 'Delete Team';
    }
}

// Add style for danger button
function addDangerButtonStyle() {
    // Check if style already exists
    if (!document.getElementById('danger-button-style')) {
        const style = document.createElement('style');
        style.id = 'danger-button-style';
        style.textContent = `
            .btn-danger {
                background-color: #e74c3c;
                color: white;
            }
            .btn-danger:hover {
                background-color: #c0392b;
            }
            .btn-danger:disabled {
                background-color: #e57373;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }
}

function addTeamDetailsStyles() {
    if (document.getElementById('team-details-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'team-details-styles';
    style.textContent = `
        /* Tournament sections styling */
        .tournament-teams-container {
            display: flex;
            flex-direction: column;
            gap: 25px;
        }
        
        .tournament-section {
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .tournament-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            background-color: rgba(52, 152, 219, 0.1);
        }
        
        .tournament-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
        }
        
        .team-count {
            background-color: rgba(52, 152, 219, 0.2);
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
        }
        
        /* Team details styling */
        .team-details-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            background-color: rgba(255, 255, 255, 0.03);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .team-info h3 {
            margin-top: 0;
            margin-bottom: 8px;
        }
        
        .team-meta {
            display: flex;
            gap: 15px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 5px;
        }
        
        .team-email {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.5);
            margin-top: 2px;
        }
        
        .team-points-summary {
            display: flex;
            gap: 20px;
        }
        
        .points-item {
            text-align: center;
            background-color: rgba(255, 255, 255, 0.05);
            padding: 10px 15px;
            border-radius: 6px;
            min-width: 100px;
        }
        
        .points-label {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 5px;
        }
        
        .points-value {
            font-size: 20px;
            font-weight: bold;
        }
        
        .players-header {
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .players-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
        }
        
        .player-card {
            background-color: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            padding: 15px;
            transition: transform 0.2s;
        }
        
        .player-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .player-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .player-header h4 {
            margin: 0;
        }
        
        .player-rank {
            background-color: rgba(255, 255, 255, 0.1);
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
        }
        
        .player-stats {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .stat-row {
            display: flex;
            justify-content: space-between;
        }
        
        .stat-item {
            flex: 1;
        }
        
        .stat-label {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 2px;
        }
        
        .stat-value {
            font-size: 14px;
            font-weight: 500;
        }
        
        .player-footer {
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            text-align: right;
            font-size: 13px;
            color: #4ade80;
        }
        
        .no-players {
            grid-column: 1 / -1;
            text-align: center;
            padding: 20px;
            background-color: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
        }
    `;
    
    document.head.appendChild(style);
}

// Update all player ranks based on CPI values
async function updatePlayerRanksByCPI() {
    try {
      // Get all players sorted by CPI in descending order (higher CPI is better)
      const { data: sortedPlayers, error } = await supabase
        .from('players')
        .select('id, name, player_cpi')
        .order('player_cpi', { ascending: false });
        
      if (error) {
        console.error('Error fetching players for ranking:', error);
        showToast('Failed to update player rankings', 'error');
        return false;
      }
  
      console.log(`Updating ranks for ${sortedPlayers.length} players based on CPI`);
      
      // Update each player with their new rank and recalculate potential points
      for (let i = 0; i < sortedPlayers.length; i++) {
        const newRank = i + 1; // Ranks start at 1
        const playerId = sortedPlayers[i].id;
        const potentialPoints = calculatePotentialPoints(newRank);
        
        const { error: updateError } = await supabase
          .from('players')
          .update({ 
            rank: newRank,
            potential_points: potentialPoints
          })
          .eq('id', playerId);
          
        if (updateError) {
          console.error(`Error updating rank for player ${playerId}:`, updateError);
        }
      }
      
      showToast(`Updated rankings for ${sortedPlayers.length} players`, 'success');
      return true;
    } catch (err) {
      console.error('Error in updatePlayerRanksByCPI:', err);
      showToast('Failed to update player rankings', 'error');
      return false;
    }
  }

// Tournament Players Modal functions
async function openTournamentPlayersModal(tournamentId) {
    try {
        // First create the modal if it doesn't exist
        if (!document.getElementById('tournamentPlayersModal')) {
            const modal = document.createElement('div');
            modal.id = 'tournamentPlayersModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal" id="closeTournamentPlayersModal">&times;</span>
                    <h2>Tournament Players</h2>
                    <h3 id="tournamentPlayersName"></h3>
                    
                    <div class="tab-buttons">
                        <button class="tab-button active" data-tab="currentPlayers">Current Players</button>
                        <button class="tab-button" data-tab="addPlayers">Add Players</button>
                    </div>
                    
                    <div id="currentPlayersTab" class="tab-content active">
                        <div class="admin-card">
                            <h3>Players in this Tournament</h3>
<p id="currentPlayersCount">0 players assigned to this tournament</p>
                            <div style="max-height: 300px; overflow-y: auto;">
                                <table class="admin-table" id="currentPlayersTable">
                                    <thead>
                                        <tr>
                                            <th>ACL ID</th>
                                            <th>Name</th>
                                            <th>Skill Level</th>
                                            <th>PPR</th>
                                            <th>CPI</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="6" class="text-center">Loading players...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <div id="addPlayersTab" class="tab-content">
                        <!-- Content will be loaded dynamically -->
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listener to close button
            document.getElementById('closeTournamentPlayersModal').addEventListener('click', () => {
                document.getElementById('tournamentPlayersModal').style.display = 'none';
            });
            
            // Setup tab switching
            document.querySelectorAll('#tournamentPlayersModal .tab-button').forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all tabs
                    document.querySelectorAll('#tournamentPlayersModal .tab-button').forEach(btn => btn.classList.remove('active'));
                    document.querySelectorAll('#tournamentPlayersModal .tab-content').forEach(content => content.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Show corresponding content
                    const tabId = this.dataset.tab + 'Tab';
                    document.getElementById(tabId).classList.add('active');
                });
            });
        }

        // Get tournament details
        const { data: tournament, error } = await supabase
            .from('tournaments')
            .select('*')
            .eq('id', tournamentId)
            .single();
            
        if (error) {
            console.error('Error fetching tournament:', error);
            showToast('Failed to load tournament details', 'error');
            return;
        }
        
        const tournamentNameElement = document.getElementById('tournamentPlayersName');
        if (tournamentNameElement) {
            tournamentNameElement.textContent = `${tournament.name} (${formatDate(tournament.start_date)})`;
        }
        
        // Load current players for this tournament
        await loadTournamentPlayers(tournamentId);
        
        // Load available players for this tournament
        await loadAvailablePlayers(tournamentId, 0);
        
        // Reset to first tab
        const firstTabButton = document.querySelector('#tournamentPlayersModal .tab-button[data-tab="currentPlayers"]');
        if (firstTabButton) {
            firstTabButton.click();
        }
        
        // Show the modal
        document.getElementById('tournamentPlayersModal').style.display = 'block';

        // Check if the button already exists
        if (!document.getElementById('updateTournamentRanksBtn')) {
            // Add the update ranks button
            const currentPlayersTab = document.getElementById('currentPlayersTab');
            if (currentPlayersTab) {
            // Add the update ranks button
            const updateRanksButton = document.createElement('button');
            updateRanksButton.className = 'btn';
            updateRanksButton.id = 'updateTournamentRanksBtn';
            updateRanksButton.textContent = 'Update Tournament Ranks';
            updateRanksButton.dataset.tournamentId = tournamentId;
            updateRanksButton.style.marginTop = '15px';
            
            // Add button below the table
            currentPlayersTab.appendChild(updateRanksButton);
            
            // Add event listener
            updateRanksButton.addEventListener('click', function() {
                const tournId = this.dataset.tournamentId;
                this.disabled = true;
                this.textContent = 'Updating...';
                
                updateTournamentPlayerRanks(tournId).then(() => {
                this.disabled = false;
                this.textContent = 'Update Tournament Ranks';
                
                // Reload the tournament players to show updated ranks
                loadTournamentPlayers(tournId);
                });
            });
            }
        }
    } catch (err) {
        console.error('Error opening tournament players modal:', err);
        showToast('Error loading tournament players', 'error');
    }
}

// Update the loadTournamentPlayers function in admin.js
// Update the loadTournamentPlayers function in admin.js
async function loadTournamentPlayers(tournamentId) {
    try {
        const tableBody = document.querySelector('#currentPlayersTable tbody');
        if (!tableBody) {
            console.error('Current players table body not found');
            return;
        }
        
        tableBody.innerHTML = '<tr><td colspan="6">Loading players...</td></tr>';
        
        // Get players assigned to this tournament
        const { data, error } = await supabase
            .from('tournament_players')
            .select(`
                id,
                player_id,
                name,
                tournament_rank,
                players (
                    id,
                    acl_player_id,
                    skill_level,
                    player_ppr,
                    player_cpi
                )
            `)
            .eq('tournament_id', tournamentId);
            
        if (error) {
            console.error('Error fetching tournament players:', error);
            tableBody.innerHTML = '<tr><td colspan="6">Error loading players</td></tr>';
            return;
        }
        
        // Update count
        const countElement = document.getElementById('currentPlayersCount');
        if (countElement) {
            countElement.textContent = `${data.length} players assigned to this tournament`;
        }
        
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">No players assigned to this tournament yet</td></tr>';
            return;
        }
        
        // Display players
        tableBody.innerHTML = '';
        data.forEach(item => {
            const player = item.players;
            if (!player) return;
            
            // Format skill level
            let skillLevelDisplay = "Unknown";
            if (player.skill_level) {
                switch(player.skill_level) {
                    case 'P': skillLevelDisplay = 'Pro'; break;
                    case 'E': skillLevelDisplay = 'Elite'; break;
                    case 'ACLS': skillLevelDisplay = 'Senior'; break;
                    case 'ACLJ': skillLevelDisplay = 'Junior'; break;
                    case 'ACLW': skillLevelDisplay = 'Women\'s'; break;
                    default: skillLevelText = player.skill_level;
                }
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.acl_player_id || 'N/A'}</td>
                <td>${item.name || 'Unknown'}</td>
                <td>${item.tournament_rank || 'Not ranked'}</td>
                <td>${skillLevelDisplay}</td>
                <td>${player.player_ppr !== null ? player.player_ppr : '—'}</td>
                <td>${player.player_cpi !== null ? player.player_cpi : '—'}</td>
                <td>
                    <button class="btn btn-small remove-player-btn" 
                            data-tournament-id="${tournamentId}" 
                            data-player-id="${player.id}"
                            data-record-id="${item.id}">
                        Remove
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-player-btn').forEach(btn => {
            btn.addEventListener('click', () => removePlayerFromTournament(
                btn.dataset.recordId,
                btn.dataset.tournamentId,
                btn.closest('tr')
            ));
        });
        
    } catch (err) {
        console.error('Error loading tournament players:', err);
        const tableBody = document.querySelector('#currentPlayersTable tbody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="6">Error loading players</td></tr>';
        }
    }
}

// Remove a player from a tournament
async function removePlayerFromTournament(recordId, tournamentId, tableRow) {
    if (!confirm('Are you sure you want to remove this player from the tournament?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('tournament_players')
            .delete()
            .eq('id', recordId);
            
        if (error) {
            console.error('Error removing player from tournament:', error);
            showToast('Failed to remove player', 'error');
            return;
        }
        
        // Remove the row from the table
        if (tableRow) {
            tableRow.remove();
        }
        
        // Update player count
        const countElement = document.getElementById('currentPlayersCount');
        if (countElement) {
            const currentCount = parseInt(countElement.textContent);
            countElement.textContent = `${currentCount - 1} players assigned to this tournament`;
        }
        
        showToast('Player removed from tournament');
        
    } catch (err) {
        console.error('Error removing player:', err);
        showToast('Error removing player', 'error');
    }
}

// Load available players (not yet in the tournament)
async function loadAvailablePlayers(tournamentId, offset = 0, limit = 20) {
    try {
        const addPlayersTab = document.getElementById('addPlayersTab');
        if (!addPlayersTab) {
            console.error('Add players tab not found');
            return;
        }
        
        if (!addPlayersTab.querySelector('.admin-card')) {
            // First time loading, create the structure
            addPlayersTab.innerHTML = `
                <div class="admin-card">
                    <h3>Add Existing Players to Tournament</h3>
                    <p>Select players from the database to add to this tournament.</p>
                    <div class="search-box">
                        <input type="text" id="availablePlayerSearch" placeholder="Search for players...">
                    </div>
                    <div style="max-height: 300px; overflow-y: auto; margin-bottom: 15px;">
                        <table class="admin-table" id="availablePlayersTable">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Rank</th>
                                    <th>Win Rate</th>
                                    <th>Potential Points</th>
                                    <th>Add</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="5" class="text-center">Loading players...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <button id="loadMorePlayersBtn" class="btn btn-small">Load More Players</button>
                </div>
            `;
            
            // Add event listeners
            const searchInput = document.getElementById('availablePlayerSearch');
            if (searchInput) {
                searchInput.addEventListener('input', debounce(function() {
                    loadAvailablePlayers(tournamentId, 0);
                }, 300));
            }
            
            const loadMoreBtn = document.getElementById('loadMorePlayersBtn');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', function() {
                    const offset = parseInt(this.dataset.offset) || 0;
                    loadAvailablePlayers(tournamentId, offset);
                });
            }
        }
    
        const searchTerm = document.getElementById('availablePlayerSearch')?.value || '';
        
        // Get players already in this tournament
        const { data: tournamentPlayers, error: tpError } = await supabase
            .from('tournament_players')
            .select('player_id')
            .eq('tournament_id', tournamentId);
            
        if (tpError) {
            console.error('Error fetching tournament players:', tpError);
            return;
        }
        
        // Create a set of player IDs already in the tournament
        const tournamentPlayerIds = new Set();
        if (tournamentPlayers) {
            tournamentPlayers.forEach(tp => {
                tournamentPlayerIds.add(tp.player_id);
            });
        }
        
        // Query to get available players not in this tournament
        let query = supabase
            .from('players')
            .select('*')
            .order('rank', { ascending: true });
            
        // Add search filter if provided
        if (searchTerm) {
            query = query.ilike('name', `%${searchTerm}%`);
        }
        
        // Add pagination
        query = query.range(offset, offset + limit - 1);
        
        const { data: players, error } = await query;
            
        if (error) {
            console.error('Error loading available players:', error);
            return;
        }
        
        const tableBody = document.querySelector('#availablePlayersTable tbody');
        if (!tableBody) {
            console.error('Available players table body not found');
            return;
        }
        
        // Clear table if this is the first batch
        if (offset === 0) {
            tableBody.innerHTML = '';
        }
        
        // If no players found
        if (players.length === 0) {
            if (offset === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No players found</td></tr>';
            }
            // Hide load more button if no more results
            const loadMoreBtn = document.getElementById('loadMorePlayersBtn');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = 'none';
            }
            return;
        }
        
        // Show load more button
        const loadMoreBtn = document.getElementById('loadMorePlayersBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'block';
        }
        
        // Add players to table
        players.forEach(player => {
            // Skip if already in tournament
            if (tournamentPlayerIds.has(player.id)) {
                return;
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.name}</td>
                <td>${player.rank || 'N/A'}</td>
                <td>${player.win_rate ? player.win_rate.toFixed(1) + '%' : 'N/A'}</td>
                <td>${player.potential_points || calculatePotentialPoints(player.rank)}</td>
                <td>
                    <button class="btn btn-small add-to-tournament-btn" 
                            data-player-id="${player.id}" 
                            data-tournament-id="${tournamentId}"
                            data-player-name="${player.name}"
                            data-potential-points="${player.potential_points || calculatePotentialPoints(player.rank)}">
                        Add
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Update load more button dataset
        if (loadMoreBtn) {
            loadMoreBtn.dataset.offset = offset + limit;
            loadMoreBtn.dataset.tournamentId = tournamentId;
        }
        
        // Add event listeners to add buttons
        document.querySelectorAll('.add-to-tournament-btn').forEach(btn => {
            btn.addEventListener('click', addPlayerToTournament);
        });
        
    } catch (err) {
        console.error('Error loading available players:', err);
    }
}

// Add a player to a tournament
async function addPlayerToTournament() {
    const playerId = this.dataset.playerId;
    const tournamentId = this.dataset.tournamentId;
    const playerName = this.dataset.playerName;
    
    if (!playerId || !tournamentId || !playerName) {
      showToast('Error: Missing player data', 'error');
      return;
    }
    
    try {
      // Check if already in tournament
      const { data: existing, error: checkError } = await supabase
        .from('tournament_players')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('player_id', playerId);
        
      if (checkError) {
        console.error('Error checking if player in tournament:', checkError);
        showToast('Error adding player to tournament', 'error');
        return;
      }
      
      if (existing && existing.length > 0) {
        showToast('Player is already in this tournament', 'info');
        return;
      }
      
      // Add player to tournament - with tournament_rank and potential_points set to null initially
      const { error: addError } = await supabase
        .from('tournament_players')
        .insert({
          tournament_id: tournamentId,
          player_id: playerId,
          name: playerName,
          tournament_rank: null,  // Set initial rank to null
          potential_points: null, // Set initial potential points to null
          created_at: new Date().toISOString()
        });
        
      if (addError) {
        console.error('Error adding player to tournament:', addError);
        showToast('Error adding player to tournament', 'error');
        return;
      }
      
      // Remove the row to indicate success
      const row = this.closest('tr');
      if (row) {
        row.remove();
      }
      
      // Refresh tournament players list
      await loadTournamentPlayers(tournamentId);
      
      showToast('Player added to tournament successfully');
      
    } catch (err) {
      console.error('Error adding player to tournament:', err);
      showToast('Error adding player to tournament', 'error');
    }
  }

// Global player import functions
function setupPlayersTab() {
    // Check if players section exists
    const playersSection = document.querySelector('#players-section .admin-card');
    if (!playersSection) {
        console.error('Players section not found');
        return;
    }
    
    // Add Import Players tab button to the players section if it doesn't exist
    if (!document.querySelector('#players-section .players-management-tabs')) {
        console.log('Creating players management tabs...');
        
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'players-management-tabs';
        tabsContainer.innerHTML = `
            <button class="tab-button active" data-tab="managePlayers">Manage Players</button>
            <button class="tab-button" data-tab="importPlayers">Import Players</button>
        `;
        
        // Insert after the search box
        const searchBox = playersSection.querySelector('.search-box');
        if (searchBox) {
            searchBox.parentNode.insertBefore(tabsContainer, searchBox.nextSibling);
        } else {
            playersSection.appendChild(tabsContainer);
        }
        
        // Create tab content containers
        const managePlayersTab = document.createElement('div');
        managePlayersTab.id = 'managePlayersTab';
        managePlayersTab.className = 'tab-content active';
        
        // Move the existing players table into the manage players tab
        const playersTable = playersSection.querySelector('#playersTable');
        if (playersTable) {
            const searchBox = playersSection.querySelector('.search-box');
            if (searchBox) {
                managePlayersTab.appendChild(searchBox.cloneNode(true));
                searchBox.parentNode.removeChild(searchBox);
            }
            
            playersTable.parentNode.removeChild(playersTable);
            managePlayersTab.appendChild(playersTable);
        }
        
        // Create import players tab content
        const importPlayersTab = document.createElement('div');
        importPlayersTab.id = 'importPlayersTab';
        importPlayersTab.className = 'tab-content';
        importPlayersTab.innerHTML = `
            <div class="admin-card">
                <h3>Import Players from JSON</h3>
                <p>Paste player data in JSON format below. This will add the players to the database.</p>
                <textarea id="playerJsonImport" class="code-input" rows="10" placeholder='Paste JSON player data here...'></textarea>
                <button id="parsePlayersImportBtn" class="btn" style="margin-top: 10px;">Parse Player Data</button>
                
                <div id="parseImportResults" style="display: none; margin-top: 20px;">
                    <h4>Players to Import</h4>
                    <p id="parseImportSummary"></p>
                    <div style="max-height: 400px; overflow-y: auto;">
                        <table class="admin-table" id="parsedImportTable">
                            <thead>
                                <tr>
                                    <th>ACL ID</th>
                                    <th>Name</th>
                                    <th>Skill Level</th>
                                    <th>PPR</th>
                                    <th>CPI</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Parsed players will appear here -->
                            </tbody>
                        </table>
                    </div>
                    <button id="importPlayersGlobalBtn" class="btn" style="margin-top: 10px;">Import Players</button>
                </div>
            </div>
        `;
        
        // Add tabs to the players section
        playersSection.appendChild(managePlayersTab);
        playersSection.appendChild(importPlayersTab);
        
        // Setup tab switching for players section
        setupPlayersTabs();
        
        // Setup the import functions now that the elements exist
        setTimeout(() => {
            setupPlayerImportFunctions();
        }, 500);
    } else {
        console.log('Players management tabs already exist');
    }
}

// Setup tab switching for players section
function setupPlayersTabs() {
    document.querySelectorAll('#players-section .tab-button').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('#players-section .tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('#players-section .tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.dataset.tab + 'Tab';
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
    
    // Setup event listeners for import functionality
    const parseBtn = document.getElementById('parsePlayersImportBtn');
    if (parseBtn) {
        parseBtn.addEventListener('click', parsePlayerImportData);
    }
    
    const importBtn = document.getElementById('importPlayersGlobalBtn');
    if (importBtn) {
        importBtn.addEventListener('click', importPlayersGlobal);
    }
}

function parsePlayerImportData() {
    const jsonInput = document.getElementById('playerJsonImport');
    const summaryElement = document.getElementById('parseImportSummary');
    const resultsContainer = document.getElementById('parseImportResults');
    const tableBody = document.querySelector('#parsedImportTable tbody');
    
    if (!jsonInput || !summaryElement || !resultsContainer || !tableBody) {
        showToast('Error: Import interface elements not found', 'error');
        return;
    }
    
    const jsonText = jsonInput.value.trim();
    
    if (!jsonText) {
        showToast('Please paste player data first', 'error');
        return;
    }
    
    try {
        // Try to parse the JSON
        let playersData = [];
        let importType = 'unknown'; // Will be set to 'bracket' or 'standings'
        
        const jsonData = JSON.parse(jsonText);
        console.log('Initial JSON parse successful:', jsonData);
        
        // Determine import type based on data structure
        if (jsonData.bracketDetails && Array.isArray(jsonData.bracketDetails)) {
            importType = 'bracket';
            playersData = extractPlayersFromBracketDetails(jsonData.bracketDetails);
        } else if (jsonData.data && Array.isArray(jsonData.data)) {
            importType = 'standings';
            playersData = jsonData.data;
        } else if (Array.isArray(jsonData)) {
            // Try to determine type by examining the first object
            if (jsonData.length > 0) {
                const firstItem = jsonData[0];
                if (firstItem.player_info || firstItem.bracketpos) {
                    importType = 'bracket';
                } else if (firstItem.playerPPR || firstItem.player_ppr || firstItem.CPI || firstItem.player_cpi) {
                    importType = 'standings';
                }
            }
            playersData = jsonData;
        } else {
            // Last resort - look for player data anywhere in the structure
            playersData = extractAllPlayers(jsonData);
            
            // Try to determine type by examining the first object
            if (playersData.length > 0) {
                const firstItem = playersData[0];
                if (firstItem.player_info || firstItem.bracketpos) {
                    importType = 'bracket';
                } else if (firstItem.playerPPR || firstItem.player_ppr || firstItem.CPI || firstItem.player_cpi) {
                    importType = 'standings';
                }
            }
        }
        
        console.log(`Detected import type: ${importType}`);
        
        // Filter out players with names starting with "Bye User"
        playersData = playersData.filter(player => {
            // Check for direct firstname/lastname combination
            if (player.firstname === "Bye" && player.lastname && player.lastname.startsWith("User")) {
                return false;
            }
            
            // Check for full name property
            if (player.name && player.name.startsWith("Bye User")) {
                return false;
            }
            
            // Check for fldPlayerFirstName/fldPlayerLastname combination
            if (player.fldPlayerFirstName === "Bye" && 
                player.fldPlayerLastname && player.fldPlayerLastname.startsWith("User")) {
                return false;
            }
            
            return true;
        });
        
        // Verify we have player data
        if (!playersData || !Array.isArray(playersData) || playersData.length === 0) {
            throw new Error('No player data found in the provided JSON');
        }
        
        console.log('Successfully parsed player data', playersData);
        
        // Process players with enhanced data handling
        const parsedPlayers = playersData.map(player => {
            console.log('Processing player:', player);
            
            // Set default high rank (will be updated by ranking system)
            const temporaryRank = 999;
            
            // Handle different player data formats
            let playerData = {
                acl_player_id: null,
                name: "Unknown Player",
                skill_level: 'P',
                player_ppr: 0,
                player_cpi: 0,
                rank: temporaryRank,
                potential_points: calculatePotentialPoints(temporaryRank),
                actual_points: 0,
                profile_picture: null,  // Changed from photoimage to profile_picture
                created_at: new Date().toISOString(),
                status: 'new',
                importType: importType // Track the source of this data
            };
            
            // Extract player ID
            if (player.playerID || player.acl_player_id) {
                playerData.acl_player_id = player.playerID || player.acl_player_id;
            } else if (player.playerid) {
                playerData.acl_player_id = player.playerid;
            }
            
            // Extract name
            if (player.fldPlayerFirstName && player.fldPlayerLastname) {
                playerData.name = `${player.fldPlayerFirstName} ${player.fldPlayerLastname}`;
            } else if (player.name) {
                playerData.name = player.name;
            } else if (player.firstname && player.lastname) {
                playerData.name = `${player.firstname} ${player.lastname}`;
            }
            
            // Extract other properties
            if (player.playerSkillLevel || player.skill_level) {
                playerData.skill_level = player.playerSkillLevel || player.skill_level;
            }
            
            // Extract PPR - Don't update to 0 if we can't find a value
            const pprValue = parseFloat(player.playerPPR || player.player_ppr);
            if (!isNaN(pprValue)) {
                playerData.player_ppr = pprValue;
            }
            
            // Extract CPI - Don't update to 0 if we can't find a value
            const cpiValue = parseFloat(player.playerCPI || player.player_cpi);
            if (!isNaN(cpiValue)) {
                playerData.player_cpi = cpiValue;
            }
            
            // Extract photo URL if available - changed to map photoimage to profile_picture
            if (player.photoimage) {
                playerData.profile_picture = player.photoimage;
            }
            
            return playerData;
        });
        
        // Check if any players were extracted
        if (parsedPlayers.length === 0) {
            throw new Error('No valid player data found');
        }
        
        // Now check if these players already exist in our database
        // Pass importType to help with smarter merging
        checkExistingPlayersGlobal(parsedPlayers, importType);
        
    } catch (err) {
        console.error('Error parsing player data:', err);
        showToast('Error parsing JSON: ' + err.message, 'error');
    }
}

// Helper function to extract players from bracket details
function extractPlayersFromBracketDetails(bracketDetails) {
    let players = [];
    
    bracketDetails.forEach(bracket => {
        if (bracket.player_info && Array.isArray(bracket.player_info)) {
            bracket.player_info.forEach(player => {
                // Check if this player is already in our list and is not a "Bye User"
                const existingPlayer = players.find(p => p.playerid === player.playerid);
                if (!existingPlayer && player.playerid && 
                    !(player.firstname === "Bye" && player.lastname && player.lastname.startsWith("User"))) {
                    players.push(player);
                }
            });
        }
    });
    
    return players;
}

// Helper function to recursively search for player data
function extractAllPlayers(obj) {
    let players = [];
    
    // Base case: not an object
    if (!obj || typeof obj !== 'object') {
        return players;
    }
    
    // If it's an array of player_info objects
    if (Array.isArray(obj) && obj.length > 0 && obj[0].player_info) {
        obj.forEach(item => {
            if (item.player_info && Array.isArray(item.player_info)) {
                item.player_info.forEach(player => {
                    // Skip "Bye User" players
                    if (player.firstname === "Bye" && player.lastname && player.lastname.startsWith("User")) {
                        return;
                    }
                    
                    const existingPlayer = players.find(p => p.playerid === player.playerid);
                    if (!existingPlayer && player.playerid) {
                        players.push(player);
                    }
                });
            }
        });
        return players;
    }
    
    // Recursive case: iterate through object properties
    for (const key in obj) {
        if (key === 'player_info' && Array.isArray(obj[key])) {
            obj[key].forEach(player => {
                // Skip "Bye User" players
                if (player.firstname === "Bye" && player.lastname && player.lastname.startsWith("User")) {
                    return;
                }
                
                const existingPlayer = players.find(p => p.playerid === player.playerid);
                if (!existingPlayer && player.playerid) {
                    players.push(player);
                }
            });
        } else if (typeof obj[key] === 'object') {
            // Recursively search deeper
            const foundPlayers = extractAllPlayers(obj[key]);
            if (foundPlayers.length > 0) {
                foundPlayers.forEach(player => {
                    // Skip "Bye User" players (should be filtered already, but double-check)
                    if (player.firstname === "Bye" && player.lastname && player.lastname.startsWith("User")) {
                        return;
                    }
                    
                    const existingPlayer = players.find(p => p.playerid === player.playerid);
                    if (!existingPlayer && player.playerid) {
                        players.push(player);
                    }
                });
            }
        }
    }
    
    return players;
}

// Helper function to extract players from bracket details
function extractPlayersFromBracketDetails(bracketDetails) {
    let players = [];
    
    bracketDetails.forEach(bracket => {
        if (bracket.player_info && Array.isArray(bracket.player_info)) {
            bracket.player_info.forEach(player => {
                // Check if this player is already in our list
                const existingPlayer = players.find(p => p.playerid === player.playerid);
                if (!existingPlayer && player.playerid) {
                    players.push(player);
                }
            });
        }
    });
    
    return players;
}

// Helper function to recursively search for player data
function extractAllPlayers(obj) {
    let players = [];
    
    // Base case: not an object
    if (!obj || typeof obj !== 'object') {
        return players;
    }
    
    // If it's an array of player_info objects
    if (Array.isArray(obj) && obj.length > 0 && obj[0].player_info) {
        obj.forEach(item => {
            if (item.player_info && Array.isArray(item.player_info)) {
                item.player_info.forEach(player => {
                    const existingPlayer = players.find(p => p.playerid === player.playerid);
                    if (!existingPlayer && player.playerid) {
                        players.push(player);
                    }
                });
            }
        });
        return players;
    }
    
    // Recursive case: iterate through object properties
    for (const key in obj) {
        if (key === 'player_info' && Array.isArray(obj[key])) {
            obj[key].forEach(player => {
                const existingPlayer = players.find(p => p.playerid === player.playerid);
                if (!existingPlayer && player.playerid) {
                    players.push(player);
                }
            });
        } else if (typeof obj[key] === 'object') {
            // Recursively search deeper
            const foundPlayers = extractAllPlayers(obj[key]);
            if (foundPlayers.length > 0) {
                foundPlayers.forEach(player => {
                    const existingPlayer = players.find(p => p.playerid === player.playerid);
                    if (!existingPlayer && player.playerid) {
                        players.push(player);
                    }
                });
            }
        }
    }
    
    return players;
}


async function checkExistingPlayersGlobal(players, importType) {
    try {
        // Get all ACL player IDs to check (filter out null/undefined values)
        const aclPlayerIds = players.map(p => p.acl_player_id).filter(id => id);
        
        let existingPlayerMap = {};
        
        // Only query Supabase if we have ACL IDs to check
        if (aclPlayerIds.length > 0) {
            // Query existing players by ACL ID - Get all fields for proper merging
            const { data: existingPlayers, error } = await supabase
                .from('players')
                .select('*')
                .in('acl_player_id', aclPlayerIds);
                
            if (error) {
                console.error('Error checking existing players by ACL ID:', error);
                // Continue with empty map instead of failing completely
            } else if (existingPlayers) {
                // Create a map of existing players by ACL ID
                existingPlayers.forEach(player => {
                    if (player.acl_player_id) {
                        existingPlayerMap[player.acl_player_id] = player;
                    }
                });
            }
        }
        
        // Also check by player name for players without ACL IDs
        const playerNames = players.map(p => p.name).filter(name => name && name !== "Unknown Player");
        
        if (playerNames.length > 0) {
            // We'll do this in batches if there are many names
            const batchSize = 10;
            for (let i = 0; i < playerNames.length; i += batchSize) {
                const nameBatch = playerNames.slice(i, i + batchSize);
                
                // Use OR filters for each name
                let query = supabase.from('players').select('*');
                
                // Add OR conditions for each name
                nameBatch.forEach((name, index) => {
                    if (index === 0) {
                        query = query.ilike('name', `%${name}%`);
                    } else {
                        query = query.or(`name.ilike.%${name}%`);
                    }
                });
                
                const { data: nameMatches, error: nameError } = await query;
                
                if (nameError) {
                    console.error('Error checking existing players by name:', nameError);
                } else if (nameMatches) {
                    // Add to our map
                    nameMatches.forEach(player => {
                        // Use name as key for players without ACL ID
                        if (!player.acl_player_id) {
                            existingPlayerMap[player.name.toLowerCase()] = player;
                        }
                    });
                }
            }
        }
        
        // Update player status based on matches and merge data intelligently
        players.forEach(player => {
            let existingPlayer = null;
            
            // Check by ACL ID first
            if (player.acl_player_id && existingPlayerMap[player.acl_player_id]) {
                existingPlayer = existingPlayerMap[player.acl_player_id];
                player.status = 'existing';
                player.statusText = 'Existing player (ACL ID match)';
                player.id = existingPlayer.id;
            }
            // Then check by name (for players without ACL ID)
            else if (player.name && existingPlayerMap[player.name.toLowerCase()]) {
                existingPlayer = existingPlayerMap[player.name.toLowerCase()];
                player.status = 'existing';
                player.statusText = 'Existing player (name match)';
                player.id = existingPlayer.id;
            }
            // Otherwise, it's a new player
            else {
                player.status = 'new';
                player.statusText = 'New player';
            }
            
            // If we found an existing player, intelligently merge the data
            if (existingPlayer) {
                // Always keep the database ID
                player.id = existingPlayer.id;
                
                // Smart merging based on import type
                if (importType === 'standings') {
                    // Event standings data typically has better PPR, CPI, photo info
                    // We want to update these values when present but keep existing values
                    // when not provided in the import
                    
                    // Only update name if we have a better one
                    if (player.name === "Unknown Player" && existingPlayer.name) {
                        player.name = existingPlayer.name;
                    }
                    
                    // Skill level - keep existing if new one is default 'P'
                    if (player.skill_level === 'P' && existingPlayer.skill_level && 
                        existingPlayer.skill_level !== 'P') {
                        player.skill_level = existingPlayer.skill_level;
                    }
                    
                    // PPR - keep existing if new one is 0
                    if ((player.player_ppr === 0 || player.player_ppr === null) && 
                        existingPlayer.player_ppr && existingPlayer.player_ppr > 0) {
                        player.player_ppr = existingPlayer.player_ppr;
                    }
                    
                    // CPI - keep existing if new one is 0
                    if ((player.player_cpi === 0 || player.player_cpi === null) && 
                        existingPlayer.player_cpi && existingPlayer.player_cpi > 0) {
                        player.player_cpi = existingPlayer.player_cpi;
                    }
                    
                    // Photo - keep existing if new one is null
                    if (!player.profile_picture && existingPlayer.profile_picture) {
                        player.profile_picture = existingPlayer.profile_picture;
                    }
                } else if (importType === 'bracket') {
                    // Bracket data typically has better name and ID info
                    // But often lacks PPR, CPI, and photo
                    
                    // For bracket data, keep existing PPR, CPI, and photo
                    if (existingPlayer.player_ppr && existingPlayer.player_ppr > 0) {
                        player.player_ppr = existingPlayer.player_ppr;
                    }
                    
                    if (existingPlayer.player_cpi && existingPlayer.player_cpi > 0) {
                        player.player_cpi = existingPlayer.player_cpi;
                    }
                    
                    if (existingPlayer.profile_picture) {
                        player.profile_picture = existingPlayer.profile_picture;
                    }
                    
                    // Only replace skill level if existing is default 'P'
                    if (existingPlayer.skill_level === 'P' && player.skill_level !== 'P') {
                        // keep the new one
                    } else if (existingPlayer.skill_level !== 'P') {
                        player.skill_level = existingPlayer.skill_level;
                    }
                }
                
                // Always preserve these fields from the existing player
                player.rank = existingPlayer.rank;
                player.potential_points = existingPlayer.potential_points;
                player.actual_points = existingPlayer.actual_points;
                player.created_at = existingPlayer.created_at;
            }
        });
        
        // Display the parsed players
        displayParsedPlayersGlobal(players, importType);
        
    } catch (err) {
        console.error('Error checking existing players:', err);
        showToast('Error processing player data: ' + err.message, 'error');
    }
}

function displayParsedPlayersGlobal(players, importType) {
    const tableBody = document.querySelector('#parsedImportTable tbody');
    const summary = document.getElementById('parseImportSummary');
    const results = document.getElementById('parseImportResults');
    const importBtn = document.getElementById('importPlayersGlobalBtn');
    
    if (!tableBody || !summary || !results || !importBtn) {
        showToast('Error: Import interface elements not found', 'error');
        return;
    }
    
    tableBody.innerHTML = '';
    
    // Count statistics
    const stats = {
        total: players.length,
        new: players.filter(p => p.status === 'new').length,
        existing: players.filter(p => p.status === 'existing').length
    };
    
    // Display summary with import type
    summary.innerHTML = `
        <strong>Import Type:</strong> ${importType === 'bracket' ? 'Bracket Data' : 'Standings Data'}<br>
        <strong>Found ${stats.total} players:</strong> 
        <span class="status-new">${stats.new} new</span>, 
        <span class="status-existing">${stats.existing} existing (will be updated)</span>
    `;
    
    // Display player rows
    players.forEach(player => {
        const row = document.createElement('tr');
        row.className = player.status; // Add class for styling
        
        // Show photo status
        const photoStatus = player.profile_picture ? 
            '<span class="has-photo">Yes</span>' : 
            '<span class="no-photo">No</span>';
        
        row.innerHTML = `
            <td>${player.acl_player_id || 'N/A'}</td>
            <td>${player.name || 'Unknown'}</td>
            <td>${player.skill_level || 'N/A'}</td>
            <td>${player.player_ppr !== null && player.player_ppr !== undefined ? player.player_ppr.toFixed(2) : 'N/A'}</td>
            <td>${player.player_cpi !== null && player.player_cpi !== undefined ? player.player_cpi.toFixed(2) : 'N/A'}</td>
            <td>${photoStatus}</td>
            <td class="status-${player.status}">${player.statusText}</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Store the players data for import
    importBtn.dataset.players = JSON.stringify(players);
    importBtn.dataset.importType = importType;
    
    // Show the results section
    results.style.display = 'block';
    
    // Scroll to results for better visibility
    results.scrollIntoView({ behavior: 'smooth' });
}

async function importPlayersGlobal() {
    const importBtn = document.getElementById('importPlayersGlobalBtn');
    if (!importBtn) {
        showToast('Error: Import button not found', 'error');
        return;
    }
    
    const playersJson = importBtn.dataset.players;
    const importType = importBtn.dataset.importType || 'unknown';
    
    if (!playersJson) {
        showToast('No player data to import', 'error');
        return;
    }
    
    try {
        const players = JSON.parse(playersJson);
        
        if (players.length === 0) {
            showToast('No players to import');
            return;
        }
        
        // Disable the import button
        importBtn.disabled = true;
        importBtn.textContent = 'Importing...';
        
        // Process each player
        let successCount = 0;
        let updateCount = 0;
        let failCount = 0;
        
        for (const player of players) {
            // If existing player, update instead of create
            if (player.status === 'existing' && player.id) {
                // Create update object with only the fields we want to update
                const updateData = {};
                
                // Always update ACL Player ID if available
                if (player.acl_player_id) {
                    updateData.acl_player_id = player.acl_player_id;
                }
                
                // Always update name if it's not "Unknown Player"
                if (player.name && player.name !== "Unknown Player") {
                    updateData.name = player.name;
                }
                
                // Always update skill level if it's not 'P'
                if (player.skill_level && player.skill_level !== 'P') {
                    updateData.skill_level = player.skill_level.length > 10 ? 
                        player.skill_level.substring(0, 10) : player.skill_level;
                }
                
                // Update PPR only if it's a valid number > 0
                if (player.player_ppr && !isNaN(player.player_ppr) && player.player_ppr > 0) {
                    updateData.player_ppr = player.player_ppr;
                }
                
                // Update CPI only if it's a valid number > 0
                if (player.player_cpi && !isNaN(player.player_cpi) && player.player_cpi > 0) {
                    updateData.player_cpi = player.player_cpi;
                }
                
                // Update photo URL if available - changed to profile_picture
                if (player.profile_picture) {
                    updateData.profile_picture = player.profile_picture;
                }
                
                // Only perform update if we have fields to update
                if (Object.keys(updateData).length > 0) {
                    console.log(`Updating player ${player.id}:`, updateData);
                    
                    try {
                        const { data, error } = await supabase
                            .from('players')
                            .update(updateData)
                            .eq('id', player.id);
                            
                        if (error) {
                            console.error('Error updating player:', error);
                            failCount++;
                        } else {
                            updateCount++;
                        }
                    } catch (updateError) {
                        console.error('Error updating player:', updateError);
                        failCount++;
                    }
                } else {
                    // No fields to update
                    updateCount++;
                }
            } else {
                // Create new player with consistent schema fields
                // Ensure skill_level is truncated if needed
                const skill_level = player.skill_level ? 
                    (player.skill_level.length > 10 ? player.skill_level.substring(0, 10) : player.skill_level) 
                    : 'P';

                // Create the player object with all required fields
                const newPlayer = {
                    name: player.name,
                    acl_player_id: player.acl_player_id,
                    skill_level: skill_level,
                    player_ppr: player.player_ppr || 0,
                    player_cpi: player.player_cpi || 0,
                    rank: player.rank || 999,
                    potential_points: player.potential_points || calculatePotentialPoints(player.rank || 999),
                    actual_points: 0, // Always start with 0 points
                    profile_picture: player.profile_picture || null,  // Changed from photoimage to profile_picture
                    created_at: new Date().toISOString()
                };
                
                console.log('Creating player:', newPlayer);
                
                // Create new player
                try {
                    const { data, error } = await supabase
                        .from('players')
                        .insert([newPlayer]);
                        
                    if (error) {
                        console.error('Error creating player:', error);
                        failCount++;
                    } else {
                        successCount++;
                    }
                } catch (createError) {
                    console.error('Error creating player:', createError);
                    failCount++;
                }
            }
        }
        
        // Update rankings after adding/updating players
        await updatePlayerRanksByCPI();
        
        // Refresh the players list
        await loadPlayers();
        
        // Reset the import section
        const parseImportResults = document.getElementById('parseImportResults');
        const playerJsonImport = document.getElementById('playerJsonImport');
        
        if (parseImportResults) {
            parseImportResults.style.display = 'none';
        }
        
        if (playerJsonImport) {
            playerJsonImport.value = '';
        }
        
        // Enable the import button
        importBtn.disabled = false;
        importBtn.textContent = 'Import Players';
        
        showToast(`Import complete: ${successCount} added, ${updateCount} updated, ${failCount} failed`);
        
    } catch (err) {
        console.error('Error importing players:', err);
        showToast('Error importing players: ' + err.message, 'error');
        
        const importBtn = document.getElementById('importPlayersGlobalBtn');
        if (importBtn) {
            importBtn.disabled = false;
            importBtn.textContent = 'Import Players';
        }
    }
}

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc)
function getOrdinal(n) {
    if (!n) return '';
    
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Helper function to truncate text
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Helper function to debounce search input
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (err) {
        console.error('Error formatting date:', err);
        return 'Invalid date';
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toast = document.getElementById('toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '4px';
        toast.style.color = 'white';
        toast.style.display = 'none';
        toast.style.zIndex = '9999';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.backgroundColor = type === 'success' ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)';
    toast.style.display = 'block';
    
    // Clear any existing timeout
    if (toast.timeout) {
        clearTimeout(toast.timeout);
    }
    
    // Hide toast after 3 seconds
    toast.timeout = setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Initialize player points system
function initializePlayerPointsSystem() {
    // Add a "Player Leaderboard" button to the admin dashboard
    const dashboardSection = document.querySelector('.admin-stats');
    if (dashboardSection) {
        // Check if button already exists
        if (!document.getElementById('playerLeaderboardBtn')) {
            const leaderboardBtn = document.createElement('button');
            leaderboardBtn.className = 'btn';
            leaderboardBtn.id = 'playerLeaderboardBtn';
            leaderboardBtn.textContent = 'View Player Leaderboard';
            leaderboardBtn.style.marginTop = '1rem';
            leaderboardBtn.style.width = '100%';
            
            // Add after dashboard
            dashboardSection.parentNode.insertBefore(leaderboardBtn, dashboardSection.nextSibling);
            
            // Event listener for leaderboard button
            leaderboardBtn.addEventListener('click', showPlayerLeaderboard);
        }
    }
    
    console.log('Player points system initialized');
}

// Function to initialize the CPI-based ranking system
async function initializeRankingSystem() {
    // Add event listeners to use modified functions
    const addPlayerForm = document.getElementById('addPlayerForm');
    if (addPlayerForm) {
        // Remove existing event listener
        const newForm = addPlayerForm.cloneNode(true);
        addPlayerForm.parentNode.replaceChild(newForm, addPlayerForm);
        
        // Add our modified event listener
        newForm.addEventListener('submit', handleAddPlayer);
    }
    
    const editPlayerForm = document.getElementById('editPlayerForm');
    if (editPlayerForm) {
        // Remove existing event listener
        const newForm = editPlayerForm.cloneNode(true);
        editPlayerForm.parentNode.replaceChild(newForm, editPlayerForm);
        
        // Add our modified event listener
        newForm.addEventListener('submit', handleUpdatePlayer);
    }
    
    // Add update rankings button
    addUpdateRankingsButton();
    
    console.log('CPI-based ranking system initialized');
}

// Call this function after the DOM is loaded and admin.js has initialized
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the admin.js scripts to initialize first
    setTimeout(() => {
        initializeRankingSystem();
    }, 1000);
});

// Logout user
async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            showToast('Error signing out', 'error');
            return false;
        }
        return true;
    } catch (err) {
        console.error('Error in logoutUser:', err);
        showToast('Error signing out', 'error');
        return false;
    }
}

function setupPlayerImportFunctions() {
    console.log('Setting up player import functions...');
    
    try {
        // Find the Parse button and Import button
        const parseBtn = document.getElementById('parsePlayersImportBtn');
        const importBtn = document.getElementById('importPlayersGlobalBtn');
        
        if (parseBtn) {
            // Remove any existing event listeners
            const newParseBtn = parseBtn.cloneNode(true);
            parseBtn.parentNode.replaceChild(newParseBtn, parseBtn);
            
            // Add our updated event listener
            newParseBtn.addEventListener('click', parsePlayerImportData);
            console.log('Parse button event listener attached');
        } else {
            console.warn('Parse button not found');
        }
        
        if (importBtn) {
            // Remove any existing event listeners
            const newImportBtn = importBtn.cloneNode(true);
            importBtn.parentNode.replaceChild(newImportBtn, importBtn);
            
            // Add our updated event listener
            newImportBtn.addEventListener('click', importPlayersGlobal);
            console.log('Import button event listener attached');
        } else {
            console.warn('Import button not found');
        }
        
        // Also setup the players tab to ensure it's available
        setupPlayersTab();
        
        console.log('Player import functions setup complete');
        return true;
    } catch (err) {
        console.error('Error setting up player import functions:', err);
        return false;
    }
}

// Function to ensure modals exist in the DOM
function ensureModalsExist() {
    // Create the tournament players modal if it doesn't exist
    if (!document.getElementById('tournamentPlayersModal')) {
        const modal = document.createElement('div');
        modal.id = 'tournamentPlayersModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" id="closeTournamentPlayersModal">&times;</span>
                <h2>Tournament Players</h2>
                <h3 id="tournamentPlayersName"></h3>
                
                <div class="tab-buttons">
                    <button class="tab-button active" data-tab="currentPlayers">Current Players</button>
                    <button class="tab-button" data-tab="addPlayers">Add Players</button>
                </div>
                
                <div id="currentPlayersTab" class="tab-content active">
                    <div class="admin-card">
                        <h3>Players in this Tournament</h3>
                        <p id="currentPlayersCount">0 players assigned to this tournament</p>
                        <div style="max-height: 300px; overflow-y: auto;">
                            <table class="admin-table" id="currentPlayersTable">
                                <thead>
                                    <tr>
                                        <th>ACL ID</th>
                                        <th>Name</th>
                                        <th>Tourn. Rank</th>
                                        <th>Skill Level</th>
                                        <th>PPR</th>
                                        <th>CPI</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="6" class="text-center">Loading players...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div id="addPlayersTab" class="tab-content">
                    <!-- Content will be loaded dynamically -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listener to close button
        document.getElementById('closeTournamentPlayersModal').addEventListener('click', () => {
            document.getElementById('tournamentPlayersModal').style.display = 'none';
        });
        
        // Setup tab switching
        document.querySelectorAll('#tournamentPlayersModal .tab-button').forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all tabs
                document.querySelectorAll('#tournamentPlayersModal .tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('#tournamentPlayersModal .tab-content').forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding content
                const tabId = this.dataset.tab + 'Tab';
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
    
    // Create the view team modal if it doesn't exist
    if (!document.getElementById('viewTeamModal')) {
        const modal = document.createElement('div');
        modal.id = 'viewTeamModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" id="closeViewTeamModal">&times;</span>
                <h2>Team Details</h2>
                <div id="teamDetailsContainer">
                    <div class="loading">Loading team details...</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listener to close button
        document.getElementById('closeViewTeamModal').addEventListener('click', () => {
            document.getElementById('viewTeamModal').style.display = 'none';
        });
    }
}

// Initialize after DOM content is fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            window.location.href = 'login.html';
            return;
        }
        
        // Check admin status
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
        
        // Ensure necessary modals exist before referencing them
        ensureModalsExist();
        
        // Add player results styles
        addPlayerResultsStyles();
        
        // Initialize player points system
        initializePlayerPointsSystem();
        
        // Setup the global player import tab
        setupPlayersTab();
        
        // Setup main tabs
        setupTabs();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load all admin data
        await loadTournaments();
        await loadPlayers();
        await loadTeams();
        
    } catch (err) {
        console.error('Error in admin initialization:', err);
        window.location.href = 'profile.html';
    }
});