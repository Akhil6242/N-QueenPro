class LeaderboardManager {
    constructor() {
        this.currentBoardSize = CONFIG.DEFAULT_BOARD_SIZE;
    }

    async loadLeaderboard(boardSize) {
        this.currentBoardSize = boardSize;
        const tableBody = document.getElementById('leaderboardBody');
        
        try {
            Utils.showLoading();
            
            // Fetch real data from Supabase
            const { data, error } = await window.supabase
                .from('leaderboard')
                .select('*')
                .eq('board_size', boardSize)
                .order('time_rank', { ascending: true })
                .limit(20);

            if (error) throw error;

            this.renderLeaderboard(data || []);
            
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            
            // Fallback: try direct query if view doesn't work
            try {
                const { data: fallbackData, error: fallbackError } = await window.supabase
                    .from('player_statistics')
                    .select(`
                        *,
                        players!inner(username, avatar_url)
                    `)
                    .eq('board_size', boardSize)
                    .gt('games_completed', 0)
                    .order('best_time', { ascending: true })
                    .limit(20);

                if (fallbackError) throw fallbackError;

                const formattedData = fallbackData.map((stat, index) => ({
                    username: stat.players.username,
                    avatar_url: stat.players.avatar_url,
                    board_size: stat.board_size,
                    best_time: stat.best_time,
                    games_completed: stat.games_completed,
                    longest_streak: stat.longest_streak,
                    games_played: stat.games_played,
                    win_rate: stat.games_played > 0 ? 
                        Math.round((stat.games_completed / stat.games_played) * 100 * 10) / 10 : 0,
                    time_rank: index + 1
                }));

                this.renderLeaderboard(formattedData);
                
            } catch (fallbackError) {
                console.error('Fallback query also failed:', fallbackError);
                tableBody.innerHTML = '<tr><td colspan="5">Error loading leaderboard. Please try again.</td></tr>';
            }
        } finally {
            Utils.hideLoading();
        }
    }

    renderLeaderboard(data) {
        const tableBody = document.getElementById('leaderboardBody');
        
        if (!data || data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                        No players have completed ${this.currentBoardSize}×${this.currentBoardSize} puzzles yet.<br>
                        <small>Be the first to solve a puzzle and appear here!</small>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = data.map((player, index) => `
            <tr class="${index < 3 ? 'top-player' : ''}">
                <td>${player.time_rank || index + 1}</td>
                <td>
                    ${player.avatar_url ? 
                        `<img src="${player.avatar_url}" alt="${player.username}" class="avatar-small" style="width: 24px; height: 24px; border-radius: 50%; margin-right: 8px;">` : 
                        '👤'
                    }
                    ${player.username}
                </td>
                <td>${Utils.formatTime(player.best_time)}</td>
                <td>${player.games_completed}</td>
                <td>${player.win_rate}%</td>
            </tr>
        `).join('');
    }

    async getPlayerStats(playerId, boardSize) {
        try {
            const { data, error } = await window.supabase
                .from('player_statistics')
                .select('*')
                .eq('player_id', playerId)
                .eq('board_size', boardSize)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error fetching player stats:', error);
            return null;
        }
    }
}
