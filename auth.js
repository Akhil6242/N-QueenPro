class AuthManager {
    constructor() {
        this.currentUser = null;
        this.supabase = window.supabase; //global supabase client
        this.setupEventListeners();
        this.checkAuthState();
    }

    setupEventListeners() {
        // Modal controls
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showAuthModal();
        });

        document.getElementById('closeAuthModal').addEventListener('click', () => {
            this.hideAuthModal();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchAuthTab(e.target.dataset.tab);
            });
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });
    }
    setupUsernameValidation() {
        const usernameInput = document.getElementById('signupUsername');
        const statusDiv = document.getElementById('usernameStatus');
        
        let timeoutId;
        
        usernameInput.addEventListener('input', (e) => {
            clearTimeout(timeoutId);
            const username = e.target.value.trim();
            
            if (username.length < 3) {
                statusDiv.textContent = '';
                return;
            }
            
            // Debounced username availability check
            timeoutId = setTimeout(() => {
                this.checkUsernameAvailability(username);
            }, 500);
        });
    }
    async checkUsernameAvailability(username) {
        const statusDiv = document.getElementById('usernameStatus');
        
        try {
            statusDiv.textContent = 'Checking availability...';
            
            const { data, error } = await this.supabase
                .from('players')
                .select('username')
                .eq('username', username)
                .single();
            
            if (data) {
                statusDiv.textContent = '❌ Username already taken';
                statusDiv.className = 'username-availability taken';
            } else {
                statusDiv.textContent = '✅ Username available';
                statusDiv.className = 'username-availability available';
            }
        } catch (error) {
            if (error.code === 'PGRST116') { // Not found = available
                statusDiv.textContent = '✅ Username available';
                statusDiv.className = 'username-availability available';
            } else {
                statusDiv.textContent = 'Error checking availability';
                statusDiv.className = 'username-availability';
            }
        }
    } 

    async checkAuthState() {
        const { data: { session } } = await this.supabase.auth.getSession();
        
        if (session) {
            this.currentUser = session.user;
            this.updateUI();
        }

        // Listen for auth changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.currentUser = session.user;
                this.updateUI();
                this.hideAuthModal();
                Utils.showToast('Welcome back!', 'success');
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.updateUI();
                Utils.showToast('Logged out successfully', 'info');
            }
        });
    }

    showAuthModal() {
        document.getElementById('authModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideAuthModal() {
        document.getElementById('authModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.clearAuthErrors();
    }

    switchAuthTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tab}Form`);
        });

        this.clearAuthErrors();
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorElement = document.getElementById('loginError');

        try {
            Utils.showLoading();
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            // Login successful - auth state change will handle UI update
        } catch (error) {
            console.error('Login error:', error);
            errorElement.textContent = error.message || 'Login failed. Please try again.';
        } finally {
            Utils.hideLoading();
        }
    }

    async handleSignup() {
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const acknowledged = document.getElementById('usernameAcknowledge').checked;
        const errorElement = document.getElementById('signupError');

        // Clear previous errors
        errorElement.textContent = '';

        // Signup Validation
        if (!acknowledged) {
            errorElement.textContent = 'Please acknowledge that username cannot be changed';
            return;
        }

        if (username.length < 5) {
            errorElement.textContent = 'Username must be at least 5 characters long';
            return;
        }

        // Basic validation
        if (password.length < 6) {
            errorElement.textContent = 'Password must be at least 6 characters long';
            return;
        }

        try {
            Utils.showLoading();
            
            // Check if username is available
            const { data: existingUser } = await this.supabase
                .from('players')
                .select('username')
                .eq('username', username)
                .single();

            if (existingUser) {
                throw new Error('Username already taken');
            }

            // Create account
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (error) throw error;

            // Create player profile
            if (data.user) {
                await this.createPlayerProfile(data.user.id, username, email);
                Utils.showToast('Account created successfully! Please check your email to verify your account.', 'success');
                this.switchAuthTab('login');

            }

        } catch (error) {
            console.error('Signup error:', error);
            errorElement.textContent = error.message || 'Signup failed. Please try again.';
        } finally {
            Utils.hideLoading();
        }
    }
    

    async createPlayerProfile(userId, username, email) {
        try {
            const { error } = await supabase
                .from('players')
                .insert({
                    auth_id: userId,
                    username: username,
                    email: email
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error creating player profile:', error);
        }
    }

    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Logout error:', error);
            Utils.showToast('Error logging out', 'error');
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        const displayUsername = document.getElementById('displayUsername');

        if (this.currentUser) {
            loginBtn.classList.add('hidden');
            userInfo.classList.remove('hidden');
            displayUsername.textContent = this.currentUser.user_metadata?.username || this.currentUser.email;
        } else {
            loginBtn.classList.remove('hidden');
            userInfo.classList.add('hidden');
        }
    }

    clearAuthErrors() {
        document.getElementById('loginError').textContent = '';
        document.getElementById('signupError').textContent = '';
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    async getAuthToken() {
        const { data: { session } } = await this.supabase.auth.getSession();
        return session?.access_token;
    }
}
