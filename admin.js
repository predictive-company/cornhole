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

// Function to calculate potential points based on rank
function calculatePotentialPoints(rank) {
    // Top players (lower rank numbers) get fewer points
    // Lower-ranked players (higher rank numbers) get more points
    
    if (rank <= 10) {
      // Top 10 players: 30-50 points (rank 1 = 30 points, rank 10 = 50 points)
      return 30 + ((rank - 1) * 2);
    } else if (rank <= 30) {
      // Rank 11-30: 50-70 points
      return 50 + ((rank - 10) * 1);
    } else {
      // Rank 31+: 70-100 points (capped at 100)
      return Math.min(100, Math.round(70 + ((rank - 30) * 0.8)));
    }
  }

// Setup event listeners for modals and buttons
function setupEventListeners() {
    // Tournament related
    document.getElementById('addTournamentBtn').addEventListener('click', () => {
        document.getElementById('addTournamentModal').style.display = 'block';
    });
    
    document.getElementById('closeTournamentPlayersModal').addEventListener('click', () => {
        document.getElementById('tournamentPlayersModal').style.display = 'none';
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

    // Add these lines inside your setupEventListeners function
document.getElementById('closeTournamentPlayersModal').addEventListener('click', () => {
    document.getElementById('tournamentPlayersModal').style.display = 'none';
});

// Setup tab switching for tournament players modal
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Show corresponding content
        const tabId = this.dataset.tab + 'Tab';
        document.getElementById(tabId).classList.add('active');
    });
});
}

