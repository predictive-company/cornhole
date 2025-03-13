// Database Cleanup Utility
// This script will help you safely delete test data by removing records in the correct order

// Utility function to run with a confirm prompt to prevent accidental deletion
async function safeDeleteData(options = {}) {
    const {
      deleteTestPlayersOnly = true, // Set to false to delete all players
      deleteTestTournamentsOnly = true, // Set to false to delete all tournaments
      deleteAllTeams = false, // Set to true to delete all teams
      testPrefix = "Test" // Prefix used to identify test data
    } = options;
  
    if (!confirm(`Are you sure you want to delete data? This cannot be undone.`)) {
      console.log("Deletion cancelled.");
      return;
    }
  
    console.log("Starting database cleanup...");
    
    try {
      // Step 1: Delete tournament_results
      console.log("Deleting tournament_results...");
      const { error: resultsError } = await supabase
        .from('tournament_results')
        .delete()
        .not('id', 'is', null); // Delete all
        
      if (resultsError) console.error("Error deleting tournament_results:", resultsError);
  
      // Step 2: Delete player_tournament_points
      console.log("Deleting player_tournament_points...");
      const { error: pointsError } = await supabase
        .from('player_tournament_points')
        .delete()
        .not('id', 'is', null); // Delete all
        
      if (pointsError) console.error("Error deleting player_tournament_points:", pointsError);
  
      // Step 3: Find and delete team_players
      console.log("Deleting team_players...");
      
      if (deleteAllTeams) {
        // Delete all team_players
        const { error: tpError } = await supabase
          .from('team_players')
          .delete()
          .not('id', 'is', null);
          
        if (tpError) console.error("Error deleting all team_players:", tpError);
      } else {
        // Get test teams first (we need their IDs to delete related team_players)
        let { data: testTeams, error: teamsQueryError } = await supabase
          .from('teams')
          .select('id')
          .or(`tournament_id.in.(${await getTestTournamentIds(testPrefix)})`);
          
        if (teamsQueryError) {
          console.error("Error querying test teams:", teamsQueryError);
        } else if (testTeams && testTeams.length > 0) {
          const teamIds = testTeams.map(team => team.id);
          
          // Delete team_players for test teams
          const { error: tpError } = await supabase
            .from('team_players')
            .delete()
            .in('team_id', teamIds);
            
          if (tpError) console.error("Error deleting team_players for test teams:", tpError);
        }
      }
  
      // Step 4: Delete teams
      console.log("Deleting teams...");
      
      if (deleteAllTeams) {
        // Delete all teams
        const { error: teamsError } = await supabase
          .from('teams')
          .delete()
          .not('id', 'is', null);
          
        if (teamsError) console.error("Error deleting all teams:", teamsError);
      } else {
        // Delete only teams related to test tournaments
        const { error: teamsError } = await supabase
          .from('teams')
          .delete()
          .or(`tournament_id.in.(${await getTestTournamentIds(testPrefix)})`);
          
        if (teamsError) console.error("Error deleting teams for test tournaments:", teamsError);
      }
  
      // Step 5: Delete tournament_players
      console.log("Deleting tournament_players...");
      
      if (deleteTestTournamentsOnly) {
        // Delete tournament_players for test tournaments
        const { error: tpError } = await supabase
          .from('tournament_players')
          .delete()
          .or(`tournament_id.in.(${await getTestTournamentIds(testPrefix)})`);
          
        if (tpError) console.error("Error deleting tournament_players for test tournaments:", tpError);
      } else {
        // Delete all tournament_players
        const { error: tpError } = await supabase
          .from('tournament_players')
          .delete()
          .not('id', 'is', null);
          
        if (tpError) console.error("Error deleting all tournament_players:", tpError);
      }
  
      // Step 6: Delete tournaments
      console.log("Deleting tournaments...");
      
      if (deleteTestTournamentsOnly) {
        // Delete only test tournaments
        const { error: tournError } = await supabase
          .from('tournaments')
          .delete()
          .ilike('name', `${testPrefix}%`);
          
        if (tournError) console.error("Error deleting test tournaments:", tournError);
      } else {
        // Delete all tournaments
        const { error: tournError } = await supabase
          .from('tournaments')
          .delete()
          .not('id', 'is', null);
          
        if (tournError) console.error("Error deleting all tournaments:", tournError);
      }
  
      // Step 7: Delete players
      console.log("Deleting players...");
      
      if (deleteTestPlayersOnly) {
        // Delete only test players
        const { error: playerError } = await supabase
          .from('players')
          .delete()
          .ilike('name', `${testPrefix}%`);
          
        if (playerError) console.error("Error deleting test players:", playerError);
      } else {
        // Delete all players
        const { error: playerError } = await supabase
          .from('players')
          .delete()
          .not('id', 'is', null);
          
        if (playerError) console.error("Error deleting all players:", playerError);
      }
  
      console.log("Database cleanup completed.");
      return true;
    } catch (err) {
      console.error("Error during database cleanup:", err);
      return false;
    }
  }
  
  // Helper function to get IDs of test tournaments
  async function getTestTournamentIds(testPrefix) {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id')
        .ilike('name', `${testPrefix}%`);
        
      if (error) {
        console.error("Error fetching test tournament IDs:", error);
        return "";
      }
      
      if (!data || data.length === 0) return "";
      
      return data.map(t => t.id).join(',');
    } catch (err) {
      console.error("Error in getTestTournamentIds:", err);
      return "";
    }
  }
  
  // Function to delete a specific player
  async function deleteSpecificPlayer(playerId) {
    if (!playerId) {
      console.error("No player ID provided");
      return false;
    }
    
    if (!confirm(`Are you sure you want to delete player ID ${playerId}? This cannot be undone.`)) {
      console.log("Deletion cancelled.");
      return false;
    }
    
    try {
      // Step 1: Check if player is used in team_players
      const { data: teamPlayers, error: tpError } = await supabase
        .from('team_players')
        .select('id, team_id')
        .eq('player_id', playerId);
        
      if (tpError) {
        console.error("Error checking team_players:", tpError);
        return false;
      }
      
      // Step 2: Delete player's tournament points
      const { error: pointsError } = await supabase
        .from('player_tournament_points')
        .delete()
        .eq('player_id', playerId);
        
      if (pointsError) {
        console.error("Error deleting player_tournament_points:", pointsError);
      }
      
      // Step 3: Delete player from tournament_players
      const { error: tournPlayerError } = await supabase
        .from('tournament_players')
        .delete()
        .eq('player_id', playerId);
        
      if (tournPlayerError) {
        console.error("Error deleting from tournament_players:", tournPlayerError);
      }
      
      // Step 4: If player is in team_players, handle that
      if (teamPlayers && teamPlayers.length > 0) {
        console.log(`Player is used in ${teamPlayers.length} teams. Removing from teams.`);
        
        const { error: deleteTPError } = await supabase
          .from('team_players')
          .delete()
          .eq('player_id', playerId);
          
        if (deleteTPError) {
          console.error("Error deleting from team_players:", deleteTPError);
          return false;
        }
      }
      
      // Step 5: Finally delete the player
      const { error: playerError } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);
        
      if (playerError) {
        console.error("Error deleting player:", playerError);
        return false;
      }
      
      console.log(`Successfully deleted player ID ${playerId}`);
      return true;
    } catch (err) {
      console.error("Error in deleteSpecificPlayer:", err);
      return false;
    }
  }
  
  // Function to delete a specific tournament and all related records
  async function deleteSpecificTournament(tournamentId) {
    if (!tournamentId) {
      console.error("No tournament ID provided");
      return false;
    }
    
    if (!confirm(`Are you sure you want to delete tournament ID ${tournamentId} and all related data? This cannot be undone.`)) {
      console.log("Deletion cancelled.");
      return false;
    }
    
    try {
      // Step 1: Delete tournament_results
      const { error: resultsError } = await supabase
        .from('tournament_results')
        .delete()
        .eq('tournament_id', tournamentId);
        
      if (resultsError) console.error("Error deleting tournament_results:", resultsError);
      
      // Step 2: Delete player_tournament_points
      const { error: pointsError } = await supabase
        .from('player_tournament_points')
        .delete()
        .eq('tournament_id', tournamentId);
        
      if (pointsError) console.error("Error deleting player_tournament_points:", pointsError);
      
      // Step 3: Get teams for this tournament
      const { data: teams, error: teamsQueryError } = await supabase
        .from('teams')
        .select('id')
        .eq('tournament_id', tournamentId);
        
      if (teamsQueryError) {
        console.error("Error querying teams:", teamsQueryError);
      } else if (teams && teams.length > 0) {
        const teamIds = teams.map(team => team.id);
        
        // Step 4: Delete team_players for these teams
        const { error: tpError } = await supabase
          .from('team_players')
          .delete()
          .in('team_id', teamIds);
          
        if (tpError) console.error("Error deleting team_players:", tpError);
      }
      
      // Step 5: Delete teams
      const { error: teamsError } = await supabase
        .from('teams')
        .delete()
        .eq('tournament_id', tournamentId);
        
      if (teamsError) console.error("Error deleting teams:", teamsError);
      
      // Step 6: Delete tournament_players
      const { error: tpError } = await supabase
        .from('tournament_players')
        .delete()
        .eq('tournament_id', tournamentId);
        
      if (tpError) console.error("Error deleting tournament_players:", tpError);
      
      // Step 7: Finally delete the tournament
      const { error: tournError } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId);
        
      if (tournError) {
        console.error("Error deleting tournament:", tournError);
        return false;
      }
      
      console.log(`Successfully deleted tournament ID ${tournamentId} and all related data`);
      return true;
    } catch (err) {
      console.error("Error in deleteSpecificTournament:", err);
      return false;
    }
  }
  
  // Function to delete a specific team and all its related records
  async function deleteSpecificTeam(teamId) {
    if (!teamId) {
      console.error("No team ID provided");
      return false;
    }
    
    if (!confirm(`Are you sure you want to delete team ID ${teamId}? This cannot be undone.`)) {
      console.log("Deletion cancelled.");
      return false;
    }
    
    try {
      // Step 1: Delete tournament_results for this team
      const { error: resultsError } = await supabase
        .from('tournament_results')
        .delete()
        .eq('team_id', teamId);
        
      if (resultsError) console.error("Error deleting tournament_results:", resultsError);
      
      // Step 2: Delete player_tournament_points for this team
      const { error: pointsError } = await supabase
        .from('player_tournament_points')
        .delete()
        .eq('team_id', teamId);
        
      if (pointsError) console.error("Error deleting player_tournament_points:", pointsError);
      
      // Step 3: Delete team_players
      const { error: tpError } = await supabase
        .from('team_players')
        .delete()
        .eq('team_id', teamId);
        
      if (tpError) {
        console.error("Error deleting team_players:", tpError);
        return false;
      }
      
      // Step 4: Finally delete the team
      const { error: teamError } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
        
      if (teamError) {
        console.error("Error deleting team:", teamError);
        return false;
      }
      
      console.log(`Successfully deleted team ID ${teamId} and all related data`);
      return true;
    } catch (err) {
      console.error("Error in deleteSpecificTeam:", err);
      return false;
    }
  }
  
  // Function to safely update player rankings after deletion
  async function updateRankingsAfterDeletion() {
    try {
      // Get all players
      const { data: players, error } = await supabase
        .from('players')
        .select('id, name, player_cpi, rank')
        .order('player_cpi', { ascending: false });
        
      if (error) {
        console.error('Error fetching players for ranking:', error);
        return false;
      }
      
      console.log(`Updating ranks for ${players.length} players`);
      
      // Update each player with their new rank
      for (let i = 0; i < players.length; i++) {
        const newRank = i + 1;
        const playerId = players[i].id;
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
      
      console.log('Player rankings updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating rankings:', err);
      return false;
    }
  }

  function addDatabaseManagementTab() {
    // 1. First, add the tab button to the main tabs
    const adminTabs = document.querySelector('.admin-tabs');
    if (!adminTabs) {
      console.error('Admin tabs container not found');
      return;
    }
    
    // Check if the tab already exists
    if (!document.querySelector('.admin-tab[data-tab="database"]')) {
      const databaseTab = document.createElement('button');
      databaseTab.className = 'admin-tab';
      databaseTab.setAttribute('data-tab', 'database');
      databaseTab.textContent = 'Database';
      
      // Add the tab to the tabs container
      adminTabs.appendChild(databaseTab);
      
      // 2. Create the database management section
      const adminContainer = document.querySelector('.admin-container');
      if (!adminContainer) {
        console.error('Admin container not found');
        return;
      }
      
      const databaseSection = document.createElement('section');
      databaseSection.className = 'admin-section';
      databaseSection.id = 'database-section';
      
      // Add the database management content
      databaseSection.innerHTML = `
        <div class="admin-card">
          <h2>Database Management</h2>
          <p>Use these tools to help manage and clean up your database. <strong>Warning:</strong> Deletions cannot be undone!</p>
          
          <div class="db-tools">
            <div class="tool-section">
              <h3>Delete Test Data</h3>
              <p>Remove all test data from the database based on prefix.</p>
              <div class="form-group">
                <label for="testPrefix">Test Data Prefix</label>
                <input type="text" id="testPrefix" value="Test" placeholder="e.g. Test">
              </div>
              <button id="deleteTestDataBtn" class="btn btn-danger">Delete Test Data Only</button>
            </div>
            
            <div class="tool-section">
              <h3>Bulk Delete Players</h3>
              <p>Paste a list of player IDs from a CSV or spreadsheet column. Can be comma-separated, newline-separated, or tab-separated.</p>
              <div class="form-group">
                <textarea id="bulkPlayerIds" class="code-input" rows="5" placeholder="Paste player IDs here, one per line or comma-separated"></textarea>
              </div>
              <div class="button-group">
                <button id="bulkDeletePlayersBtn" class="btn btn-danger">Bulk Delete Players</button>
                <span id="bulkDeleteStatus" class="status-text"></span>
              </div>
            </div>
            
            <div class="tool-section">
              <h3>Delete Specific Records</h3>
              <div class="form-group">
                <label for="specificId">ID to Delete</label>
                <input type="text" id="specificId" placeholder="Enter ID">
              </div>
              <div class="button-group">
                <button id="deletePlayerBtn" class="btn btn-danger">Delete Player</button>
                <button id="deleteTournamentBtn" class="btn btn-danger">Delete Tournament</button>
                <button id="deleteTeamBtn" class="btn btn-danger">Delete Team</button>
              </div>
            </div>
            
            <div class="tool-section">
              <h3>Update Rankings</h3>
              <p>Recalculate player rankings based on CPI.</p>
              <button id="updateRankingsBtn" class="btn">Update All Rankings</button>
            </div>
            
            <div id="cleanupResults" class="cleanup-results" style="display: none;">
              <h3>Operation Results</h3>
              <div id="resultsContent"></div>
            </div>
          </div>
        </div>
      `;
      
      // Add the section to the admin container
      adminContainer.appendChild(databaseSection);
      
      // 3. Add CSS styles
      const style = document.createElement('style');
      style.textContent = `
        .db-tools {
          margin-top: 20px;
        }
        
        .tool-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .tool-section:last-child {
          border-bottom: none;
        }
        
        .button-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .btn-danger {
          background-color: #e74c3c;
          color: white;
        }
        
        .btn-danger:hover {
          background-color: #c0392b;
        }
        
        .cleanup-results {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
        }
        
        .cleanup-results h3 {
          margin-top: 0;
        }
        
        .result-success {
          color: #2ecc71;
        }
        
        .result-error {
          color: #e74c3c;
        }
        
        .status-text {
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
        }
        
        .code-input {
          width: 100%;
          background-color: rgba(0, 0, 0, 0.2);
          color: white;
          font-family: monospace;
          padding: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .processing {
          animation: blink 1s infinite;
          color: #f39c12;
        }
      `;
      document.head.appendChild(style);
      
      // 4. Add event listeners for the database management buttons
      setupDatabaseManagementListeners();
    }
  }
  
  // Function to set up the event listeners for database management
  function setupDatabaseManagementListeners() {
    document.getElementById('deleteTestDataBtn').addEventListener('click', async () => {
      const prefix = document.getElementById('testPrefix').value || 'Test';
      
      try {
        const success = await safeDeleteData({
          deleteTestPlayersOnly: true,
          deleteTestTournamentsOnly: true,
          deleteAllTeams: false,
          testPrefix: prefix
        });
        
        showCleanupResults(
          success 
            ? `Successfully deleted test data with prefix "${prefix}".` 
            : `Error deleting test data. Check console for details.`,
          success
        );
        
        // Refresh the data if successful
        if (success) {
          await loadPlayers();
          await loadTournaments();
          await loadTeams();
        }
      } catch (err) {
        console.error('Error deleting test data:', err);
        showCleanupResults('An error occurred: ' + err.message, false);
      }
    });
    
    document.getElementById('bulkDeletePlayersBtn').addEventListener('click', async () => {
      const bulkPlayerIds = document.getElementById('bulkPlayerIds').value;
      const statusElement = document.getElementById('bulkDeleteStatus');
      
      if (!bulkPlayerIds || bulkPlayerIds.trim() === '') {
        showCleanupResults('Please paste player IDs first', false);
        return;
      }
      
      // Show processing status
      statusElement.textContent = 'Processing...';
      statusElement.className = 'status-text processing';
      
      try {
        const result = await bulkDeletePlayers(bulkPlayerIds);
        
        statusElement.textContent = '';
        statusElement.className = 'status-text';
        
        showCleanupResults(result.message, result.success);
        
        // Clear the textarea if successful
        if (result.success) {
          document.getElementById('bulkPlayerIds').value = '';
          
          // Refresh the players list
          await loadPlayers();
        }
      } catch (err) {
        console.error('Error in bulk delete:', err);
        statusElement.textContent = '';
        statusElement.className = 'status-text';
        showCleanupResults('An error occurred: ' + err.message, false);
      }
    });
    
    document.getElementById('deletePlayerBtn').addEventListener('click', async () => {
      const id = document.getElementById('specificId').value;
      if (!id) {
        showCleanupResults('Please enter a player ID', false);
        return;
      }
      
      try {
        const success = await deleteSpecificPlayer(id);
        
        showCleanupResults(
          success 
            ? `Successfully deleted player with ID ${id}.` 
            : `Error deleting player. Check console for details.`,
          success
        );
        
        // Refresh the data if successful
        if (success) {
          await loadPlayers();
        }
      } catch (err) {
        console.error('Error deleting player:', err);
        showCleanupResults('An error occurred: ' + err.message, false);
      }
    });
    
    document.getElementById('deleteTournamentBtn').addEventListener('click', async () => {
      const id = document.getElementById('specificId').value;
      if (!id) {
        showCleanupResults('Please enter a tournament ID', false);
        return;
      }
      
      try {
        const success = await deleteSpecificTournament(id);
        
        showCleanupResults(
          success 
            ? `Successfully deleted tournament with ID ${id} and all related data.` 
            : `Error deleting tournament. Check console for details.`,
          success
        );
        
        // Refresh the data if successful
        if (success) {
          await loadTournaments();
          await loadTeams();
          await loadPlayers();
        }
      } catch (err) {
        console.error('Error deleting tournament:', err);
        showCleanupResults('An error occurred: ' + err.message, false);
      }
    });
    
    document.getElementById('deleteTeamBtn').addEventListener('click', async () => {
      const id = document.getElementById('specificId').value;
      if (!id) {
        showCleanupResults('Please enter a team ID', false);
        return;
      }
      
      try {
        const success = await deleteSpecificTeam(id);
        
        showCleanupResults(
          success 
            ? `Successfully deleted team with ID ${id} and all related data.` 
            : `Error deleting team. Check console for details.`,
          success
        );
        
        // Refresh the data if successful
        if (success) {
          await loadTeams();
        }
      } catch (err) {
        console.error('Error deleting team:', err);
        showCleanupResults('An error occurred: ' + err.message, false);
      }
    });
    
    document.getElementById('updateRankingsBtn').addEventListener('click', async () => {
      try {
        const success = await updateRankingsAfterDeletion();
        
        showCleanupResults(
          success 
            ? `Successfully updated all player rankings.` 
            : `Error updating rankings. Check console for details.`,
          success
        );
        
        // Refresh the players list
        if (success) {
          await loadPlayers();
        }
      } catch (err) {
        console.error('Error updating rankings:', err);
        showCleanupResults('An error occurred: ' + err.message, false);
      }
    });
  }
  

  function addDatabaseCleanupTool() {
    // Instead of adding the tools directly to the page, add a new tab
    addDatabaseManagementTab();
    
    // Update existing tab click event to handle the database tab
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
      // Remove existing event listener
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);
      
      // Add new event listener
      newTab.addEventListener('click', () => {
        // Remove active class from all tabs and sections
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked tab
        newTab.classList.add('active');
        
        // Show corresponding section
        const sectionId = `${newTab.dataset.tab}-section`;
        const section = document.getElementById(sectionId);
        if (section) {
          section.classList.add('active');
        }
      });
    });
  }
  
