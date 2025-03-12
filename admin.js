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

// Handle adding a new player
async function handleAddPlayer(e) {
    e.preventDefault();
    
    try {
        // Check if form elements exist
        const nameInput = document.getElementById('playerName');
        const rankInput = document.getElementById('playerRank');
        const skillLevelInput = document.getElementById('skillLevel');
        const playerPPRInput = document.getElementById('playerPPR');
        const playerCPIInput = document.getElementById('playerCPI');
        const potentialPointsInput = document.getElementById('potentialPoints');
        const profilePictureInput = document.getElementById('profilePicture');
        const form = document.getElementById('addPlayerForm');
        const modal = document.getElementById('addPlayerModal');
        
        if (!nameInput || !rankInput || !skillLevelInput || !playerPPRInput || 
            !playerCPIInput || !potentialPointsInput || !form || !modal) {
            showToast('Error: Form elements missing', 'error');
            return;
        }
        
        const newPlayer = {
            name: nameInput.value,
            rank: parseInt(rankInput.value),
            skill_level: skillLevelInput.value,
            player_ppr: parseFloat(playerPPRInput.value) || null,
            player_cpi: parseFloat(playerCPIInput.value) || null,
            potential_points: parseInt(potentialPointsInput.value),
            profile_picture: profilePictureInput?.value || '',
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
        form.reset();
        modal.style.display = 'none';
        await loadPlayers();
        
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
        
        // Check if form elements exist
        const idInput = document.getElementById('editPlayerId');
        const nameInput = document.getElementById('editPlayerName');
        const rankInput = document.getElementById('editPlayerRank');
        const skillLevelInput = document.getElementById('editSkillLevel');
        const playerPPRInput = document.getElementById('editPlayerPPR');
        const playerCPIInput = document.getElementById('editPlayerCPI');
        const potentialPointsInput = document.getElementById('editPotentialPoints');
        const actualPointsInput = document.getElementById('editActualPoints');
        const profilePictureInput = document.getElementById('editProfilePicture');
        const modal = document.getElementById('editPlayerModal');
        
        if (!idInput || !nameInput || !rankInput || !skillLevelInput || !playerPPRInput || 
            !playerCPIInput || !potentialPointsInput || !actualPointsInput || !modal) {
            showToast('Error: Form elements missing', 'error');
            return;
        }
        
        // Populate form fields
        idInput.value = player.id;
        nameInput.value = player.name;
        rankInput.value = player.rank;
        skillLevelInput.value = player.skill_level || 'P'; // Default to 'P' if missing
        playerPPRInput.value = player.player_ppr !== null ? player.player_ppr : '';
        playerCPIInput.value = player.player_cpi !== null ? player.player_cpi : '';
        potentialPointsInput.value = player.potential_points;
        actualPointsInput.value = player.actual_points || 0;
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

async function handleUpdatePlayer(e) {
    e.preventDefault();
    
    try {
        // Check if form elements exist
        const idInput = document.getElementById('editPlayerId');
        const nameInput = document.getElementById('editPlayerName');
        const rankInput = document.getElementById('editPlayerRank');
        const skillLevelInput = document.getElementById('editSkillLevel');
        const playerPPRInput = document.getElementById('editPlayerPPR');
        const playerCPIInput = document.getElementById('editPlayerCPI');
        const potentialPointsInput = document.getElementById('editPotentialPoints');
        const actualPointsInput = document.getElementById('editActualPoints');
        const profilePictureInput = document.getElementById('editProfilePicture');
        const modal = document.getElementById('editPlayerModal');
        
        if (!idInput || !nameInput || !rankInput || !skillLevelInput || !playerPPRInput || 
            !playerCPIInput || !potentialPointsInput || !actualPointsInput || !modal) {
            showToast('Error: Form elements missing', 'error');
            return;
        }
        
        const playerId = idInput.value;
        const updatedPlayer = {
            name: nameInput.value,
            rank: parseInt(rankInput.value),
            skill_level: skillLevelInput.value,
            player_ppr: playerPPRInput.value ? parseFloat(playerPPRInput.value) : null,
            player_cpi: playerCPIInput.value ? parseFloat(playerCPIInput.value) : null,
            potential_points: parseInt(potentialPointsInput.value),
            actual_points: parseInt(actualPointsInput.value || 0),
            profile_picture: profilePictureInput?.value || ''
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
        modal.style.display = 'none';
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

async function loadTeams() {
    try {
        console.log("Loading teams...");
        
        // First get all tournaments for the dropdown selector
        const { data: tournaments, error: tournamentError } = await supabase
            .from('tournaments')
            .select('id, name')
            .order('start_date', { ascending: false });
            
        if (tournamentError) {
            console.error('Error loading tournaments for teams view:', tournamentError);
            showToast('Failed to load tournaments', 'error');
            return;
        }
        
        // Populate tournament dropdown in team section
        const tournamentSelect = document.getElementById('teamTournamentFilter');
        if (!tournamentSelect) {
            console.error('Tournament select dropdown not found');
            return;
        }
        
        tournamentSelect.innerHTML = '<option value="all">All Tournaments</option>';
        
        tournaments.forEach(tournament => {
            const option = document.createElement('option');
            option.value = tournament.id;
            option.textContent = tournament.name;
            tournamentSelect.appendChild(option);
        });
        
        // Check if a specific tournament is selected
        const selectedTournament = tournamentSelect.value;
        
        // Update the teams section header based on selection
        updateTeamsSectionHeader(selectedTournament, tournaments);
        
        // Load teams based on selection
        if (selectedTournament === 'all') {
            await loadAllTeams();
        } else {
            await loadTeamsByTournament(selectedTournament);
        }
        
        // Add event listener to the tournament filter dropdown
        tournamentSelect.removeEventListener('change', handleTournamentSelect);
        tournamentSelect.addEventListener('change', handleTournamentSelect);
        
    } catch (err) {
        console.error('Error in loadTeams:', err);
        showToast('Failed to load teams', 'error');
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
// Open player results modal
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
        if (!tournamentInfoContainer) {
            showToast('Error: Tournament info container not found', 'error');
            return;
        }
        
        tournamentInfoContainer.innerHTML = `
            <div class="admin-card">
                <h3>${tournament.name}</h3>
                <p>Start: ${formatDate(tournament.start_date)} | End: ${formatDate(tournament.end_date)}</p>
                <p>Prize Pool: $${tournament.prize_pool?.toLocaleString() || '0'}</p>
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
        
        const playerResultsContainer = document.getElementById('playerResultsContainer');
        if (!playerResultsContainer) {
            showToast('Error: Player results container not found', 'error');
            return;
        }
        
        if (!teams || teams.length === 0) {
            playerResultsContainer.innerHTML = '<p>No teams found for this tournament.</p>';
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
            playerResultsContainer.innerHTML = '<p>No players found for this tournament.</p>';
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
                
                if (!pointsInput || !calculationDiv) return;
                
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

// Save player results
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
        if (!saveButton) {
            showToast('Error: Save button not found', 'error');
            return;
        }
        
        saveButton.textContent = 'Saving...';
        saveButton.disabled = true;
        
        try {
            // First, delete any existing results for this tournament
            await supabase
                .from('player_tournament_points')
                .delete()
                .eq('tournament_id', tournamentId);
        } catch (deleteError) {
            console.error('Error deleting existing results:', deleteError);
            showToast('Error deleting existing results', 'error');
            saveButton.textContent = 'Save Player Results';
            saveButton.disabled = false;
            return;
        }
        
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
                    placement: placement,
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
                playerUpdates.push({
                    playerId,
                    newTotalPoints
                });
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
                showToast('Error saving player results', 'error');
                saveButton.textContent = 'Save Player Results';
                saveButton.disabled = false;
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
        
        showToast('Player results saved successfully.');
        const modal = document.getElementById('playerResultsModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Refresh tournament and player lists
        await loadTournaments();
        await loadPlayers();
        
        // Reset button state
        saveButton.textContent = 'Save Player Results';
        saveButton.disabled = false;
        
    } catch (err) {
        console.error('Error in savePlayerResults:', err);
        showToast('Failed to save player results', 'error');
        
        // Reset button in case of error
        const saveButton = document.getElementById('savePlayerResultsBtn');
        if (saveButton) {
            saveButton.textContent = 'Save Player Results';
            saveButton.disabled = false;
        }
    }
}

// Update the viewTeamDetails function to use the new stats
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
        
        // Create player cards
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
            
            if (players && players.length > 0) {
                for (const player of players) {
                    // Get player's tournament points specifically for this tournament and team
                    let playerTournamentPoints = 0;
                    let placement = 'Not Placed';
                    
                    const { data: pointsRecord } = await supabase
                        .from('player_tournament_points')
                        .select('points_earned, placement')
                        .eq('player_id', player.id)
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
                    
                    totalPotentialPoints += player.potential_points || 0;
                    
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
                    
                    // Display player's PPR and CPI instead of Win Rate, Airmail %, and Push %
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
                                        <div class="stat-value">${player.potential_points || 0}</div>
                                    </div>
                                </div>
                                
                                <div class="stat-row">
                                    <div class="stat-item">
                                        <div class="stat-label">PPR</div>
                                        <div class="stat-value">${player.player_ppr !== null ? player.player_ppr.toFixed(1) : '—'}</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">Tournament Points</div>
                                        <div class="stat-value">${playerTournamentPoints}</div>
                                    </div>
                                </div>
                                
                                <div class="stat-row">
                                    <div class="stat-item">
                                        <div class="stat-label">CPI</div>
                                        <div class="stat-value">${player.player_cpi !== null ? player.player_cpi.toFixed(1) : '—'}</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">Placement</div>
                                        <div class="stat-value">${placement}</div>
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
                        <div class="points-value">${team.team_points || totalTeamPoints || 0 }</div>
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
    } catch (err) {
        console.error('Error opening tournament players modal:', err);
        showToast('Error loading tournament players', 'error');
    }
}

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
                    default: skillLevelDisplay = player.skill_level;
                }
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.acl_player_id || 'N/A'}</td>
                <td>${item.name || 'Unknown'}</td>
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
    const potentialPoints = this.dataset.potentialPoints;
    
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
        
        // Add player to tournament
        const { error: addError } = await supabase
            .from('tournament_players')
            .insert({
                tournament_id: tournamentId,
                player_id: playerId,
                name: playerName,
                potential_points: potentialPoints,
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

// Parse player import data in the players tab
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
        checkExistingPlayersGlobal(parsedPlayers);
        
    } catch (err) {
        console.error('Error parsing player data:', err);
        showToast('Error parsing JSON: ' + err.message, 'error');
    }
}

// Check if players already exist in the database (for global import)
async function checkExistingPlayersGlobal(players) {
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
        if (existingPlayers) {
            existingPlayers.forEach(player => {
                existingPlayerMap[player.acl_player_id] = player;
            });
        }
        
        // Update player status
        players.forEach(player => {
            if (existingPlayerMap[player.acl_player_id]) {
                player.status = 'existing';
                player.statusText = 'Existing player';
                player.id = existingPlayerMap[player.acl_player_id].id;
            } else {
                player.status = 'new';
                player.statusText = 'New player';
            }
        });
        
        // Display the parsed players
        displayParsedPlayersGlobal(players);
        
    } catch (err) {
        console.error('Error checking existing players:', err);
        showToast('Error processing player data', 'error');
    }
}

// Display parsed players in the global import tab
function displayParsedPlayersGlobal(players) {
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
    
    // Display summary
    summary.innerHTML = `
        Found ${stats.total} players: 
        ${stats.new} new, 
        ${stats.existing} existing
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
    importBtn.dataset.players = JSON.stringify(players);
    
    // Show the results section
    results.style.display = 'block';
}

// Import players globally (not tied to a tournament)
async function importPlayersGlobal() {
    const importBtn = document.getElementById('importPlayersGlobalBtn');
    if (!importBtn) {
        showToast('Error: Import button not found', 'error');
        return;
    }
    
    const playersJson = importBtn.dataset.players;
    
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
        for (const player of players) {
            // If existing player, skip creation
            if (player.status === 'existing' && player.id) {
                continue; // Skip existing players
            } else {
                // Create new player
                // Ensure skill_level is truncated if needed
                const skill_level = player.skill_level ? 
                    (player.skill_level.length > 10 ? player.skill_level.substring(0, 10) : player.skill_level) 
                    : 'A';

                // Calculate potential points based on rank
                const potentialPoints = calculatePotentialPoints(player.rank || 999);
                
                // Create new player
                try {
                    await supabase
                        .from('players')
                        .insert({
                            name: player.name,
                            acl_player_id: player.acl_player_id,
                            skill_level: skill_level,
                            player_ppr: player.player_ppr,
                            player_cpi: player.player_cpi,
                            rank: player.rank || 999,
                            win_rate: 50, // Default value
                            airmail_percentage: 20, // Default value 
                            push_percentage: 15, // Default value
                            potential_points: potentialPoints,
                            actual_points: 0,
                            created_at: new Date().toISOString()
                        });
                } catch (createError) {
                    console.error('Error creating player:', createError);
                    continue;
                }
            }
        }
        
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
        
        showToast(`Successfully imported players to database`);
        
    } catch (err) {
        console.error('Error importing players:', err);
        showToast('Error importing players', 'error');
        
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