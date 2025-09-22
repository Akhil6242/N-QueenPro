class API {
    static async makeRequest(endpoint, options = {}) {
        const url = CONFIG.API_BASE_URL + endpoint;
        const token = await window.nQueenApp.authManager.getAuthToken();
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };
        
        const requestOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static async startGame(gameData) {
        return this.makeRequest(CONFIG.ENDPOINTS.START_GAME, {
            method: 'POST',
            body: JSON.stringify(gameData)
        });
    }

    static async completeGame(gameData) {
        return this.makeRequest(CONFIG.ENDPOINTS.COMPLETE_GAME, {
            method: 'POST',
            body: JSON.stringify(gameData)
        });
    }

    static async getLeaderboard(boardSize) {
        return this.makeRequest(`${CONFIG.ENDPOINTS.GET_LEADERBOARD}/${boardSize}`);
    }
}
