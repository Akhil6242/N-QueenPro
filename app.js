class NQueenApp {
    constructor() {
        this.authManager = new AuthManager();
        this.gameManager = null;
        this.leaderboardManager = new LeaderboardManager();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showWelcomeScreen();

        // Load initial leaderboard data
        this.leaderboardManager.loadLeaderboard(CONFIG.DEFAULT_BOARD_SIZE);
    }

    startGame() {
        // Hide welcome screen and show game interface
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('gameInterface').classList.remove('hidden');

        // Initialize game manager
        const boardSize = parseInt(document.getElementById('boardSize').value);
        this.gameManager = new GameManager(boardSize);
        
        // Refresh leaderboard for current board size
        this.leaderboardManager.loadLeaderboard(boardSize);

        // Create the chessboard
        this.gameManager.createBoard();
    }

    setupEventListeners() {
        // Start game button
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.startGame();
        });

        // Board size change
        document.getElementById('boardSize').addEventListener('change', (e) => {
            if (this.gameManager) {
                this.gameManager.changeBoardSize(parseInt(e.target.value));
            }
        });

        // Leaderboard controls
        document.getElementById('leaderboardSize').addEventListener('change', (e) => {
            if (this.leaderboardManager) {
                this.leaderboardManager.loadLeaderboard(parseInt(e.target.value));
            }
        });

        document.getElementById('refreshLeaderboard').addEventListener('click', () => {
            if (this.leaderboardManager) {
                const boardSize = parseInt(document.getElementById('leaderboardSize').value);
                this.leaderboardManager.loadLeaderboard(boardSize);
            }
        });
    }

    showWelcomeScreen() {
        document.getElementById('welcomeScreen').classList.remove('hidden');
        document.getElementById('gameInterface').classList.add('hidden');
    }
}

// About Us Modal Functionality
class AboutUsManager {
    constructor() {
        this.setupEventListeners();
        this.setupDeveloperInfo();
    }

    setupEventListeners() {
        // Open modal
        document.getElementById('aboutUsBtn').addEventListener('click', () => {
            this.showAboutModal();
        });

        // Close modal
        document.getElementById('closeAboutModal').addEventListener('click', () => {
            this.hideAboutModal();
        });

        // Close on backdrop click
        document.getElementById('aboutUsModal').addEventListener('click', (e) => {
            if (e.target.id === 'aboutUsModal') {
                this.hideAboutModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !document.getElementById('aboutUsModal').classList.contains('hidden')) {
                this.hideAboutModal();
            }
        });
    }

    setupDeveloperInfo() {
        // Update with your actual information
        const developerInfo = {
            name: "Akhilesh Yadav",
            image: "https://avatars.githubusercontent.com/u/181719775?s=400&u=021d888025a489910b0cb86571d24c029fe2bba3&v=4", // Replace with your actual image
            email: "akhilyadavbil@gmail.com",
            linkedin: "https://linkedin.com/in/akhilesh-yadav-0b83032a5",
            github: "https://github.com/Akhil6242",
            portfolio: "https://yourportfolio.com"
        };

        // Update the modal content
        document.getElementById('developerName').textContent = developerInfo.name;
        document.getElementById('developerImage').src = developerInfo.image;
        document.getElementById('developerImage').alt = `${developerInfo.name} - Profile Picture`;
        
        document.getElementById('developerEmail').href = `mailto:${developerInfo.email}`;
        document.getElementById('developerLinkedIn').href = developerInfo.linkedin;
        document.getElementById('developerGitHub').href = developerInfo.github;
        document.getElementById('developerPortfolio').href = developerInfo.portfolio;
    }

    showAboutModal() {
        const modal = document.getElementById('aboutUsModal');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Add animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    hideAboutModal() {
        const modal = document.getElementById('aboutUsModal');
        modal.classList.remove('show');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 300);
    }
}


// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.nQueenApp = new NQueenApp();
    window.aboutUsManager = new AboutUsManager(); // ADD THIS LINE
});

document.addEventListener('DOMContentLoaded', () => {
    window.nQueenApp = new NQueenApp();
});
