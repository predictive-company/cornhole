// Admin Portal Enhancements
// This file adds new functionality to the existing admin.js

// ---------- DASHBOARD STATISTICS ----------
async function loadDashboardStatistics() {
    try {
      // Get count of tournaments
      const { data: tournaments, error: tournamentError } = await supabase
        .from('tournaments')
        .select('id, status');
        
      if (tournamentError) throw tournamentError;
      
      // Get count of players
      const { data: players, error: playerError } = await supabase
        .from('players')
        .select('id');
        
      if (playerError) throw playerError;
      
      // Get count of teams
      const { data: teams, error: teamError } = await supabase
        .from('teams')
        .select('id');
        
      if (teamError) throw teamError;
      
      // Get count of users
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id');
        
      if (userError) throw userError;
      
      // Calculate active tournaments
      const activeTournaments = tournaments.filter(t => t.status === 'active').length;
      const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming').length;
      
      // Add statistics to page
      const statsHTML = `
        <div class="admin-stats">
          <div class="stat-card">
            <div class="stat-value">${tournaments.length}</div>
            <div class="stat-label">Total Tournaments</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${activeTournaments}</div>
            <div class="stat-label">Active Tournaments</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${upcomingTournaments}</div>
            <div class="stat-label">Upcoming Tournaments</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${players.length}</div>
            <div class="stat-label">Players</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${teams.length}</div>
            <div class="stat-label">Teams</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${users.length}</div>
            <div class="stat-label">Users</div>
          </div>
        </div>
      `;
      
      // Create dashboard container
      const dashboardContainer = document.createElement('div');
      dashboardContainer.className = 'admin-card';
      dashboardContainer.innerHTML = `
        <h2>Dashboard</h2>
        ${statsHTML}
      `;
      
      // Insert at the beginning of the admin-container (after the h1)
      const adminContainer = document.querySelector('.admin-container');
      adminContainer.insertBefore(dashboardContainer, adminContainer.querySelector('.admin-tabs'));
      
      // Add CSS for stats
      const style = document.createElement('style');
      style.textContent = `
        .admin-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        .stat-card {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 15px;
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
          color: #3498db;
        }
        .stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
        }
      `;
      document.head.appendChild(style);
      
    } catch (err) {
      console.error('Error loading dashboard statistics:', err);
      showToast('Failed to load statistics', 'error');
    }
  }
  
  // ---------- TOURNAMENT VISUALIZATION ----------
  async function addTournamentVisualization() {
    try {
      // Get tournaments and teams data
      const { data: tournaments, error: tournamentError } = await supabase
        .from('tournaments')
        .select('id, name');
        
      if (tournamentError) throw tournamentError;
      
      // Get teams data for each tournament
      const tournamentData = [];
      
      for (const tournament of tournaments) {
        const { data: teams, error: teamError } = await supabase
          .from('teams')
          .select('id')
          .eq('tournament_id', tournament.id);
          
        if (teamError) throw teamError;
        
        tournamentData.push({
          name: tournament.name,
          teamCount: teams.length
        });
      }
      
      // Sort by number of teams
      tournamentData.sort((a, b) => b.teamCount - a.teamCount);
      
      // Only take top 5 tournaments
      const topTournaments = tournamentData.slice(0, 5);
      
      // Create visualization container
      const visualizationContainer = document.createElement('div');
      visualizationContainer.className = 'admin-card visualization-card';
      visualizationContainer.innerHTML = `
        <h3>Tournament Participation</h3>
        <div class="chart-container">
          ${topTournaments.map(tournament => `
            <div class="chart-bar-container">
              <div class="chart-label">${truncateText(tournament.name, 15)}</div>
              <div class="chart-bar" style="width: ${Math.min(100, tournament.teamCount * 5)}%;">
                <span class="chart-value">${tournament.teamCount}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Get tournaments section
      const tournamentsSection = document.getElementById('tournaments-section');
      tournamentsSection.appendChild(visualizationContainer);
      
      // Add CSS for visualization
      const style = document.createElement('style');
      style.textContent = `
        .visualization-card {
          margin-top: 20px;
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
          width: 120px;
          text-align: right;
          padding-right: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chart-bar {
          height: 30px;
          background-color: rgba(52, 152, 219, 0.5);
          border-radius: 4px;
          display: flex;
          align-items: center;
          padding-left: 10px;
          position: relative;
          min-width: 40px;
          transition: width 0.5s ease-in-out;
        }
        .chart-value {
          color: white;
          position: absolute;
          right: 10px;
          font-weight: bold;
        }
      `;
      document.head.appendChild(style);
      
    } catch (err) {
      console.error('Error creating tournament visualization:', err);
    }
  }
  
  // ---------- BATCH OPERATIONS FOR PLAYERS ----------
  function addBatchPlayerOperations() {
    // Create batch operations panel
    const batchOperationsContainer = document.createElement('div');
    batchOperationsContainer.className = 'admin-card batch-operations';
    batchOperationsContainer.innerHTML = `
      <h3>Batch Operations</h3>
      <div class="batch-controls">
        <div class="form-group">
          <select id="batchOperation">
            <option value="">Select Operation</option>
            <option value="update-rank">Update Rankings</option>
            <option value="adjust-percentage">Adjust Percentages</option>
            <option value="delete-selected">Delete Selected</option>
          </select>
        </div>
        <div id="batchOperationForm"></div>
      </div>
      <div class="batch-selection">
        <div class="batch-header">
          <input type="checkbox" id="selectAllPlayers">
          <label for="selectAllPlayers">Select All Players</label>
        </div>
        <div id="batchPlayersList"></div>
      </div>
      <button id="applyBatchOperation" class="btn" disabled>Apply to Selected</button>
    `;
    
    // Get players section
    const playersSection = document.getElementById('players-section');
    
    // Insert before the existing content
    playersSection.insertBefore(batchOperationsContainer, playersSection.firstChild);
    
    // Add CSS for batch operations
    const style = document.createElement('style');
    style.textContent = `
      .batch-operations {
        margin-bottom: 20px;
      }
      .batch-controls {
        display: flex;
        gap: 20px;
        margin-bottom: 15px;
      }
      .batch-controls .form-group {
        flex: 1;
      }
      #batchOperationForm {
        flex: 2;
        display: flex;
        gap: 10px;
      }
      .batch-selection {
        margin-bottom: 15px;
      }
      .batch-header {
        margin-bottom: 10px;
      }
      #batchPlayersList {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        padding: 10px;
      }
      .batch-player-item {
        display: flex;
        align-items: center;
        padding: 5px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .batch-player-item:last-child {
        border-bottom: none;
      }
      .batch-player-item label {
        margin-left: 10px;
        flex: 1;
      }
    `;
    document.head.appendChild(style);
    
    // Set up event listeners
    document.getElementById('batchOperation').addEventListener('change', setupBatchOperation);
    document.getElementById('selectAllPlayers').addEventListener('change', toggleSelectAllPlayers);
    document.getElementById('applyBatchOperation').addEventListener('click', applyBatchOperation);
    
    // Load players
    loadBatchPlayersList();
  }
  
  // Setup batch operation form based on selected operation
  function setupBatchOperation() {
    const operation = document.getElementById('batchOperation').value;
    const formContainer = document.getElementById('batchOperationForm');
    formContainer.innerHTML = '';
    
    if (operation === 'update-rank') {
      formContainer.innerHTML = `
        <div class="form-group">
          <label for="rankAdjustment">Rank Adjustment</label>
          <input type="number" id="rankAdjustment" placeholder="e.g. +1 or -2">
        </div>
      `;
    } else if (operation === 'adjust-percentage') {
      formContainer.innerHTML = `
        <div class="form-group">
          <label for="percentageField">Field to Adjust</label>
          <select id="percentageField">
            <option value="win_rate">Win Rate</option>
            <option value="airmail_percentage">Airmail Percentage</option>
            <option value="push_percentage">Push Percentage</option>
          </select>
        </div>
        <div class="form-group">
          <label for="percentageAdjustment">Percentage Adjustment</label>
          <input type="number" id="percentageAdjustment" placeholder="e.g. +5 or -3" step="0.1">
        </div>
      `;
    }
    
    // Enable/disable apply button
    const applyButton = document.getElementById('applyBatchOperation');
    applyButton.disabled = operation === '';
  }
  
  // Load players for batch operations
  async function loadBatchPlayersList() {
    try {
      const { data: players, error } = await supabase
        .from('players')
        .select('id, name, rank')
        .order('rank', { ascending: true });
        
      if (error) throw error;
      
      const batchPlayersList = document.getElementById('batchPlayersList');
      batchPlayersList.innerHTML = '';
      
      players.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'batch-player-item';
        playerItem.innerHTML = `
          <input type="checkbox" id="player-${player.id}" data-player-id="${player.id}" class="batch-player-checkbox">
          <label for="player-${player.id}">${player.name} (Rank: ${player.rank})</label>
        `;
        batchPlayersList.appendChild(playerItem);
      });
      
      // Add event listeners to checkboxes
      document.querySelectorAll('.batch-player-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedCount);
      });
      
    } catch (err) {
      console.error('Error loading players for batch operations:', err);
    }
  }
  
  // Toggle select all players
  function toggleSelectAllPlayers(e) {
    const isChecked = e.target.checked;
    document.querySelectorAll('.batch-player-checkbox').forEach(checkbox => {
      checkbox.checked = isChecked;
    });
    updateSelectedCount();
  }
  
  // Update selected count
  function updateSelectedCount() {
    const selectedCount = document.querySelectorAll('.batch-player-checkbox:checked').length;
    const applyButton = document.getElementById('applyBatchOperation');
    
    if (selectedCount > 0) {
      applyButton.textContent = `Apply to Selected (${selectedCount})`;
      applyButton.disabled = false;
    } else {
      applyButton.textContent = 'Apply to Selected';
      applyButton.disabled = true;
    }
  }
  
  // Apply batch operation
  async function applyBatchOperation() {
    try {
      const operation = document.getElementById('batchOperation').value;
      const selectedPlayers = Array.from(document.querySelectorAll('.batch-player-checkbox:checked'))
        .map(checkbox => checkbox.dataset.playerId);
      
      if (selectedPlayers.length === 0) {
        showToast('No players selected', 'error');
        return;
      }
      
      if (operation === 'delete-selected') {
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete ${selectedPlayers.length} player(s)? This cannot be undone.`)) {
          return;
        }
        
        // Check if players are used in teams
        const { data: teamPlayers, error: checkError } = await supabase
          .from('team_players')
          .select('player_id')
          .in('player_id', selectedPlayers);
          
        if (checkError) throw checkError;
        
        if (teamPlayers && teamPlayers.length > 0) {
          const usedPlayerIds = new Set(teamPlayers.map(tp => tp.player_id));
          const unusedPlayers = selectedPlayers.filter(id => !usedPlayerIds.has(id));
          
          if (unusedPlayers.length === 0) {
            showToast('Cannot delete: All selected players are used in teams', 'error');
            return;
          }
          
          // Only delete unused players
          await supabase
            .from('players')
            .delete()
            .in('id', unusedPlayers);
            
          showToast(`Deleted ${unusedPlayers.length} player(s). ${selectedPlayers.length - unusedPlayers.length} player(s) were not deleted because they are used in teams.`);
        } else {
          // Delete all selected players
          await supabase
            .from('players')
            .delete()
            .in('id', selectedPlayers);
            
          showToast(`Deleted ${selectedPlayers.length} player(s)`);
        }
      } else if (operation === 'update-rank') {
        const rankAdjustment = parseInt(document.getElementById('rankAdjustment').value);
        
        if (isNaN(rankAdjustment)) {
          showToast('Please enter a valid rank adjustment', 'error');
          return;
        }
        
        // Get current players
        const { data: players, error: getError } = await supabase
          .from('players')
          .select('id, rank')
          .in('id', selectedPlayers);
          
        if (getError) throw getError;
        
        // Update each player individually
        const updates = players.map(player => {
          const newRank = Math.max(1, player.rank + rankAdjustment); // Ensure rank is at least 1
          return supabase
            .from('players')
            .update({ rank: newRank })
            .eq('id', player.id);
        });
        
        await Promise.all(updates);
        showToast(`Updated rank for ${selectedPlayers.length} player(s)`);
      } else if (operation === 'adjust-percentage') {
        const field = document.getElementById('percentageField').value;
        const percentageAdjustment = parseFloat(document.getElementById('percentageAdjustment').value);
        
        if (isNaN(percentageAdjustment)) {
          showToast('Please enter a valid percentage adjustment', 'error');
          return;
        }
        
        // Get current players
        const { data: players, error: getError } = await supabase
          .from('players')
          .select(`id, ${field}`)
          .in('id', selectedPlayers);
          
        if (getError) throw getError;
        
        // Update each player individually
        const updates = players.map(player => {
          const currentValue = player[field];
          const newValue = Math.min(100, Math.max(0, currentValue + percentageAdjustment)); // Clamp between 0 and 100
          const update = {};
          update[field] = newValue;
          
          return supabase
            .from('players')
            .update(update)
            .eq('id', player.id);
        });
        
        await Promise.all(updates);
        showToast(`Updated ${field.replace('_', ' ')} for ${selectedPlayers.length} player(s)`);
      }
      
      // Refresh player lists
      loadPlayers();
      loadBatchPlayersList();
      
    } catch (err) {
      console.error('Error applying batch operation:', err);
      showToast('Failed to apply batch operation', 'error');
    }
  }
  
  // ---------- IMPROVED FILTERING ----------
  function enhanceFiltering() {
    // Add advanced filtering to tournaments
    const tournamentFilters = document.createElement('div');
    tournamentFilters.className = 'advanced-filters';
    tournamentFilters.innerHTML = `
      <select id="prizeTierFilter">
        <option value="all">All Prize Tiers</option>
        <option value="0-1000">$0 - $1,000</option>
        <option value="1001-5000">$1,001 - $5,000</option>
        <option value="5001-10000">$5,001 - $10,000</option>
        <option value="10001+">$10,001+</option>
      </select>
      <select id="teamSizeFilter">
        <option value="all">All Team Sizes</option>
        <option value="1-3">1-3 Players</option>
        <option value="4-6">4-6 Players</option>
        <option value="7+">7+ Players</option>
      </select>
      <button id="clearTournamentFilters" class="btn btn-small">Clear Filters</button>
    `;
    
    // Add advanced filtering to players
    const playerFilters = document.createElement('div');
    playerFilters.className = 'advanced-filters';
    playerFilters.innerHTML = `
      <select id="winRateFilter">
        <option value="all">All Win Rates</option>
        <option value="0-50">0-50%</option>
        <option value="51-75">51-75%</option>
        <option value="76-100">76-100%</option>
      </select>
      <button id="clearPlayerFilters" class="btn btn-small">Clear Filters</button>
    `;
    
    // Add advanced filtering to teams
    const teamFilters = document.createElement('div');
    teamFilters.className = 'advanced-filters';
    teamFilters.innerHTML = `
      <select id="teamWinningsFilter">
        <option value="all">All Winnings</option>
        <option value="0">$0 (No Winnings)</option>
        <option value="1-1000">$1 - $1,000</option>
        <option value="1001+">$1,001+</option>
      </select>
      <button id="clearTeamFilters" class="btn btn-small">Clear Filters</button>
    `;
    
    // Add CSS for advanced filters
    const style = document.createElement('style');
    style.textContent = `
      .advanced-filters {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
      }
      .advanced-filters select {
        padding: 8px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background-color: rgba(255, 255, 255, 0.05);
        color: white;
      }
    `;
    document.head.appendChild(style);
    
    // Insert filters into filter options
    const tournamentFilterOptions = document.querySelector('#tournaments-section .filter-options');
    tournamentFilterOptions.parentNode.insertBefore(tournamentFilters, tournamentFilterOptions.nextSibling);
    
    const playerFilterOptions = document.querySelector('#players-section .filter-options');
    playerFilterOptions.parentNode.insertBefore(playerFilters, playerFilterOptions.nextSibling);
    
    const teamFilterOptions = document.querySelector('#teams-section .filter-options');
    teamFilterOptions.parentNode.insertBefore(teamFilters, teamFilterOptions.nextSibling);
    
    // Set up event listeners
    document.getElementById('prizeTierFilter').addEventListener('change', enhancedFilterTournaments);
    document.getElementById('teamSizeFilter').addEventListener('change', enhancedFilterTournaments);
    document.getElementById('clearTournamentFilters').addEventListener('click', clearTournamentFilters);
    
    document.getElementById('winRateFilter').addEventListener('change', enhancedFilterPlayers);
    document.getElementById('clearPlayerFilters').addEventListener('click', clearPlayerFilters);
    
    document.getElementById('teamWinningsFilter').addEventListener('change', enhancedFilterTeams);
    document.getElementById('clearTeamFilters').addEventListener('click', clearTeamFilters);
  }
  
  // Enhanced tournament filtering
  function enhancedFilterTournaments() {
    const statusFilter = document.getElementById('tournamentStatusFilter').value;
    const searchTerm = document.getElementById('tournamentSearch').value.toLowerCase();
    const prizeTierFilter = document.getElementById('prizeTierFilter').value;
    const teamSizeFilter = document.getElementById('teamSizeFilter').value;
    
    const rows = document.querySelectorAll('#tournamentsTable tbody tr');
    
    rows.forEach(row => {
      const tournamentName = row.cells[0].textContent.toLowerCase();
      const status = row.cells[5].textContent.toLowerCase();
      const prizePool = parseInt(row.cells[3].textContent.replace(/[$,]/g, ''));
      const teamSize = parseInt(row.cells[4].textContent);
      
      const matchesStatus = statusFilter === 'all' || status.includes(statusFilter);
      const matchesSearch = tournamentName.includes(searchTerm);
      
      // Check prize tier
      let matchesPrizeTier = true;
      if (prizeTierFilter === '0-1000') {
        matchesPrizeTier = prizePool >= 0 && prizePool <= 1000;
      } else if (prizeTierFilter === '1001-5000') {
        matchesPrizeTier = prizePool >= 1001 && prizePool <= 5000;
      } else if (prizeTierFilter === '5001-10000') {
        matchesPrizeTier = prizePool >= 5001 && prizePool <= 10000;
      } else if (prizeTierFilter === '10001+') {
        matchesPrizeTier = prizePool >= 10001;
      }
      
      // Check team size
      let matchesTeamSize = true;
      if (teamSizeFilter === '1-3') {
        matchesTeamSize = teamSize >= 1 && teamSize <= 3;
      } else if (teamSizeFilter === '4-6') {
        matchesTeamSize = teamSize >= 4 && teamSize <= 6;
      } else if (teamSizeFilter === '7+') {
        matchesTeamSize = teamSize >= 7;
      }
      
      row.style.display = matchesStatus && matchesSearch && matchesPrizeTier && matchesTeamSize ? '' : 'none';
    });
  }
  
  // Clear tournament filters
  function clearTournamentFilters() {
    document.getElementById('tournamentStatusFilter').value = 'all';
    document.getElementById('tournamentSearch').value = '';
    document.getElementById('prizeTierFilter').value = 'all';
    document.getElementById('teamSizeFilter').value = 'all';
    
    // Show all rows
    document.querySelectorAll('#tournamentsTable tbody tr').forEach(row => {
      row.style.display = '';
    });
  }
  
  // Enhanced player filtering
  function enhancedFilterPlayers() {
    const rankFilter = document.getElementById('playerRankFilter').value;
    const searchTerm = document.getElementById('playerSearch').value.toLowerCase();
    const winRateFilter = document.getElementById('winRateFilter').value;
    
    const rows = document.querySelectorAll('#playersTable tbody tr');
    
    rows.forEach(row => {
      const playerName = row.cells[0].textContent.toLowerCase();
      const rank = parseInt(row.cells[1].textContent);
      const winRate = parseFloat(row.cells[2].textContent);
      
      let matchesRank = true;
      if (rankFilter === '1-10') {
        matchesRank = rank >= 1 && rank <= 10;
      } else if (rankFilter === '11-20') {
        matchesRank = rank >= 11 && rank <= 20;
      } else if (rankFilter === '21+') {
        matchesRank = rank >= 21;
      }
      
      const matchesSearch = playerName.includes(searchTerm);
      
      // Check win rate
      let matchesWinRate = true;
      if (winRateFilter === '0-50') {
        matchesWinRate = winRate >= 0 && winRate <= 50;
      } else if (winRateFilter === '51-75') {
        matchesWinRate = winRate > 50 && winRate <= 75;
      } else if (winRateFilter === '76-100') {
        matchesWinRate = winRate > 75 && winRate <= 100;
      }
      
      row.style.display = matchesRank && matchesSearch && matchesWinRate ? '' : 'none';
    });
  }
  
  // Clear player filters
  function clearPlayerFilters() {
    document.getElementById('playerRankFilter').value = 'all';
    document.getElementById('playerSearch').value = '';
    document.getElementById('winRateFilter').value = 'all';
    
    // Show all rows
    document.querySelectorAll('#playersTable tbody tr').forEach(row => {
      row.style.display = '';
    });
  }
  
  // Enhanced team filtering
  function enhancedFilterTeams() {
    const tournamentFilter = document.getElementById('teamTournamentFilter').value;
    const searchTerm = document.getElementById('teamSearch').value.toLowerCase();
    const winningsFilter = document.getElementById('teamWinningsFilter').value;
    
    const rows = document.querySelectorAll('#teamsTable tbody tr');
    
    rows.forEach(row => {
      const username = row.cells[1].textContent.toLowerCase();
      const teamId = row.cells[0].textContent.toLowerCase();
      const tournamentName = row.cells[2].textContent;
      const winnings = parseInt(row.cells[5].textContent.replace(/[$,]/g, '')) || 0;
      
      const matchesTournament = tournamentFilter === 'all' || row.cells[2].textContent.includes(tournamentFilter);
      const matchesSearch = username.includes(searchTerm) || teamId.includes(searchTerm);
      
      // Check winnings
      let matchesWinnings = true;
      if (winningsFilter === '0') {
        matchesWinnings = winnings === 0;
      } else if (winningsFilter === '1-1000') {
        matchesWinnings = winnings >= 1 && winnings <= 1000;
      } else if (winningsFilter === '1001+') {
        matchesWinnings = winnings >= 1001;
      }
      
      row.style.display = matchesTournament && matchesSearch && matchesWinnings ? '' : 'none';
    });
  }
  
  // Clear team filters
  function clearTeamFilters() {
    document.getElementById('teamTournamentFilter').value = 'all';
    document.getElementById('teamSearch').value = '';
    document.getElementById('teamWinningsFilter').value = 'all';
    
    // Show all rows
    document.querySelectorAll('#teamsTable tbody tr').forEach(row => {
      row.style.display = '';
    });
  }
  
  // ---------- EXPORT FUNCTIONALITY ----------
  function addExportFunctionality() {
    // Add export buttons
    const tournamentExportBtn = document.createElement('button');
    tournamentExportBtn.className = 'btn';
    tournamentExportBtn.textContent = 'Export CSV';
    tournamentExportBtn.id = 'exportTournamentsBtn';
    
    const playerExportBtn = document.createElement('button');
    playerExportBtn.className = 'btn';
    playerExportBtn.textContent = 'Export CSV';
    playerExportBtn.id = 'exportPlayersBtn';
    
    const teamExportBtn = document.createElement('button');
    teamExportBtn.className = 'btn';
    teamExportBtn.textContent = 'Export CSV';
    teamExportBtn.id = 'exportTeamsBtn';
    
    // Add buttons to each section
    document.querySelector('#tournaments-section .filter-options').appendChild(tournamentExportBtn);
    document.querySelector('#players-section .filter-options').appendChild(playerExportBtn);
    document.querySelector('#teams-section .filter-options').appendChild(teamExportBtn);
    
    // Set up event listeners
    tournamentExportBtn.addEventListener('click', exportTournaments);
    playerExportBtn.addEventListener('click', exportPlayers);
    teamExportBtn.addEventListener('click', exportTeams);
    
    const style = document.createElement('style');
    style.textContent = `
        .filter-options .btn {
        margin-left: auto;
        }
    `;
    document.head.appendChild(style);
}

// Export tournaments function
async function exportTournaments() {
  try {
    // Get visible tournaments (respecting filters)
    const visibleRows = Array.from(document.querySelectorAll('#tournamentsTable tbody tr'))
      .filter(row => row.style.display !== 'none');
    
    if (visibleRows.length === 0) {
      showToast('No tournaments to export', 'error');
      return;
    }
    
    // Create CSV content
    let csvContent = 'Name,Start Date,End Date,Prize Pool,Team Size,Status\n';
    
    visibleRows.forEach(row => {
      const name = row.cells[0].textContent.replace(/,/g, ' ');
      const startDate = row.cells[1].textContent;
      const endDate = row.cells[2].textContent;
      const prizePool = row.cells[3].textContent;
      const teamSize = row.cells[4].textContent;
      const status = row.cells[5].textContent;
      
      csvContent += `"${name}",${startDate},${endDate},${prizePool},${teamSize},${status}\n`;
    });
    
    // Create and trigger download
    downloadCSV(csvContent, 'tournaments.csv');
    showToast(`Exported ${visibleRows.length} tournaments`);
    
  } catch (err) {
    console.error('Error exporting tournaments:', err);
    showToast('Failed to export tournaments', 'error');
  }
}

// Export players function
async function exportPlayers() {
  try {
    // Get visible players (respecting filters)
    const visibleRows = Array.from(document.querySelectorAll('#playersTable tbody tr'))
      .filter(row => row.style.display !== 'none');
    
    if (visibleRows.length === 0) {
      showToast('No players to export', 'error');
      return;
    }
    
    // Create CSV content
    let csvContent = 'Name,Rank,Win Rate,Airmail %,Push %,Potential Points\n';
    
    visibleRows.forEach(row => {
      const name = row.cells[0].textContent.replace(/,/g, ' ');
      const rank = row.cells[1].textContent;
      const winRate = row.cells[2].textContent;
      const airmail = row.cells[3].textContent;
      const push = row.cells[4].textContent;
      const potential = row.cells[5].textContent;
      
      csvContent += `"${name}",${rank},${winRate},${airmail},${push},${potential}\n`;
    });
    
    // Create and trigger download
    downloadCSV(csvContent, 'players.csv');
    showToast(`Exported ${visibleRows.length} players`);
    
  } catch (err) {
    console.error('Error exporting players:', err);
    showToast('Failed to export players', 'error');
  }
}

// Export teams function
async function exportTeams() {
  try {
    // Get visible teams (respecting filters)
    const visibleRows = Array.from(document.querySelectorAll('#teamsTable tbody tr'))
      .filter(row => row.style.display !== 'none');
    
    if (visibleRows.length === 0) {
      showToast('No teams to export', 'error');
      return;
    }
    
    // Create CSV content
    let csvContent = 'Team ID,User,Tournament,Created,Final Rank,Winnings\n';
    
    visibleRows.forEach(row => {
      const teamId = row.cells[0].textContent;
      const user = row.cells[1].textContent.replace(/,/g, ' ');
      const tournament = row.cells[2].textContent.replace(/,/g, ' ');
      const created = row.cells[3].textContent;
      const rank = row.cells[4].textContent;
      const winnings = row.cells[5].textContent;
      
      csvContent += `${teamId},"${user}","${tournament}",${created},${rank},${winnings}\n`;
    });
    
    // Create and trigger download
    downloadCSV(csvContent, 'teams.csv');
    showToast(`Exported ${visibleRows.length} teams`);
    
  } catch (err) {
    console.error('Error exporting teams:', err);
    showToast('Failed to export teams', 'error');
  }
}

// Helper function to download CSV
function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ---------- UTILITY FUNCTIONS ----------
// Helper function to truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// ---------- INITIALIZATION ----------
// Function to initialize all enhancements
function initializeAdminEnhancements() {
  // Add all enhancements
  loadDashboardStatistics();
  addTournamentVisualization();
  addBatchPlayerOperations();
  enhanceFiltering();
  addExportFunctionality();
  
  console.log('Admin portal enhancements initialized');
}

// Add to existing initialization in admin.js
document.addEventListener('DOMContentLoaded', function() {
  // Original DOMContentLoaded event handler is already set up in admin.js
  // We'll let it finish loading first, then add our enhancements
  
  // Add our enhancements with a small delay to ensure everything is loaded
  setTimeout(initializeAdminEnhancements, 500);
});