// TOURNAMENT FUNCTIONS
// Load all tournaments
// Modified loadTournaments function to use Player Results button instead of Set Results
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
            
            // In loadTournaments function - fix the row rendering to include action buttons
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
    `;
    document.head.appendChild(style);
}

// Add to DOMContentLoaded event handler to ensure styles are added
document.addEventListener('DOMContentLoaded', function() {
    // Add with a delay to ensure DOM is fully loaded
    setTimeout(function() {
        addPlayerResultsStyles();
    }, 500);
});

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
            top_players_count: parseInt(document.getElementById('topPlayersCount').value),
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
        document.getElementById('editTopPlayersCount').value = tournament.top_players_count || 4;
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
            top_players_count: parseInt(document.getElementById('editTopPlayersCount').value),
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
        
        // Display tournament info
        const tournamentInfo = document.getElementById('tournamentInfo');
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
        
        if (!teams || teams.length === 0) {
            const tableBody = document.querySelector('#teamsForRankingTable tbody');
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
            document.getElementById('setWinnersModal').style.display = 'block';
            document.getElementById('saveWinnersBtn').dataset.tournamentId = tournamentId;
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
        const tableBody = document.querySelector('#teamsForRankingTable tbody');
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
        document.getElementById('setWinnersModal').style.display = 'block';
        // Store tournament ID for save function
        document.getElementById('saveWinnersBtn').dataset.tournamentId = tournamentId;
        
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
        
        const tournamentId = document.getElementById('saveWinnersBtn').dataset.tournamentId;
        const placements = document.querySelectorAll('.team-placement');
        const pointsInputs = document.querySelectorAll('.team-points');
        const winningsInputs = document.querySelectorAll('.team-winnings');
        
        // Start a loading indicator
        document.getElementById('saveWinnersBtn').textContent = 'Saving...';
        document.getElementById('saveWinnersBtn').disabled = true;
        
        // First, delete any existing results for this tournament
        await supabase
            .from('tournament_results')
            .delete()
            .eq('tournament_id', tournamentId);
        
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
                            playerPointsUpdates.push(
                                supabase
                                    .from('players')
                                    .update({ 
                                        actual_points: newTotalPoints 
                                    })
                                    .eq('id', teamPlayer.player_id)
                            );
                            
                            // Create a record in player_tournament_points table
                            const { error: pointsRecordError } = await supabase
                                .from('player_tournament_points')
                                .insert([{
                                    player_id: teamPlayer.player_id,
                                    tournament_id: tournamentId,
                                    team_id: teamId,
                                    points_earned: pointsForPlayer,
                                    team_placement: placement
                                }]);
                                
                            if (pointsRecordError) {
                                console.error('Error recording player tournament points:', pointsRecordError);
                            }
                        }
                    }
                }
            }
            
            // Update team winnings
            teamUpdates.push(
                supabase
                    .from('teams')
                    .update({ 
                        final_rank: placement || null,
                        winnings: winnings 
                    })
                    .eq('id', teamId)
            );
        }
        
        // Execute team updates
        if (teamUpdates.length > 0) {
            await Promise.all(teamUpdates);
        }
        
        // Execute player points updates
        if (playerPointsUpdates.length > 0) {
            await Promise.all(playerPointsUpdates);
        }
        
        // Insert tournament results
        if (tournamentResults.length > 0) {
            const { error: resultsError } = await supabase
                .from('tournament_results')
                .insert(tournamentResults);
                
            if (resultsError) {
                console.error('Error saving tournament results:', resultsError);
                showToast('Error saving tournament results', 'error');
                document.getElementById('saveWinnersBtn').textContent = 'Save Results';
                document.getElementById('saveWinnersBtn').disabled = false;
                return;
            }
        }
        
        // Update tournament status to completed
        await supabase
            .from('tournaments')
            .update({ status: 'completed' })
            .eq('id', tournamentId);
        
        showToast('Tournament results saved successfully. Player points have been updated.');
        document.getElementById('setWinnersModal').style.display = 'none';
        
        // Refresh tournament and team lists
        loadTournaments();
        loadTeams();
        loadPlayers(); // Also refresh the players list to show updated points
        
        // Reset button state
        document.getElementById('saveWinnersBtn').textContent = 'Save Results';
        document.getElementById('saveWinnersBtn').disabled = false;
        
    } catch (err) {
        console.error('Error in handleSaveWinners:', err);
        showToast('Failed to save tournament results', 'error');
        
        // Reset button in case of error
        document.getElementById('saveWinnersBtn').textContent = 'Save Results';
        document.getElementById('saveWinnersBtn').disabled = false;
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

// PLAYER FUNCTIONS
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
                <td>${player.actual_points || 0}</td>
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
            actual_points: 0, // Initialize with zero actual points
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
        document.getElementById('editActualPoints').value = player.actual_points || 0;
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
            actual_points: parseInt(document.getElementById('editActualPoints').value || 0),
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

// Updated viewPlayerPointsHistory function to use 'placement' instead of 'team_placement'
async function viewPlayerPointsHistory(playerId) {
    try {
        // Create a modal for displaying points history
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
        document.getElementById('playerPointsHistoryContainer').innerHTML = 
            '<p>An error occurred while loading player points history.</p>';
    }
}

// Modified player leaderboard function to remove rank information
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
            document.getElementById('leaderboardContainer').innerHTML = '<p>Error loading leaderboard data.</p>';
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
                        <th>Win Rate</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    ${players.map((player, index) => `
                        <tr class="${index < 3 ? 'top-rank rank-' + (index + 1) : ''}">
                            <td><strong>${index + 1}</strong></td>
                            <td>${player.name}</td>
                            <td>${player.actual_points || 0}</td>
                            <td>${player.win_rate.toFixed(1)}%</td>
                            <td>
                                <button class="btn btn-small points-history-btn" data-id="${player.id}">View History</button>
                            </td>
                        </tr>
                    `).join('')}
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
        
        document.getElementById('leaderboardContainer').innerHTML = leaderboardHtml;
        
        // Add event listeners to history buttons
        document.querySelectorAll('#leaderboardContainer .points-history-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // First close the leaderboard modal
                document.getElementById('leaderboardModal').style.display = 'none';
                // Then open the points history modal
                viewPlayerPointsHistory(btn.dataset.id);
            });
        });
        
    } catch (err) {
        console.error('Error showing player leaderboard:', err);
        document.getElementById('leaderboardContainer').innerHTML = '<p>An error occurred while loading the leaderboard.</p>';
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
// Updated loadTeams function to show team points instead of winnings
async function loadTeams() {
    try {
        console.log("Loading teams...");
        
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
            
            // Get total points for this team from player_tournament_points
            let teamPoints = team.team_points || 0;
            
            // Create the table row
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${team.id}</td>
                <td>${username}</td>
                <td>${tournamentName}</td>
                <td>${formatDate(team.created_at)}</td>
                <td class="team-points">${teamPoints}</td>
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


// Updated openPlayerResultsModal function to use 'placement' instead of 'team_placement'
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
        
        // Create a modal for displaying player results if it doesn't exist
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
                        <div class="loading">Loading players...</div>
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
        tournamentInfoContainer.innerHTML = `
            <div class="admin-card">
                <h3>${tournament.name}</h3>
                <p>Start: ${formatDate(tournament.start_date)} | End: ${formatDate(tournament.end_date)}</p>
                <p>Prize Pool: $${tournament.prize_pool.toLocaleString()}</p>
            </div>
            <div class="winners-explanation">
                <p>Set the placement for each player. Points will be assigned based on placement:</p>
                <ul>
                    <li>Any player who places in the top 4 will receive their full potential points.</li>
                </ul>
                <p><strong>New System:</strong> Points are awarded directly to individual players based on their performance.</p>
            </div>
        `;
        
        // Get all players who participated in this tournament (through any team)
        // First, get all teams in this tournament
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select('id')
            .eq('tournament_id', tournamentId);
            
        if (teamsError) {
            console.error('Error fetching teams:', teamsError);
            showToast('Failed to load teams', 'error');
            return;
        }
        
        if (!teams || teams.length === 0) {
            document.getElementById('playerResultsContainer').innerHTML = '<p>No teams found for this tournament.</p>';
            return;
        }
        
        // Get team IDs
        const teamIds = teams.map(team => team.id);
        
        // Get all players in these teams
        const { data: teamPlayers, error: teamPlayersError } = await supabase
            .from('team_players')
            .select('player_id, team_id')
            .in('team_id', teamIds);
            
        if (teamPlayersError) {
            console.error('Error fetching team players:', teamPlayersError);
            showToast('Failed to load team players', 'error');
            return;
        }
        
        if (!teamPlayers || teamPlayers.length === 0) {
            document.getElementById('playerResultsContainer').innerHTML = '<p>No players found for this tournament.</p>';
            return;
        }
        
        // Get unique player IDs
        const playerIds = [...new Set(teamPlayers.map(tp => tp.player_id))];
        
        // Get player details including potential_points directly from the players table
        const { data: players, error: playersError } = await supabase
            .from('players')
            .select('*')
            .in('id', playerIds);
            
        if (playersError) {
            console.error('Error fetching players:', playersError);
            showToast('Failed to load players', 'error');
            return;
        }
        
        // Check for existing results for this tournament
        const { data: existingResults, error: resultsError } = await supabase
            .from('player_tournament_points')
            .select('player_id, placement, points_earned')  // Updated from team_placement to placement
            .eq('tournament_id', tournamentId);
            
        // Create a map for existing results
        const resultsMap = {};
        if (existingResults && existingResults.length > 0) {
            existingResults.forEach(result => {
                resultsMap[result.player_id] = {
                    placement: result.placement,  // Updated from team_placement to placement
                    points_earned: result.points_earned
                };
            });
        }
        
        // Create a map of player details
        const playerMap = {};
        players.forEach(player => {
            playerMap[player.id] = player;
        });
        
        // Create a map of team ID per player (for reference)
        const playerTeamMap = {};
        teamPlayers.forEach(tp => {
            playerTeamMap[tp.player_id] = tp.team_id;
        });
        
        // Sort players by name for easier reference
        const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));
        
        // Create the player results table
        const playerResultsContainer = document.getElementById('playerResultsContainer');
        playerResultsContainer.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Potential Points</th>
                        <th>Placement</th>
                        <th>Points Earned</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedPlayers.map(player => {
                        const existingResult = resultsMap[player.id] || {};
                        // Use potential_points directly from player data
                        return `
                            <tr>
                                <td>${player.name}</td>
                                <td>${player.potential_points || 0}</td>
                                <td>
                                    <select class="player-placement" data-player-id="${player.id}" data-potential-points="${player.potential_points || 0}" data-team-id="${playerTeamMap[player.id]}">
                                        <option value="">Select Placement</option>
                                        <option value="1" ${existingResult.placement === 1 ? 'selected' : ''}>1st Place</option>
                                        <option value="2" ${existingResult.placement === 2 ? 'selected' : ''}>2nd Place</option>
                                        <option value="3" ${existingResult.placement === 3 ? 'selected' : ''}>3rd Place</option>
                                        <option value="4" ${existingResult.placement === 4 ? 'selected' : ''}>4th Place</option>
                                        <option value="0" ${existingResult.placement === 0 ? 'selected' : ''}>Did Not Place</option>
                                    </select>
                                </td>
                                <td>
                                    <input type="number" class="player-points" data-player-id="${player.id}" 
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
                const pointsInput = this.closest('tr').querySelector('.player-points');
                const calculationDiv = this.closest('tr').querySelector('.points-calculation');
                
                // Calculate points based on placement - now all top 4 get full points
                let pointsEarned = 0;
                if (placement >= 1 && placement <= (tournament.top_players_count || 4)) {
                    pointsEarned = potentialPoints; // 100% of potential points for any top placement
                    calculationDiv.textContent = `Full points awarded: ${pointsEarned}`;
                    calculationDiv.style.display = 'block';
                } else {
                    calculationDiv.style.display = 'none';
                }
                
                pointsInput.value = pointsEarned;
            });
        });
        
        // Add event listener to save button
        document.getElementById('savePlayerResultsBtn').addEventListener('click', function() {
            savePlayerResults(tournamentId);
        });
        
    } catch (err) {
        console.error('Error in openPlayerResultsModal:', err);
        showToast('Failed to load player results modal', 'error');
    }
}