// Helper function to show cleanup results
function showCleanupResults(message, success) {
    const resultsContainer = document.getElementById('cleanupResults');
    const resultsContent = document.getElementById('resultsContent');
    
    if (!resultsContainer || !resultsContent) return;
    
    resultsContent.innerHTML = `<p class="${success ? 'result-success' : 'result-error'}">${message}</p>`;
    resultsContainer.style.display = 'block';
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
    
    // Make sure the Database tab is visible
    const databaseTab = document.querySelector('.admin-tab[data-tab="database"]');
    if (databaseTab && !databaseTab.classList.contains('active')) {
      databaseTab.click();
    }
  }
  
  // Initialize the cleanup tool when the page loads
  document.addEventListener('DOMContentLoaded', function() {
    // Wait for the admin.js scripts to initialize first
    setTimeout(() => {
      addDatabaseCleanupTool();
    }, 1000);
  });

  // Function to bulk delete players from a CSV-formatted list of IDs
async function bulkDeletePlayers(idsList) {
    if (!idsList || idsList.trim() === '') {
      console.error("No player IDs provided");
      return { success: false, message: "No player IDs provided" };
    }
    
    if (!confirm("Are you sure you want to bulk delete these players? This cannot be undone.")) {
      console.log("Bulk deletion cancelled.");
      return { success: false, message: "Operation cancelled" };
    }
  
    // Parse the input - handles various formats:
    // - Comma-separated values
    // - Newline-separated values
    // - CSV format with quotes
    // - Tab-separated values
    
    // First replace any quotes and split by common delimiters
    const cleanedInput = idsList.replace(/["']/g, '');
    const playerIds = cleanedInput
      .split(/[\n\r,\t;]+/) // Split by newline, comma, tab, or semicolon
      .map(id => id.trim())
      .filter(id => id !== '');
    
    if (playerIds.length === 0) {
      return { success: false, message: "No valid player IDs found" };
    }
    
    console.log(`Attempting to delete ${playerIds.length} players...`);
    
    // Results tracking
    const results = {
      total: playerIds.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      failedIds: []
    };
    
    try {
      // First, delete tournament_results for any teams that might contain these players
      // This is a preparatory step that might help with constraint issues
      console.log("Preliminary cleanup: player_tournament_points...");
      const { error: cleanupError } = await supabase
        .from('player_tournament_points')
        .delete()
        .in('player_id', playerIds);
        
      if (cleanupError) {
        console.error("Error in preliminary cleanup:", cleanupError);
        // Continue anyway
      }
      
      // Delete from tournament_players
      console.log("Deleting from tournament_players...");
      const { error: tpError } = await supabase
        .from('tournament_players')
        .delete()
        .in('player_id', playerIds);
        
      if (tpError) {
        console.error("Error deleting from tournament_players:", tpError);
        // Continue anyway
      }
      
      // Find all team_player records that use these players
      console.log("Checking team_players records...");
      const { data: teamPlayers, error: teamPlayersError } = await supabase
        .from('team_players')
        .select('id, team_id, player_id')
        .in('player_id', playerIds);
        
      if (teamPlayersError) {
        console.error("Error checking team_players:", teamPlayersError);
      } else if (teamPlayers && teamPlayers.length > 0) {
        // Delete the team_player records
        console.log(`Found ${teamPlayers.length} team_player records to delete...`);
        
        const { error: deleteTeamPlayersError } = await supabase
          .from('team_players')
          .delete()
          .in('player_id', playerIds);
          
        if (deleteTeamPlayersError) {
          console.error("Error deleting team_players:", deleteTeamPlayersError);
          return { 
            success: false, 
            message: `Error deleting team_players: ${deleteTeamPlayersError.message}. Process aborted.` 
          };
        }
      }
      
      // Now attempt to delete the players
      console.log("Deleting players...");
      const { data: deletedPlayers, error: deletePlayersError } = await supabase
        .from('players')
        .delete()
        .in('id', playerIds)
        .select();
        
      if (deletePlayersError) {
        console.error("Error bulk deleting players:", deletePlayersError);
        return { 
          success: false, 
          message: `Error deleting players: ${deletePlayersError.message}` 
        };
      }
      
      // Calculate results
      results.successful = deletedPlayers ? deletedPlayers.length : 0;
      results.skipped = playerIds.length - results.successful;
      
      console.log(`Successfully deleted ${results.successful} players out of ${results.total}`);
      
      if (results.skipped > 0) {
        console.log(`${results.skipped} players could not be found or were already deleted.`);
      }
      
      // Update rankings after deletion
      await updateRankingsAfterDeletion();
      
      return { 
        success: true, 
        message: `Successfully deleted ${results.successful} players out of ${results.total} provided IDs.` + 
                 (results.skipped > 0 ? ` ${results.skipped} IDs were skipped (not found or already deleted).` : ''),
        results: results
      };
    } catch (err) {
      console.error("Error in bulkDeletePlayers:", err);
      return { 
        success: false, 
        message: `An error occurred: ${err.message}` 
      };
    }
  }