// This file contains compatibility fixes to ensure admin.js and admin-enhancements.js work together

// Fix for tournament players - remove potential_points field from insert
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
        
        // Add player to tournament - NOT including potential_points field
        const { error: addError } = await supabase
            .from('tournament_players')
            .insert({
                tournament_id: tournamentId,
                player_id: playerId,
                name: playerName,
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

// Function to ensure player actions work correctly
function reattachPlayerEventListeners() {
    // Re-attach player action event listeners
    document.querySelectorAll('.edit-player-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditPlayerModal(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-player-btn').forEach(btn => {
        btn.addEventListener('click', () => deletePlayer(btn.dataset.id));
    });
    
    document.querySelectorAll('.points-history-btn').forEach(btn => {
        btn.addEventListener('click', () => viewPlayerPointsHistory(btn.dataset.id));
    });
    
    console.log('Player action event listeners reattached');
}

// Function to safely initialize admin enhancements
function initializeAdminEnhancements() {
    console.log('Initializing admin enhancements...');
    
    // Check if we need to update dashboard stats
    const existingStats = document.querySelector('.admin-stats');
    if (!existingStats) {
        // Add dashboard stats if not present
        setupDashboardStats();
    } else {
        // Update existing stats
        updateDashboardStats();
    }
    
    // Check if the admin-enhancements.js script is loaded properly
    // If functions from admin-enhancements.js exist, we can use them
    if (typeof loadDashboardStatistics === 'function') {
        try {
            // These functions come from admin-enhancements.js
            if (typeof addTournamentVisualization === 'function' && 
                !document.querySelector('.visualization-card')) {
                addTournamentVisualization();
            }
            
            if (typeof addBatchPlayerOperations === 'function' && 
                !document.querySelector('.batch-operations')) {
                addBatchPlayerOperations();
            }
            
            if (typeof addExportFunctionality === 'function' && 
                !document.getElementById('exportTournamentsBtn')) {
                addExportFunctionality();
            }
            
            if (typeof enhanceFiltering === 'function') {
                enhanceFiltering();
            }
        } catch (err) {
            console.error('Error initializing enhancements:', err);
        }
    } else {
        console.warn('Admin enhancements script not fully loaded. Some features might be unavailable.');
    }
    
    // Override addPlayerToTournament function with our fixed version
    const addButtons = document.querySelectorAll('.add-to-tournament-btn');
    if (addButtons.length > 0) {
        addButtons.forEach(btn => {
            // Remove existing event listener
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add our fixed event listener
            newBtn.addEventListener('click', addPlayerToTournament);
        });
    }
    
    // Reattach event listeners for player actions
    reattachPlayerEventListeners();
    
    console.log('Admin portal enhancements initialized');
}

// Updated setupDashboardStats that works with our modified HTML
async function setupDashboardStats() {
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
        
        // Update stats in existing HTML
        const totalPlayersElement = document.getElementById('totalPlayers');
        const activeTournamentsElement = document.getElementById('activeTournaments');
        const totalTeamsElement = document.getElementById('totalTeams');
        
        if (totalPlayersElement) {
            totalPlayersElement.textContent = players.length;
        }
        
        if (activeTournamentsElement) {
            const activeTournaments = tournaments.filter(t => t.status === 'active').length;
            activeTournamentsElement.textContent = activeTournaments;
        }
        
        if (totalTeamsElement) {
            totalTeamsElement.textContent = teams.length;
        }
    } catch (err) {
        console.error('Error setting up dashboard statistics:', err);
    }
}

// Function to periodically update dashboard stats
function updateDashboardStats() {
    // Schedule updates every 30 seconds
    setInterval(() => {
        setupDashboardStats();
    }, 30000);
}

// Wait for admin.js to initialize first, then run our compatibility fixes
document.addEventListener('DOMContentLoaded', function() {
    // Make sure admin-enhancements.js is loaded
    const enhancementsScript = document.createElement('script');
    enhancementsScript.src = 'js/admin-enhancements.js';
    document.body.appendChild(enhancementsScript);
    
    // Wait for admin.js to finish loading, then apply our fixes
    setTimeout(() => {
        initializeAdminEnhancements();
    }, 1500); // Increased delay to ensure admin.js and admin-enhancements.js have fully loaded
});