// Updated save player results function to use 'placement' instead of 'team_placement'
async function savePlayerResults(tournamentId) {
    try {
        // Get all player placements and points
        const playerPlacements = document.querySelectorAll('.player-placement');
        const playerPoints = document.querySelectorAll('.player-points');
        
        // Start a loading indicator
        const saveButton = document.getElementById('savePlayerResultsBtn');
        saveButton.textContent = 'Saving...';
        saveButton.disabled = true;
        
        // First, delete any existing results for this tournament
        await supabase
            .from('player_tournament_points')
            .delete()
            .eq('tournament_id', tournamentId);
        
        // Prepare updates for player points and records
        const playerPointsRecords = [];
        const playerUpdates = [];
        
        // Process each player
        for (let i = 0; i < playerPlacements.length; i++) {
            const playerId = playerPlacements[i].dataset.playerId;
            const teamId = playerPlacements[i].dataset.teamId;
            const placement = parseInt(playerPlacements[i].value);
            const pointsEarned = parseInt(playerPoints[i].value) || 0;
            
            // Only add results for players with valid placements
            if (placement > 0) {
                // Create record for player_tournament_points
                playerPointsRecords.push({
                    player_id: playerId,
                    tournament_id: tournamentId,
                    team_id: teamId,
                    placement: placement, // Changed from team_placement to placement
                    points_earned: pointsEarned
                });
                
                // Get current player points
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
                playerUpdates.push(
                    supabase
                        .from('players')
                        .update({ 
                            actual_points: newTotalPoints 
                        })
                        .eq('id', playerId)
                );
            }
        }
        
        // Execute player updates
        if (playerUpdates.length > 0) {
            await Promise.all(playerUpdates);
        }
        
        // Insert player tournament points records
        if (playerPointsRecords.length > 0) {
            const { error: pointsRecordsError } = await supabase
                .from('player_tournament_points')
                .insert(playerPointsRecords);
                
            if (pointsRecordsError) {
                console.error('Error saving player tournament points:', pointsRecordsError);
                showToast('Error saving player results', 'error');
                saveButton.textContent = 'Save Player Results';
                saveButton.disabled = false;
                return;
            }
        }
        
        // Update tournament status to completed
        await supabase
            .from('tournaments')
            .update({ status: 'completed' })
            .eq('id', tournamentId);
        
        showToast('Player results saved successfully.');
        document.getElementById('playerResultsModal').style.display = 'none';
        
        // Refresh tournament and player lists
        loadTournaments();
        loadPlayers();
        
        // Reset button state
        saveButton.textContent = 'Save Player Results';
        saveButton.disabled = false;
        
    } catch (err) {
        console.error('Error in savePlayerResults:', err);
        showToast('Failed to save player results', 'error');
        
        // Reset button in case of error
        document.getElementById('savePlayerResultsBtn').textContent = 'Save Player Results';
        document.getElementById('savePlayerResultsBtn').disabled = false;
    }
}


