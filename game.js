class GameManager {
    constructor(boardSize = 5) {
        this.boardSize = boardSize;
        this.board = [];
        this.queensPositions = new Set();
        this.gameStartTime = null;
        this.gameTimer = null;
        this.movesCount = 0;
        this.hintsUsed = 0;
        this.solutions = [];
        this.currentSolutionIndex = 0;
        this.gameSession = null;

        this.setupEventListeners();
        this.generateAllSolutions();
    }

    setupEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('hintBtn').addEventListener('click', () => {
            this.showHint();
        });

        document.getElementById('solveBtn').addEventListener('click', () => {
            this.showSolution();
        });
    }

    createBoard() {
        const boardElement = document.getElementById('chessboard');
        boardElement.innerHTML = '';
        
        // Set CSS grid template
        boardElement.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        boardElement.classList.remove('solved');

        // Create board squares
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Add click handler
                square.addEventListener('click', () => {
                    this.handleSquareClick(row, col);
                });

                boardElement.appendChild(square);
            }
        }

        this.startGameTimer();
        this.updateDisplay();
    }

    handleSquareClick(row, col) {
        const position = `${row},${col}`;
        
        if (this.queensPositions.has(position)) {
            // Remove queen
            this.queensPositions.delete(position);
        } else {
            // Add queen
            this.queensPositions.add(position);
        }
        
        this.movesCount++;
        this.updateBoard();
        this.updateDisplay();
        this.checkGameState();
    }

    updateBoard() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const position = `${row},${col}`;
            
            // Clear previous states
            square.classList.remove('queen', 'conflict', 'hint');
            
            // Add queen if present
            if (this.queensPositions.has(position)) {
                square.classList.add('queen');
            }
            
            // Add conflict highlighting
            if (this.isSquareUnderAttack(row, col)) {
                square.classList.add('conflict');
            }
        });
    }

    isSquareUnderAttack(row, col) {
        for (let pos of this.queensPositions) {
            const [qRow, qCol] = pos.split(',').map(Number);
            
            // Skip same position
            if (qRow === row && qCol === col) continue;
            
            // Check if attacking
            if (qRow === row || qCol === col || 
                Math.abs(qRow - row) === Math.abs(qCol - col)) {
                return true;
            }
        }
        return false;
    }

    countConflicts() {
        let conflicts = 0;
        const positions = Array.from(this.queensPositions).map(pos => 
            pos.split(',').map(Number)
        );

        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                const [r1, c1] = positions[i];
                const [r2, c2] = positions[j];
                
                if (r1 === r2 || c1 === c2 || 
                    Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
                    conflicts++;
                }
            }
        }
        
        return conflicts;
    }

    checkGameState() {
        const conflicts = this.countConflicts();
        const queensCount = this.queensPositions.size;
        const messageElement = document.getElementById('gameMessage');
        const conflictElement = document.getElementById('conflictInfo');
        
        if (queensCount === this.boardSize && conflicts === 0) {
            // Game solved!
            document.getElementById('chessboard').classList.add('solved');
            messageElement.textContent = '🎉 Congratulations! You solved the puzzle!';
            messageElement.className = 'message success';
            conflictElement.textContent = '';
            
            this.stopGameTimer();
            this.completeGame(true);
        } else if (conflicts > 0) {
            document.getElementById('chessboard').classList.remove('solved');
            messageElement.textContent = `${conflicts} conflict${conflicts > 1 ? 's' : ''} detected`;
            messageElement.className = 'message info';
            conflictElement.textContent = `Queens cannot attack each other!`;
        } else {
            document.getElementById('chessboard').classList.remove('solved');
            messageElement.textContent = '';
            messageElement.className = 'message';
            conflictElement.textContent = '';
        }
    }

    generateAllSolutions() {
        this.solutions = [];
        const solution = [];
        this.solveNQueens(0, solution);
        console.log(`Found ${this.solutions.length} solutions for ${this.boardSize}x${this.boardSize} board`);
    }

    solveNQueens(row, currentSolution) {
        if (row === this.boardSize) {
            this.solutions.push([...currentSolution]);
            return;
        }

        for (let col = 0; col < this.boardSize; col++) {
            if (this.isSafeToPlace(row, col, currentSolution)) {
                currentSolution.push(col);
                this.solveNQueens(row + 1, currentSolution);
                currentSolution.pop();
            }
        }
    }

    isSafeToPlace(row, col, currentSolution) {
        for (let i = 0; i < currentSolution.length; i++) {
            const placedCol = currentSolution[i];
            
            if (placedCol === col || 
                Math.abs(i - row) === Math.abs(placedCol - col)) {
                return false;
            }
        }
        return true;
    }

    showHint() {
        if (this.solutions.length === 0 || this.hintsUsed >= CONFIG.MAX_HINTS_PER_GAME) {
            Utils.showToast('No more hints available', 'warning');
            return;
        }

        const solution = this.solutions[this.currentSolutionIndex];
        const placedQueens = this.queensPositions.size;
        
        if (placedQueens < this.boardSize) {
            const hintRow = placedQueens;
            const hintCol = solution[hintRow];
            
            // Highlight hint square
            const squares = document.querySelectorAll('.square');
            squares.forEach(square => {
                const row = parseInt(square.dataset.row);
                const col = parseInt(square.dataset.col);
                
                if (row === hintRow && col === hintCol) {
                    square.classList.add('hint');
                    setTimeout(() => {
                        square.classList.remove('hint');
                    }, 2000);
                }
            });
            
            this.hintsUsed++;
            this.updateDisplay();
            Utils.showToast(`Hint: Try row ${hintRow + 1}, column ${hintCol + 1}`, 'info');
        }
    }

    showSolution() {
        if (this.solutions.length === 0) {
            Utils.showToast('No solution available', 'warning');
            return;
        }
        
        this.queensPositions.clear();
        const solution = this.solutions[this.currentSolutionIndex];
        
        for (let row = 0; row < this.boardSize; row++) {
            const col = solution[row];
            this.queensPositions.add(`${row},${col}`);
        }
        
        this.updateBoard();
        this.updateDisplay();
        this.checkGameState();
        
        Utils.showToast('Solution displayed!', 'info');
    }

    changeBoardSize(newSize) {
        this.boardSize = newSize;
        this.resetGame();
        this.generateAllSolutions();
        this.createBoard();
    }

    resetGame() {
        this.queensPositions.clear();
        this.movesCount = 0;
        this.hintsUsed = 0;
        this.stopGameTimer();
        this.startGameTimer();
        
        if (document.getElementById('chessboard').children.length > 0) {
            this.updateBoard();
            this.updateDisplay();
            this.checkGameState();
        }
        
        Utils.showToast('Game reset!', 'info');
    }

    startGameTimer() {
        this.gameStartTime = Date.now();
        this.gameTimer = setInterval(() => {
            this.updateTimer();
        }, CONFIG.TIMER_UPDATE_INTERVAL);
    }

    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    updateTimer() {
        if (!this.gameStartTime) return;
        
        const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('gameTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateDisplay() {
        document.getElementById('queensCount').textContent = this.queensPositions.size;
        document.getElementById('movesCount').textContent = this.movesCount;
        document.getElementById('hintsUsed').textContent = this.hintsUsed;
        
        // Update hint button state
        const hintBtn = document.getElementById('hintBtn');
        if (this.hintsUsed >= CONFIG.MAX_HINTS_PER_GAME) {
            hintBtn.disabled = true;
            hintBtn.textContent = 'No Hints Left';
        } else {
            hintBtn.disabled = false;
            hintBtn.textContent = `Get Hint (${CONFIG.MAX_HINTS_PER_GAME - this.hintsUsed} left)`;
        }
    }

    async completeGame(solved = false) {
        if (!this.gameStartTime) return;
        
        const timeTaken = Math.floor((Date.now() - this.gameStartTime) / 1000);
        
        // If user is authenticated, save to Supabase directly
        if (window.nQueenApp.authManager.isAuthenticated()) {
            try {
                const currentUser = window.nQueenApp.authManager.getCurrentUser();
                
                // Get player ID from database
                const { data: player } = await window.supabase
                    .from('players')
                    .select('id')
                    .eq('auth_id', currentUser.id)
                    .single();
                
                if (player) {
                    // Save game session
                    const { data: gameSession, error: sessionError } = await window.supabase
                        .from('game_sessions')
                        .insert({
                            player_id: player.id,
                            board_size: this.boardSize,
                            solution_found: solved,
                            time_taken: solved ? timeTaken : null,
                            moves_count: this.movesCount,
                            hints_used: this.hintsUsed
                        })
                        .select()
                        .single();

                    if (sessionError) {
                        console.error('Session save error:', sessionError);
                        throw new Error('Failed to save game session: ' + sessionError.message);
                    }

                    console.log('Game session saved successfully:', gameSession);

                    // Update player statistics
                    try {
                        await this.updatePlayerStatistics(player.id, timeTaken, solved);
                        console.log('Player statistics updated successfully');
                    } catch (statsError) {
                        console.error('Statistics update error:', statsError);
                        // Don't throw here - game session was saved successfully
                        Utils.showToast('Game saved but statistics update failed try resetting the leaderboard!', 'warning');
                        return; // Exit early
                    }
                    
                    // Show success message
                    if (solved) {
                        Utils.showToast(`🎉 Puzzle solved in ${Utils.formatTime(timeTaken)}! Stats updated.`, 'success');
                        
                        // Refresh leaderboard
                        if (window.nQueenApp.leaderboardManager) {
                            window.nQueenApp.leaderboardManager.loadLeaderboard(this.boardSize);
                        }
                    }
                }
            } catch (error) {
                console.error('Error saving game:', error);
            }
        } else {
            // User not logged in
            if (solved) {
                Utils.showToast('🎉 Puzzle solved! Login to save your progress.', 'info');
            }
        }
    }

    async updatePlayerStatistics(playerId, timeTaken, solved) {
        try {
            // Get current statistics for this board size
            const { data: currentStats } = await window.supabase
                .from('player_statistics')
                .select('*')
                .eq('player_id', playerId)
                .eq('board_size', this.boardSize)
                .single();

            let updates = {};
            
            if (currentStats) {
                // Update existing statistics
                updates = {
                    games_played: currentStats.games_played + 1,
                    games_completed: currentStats.games_completed + (solved ? 1 : 0),
                    total_hints_used: currentStats.total_hints_used + this.hintsUsed,
                    last_played: new Date().toISOString()
                };

                // Update best time if this is better
                if (solved && timeTaken) {
                    if (!currentStats.best_time || timeTaken < currentStats.best_time) {
                        updates.best_time = timeTaken;
                    }
                    
                    // Calculate new average time
                    const totalCompletedGames = currentStats.games_completed + 1;
                    const currentTotalTime = (currentStats.average_time || 0) * currentStats.games_completed;
                    updates.average_time = (currentTotalTime + timeTaken) / totalCompletedGames;
                }

                // Update streaks
                if (solved) {
                    updates.current_streak = currentStats.current_streak + 1;
                    if (updates.current_streak > currentStats.longest_streak) {
                        updates.longest_streak = updates.current_streak;
                    }
                } else {
                    updates.current_streak = 0;
                }

                // Update existing record
                const { error } = await window.supabase
                    .from('player_statistics')
                    .update(updates)
                    .eq('player_id', playerId)
                    .eq('board_size', this.boardSize);

                if (error) throw error;

            } else {
                // Create new statistics record
                const { error } = await window.supabase
                    .from('player_statistics')
                    .insert({
                        player_id: playerId,
                        board_size: this.boardSize,
                        games_played: 1,
                        games_completed: solved ? 1 : 0,
                        best_time: solved ? timeTaken : null,
                        average_time: solved ? timeTaken : null,
                        total_hints_used: this.hintsUsed,
                        current_streak: solved ? 1 : 0,
                        longest_streak: solved ? 1 : 0,
                        last_played: new Date().toISOString()
                    });

                if (error) throw error;
            }

            // Update player total games count
            await window.supabase
                .from('players')
                .update({ 
                    total_games_played: window.supabase.raw('total_games_played + 1'),
                    last_active: new Date().toISOString()
                })
                .eq('id', playerId);

        } catch (error) {
            console.error('Error updating player statistics:', error);
            throw error;
        }
    }

}
