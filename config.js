const CONFIG = {
    SUPABASE_URL: 'https://yyggnhdakiptmpajxplf.supabase.co', // Replace with your actual URL
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5Z2duaGRha2lwdG1wYWp4cGxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTU4OTksImV4cCI6MjA3MzI3MTg5OX0.s02w77hjWhvVmqhsHnK0m9vTzvi8OQdOnTlsywbaADQ',
    API_BASE_URL: 'https://N-QueenPro.appspot.com',
    
    // Game settings
    DEFAULT_BOARD_SIZE: 5,
    MAX_HINTS_PER_GAME: 3,
    TIMER_UPDATE_INTERVAL: 1000,
    
    // UI settings
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 3000,
    
    // API endpoints
    ENDPOINTS: {
        START_GAME: '/api/games/start',
        COMPLETE_GAME: '/api/games/complete',
        GET_LEADERBOARD: '/api/leaderboard',
        GET_PLAYER_STATS: '/api/players/stats',
        UPDATE_PLAYER_PROFILE: '/api/players/profile'
    }
};

// CORRECT way to initialize Supabase client from CDN
const { createClient } = supabase;
const supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// Make it globally available
window.supabase = supabaseClient;