// View team details with enhanced player points display
// Updated view team details to show player points in tournaments
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
        let totalTeamPoints = 0;
        
        if (teamPlayers && teamPlayers.length > 0) {
            // Get each player's details
            for (const tp of teamPlayers) {
                const { data: player } = await supabase
                    .from('players')
                    .select('*')
                    .eq('id', tp.player_id)
                    .single();
                    
                if (player) {
                    // Get player's tournament points specifically for this tournament and team
                    let playerTournamentPoints = 0;
                    let placement = 'Not Placed';
                    
                    const { data: pointsRecord } = await supabase
                        .from('player_tournament_points')
                        .select('points_earned, placement')
                        .eq('player_id', tp.player_id)
                        .eq('tournament_id', team.tournament_id)
                        .eq('team_id', teamId)
                        .single();
                        
                    if (pointsRecord) {
                        playerTournamentPoints = pointsRecord.points_earned || 0;
                        totalTeamPoints += playerTournamentPoints;
                        
                        if (pointsRecord.placement) {
                            const placements = ['Not Placed', '1st Place', '2nd Place', '3rd Place', '4th Place'];
                            placement = placements[pointsRecord.placement] || 'Not Placed';
                        }
                    }
                    
                    playerCards += `
                        <div class="admin-card" style="margin-bottom: 15px;">
                            <h4>${player.name}</h4>
                            <div style="display: flex; justify-content: space-between;">
                                <div>Potential Points: ${player.potential_points}</div>
                                <div>Tournament Points: ${playerTournamentPoints}</div>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <div>Win Rate: ${player.win_rate.toFixed(1)}%</div>
                                <div>Placement: ${placement}</div>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <div>Airmail: ${player.airmail_percentage.toFixed(1)}%</div>
                                <div>Push: ${player.push_percentage.toFixed(1)}%</div>
                            </div>
                            <div style="font-size: 0.9rem; margin-top: 8px; color: #4ade80;">
                                <strong>Total Career Points: ${player.actual_points || 0}</strong>
                            </div>
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
                <p><strong>Team Points:</strong> ${team.team_points || totalTeamPoints}</p>
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

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc)
function getOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
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

function initializePlayerPointsSystem() {
    // Add a "Player Leaderboard" button to the admin dashboard
    const dashboardSection = document.querySelector('.admin-stats');
    if (dashboardSection) {
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
    
    console.log('Player points system initialized');
}

// Add this code to your existing DOMContentLoaded event handler or to the end of your admin.js file
document.addEventListener('DOMContentLoaded', function() {
    // This function will run after your existing admin.js initialization
    // Wait a bit to ensure the dashboard is loaded
    setTimeout(function() {
        initializePlayerPointsSystem();
    }, 1000);
})

// Add all these new functions at the end of your admin.js file
async function openTournamentPlayersModal(tournamentId) {
    try {
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
        
        // Update modal with tournament info
        document.getElementById('tournamentPlayersName').textContent = 
            `${tournament.name} (${formatDate(tournament.start_date)})`;
        
        // Store tournament ID for later use
        document.getElementById('parsePlayersBtn').dataset.tournamentId = tournamentId;
        document.getElementById('importPlayersBtn').dataset.tournamentId = tournamentId;
        
        // Clear previous data
        document.getElementById('playerJsonInput').value = '';
        document.getElementById('parseResults').style.display = 'none';
        
        // Load current players for this tournament
        await loadTournamentPlayers(tournamentId);
        
        // Reset to first tab
        document.querySelector('.tab-button[data-tab="currentPlayers"]').click();
        
        // Show the modal
        document.getElementById('tournamentPlayersModal').style.display = 'block';
        
        // Setup event listeners
        document.getElementById('parsePlayersBtn').onclick = parsePlayerData;
        document.getElementById('importPlayersBtn').onclick = importPlayers;
        
    } catch (err) {
        console.error('Error opening tournament players modal:', err);
        showToast('Error loading tournament players', 'error');
    }
}

async function loadTournamentPlayers(tournamentId) {
    try {
        const tableBody = document.querySelector('#currentPlayersTable tbody');
        tableBody.innerHTML = '<tr><td colspan="6">Loading players...</td></tr>';
        
        // Get players assigned to this tournament
        const { data, error } = await supabase
            .from('tournament_players')
            .select(`
                id,
                player_id,
                name,
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
        document.getElementById('currentPlayersCount').textContent = 
            `${data.length} players assigned to this tournament`;
        
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">No players assigned to this tournament yet</td></tr>';
            return;
        }
        
        // Display players
        tableBody.innerHTML = '';
        data.forEach(item => {
            const player = item.players;
            if (!player) return;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.acl_player_id || 'N/A'}</td>
                <td>${item.name || 'Unknown'}</td>
                <td>${player.skill_level || 'N/A'}</td>
                <td>${player.player_ppr || 'N/A'}</td>
                <td>${player.player_cpi || 'N/A'}</td>
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
        document.querySelector('#currentPlayersTable tbody').innerHTML = 
            '<tr><td colspan="6">Error loading players</td></tr>';
    }
}

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
        tableRow.remove();
        
        // Update player count
        const currentCount = parseInt(document.getElementById('currentPlayersCount').textContent);
        document.getElementById('currentPlayersCount').textContent = 
            `${currentCount - 1} players assigned to this tournament`;
        
        showToast('Player removed from tournament');
        
    } catch (err) {
        console.error('Error removing player:', err);
        showToast('Error removing player', 'error');
    }
}

function parsePlayerData() {
    const jsonText = document.getElementById('playerJsonInput').value.trim();
    const tournamentId = this.dataset.tournamentId;
    
    if (!jsonText) {
        showToast('Please paste player data first', 'error');
        return;
    }
    
    try {
        // Try to parse the JSON
        let playersData;
        
        try {
            // First attempt: Try to parse the entire text as JSON
            const jsonData = JSON.parse(jsonText);
            
            // Check if it has a data property that's an array
            if (jsonData.data && Array.isArray(jsonData.data)) {
                playersData = jsonData.data;
            } else if (Array.isArray(jsonData)) {
                playersData = jsonData;
            } else {
                throw new Error('JSON doesn\'t contain player data array');
            }
        } catch (e) {
            console.error('Initial parsing failed:', e);
            
            // Second attempt: Try to extract JSON from the text
            // Remove any leading/trailing non-JSON content
            let cleanedText = jsonText;
            
            // Find the first '{' and last '}'
            const startBrace = cleanedText.indexOf('{');
            const endBrace = cleanedText.lastIndexOf('}');
            
            if (startBrace >= 0 && endBrace > startBrace) {
                cleanedText = cleanedText.substring(startBrace, endBrace + 1);
                
                try {
                    const jsonData = JSON.parse(cleanedText);
                    if (jsonData.data && Array.isArray(jsonData.data)) {
                        playersData = jsonData.data;
                    } else {
                        throw new Error('JSON doesn\'t contain player data array');
                    }
                } catch (nestedError) {
                    console.error('Second parsing attempt failed:', nestedError);
                    throw new Error('Could not parse player data. Please ensure it\'s valid JSON.');
                }
            } else {
                throw new Error('Invalid JSON format');
            }
        }
        
        // Verify we have player data
        if (!playersData || !Array.isArray(playersData) || playersData.length === 0) {
            throw new Error('No player data found in the provided JSON');
        }
        
        console.log('Successfully parsed player data', playersData);
        
        // Process players
        // Process players
        const parsedPlayers = playersData.map(player => ({
            acl_player_id: player.playerID,
            name: `${player.fldPlayerFirstName} ${player.fldPlayerLastname}`,
            skill_level: player.playerSkillLevel || 'A',
            player_ppr: parseFloat(player.playerPPR) || 0,
            player_cpi: parseFloat(player.playerCPI) || 0,
            rank: player.fldTeamID || 999, // Use fldTeamID as rank, default to 999 if missing
            status: 'new' // Default status, will be updated later
        }));
        
        // Check if any players were extracted
        if (parsedPlayers.length === 0) {
            throw new Error('No valid player data found');
        }
        
        // Now check if these players already exist in our database
        checkExistingPlayers(parsedPlayers, tournamentId);
        
    } catch (err) {
        console.error('Error parsing player data:', err);
        showToast('Error parsing JSON: ' + err.message, 'error');
    }
}

async function checkExistingPlayers(players, tournamentId) {
    try {
        // Get all ACL player IDs to check
        const aclPlayerIds = players.map(p => p.acl_player_id).filter(id => id);
        
        // Query existing players
        const { data: existingPlayers, error } = await supabase
            .from('players')
            .select('id, name, acl_player_id')
            .in('acl_player_id', aclPlayerIds);
            
        if (error) {
            console.error('Error checking existing players:', error);
            showToast('Error checking existing players', 'error');
            return;
        }
        
        // Create a map of existing players by ACL ID
        const existingPlayerMap = {};
        existingPlayers.forEach(player => {
            existingPlayerMap[player.acl_player_id] = player;
        });
        
        // Check tournament players to identify duplicates
        const { data: tournamentPlayerData, error: tpError } = await supabase
            .from('tournament_players')
            .select(`
                players (id, acl_player_id)
            `)
            .eq('tournament_id', tournamentId);
            
        if (tpError) {
            console.error('Error checking tournament players:', tpError);
        }
        
        // Create a set of player IDs already in the tournament
        const tournamentPlayerIds = new Set();
        if (tournamentPlayerData) {
            tournamentPlayerData.forEach(tp => {
                if (tp.players && tp.players.acl_player_id) {
                    tournamentPlayerIds.add(tp.players.acl_player_id);
                }
            });
        }
        
        // Update player status
        players.forEach(player => {
            if (tournamentPlayerIds.has(player.acl_player_id)) {
                player.status = 'duplicate';
                player.statusText = 'Already in tournament';
            } else if (existingPlayerMap[player.acl_player_id]) {
                player.status = 'existing';
                player.statusText = 'Existing player';
                player.id = existingPlayerMap[player.acl_player_id].id;
            } else {
                player.status = 'new';
                player.statusText = 'New player';
            }
        });
        
        // Display the parsed players
        displayParsedPlayers(players, tournamentId);
        
    } catch (err) {
        console.error('Error checking existing players:', err);
        showToast('Error processing player data', 'error');
    }
}

function displayParsedPlayers(players, tournamentId) {
    const tableBody = document.querySelector('#parsedPlayersTable tbody');
    tableBody.innerHTML = '';
    
    // Count statistics
    const stats = {
        total: players.length,
        new: players.filter(p => p.status === 'new').length,
        existing: players.filter(p => p.status === 'existing').length,
        duplicate: players.filter(p => p.status === 'duplicate').length
    };
    
    // Display summary
    document.getElementById('parseResultsSummary').innerHTML = `
        Found ${stats.total} players: 
        ${stats.new} new, 
        ${stats.existing} existing, 
        ${stats.duplicate} already in tournament
    `;
    
    // Display player rows
    players.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.acl_player_id || 'N/A'}</td>
            <td>${player.name || 'Unknown'}</td>
            <td>${player.skill_level || 'N/A'}</td>
            <td>${player.player_ppr || 'N/A'}</td>
            <td>${player.player_cpi || 'N/A'}</td>
            <td class="status-${player.status}">${player.statusText}</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Store the players data for import
    document.getElementById('importPlayersBtn').dataset.players = JSON.stringify(players);
    
    // Show the results section
    document.getElementById('parseResults').style.display = 'block';
}

async function importPlayers() {
    const tournamentId = this.dataset.tournamentId;
    const playersJson = this.dataset.players;
    
    if (!playersJson) {
        showToast('No player data to import', 'error');
        return;
    }
    
    try {
        const players = JSON.parse(playersJson);
        const playersToImport = players.filter(p => p.status !== 'duplicate');
        
        if (playersToImport.length === 0) {
            showToast('No new players to import');
            return;
        }
        
        // Disable the import button
        this.disabled = true;
        this.textContent = 'Importing...';
        
        // Process each player
        for (const player of playersToImport) {
            let playerId;
            
            // If existing player, use their ID
            if (player.status === 'existing' && player.id) {
                playerId = player.id;
            } else {
                // Create new player
// Ensure skill_level is truncated if needed
        const skill_level = player.skill_level ? 
        (player.skill_level.length > 10 ? player.skill_level.substring(0, 10) : player.skill_level) 
        : 'A';

        // Create new player
        const { data: newPlayer, error: createError } = await supabase
        .from('players')
        .insert({
            name: player.name,
            acl_player_id: player.acl_player_id,
            skill_level: skill_level,
            player_ppr: player.player_ppr,
            player_cpi: player.player_cpi,
            rank: player.rank, // Add rank from our processed data
            created_at: new Date().toISOString()
        })
        .select();
                                
                if (createError) {
                    console.error('Error creating player:', createError);
                    continue;
                }
                
                playerId = newPlayer[0].id;
            }

            const playerRank = player.rank || 999; // Default to 999 if no rank
            const potentialPoints = calculatePotentialPoints(playerRank);
            
            // Associate with tournament
            const { error: linkError } = await supabase
                .from('tournament_players')
                .insert({
                    tournament_id: tournamentId,
                    player_id: playerId,
                    name: player.name,
                    potential_points: potentialPoints // Add potential points

                });
                
            if (linkError) {
                console.error('Error linking player to tournament:', linkError);
            }
        }
        
        // Refresh the current players list
        await loadTournamentPlayers(tournamentId);
        
        // Reset the import section
        document.getElementById('parseResults').style.display = 'none';
        document.getElementById('playerJsonInput').value = '';
        
        // Switch to the current players tab
        document.querySelector('.tab-button[data-tab="currentPlayers"]').click();
        
        // Enable the import button
        this.disabled = false;
        this.textContent = 'Import Players';
        
        showToast(`Successfully imported ${playersToImport.length} players`);
        
    } catch (err) {
        console.error('Error importing players:', err);
        showToast('Error importing players', 'error');
        this.disabled = false;
        this.textContent = 'Import Players';
    }
}
;