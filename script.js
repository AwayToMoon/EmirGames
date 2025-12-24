// Modern Gaming Platform - Enhanced JavaScript
class GamingPlatform {
    constructor() {
        this.currentGameId = null;
        this.isEditMode = false;
        this.selectedGenres = [];
        this.activeGenres = new Set(['all']);
        this.currentTab = 'all';
        this.originalGamesOrder = [];
        this.isLoading = false;
        this.isStreamerLoggedIn = false;
        this.steamDataCache = new Map(); // Cache für Steam-Daten
        
        this.init();
    }

    translateGenreToEnglish(genre) {
        const mapping = {
            'Sport': 'Sports',
            'Strategie': 'Strategy',
            'Rätsel': 'Puzzle',
            'Abenteuer': 'Adventure',
            'Simulation': 'Simulation',
            'Simulationen': 'Simulation',
            'Gelegenheitsspiele': 'Casual',
            'Gelegenheitsspiel': 'Casual',
            'Rollenspiel': 'RPG',
            'Überleben': 'Survival',
            'Kostenlos': 'Free To Play',
            'Kostenlos spielen': 'Free To Play',
            'Einzelspieler': 'Singleplayer',
            'Mehrspieler': 'Multiplayer',
            'Rennen': 'Racing',
            'Plattform': 'Platformer',
            'Plattformer': 'Platformer'
        };
        return mapping[genre] || genre;
    }

    async init() {
        try {
            this.showLoading();
            
            // Ensure page is at top during initialization
            window.scrollTo(0, 0);
            
            // Set a timeout to hide loading indicator after 10 seconds as fallback
            const loadingTimeout = setTimeout(() => {
                this.hideLoading();
                console.warn('Loading timeout reached, hiding loading indicator');
            }, 10000);
            
            await this.setupEventListeners();
            await this.loadInitialData();
            
            // Clear timeout and hide loading
            clearTimeout(loadingTimeout);
            this.hideLoading();
            
            // Final scroll to top after everything is loaded
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
            
            this.showNotification('Plattform erfolgreich geladen! 🎮', 'success');
        } catch (error) {
            console.error('Initialization error:', error);
            this.hideLoading();
            this.showNotification('Fehler beim Laden der Plattform', 'error');
        }
    }

    async setupEventListeners() {
        // Navigation Events
        this.setupNavigationEvents();
        
        // Admin Panel Events
        this.setupAdminEvents();
        
        // Streamer Panel Events
        this.setupStreamerEvents();
        
        // Game Management Events
        this.setupGameEvents();
        
        // Corner Image Events
        this.setupCornerImageEvents();
        
        // Corner Image Click Events
        this.setupCornerImageClickEvents();
        
        // Filter and Tab Events
        this.setupFilterEvents();
        
        // Modal Events
        this.setupModalEvents();
        
        // Randomizer Events
        this.setupRandomizerEvents();
        
        // Keyboard Events
        this.setupKeyboardEvents();
    }

    setupNavigationEvents() {
        // Navigation Links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.switchPage(page);
            });
        });

        // Support Button
        const supportBtn = document.getElementById('support-btn');
        if (supportBtn) {
            supportBtn.addEventListener('click', () => {
                this.openSupportModal();
            });
        }

        // Main Login Button
        const mainLoginBtn = document.getElementById('main-login-btn');
        if (mainLoginBtn) {
            mainLoginBtn.addEventListener('click', () => {
                // Check if admin is logged in
                if (this.isAdminLoggedIn()) {
                    this.logoutAdmin();
                } else if (this.isStreamerLoggedIn) {
                    this.logoutStreamer();
                } else {
                    this.showLoginOptions();
                }
            });
        }

        // Social Media Buttons
        this.setupSocialMediaButtons();

        // Action Buttons
        this.setupActionButtons();

        // FAQ Toggle
        this.setupFAQToggle();

    }

    switchPage(page) {
        // Hide all pages
        document.querySelectorAll('.page-content').forEach(p => {
            p.classList.remove('active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Add active class to clicked nav link
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Ensure loading indicator is hidden when switching pages
        this.hideLoading();

        // Scroll to top when switching pages
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Load content based on page
        if (page === 'games') {
            this.renderGames();
        }
    }

    showLoginOptions() {
        // Create login options modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content login-content">
                <span class="close-modal">&times;</span>
                <h2><i class="fas fa-user-shield"></i> Login Optionen</h2>
                <div class="login-options">
                    <button id="admin-login-option" class="login-option-btn">
                        <i class="fas fa-user-shield"></i>
                        Admin Login
                    </button>
                    <button id="streamer-login-option" class="login-option-btn">
                        <i class="fas fa-gamepad"></i>
                        Streamer Login
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners for login options
        modal.querySelector('#admin-login-option').addEventListener('click', () => {
            modal.remove();
            this.openModal('login-modal');
        });
        
        modal.querySelector('#streamer-login-option').addEventListener('click', () => {
            modal.remove();
            this.openModal('streamer-login-modal');
        });
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    openSupportModal() {
        // Create support modal if it doesn't exist
        let supportModal = document.getElementById('support-modal');
        if (!supportModal) {
            supportModal = document.createElement('div');
            supportModal.id = 'support-modal';
            supportModal.className = 'modal support-modal-no-close';
            supportModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-heart"></i> Supportet mich</h2>
                        <button class="close-modal" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Vielen Dank für dein Interesse, mich zu unterstützen! 💖</p>
                        <div class="support-options">
                            <a href="https://www.paypal.com/paypalme/away21" target="_blank" class="support-option">
                                <i class="fab fa-paypal"></i>
                                PayPal
                            </a>
                            <a href="https://streamelements.com/away2moon/tip" target="_blank" class="support-option">
                                <i class="fas fa-donate"></i>
                                StreamElements
                            </a>
                        </div>
                        <p class="support-note">Jede Unterstützung hilft mir dabei, bessere Inhalte zu erstellen! 🙏</p>
                    </div>
                </div>
            `;
            document.body.appendChild(supportModal);
        }
        supportModal.style.display = 'flex';
    }

    setupSocialMediaButtons() {
        // TikTok Button
        const tiktokBtn = document.getElementById('social-tiktok');
        if (tiktokBtn) {
            tiktokBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.open('https://www.tiktok.com/@creator_emir999', '_blank');
            });
        }

        // Instagram Button
        const instagramBtn = document.getElementById('social-instagram');
        if (instagramBtn) {
            instagramBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.open('https://www.instagram.com/highercellffx/', '_blank');
            });
        }

        // Discord Button
        const discordBtn = document.getElementById('social-discord');
        if (discordBtn) {
            discordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.open('https://discord.com/invite/32HKVGXePw', '_blank');
            });
        }

        // YouTube Button
        const youtubeBtn = document.getElementById('social-youtube');
        if (youtubeBtn) {
            youtubeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.open('https://www.youtube.com/@flyonkukirin', '_blank');
            });
        }
    }

    setupActionButtons() {
        // Random Game Button
        const randomGameBtn = document.getElementById('random-game-btn');
        if (randomGameBtn) {
            randomGameBtn.addEventListener('click', () => {
                this.showRandomGame();
            });
        }

        // Suggest Game Button
        const suggestGameBtn = document.getElementById('suggest-game-btn');
        if (suggestGameBtn) {
            suggestGameBtn.addEventListener('click', () => {
                this.openModal('suggest-form');
            });
        }
    }

    showRandomGame() {
        // Get all games from the current view
        const gameElements = document.querySelectorAll('.game:not(.hidden)');
        if (gameElements.length === 0) {
            this.showNotification('Keine Spiele verfügbar!', 'error');
            return;
        }

        // Pick a random game
        const randomIndex = Math.floor(Math.random() * gameElements.length);
        const randomGame = gameElements[randomIndex];
        
        // Add pulsing animation to the button
        const randomBtn = document.getElementById('random-game-btn');
        if (randomBtn) {
            randomBtn.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                randomBtn.style.animation = '';
            }, 600);
        }

        // Scroll to the random game
        randomGame.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });

        // Add strong highlight effect
        randomGame.style.transform = 'scale(1.1)';
        randomGame.style.boxShadow = '0 0 40px rgba(99, 102, 241, 1), 0 0 80px rgba(139, 92, 246, 0.8)';
        randomGame.style.border = '3px solid #6366f1';
        randomGame.style.zIndex = '1000';
        randomGame.style.position = 'relative';
        
        // Add pulsing border animation
        randomGame.style.animation = 'randomGamePulse 2s ease-in-out';
        
        // Reset after 3 seconds
        setTimeout(() => {
            randomGame.style.transform = '';
            randomGame.style.boxShadow = '';
            randomGame.style.border = '';
            randomGame.style.zIndex = '';
            randomGame.style.position = '';
            randomGame.style.animation = '';
        }, 3000);

        this.showNotification('🎲 Zufälliges Spiel ausgewählt!', 'success');
    }

    setupFAQToggle() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    // Close all other FAQ items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // Toggle current item
                    item.classList.toggle('active');
                });
            }
        });
    }

    async loadFeaturedGames() {
        try {
            const snapshot = await db.collection("games").get();
            const games = [];
            
            snapshot.forEach(doc => {
                const gameData = doc.data();
                if (!gameData.isPending && !gameData.unreleased && !gameData.played) {
                    games.push({ id: doc.id, ...gameData });
                }
            });

            // Take first 6 games for featured section
            const featuredGames = games.slice(0, 6);
            const featuredContainer = document.getElementById('featured-game-list');
            
            if (featuredContainer) {
                featuredContainer.innerHTML = '';
                if (featuredGames.length > 0) {
                    featuredGames.forEach(game => {
                        const gameElement = this.createGamePreviewElement(game);
                        featuredContainer.appendChild(gameElement);
                    });
                } else {
                    featuredContainer.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">Keine Spiele verfügbar</p>';
                }
            }
        } catch (error) {
            console.error('Error loading featured games:', error);
            // Show fallback content if no games are available
            const featuredContainer = document.getElementById('featured-game-list');
            if (featuredContainer) {
                featuredContainer.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">Keine Spiele verfügbar</p>';
            }
        }
    }

    createGamePreviewElement(game) {
        const gameElement = document.createElement('div');
        gameElement.className = 'game-preview-card';
        gameElement.innerHTML = `
            <img src="${game.image}" alt="${game.name}" loading="lazy">
            <div class="game-preview-content">
                <h3>${game.name}</h3>
                <div class="game-preview-genres">
                    ${this.createGenreTags(game.genres)}
                </div>
            </div>
        `;

        // Add click event to open game
        gameElement.addEventListener('click', () => {
            window.open(game.link, '_blank');
        });

        return gameElement;
    }

    setupAdminEvents() {
        // Admin Login
        const adminLoginBtn = document.getElementById('admin-login-btn');
        if (adminLoginBtn) {
            adminLoginBtn.addEventListener('click', () => {
                this.openModal('login-modal');
            });
        }

        const loginSubmit = document.getElementById('login-submit');
        if (loginSubmit) {
            loginSubmit.addEventListener('click', async () => {
                await this.handleAdminLogin();
            });
        }

        const loginCancel = document.getElementById('login-cancel');
        if (loginCancel) {
            loginCancel.addEventListener('click', () => {
                this.closeModal('login-modal');
            });
        }

        // Admin Panel Buttons
        const addGameBtn = document.getElementById('add-game-btn');
        if (addGameBtn) {
            addGameBtn.addEventListener('click', () => {
                this.openGameForm();
            });
        }

        const editGamesBtn = document.getElementById('edit-games-btn');
        if (editGamesBtn) {
            editGamesBtn.addEventListener('click', () => {
                this.toggleEditMode();
            });
        }

        const editCornerImageBtn = document.getElementById('edit-corner-image-btn');
        if (editCornerImageBtn) {
            editCornerImageBtn.addEventListener('click', () => {
                this.openCornerImageForm();
            });
        }

        const viewSuggestionsBtn = document.getElementById('view-suggestions-btn');
        if (viewSuggestionsBtn) {
            viewSuggestionsBtn.addEventListener('click', () => {
                this.viewSuggestions();
            });
        }

        // Bulk-Update Genres
        const updateBtn = document.getElementById('update-genres-btn');
        if (updateBtn) {
            updateBtn.addEventListener('click', async () => {
                await this.bulkUpdateGenres();
            });
        }

        // Validate Steam Links
        const validateLinksBtn = document.getElementById('validate-steam-links-btn');
        if (validateLinksBtn) {
            validateLinksBtn.addEventListener('click', async () => {
                await this.validateSteamLinks();
            });
        }
    }

    setupStreamerEvents() {
        // Streamer Login
        const streamerLoginBtn = document.getElementById('streamer-login-btn');
        if (streamerLoginBtn) {
            streamerLoginBtn.addEventListener('click', () => {
                this.openModal('streamer-login-modal');
            });
        }

        const streamerLoginSubmit = document.getElementById('streamer-login-submit');
        if (streamerLoginSubmit) {
            streamerLoginSubmit.addEventListener('click', async () => {
                await this.handleStreamerLogin();
            });
        }

        const streamerLoginCancel = document.getElementById('streamer-login-cancel');
        if (streamerLoginCancel) {
            streamerLoginCancel.addEventListener('click', () => {
                this.closeModal('streamer-login-modal');
            });
        }

        // Enter key for streamer login
        const streamerPassword = document.getElementById('streamer-password');
        if (streamerPassword) {
            streamerPassword.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    await this.handleStreamerLogin();
                }
            });
        }
    }

    setupGameEvents() {
        // Game Form Events
        const linkTypeSelect = document.getElementById('game-link-type');
        if (linkTypeSelect) {
            linkTypeSelect.addEventListener('change', (e) => {
                const linkLabel = document.getElementById('link-label');
                const linkInput = document.getElementById('steam-link');
                if (e.target.value === 'itchio') {
                    linkLabel.textContent = 'Itch.io-Link';
                    linkInput.placeholder = 'Itch.io-Link einfügen (z.B. https://username.itch.io/gamename)';
                } else {
                    linkLabel.textContent = 'Steam-Link';
                    linkInput.placeholder = 'Steam-Link einfügen';
                }
                // Reset form when switching
                linkInput.value = '';
                document.getElementById('steam-fetch-status').classList.add('hidden');
                document.getElementById('steam-preview').classList.add('hidden');
            });
        }

        const steamLink = document.getElementById('steam-link');
        if (steamLink) {
            steamLink.addEventListener('input', this.debounce(async (e) => {
                const linkType = document.getElementById('game-link-type')?.value || 'steam';
                await this.handleGameLinkInput(e.target.value, linkType);
            }, 500));
        }

        const saveGame = document.getElementById('save-game');
        if (saveGame) {
            saveGame.addEventListener('click', async () => {
                await this.saveGame();
            });
        }

        // Suggest Game Events
        const suggestGameBtn = document.getElementById('suggest-game-btn');
        if (suggestGameBtn) {
            suggestGameBtn.addEventListener('click', () => {
                this.openModal('suggest-form');
            });
        }

        const suggestSteamLink = document.getElementById('suggest-steam-link');
        if (suggestSteamLink) {
            suggestSteamLink.addEventListener('input', this.debounce(async (e) => {
                await this.handleSuggestSteamLinkInput(e.target.value);
            }, 500));
        }

        const submitSuggestion = document.getElementById('submit-suggestion');
        if (submitSuggestion) {
            submitSuggestion.addEventListener('click', async () => {
                await this.submitSuggestion();
            });
        }
    }

    setupCornerImageEvents() {
        const saveCornerImage = document.getElementById('save-corner-image');
        if (saveCornerImage) {
            saveCornerImage.addEventListener('click', async () => {
                await this.saveCornerImage();
            });
        }

        const cornerImageUrl = document.getElementById('corner-image-url');
        if (cornerImageUrl) {
            cornerImageUrl.addEventListener('input', (e) => {
                this.updateCornerImagePreview(e.target.value);
            });
        }
    }

    setupFilterEvents() {
        // Genre Filter Buttons
        document.querySelectorAll('.genre-filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.handleGenreFilter(button.dataset.genre);
            });
        });

        // Tab Buttons
        document.querySelectorAll('.game-tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.handleTabChange(button.id);
            });
        });
    }

    setupModalEvents() {
        // Close Modal Buttons
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                // Don't close support modal
                if (!modal.classList.contains('support-modal-no-close')) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Modal Overlay Click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal && !modal.classList.contains('support-modal-no-close')) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Impressum link
        const imprintLink = document.getElementById('impressum-link');
        if (imprintLink) {
            imprintLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal('imprint-modal');
            });
        }
    }

    setupRandomizerEvents() {
        // Add event listeners for randomizer buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'play-random-game') {
                this.playRandomGame();
            } else if (e.target.id === 'close-random-game') {
                this.closeRandomizer();
            }
        });
    }

    setupKeyboardEvents() {
        // Enter key for login
        const adminPassword = document.getElementById('admin-password');
        if (adminPassword) {
            adminPassword.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    await this.handleAdminLogin();
                }
            });
        }

        // Escape key for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Don't close support modal with escape key
                const supportModal = document.getElementById('support-modal');
                if (supportModal && supportModal.style.display === 'flex') {
                    return;
                }
                this.closeAllModals();
            }
        });
    }

    async loadInitialData() {
        try {
            // Erst Migrationen ausführen
            await this.migrateUnreleasedFlag();
            await this.migrateGenresToEnglish();
            await this.migrateSteamLinks();
            await this.migrateHorrorFlag();
            
            // Dann alles andere parallel laden
            await Promise.all([
                this.loadSocialLinks(),
                this.loadCornerImageOnStartup(),
                this.updateGenreFilterButtons(),
                this.updateSuggestionCount()
            ]);
            
            // Update login button state
            this.updateLoginButton();
            
            // Setze Standard-Footer-Links falls keine in der Datenbank vorhanden sind
            this.setDefaultFooterLinks();
        } catch (error) {
            console.error('Error in loadInitialData:', error);
            // Continue even if some data fails to load
        }
    }

    // Admin Functions
    async handleAdminLogin() {
        const password = document.getElementById('admin-password').value;
        
        if (!password.trim()) {
            this.showNotification('Bitte geben Sie ein Passwort ein', 'error');
            return;
        }
        
        try {
            const isValid = await this.checkAdminPassword(password);
            if (isValid) {
                document.getElementById('admin-panel').classList.remove('hidden');
                this.closeModal('login-modal');
                document.getElementById('admin-password').value = '';
                await this.loadSocialLinks();
                this.updateLoginButton();
                this.showNotification('Admin-Login erfolgreich! 🔐', 'success');
            } else {
                this.showNotification('Falsches Passwort!', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Fehler beim Login', 'error');
        }
    }

    isAdminLoggedIn() {
        return !document.getElementById('admin-panel').classList.contains('hidden');
    }

    logoutAdmin() {
        // Hide admin panel
        document.getElementById('admin-panel').classList.add('hidden');
        
        // Reset edit mode
        this.isEditMode = false;
        const editBtn = document.getElementById('edit-games-btn');
        if (editBtn) {
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Spiele bearbeiten';
        }
        
        // Re-render games to hide admin buttons
        this.renderGames();
        
        // Update login button
        this.updateLoginButton();
        
        this.showNotification('Admin-Logout erfolgreich! 👋', 'success');
    }

    updateLoginButton() {
        const loginBtn = document.getElementById('main-login-btn');
        if (!loginBtn) return;
        
        if (this.isAdminLoggedIn()) {
            loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Admin Logout';
            loginBtn.style.background = 'linear-gradient(45deg, #dc2626, #b91c1c)';
            loginBtn.title = 'Als Admin ausloggen';
        } else if (this.isStreamerLoggedIn) {
            loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Streamer Logout';
            loginBtn.style.background = 'linear-gradient(45deg, #059669, #047857)';
            loginBtn.title = 'Als Streamer ausloggen';
        } else {
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
            loginBtn.style.background = '';
            loginBtn.title = 'Als Admin oder Streamer einloggen';
        }
    }

    async checkAdminPassword(inputPassword) {
        try {
            const doc = await db.collection("settings").doc("admin").get();
            if (doc.exists) {
                const data = doc.data();
                const hashedInput = CryptoJS.SHA256(inputPassword).toString();
                return hashedInput === data.passwordHash;
            }
            return false;
        } catch (error) {
            console.error("Error checking password:", error);
            return false;
        }
    }

    // Streamer Login Functions
    async handleStreamerLogin() {
        const password = document.getElementById('streamer-password').value;
        
        if (!password.trim()) {
            this.showNotification('Bitte geben Sie ein Streamer-Passwort ein', 'error');
            return;
        }
        
        try {
            const isValid = await this.checkStreamerPassword(password);
            if (isValid) {
                this.isStreamerLoggedIn = true;
                document.getElementById('streamer-panel').classList.remove('hidden');
                this.closeModal('streamer-login-modal');
                document.getElementById('streamer-password').value = '';
                this.updateLoginButton();
                this.showNotification('Streamer-Login erfolgreich! 🎮', 'success');
                await this.renderGames(); // Re-render to show streamer buttons
            } else {
                this.showNotification('Falsches Streamer-Passwort!', 'error');
            }
        } catch (error) {
            console.error('Streamer login error:', error);
            this.showNotification('Fehler beim Streamer-Login', 'error');
        }
    }

    isStreamerLoggedIn() {
        return this.isStreamerLoggedIn;
    }

    logoutStreamer() {
        // Hide streamer panel
        this.isStreamerLoggedIn = false;
        document.getElementById('streamer-panel').classList.add('hidden');
        
        // Re-render games to hide streamer buttons
        this.renderGames();
        
        // Update login button
        this.updateLoginButton();
        
        this.showNotification('Streamer-Logout erfolgreich! 👋', 'success');
    }

    async checkStreamerPassword(inputPassword) {
        try {
            const doc = await db.collection("settings").doc("streamer").get();
            if (doc.exists) {
                const data = doc.data();
                const hashedInput = CryptoJS.SHA256(inputPassword).toString();
                return hashedInput === data.passwordHash;
            }
            return false;
        } catch (error) {
            console.error("Error checking streamer password:", error);
            return false;
        }
    }

    openGameForm() {
        this.currentGameId = null;
        this.isEditMode = false;
        this.resetGameForm();
        
        // Reset form title and button
        const formTitle = document.querySelector('#game-form h2');
        const saveButton = document.getElementById('save-game');
        
        formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Spiel hinzufügen';
        saveButton.innerHTML = '<i class="fas fa-save"></i> Speichern';
        
        this.openModal('game-form');
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        this.renderGames();
        const btn = document.getElementById('edit-games-btn');
        btn.innerHTML = this.isEditMode ? 
            '<i class="fas fa-times"></i> Bearbeiten beenden' : 
            '<i class="fas fa-edit"></i> Spiele bearbeiten';
    }

    openCornerImageForm() {
        this.loadCornerImageData();
        this.openModal('corner-image-form');
    }

    async loadCornerImageData() {
        try {
            const doc = await db.collection("settings").doc("social").get();
            if (doc.exists) {
                const data = doc.data();
                const cornerImageUrl = document.getElementById('corner-image-url');
                if (cornerImageUrl) {
                    cornerImageUrl.value = data.cornerImage || '';
                    this.updateCornerImagePreview(data.cornerImage || '');
                }
            }
        } catch (error) {
            console.error("Error loading corner image data:", error);
        }
    }

    async loadCornerImageOnStartup() {
        // Corner Image wird nicht mehr aus der Datenbank geladen
        // Das ursprüngliche Bild aus der HTML-Datei wird verwendet
        console.log("Corner Image wird aus HTML-Datei geladen, nicht aus der Datenbank");
    }

    updateCornerImagePreview(url) {
        const previewImage = document.getElementById('preview-image');
        const noPreview = document.getElementById('no-preview');
        
        if (url && url.trim() && url !== '#') {
            previewImage.src = url;
            previewImage.style.display = 'block';
            noPreview.style.display = 'none';
        } else {
            previewImage.style.display = 'none';
            noPreview.style.display = 'block';
        }
    }

    async saveCornerImage() {
        const cornerImageUrl = document.getElementById('corner-image-url').value.trim();
        
        if (!cornerImageUrl) {
            this.showNotification('Bitte geben Sie eine Corner Image URL ein!', 'error');
            return;
        }

        try {
            // Update the corner image directly
            document.getElementById('corner-image').src = cornerImageUrl;
            
            // Save to database
            await db.collection("settings").doc("social").set({
                cornerImage: cornerImageUrl
            }, { merge: true });
            
            this.closeModal('corner-image-form');
            this.showNotification('Corner Image erfolgreich aktualisiert! 🖼️', 'success');
        } catch (error) {
            console.error("Error saving corner image:", error);
            this.showNotification('Fehler beim Speichern des Corner Images', 'error');
        }
    }

    setupCornerImageClickEvents() {
        const cornerImageLink = document.getElementById('corner-image-link');
        if (cornerImageLink) {
            cornerImageLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSocialMediaOptions();
            });
        }
    }

    showSocialMediaOptions() {
        // Create social media options modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content social-options-content">
                <span class="close-modal">&times;</span>
                <h2><i class="fas fa-share-alt"></i> Folge HigherCellF</h2>
                <p style="text-align: center; margin-bottom: 20px; color: #94a3b8;">
                    Wähle eine Social Media Plattform aus:
                </p>
                <div class="social-options-grid">
                    <a href="https://www.tiktok.com/@creator_emir999" target="_blank" class="social-option-card">
                        <i class="fab fa-tiktok"></i>
                        <span>TikTok</span>
                    </a>
                    <a href="https://www.instagram.com/highercellffx/" target="_blank" class="social-option-card">
                        <i class="fab fa-instagram"></i>
                        <span>Instagram</span>
                    </a>
                    <a href="https://discord.com/invite/32HKVGXePw" target="_blank" class="social-option-card">
                        <i class="fab fa-discord"></i>
                        <span>Discord</span>
                    </a>
                    <a href="https://www.youtube.com/@flyonkukirin" target="_blank" class="social-option-card">
                        <i class="fab fa-youtube"></i>
                        <span>YouTube</span>
                    </a>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal events
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Game Management Functions
    async handleGameLinkInput(link, linkType = 'steam') {
        const status = document.getElementById("steam-fetch-status");
        const preview = document.getElementById("steam-preview");
        
        if (!link.trim()) {
            status.classList.add('hidden');
            preview.classList.add('hidden');
            return;
        }

        if (linkType === 'itchio') {
            await this.handleItchIoLinkInput(link);
            return;
        }

        // Original Steam handling
        status.classList.remove('hidden');
        status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Lade Spieldaten von Steam...';
        preview.classList.add('hidden');

        try {
            const appid = this.extractSteamAppId(link);
            if (!appid) {
                status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ungültiger Steam-Link!';
                return;
            }

            const gameData = await this.fetchSteamGameData(appid);
            this.displaySteamPreview(gameData, 'steam');
            status.classList.add('hidden');
        } catch (error) {
            console.error('Steam fetch error:', error);
            status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Fehler beim Laden der Spieldaten!';
        }
    }

    async handleSteamLinkInput(link) {
        await this.handleGameLinkInput(link, 'steam');
    }

    async handleItchIoLinkInput(link) {
        const status = document.getElementById("steam-fetch-status");
        const preview = document.getElementById("steam-preview");
        
        if (!this.isValidItchIoLink(link)) {
            status.classList.remove('hidden');
            status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ungültiger Itch.io-Link! Bitte verwende das Format: https://username.itch.io/gamename';
            preview.classList.add('hidden');
            return;
        }

        status.classList.remove('hidden');
        status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Lade Spieldaten von Itch.io...';
        preview.classList.add('hidden');

        try {
            const gameData = await this.fetchItchIoGameData(link);
            this.displaySteamPreview(gameData, 'steam');
            status.classList.add('hidden');
        } catch (error) {
            console.error('Itch.io fetch error:', error);
            status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Fehler beim Laden der Spieldaten! Bitte fülle die Felder manuell aus.';
        }
    }

    isValidItchIoLink(url) {
        if (!url || typeof url !== 'string') return false;
        const itchPattern = /^https?:\/\/([\w-]+)\.itch\.io\/([\w-]+)/;
        return itchPattern.test(url);
    }

    async fetchItchIoGameData(url) {
        try {
            // Itch.io doesn't have a public API, so we'll extract what we can from the URL
            // and let the user fill in the rest manually
            const match = url.match(/https?:\/\/([\w-]+)\.itch\.io\/([\w-]+)/);
            if (!match) {
                throw new Error('Invalid Itch.io URL');
            }

            const [, username, gameName] = match;
            
            // Try to fetch the page to get some basic info
            try {
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(proxyUrl, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const html = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    // Try to extract title
                    const title = doc.querySelector('title')?.textContent || 
                                 doc.querySelector('h1')?.textContent || 
                                 gameName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    
                    // Try to extract description
                    const description = doc.querySelector('meta[name="description"]')?.content || 
                                      doc.querySelector('.game_description')?.textContent?.trim() || 
                                      '';
                    
                    // Try to extract image
                    const image = doc.querySelector('meta[property="og:image"]')?.content ||
                                 doc.querySelector('.screenshot img')?.src ||
                                 doc.querySelector('img[alt*="cover"]')?.src ||
                                 '';
                    
                    return {
                        name: title.replace(' - itch.io', '').trim(),
                        short_description: description,
                        header_image: image || 'https://img.itch.zone/aW1nLzE2NDU2NDAucG5n/original/itchio-logo.png',
                        genres: [] // Itch.io doesn't have standardized genres
                    };
                }
            } catch (fetchError) {
                console.warn('Could not fetch Itch.io page, using fallback data');
            }
            
            // Fallback: return basic data from URL
            return {
                name: gameName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                short_description: '',
                header_image: 'https://img.itch.zone/aW1nLzE2NDU2NDAucG5n/original/itchio-logo.png',
                genres: []
            };
        } catch (error) {
            console.error('Error fetching Itch.io data:', error);
            throw error;
        }
    }

    async handleSuggestSteamLinkInput(link) {
        const status = document.getElementById("suggest-steam-fetch-status");
        const preview = document.getElementById("suggest-steam-preview");
        
        if (!link.trim()) {
            status.classList.add('hidden');
            preview.classList.add('hidden');
            return;
        }
        
        status.classList.remove('hidden');
        status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Lade Spieldaten von Steam...';
        preview.classList.add('hidden');

        try {
            const appid = this.extractSteamAppId(link);
            if (!appid) {
                status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ungültiger Steam-Link!';
                return;
            }
            
            const gameData = await this.fetchSteamGameData(appid);
            this.displaySteamPreview(gameData, 'suggest-steam');
            status.classList.add('hidden');
        } catch (error) {
            console.error('Steam fetch error:', error);
            status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Fehler beim Laden der Spieldaten!';
        }
    }

    extractSteamAppId(link) {
        const match = link.match(/store\.steampowered\.com\/app\/(\d+)/);
        return match ? match[1] : null;
    }

    async fetchSteamGameData(appid) {
        // Check cache first
        const cacheKey = `steam_${appid}_en`;
        const cached = this.getSteamCache(cacheKey);
        if (cached) {
            return cached;
        }
        
        try {
            // Use faster CORS proxy with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch(`https://corsproxy.io/?https://store.steampowered.com/api/appdetails?appids=${appid}&l=english`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data[appid] || !data[appid].success) {
                throw new Error('Spiel nicht gefunden');
            }
            
            const gameData = data[appid].data;
            
            // Cache the result
            this.setSteamCache(cacheKey, gameData);
            
            return gameData;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Zeitüberschreitung beim Laden der Steam-Daten');
            }
            throw error;
        }
    }

    async bulkUpdateGenres() {
        try {
            this.showNotification('Starte Genre-Aktualisierung…', 'info');
            const snapshot = await db.collection('games').get();
            const docs = snapshot.docs;
            let updated = 0;
            let skipped = 0;

            for (const doc of docs) {
                const game = doc.data();
                const link = game.steamLink || game.link;
                if (!link) { skipped++; continue; }
                const appid = this.extractSteamAppId(link);
                if (!appid) { skipped++; continue; }
                try {
                    const data = await this.fetchSteamGameData(appid);
                    const newGenres = (data.genres || []).map(g => g.description);
                    if (newGenres && newGenres.length) {
                        await db.collection('games').doc(doc.id).update({ genres: newGenres });
                        updated++;
                    } else {
                        skipped++;
                    }
                } catch (e) {
                    console.error('Bulk update error for', doc.id, e);
                    skipped++;
                }
            }

            await this.renderGames();
            await this.updateGenreFilterButtons();
            this.showNotification(`Genres aktualisiert: ${updated}, übersprungen: ${skipped}`, 'success');
        } catch (error) {
            console.error('Bulk update failed:', error);
            this.showNotification('Fehler bei der Genre-Aktualisierung', 'error');
        }
    }

    displaySteamPreview(gameData, prefix) {
        const image = document.getElementById(`${prefix}-image`);
        const name = document.getElementById(`${prefix}-name`);
        const genres = document.getElementById(`${prefix}-genres`);
        const preview = document.getElementById(`${prefix}-preview`);

        image.src = gameData.header_image;
        name.textContent = gameData.name;
        genres.textContent = (gameData.genres || []).map(g => g.description).join(", ");
        preview.classList.remove('hidden');
        
        // Auto-fill manual fields if they exist
        if (prefix === 'steam') {
            document.getElementById('game-name').value = gameData.name;
            document.getElementById('game-description').value = gameData.short_description || '';
        }
    }

    async saveGame() {
        const linkInput = document.getElementById('steam-link').value.trim();
        const linkType = document.getElementById('game-link-type')?.value || 'steam';
        const manualName = document.getElementById('game-name').value.trim();
        const manualDescription = document.getElementById('game-description').value.trim();
        
        if (!linkInput) {
            this.showNotification('Bitte gib einen Link ein!', 'error');
            return;
        }
        
        if (!manualName) {
            this.showNotification('Bitte gib einen Spielnamen ein!', 'error');
            return;
        }
            
        try {
            let gameData;
            let gameToSave;

            if (linkType === 'itchio') {
                if (!this.isValidItchIoLink(linkInput)) {
                    this.showNotification('Ungültiger Itch.io-Link!', 'error');
                    return;
                }

                try {
                    gameData = await this.fetchItchIoGameData(linkInput);
                } catch (error) {
                    // If fetch fails, use fallback data
                    gameData = {
                        header_image: 'https://img.itch.zone/aW1nLzE2NDU2NDAucG5n/original/itchio-logo.png',
                        short_description: ''
                    };
                }

                gameToSave = {
                    name: manualName,
                    steamLink: linkInput, // Store Itch.io link in steamLink field for compatibility
                    itchIoLink: linkInput, // Also store in dedicated field
                    image: gameData.header_image || 'https://img.itch.zone/aW1nLzE2NDU2NDAucG5n/original/itchio-logo.png',
                    genres: [], // Itch.io games don't have standardized genres
                    description: manualDescription || gameData.short_description || "",
                    unreleased: false,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                };
            } else {
                // Steam handling
                const appid = this.extractSteamAppId(linkInput);
                if (!appid) {
                    this.showNotification('Ungültiger Steam-Link!', 'error');
                    return;
                }

                gameData = await this.fetchSteamGameData(appid);
                gameToSave = {
                    name: manualName, // Use manual input instead of Steam data
                    steamLink: linkInput,
                    image: gameData.header_image,
                    genres: (gameData.genres || []).map(g => g.description),
                    description: manualDescription || gameData.short_description || "", // Use manual input, fallback to Steam
                    unreleased: gameData.release_date && gameData.release_date.coming_soon === true,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                };
            }

            if (this.currentGameId) {
                // Update existing game
                await db.collection("games").doc(this.currentGameId).update(gameToSave);
                this.showNotification('Spiel erfolgreich bearbeitet! ✏️', 'success');
            } else {
                // Add new game
                gameToSave.isNew = true;
                await db.collection("games").add(gameToSave);
                this.showNotification('Spiel erfolgreich hinzugefügt! 🎮', 'success');
            }

            this.closeModal('game-form');
            this.resetGameForm();
            this.currentGameId = null;
            await this.renderGames();
        } catch (error) {
            console.error('Save game error:', error);
            this.showNotification('Fehler beim Speichern des Spiels!', 'error');
        }
    }

    async submitSuggestion() {
            const steamLink = document.getElementById('suggest-steam-link').value.trim();
            if (!steamLink) {
            this.showNotification('Bitte einen Steam-Link eingeben!', 'error');
                return;
            }

        try {
            const appid = this.extractSteamAppId(steamLink);
            if (!appid) {
                this.showNotification('Ungültiger Steam-Link!', 'error');
                return;
            }

            const gameData = await this.fetchSteamGameData(appid);
            const suggestionData = {
                name: gameData.name,
                        link: steamLink,
                image: gameData.header_image,
                genres: (gameData.genres || []).map(g => g.description),
                description: gameData.short_description || "",
                        isPending: true,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                unreleased: gameData.release_date && gameData.release_date.coming_soon === true
            };

            await db.collection('games').add(suggestionData);
            this.resetSuggestForm();
            this.closeModal('suggest-form');
            await this.updateSuggestionCount();
            this.showNotification('Vielen Dank für deinen Vorschlag! 🎉', 'success');
        } catch (error) {
            console.error('Submit suggestion error:', error);
            this.showNotification('Fehler beim Speichern des Vorschlags', 'error');
        }
    }

    // Social Media Functions
    async loadSocialLinks() {
        try {
            const doc = await db.collection("settings").doc("social").get();
            if (doc.exists) {
                const data = doc.data();
                this.updateSocialLinks(data);
                this.populateSocialForm(data);
            } else {
                // Wenn keine Daten in der Datenbank vorhanden sind, setze Standard-Links
                this.setDefaultFooterLinks();
            }
        } catch (error) {
            console.error("Error loading social links:", error);
            // Continue even if social links fail to load
            this.setDefaultFooterLinks();
        }
    }

    setDefaultFooterLinks() {
        // Setze Standard-Footer-Links für HigherCellF
        const defaultLinks = {
            'footer-instagram': 'https://www.instagram.com/awaytomoon22/',
            'footer-tiktok': 'https://www.tiktok.com/@away2moon',
            'footer-twitter': 'https://twitter.com/Away2Moon'
        };

        Object.entries(defaultLinks).forEach(([id, url]) => {
            const element = document.getElementById(id);
            if (element) {
                element.href = url;
            }
        });
    }

    updateSocialLinks(data) {
        const socialElements = {
            'tiktok-btn': data.tiktok,
            'discord-btn': data.discord,
            'instagram-btn': data.instagram,
            'kick-btn': data.kick,
            'footer-instagram': data.footerInstagram,
            'footer-tiktok': data.footerTiktok,
            'footer-twitter': data.footerTwitter
        };

        Object.entries(socialElements).forEach(([id, url]) => {
            const element = document.getElementById(id);
            if (element && url && url !== '#') {
                element.href = url;
            }
        });

        // Update logos
        if (data.headerLogo) document.getElementById("header-logo").src = data.headerLogo;
        if (data.logo) document.getElementById("favicon").href = data.logo;
        if (data.adminLogo) document.getElementById("admin-logo").src = data.adminLogo;
        // Corner Image wird nicht mehr aus der Datenbank geladen
        // if (data.cornerImage && data.cornerImage !== '#') document.getElementById("corner-image").src = data.cornerImage;
    }

    populateSocialForm(data) {
        const formFields = {
            'tiktok-link': data.tiktok || '',
            'discord-link': data.discord || '',
            'instagram-link': data.instagram || '',
            'kick-link': data.kick || '',
            'footer-instagram-link': data.footerInstagram || '',
            'footer-tiktok-link': data.footerTiktok || '',
            'footer-twitter-link': data.footerTwitter || '',
            'header-logo-link': data.headerLogo || '',
            'logo-link': data.logo || '',
            'admin-logo-link': data.adminLogo || '',
            'corner-image-link': data.cornerImage || ''
        };

        Object.entries(formFields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });
    }

    async saveSocialLinks() {
        try {
            const formData = {
                tiktok: document.getElementById("tiktok-link").value || "#",
                discord: document.getElementById("discord-link").value || "#",
                instagram: document.getElementById("instagram-link").value || "#",
                kick: document.getElementById("kick-link").value || "#",
                footerInstagram: document.getElementById("footer-instagram-link").value || "#",
                footerTiktok: document.getElementById("footer-tiktok-link").value || "#",
                footerTwitter: document.getElementById("footer-twitter-link").value || "#",
                logo: document.getElementById("logo-link").value || "#",
                headerLogo: document.getElementById("header-logo-link").value || "#",
                adminLogo: document.getElementById("admin-logo-link").value || "#",
                cornerImage: document.getElementById("corner-image-link").value || "#"
            };

            await db.collection("settings").doc("social").set(formData);
            await this.loadSocialLinks();
            this.closeModal('social-form');
            this.showNotification('Social Media Links gespeichert! 📱', 'success');
        } catch (error) {
            console.error("Error saving social links:", error);
            this.showNotification('Fehler beim Speichern der Links', 'error');
        }
    }

    // Filter and Tab Functions
    handleGenreFilter(genre) {
        if (genre === 'all') {
            this.activeGenres.clear();
            this.activeGenres.add('all');
            document.querySelectorAll('.genre-filter-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('.genre-filter-btn[data-genre="all"]').classList.add('active');
        } else {
            this.activeGenres.delete('all');
            document.querySelector('.genre-filter-btn[data-genre="all"]').classList.remove('active');
            
            if (this.activeGenres.has(genre)) {
                this.activeGenres.delete(genre);
                document.querySelector(`.genre-filter-btn[data-genre="${genre}"]`).classList.remove('active');
                
                if (this.activeGenres.size === 0) {
                    this.activeGenres.add('all');
                    document.querySelector('.genre-filter-btn[data-genre="all"]').classList.add('active');
                }
            } else {
                this.activeGenres.add(genre);
                document.querySelector(`.genre-filter-btn[data-genre="${genre}"]`).classList.add('active');
            }
        }
        
        this.renderGames();
    }

    handleTabChange(tabId) {
        this.currentTab = tabId.replace('tab-', '').replace('-games', '');
        
        document.querySelectorAll('.game-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        
        this.renderGames();
        this.updateGenreFilterButtons();
    }

    // Game Rendering Functions
    async renderGames() {
        try {
            this.showLoading();
            const gameList = document.getElementById("game-list");
            if (gameList) {
                gameList.innerHTML = "";
            }
            
            const snapshot = await db.collection("games").get();
            let games = [];
            
            snapshot.forEach(doc => {
                const gameData = doc.data();
                if (!gameData.isPending) {
                    // Ensure isHorror flag is set correctly based on genres
                    const hasHorrorGenre = gameData.genres && Array.isArray(gameData.genres) && gameData.genres.includes('Horror');
                    if (hasHorrorGenre && !gameData.isHorror) {
                        gameData.isHorror = true;
                    }
                    
                    if (this.shouldShowGame(gameData)) {
                            games.push({ id: doc.id, ...gameData });
                        }
                }
            });

            // Sort games based on current tab and filters
            this.sortGames(games);
            
            // Render games with animation
            if (gameList) {
                games.forEach((game, index) => {
                    const gameElement = this.createGameElement(game);
                    gameElement.style.animationDelay = `${index * 0.1}s`;
                    gameList.appendChild(gameElement);
                });
            }

            this.hideLoading();
        } catch (error) {
            console.error("Error rendering games:", error);
            this.showNotification('Fehler beim Laden der Spiele', 'error');
            this.hideLoading();
        }
    }

    shouldShowGame(gameData) {
        // Check tab filter first
        let showByTab = false;
        if (this.currentTab === 'unreleased') {
            showByTab = gameData.unreleased === true && gameData.played !== true;
        } else if (this.currentTab === 'played') {
            showByTab = gameData.played === true;
        } else if (this.currentTab === 'itchio') {
            // Show only Itch.io games
            const link = gameData.steamLink || gameData.link || '';
            showByTab = this.isValidItchIoLink(link) && !gameData.unreleased && !gameData.played;
        } else {
            // Show all games except Itch.io games
            const link = gameData.steamLink || gameData.link || '';
            showByTab = !gameData.unreleased && !gameData.played && !this.isValidItchIoLink(link);
        }
        
        if (!showByTab) return false;
        
        // Check genre filter
        if (this.activeGenres.has('all')) {
            return true;
        }
        
        // Check if game has any of the selected genres
        if (gameData.genres && Array.isArray(gameData.genres)) {
            return gameData.genres.some(genre => this.activeGenres.has(genre));
        }
        
        return false;
    }

    sortGames(games) {
        if (this.currentTab === 'all' && this.activeGenres.has('all') && this.originalGamesOrder.length > 0) {
            games.sort((a, b) => this.originalGamesOrder.indexOf(a.id) - this.originalGamesOrder.indexOf(b.id));
        }
    }

    createGameElement(game) {
        const gameElement = document.createElement('div');
        gameElement.className = 'game';
        gameElement.style.opacity = '0';
        gameElement.style.transform = 'translateY(20px)';
        
        const isHorror = game.isHorror || (game.genres && game.genres.includes('Horror'));
        if (isHorror) {
            gameElement.classList.add('horror-game');
        }
        
        gameElement.innerHTML = `
            ${isHorror ? '<div class="horror-badge"><i class="fas fa-ghost"></i> Horror</div>' : ''}
            <img src="${game.image}" alt="${game.name}" loading="lazy">
            <div class="game-content">
                <h2>${game.name}</h2>
                ${this.createAdminButtons(game)}
                ${this.createStreamerButtons(game)}
            </div>
        `;

        // Add click event to open game detail page
        gameElement.querySelector('img').addEventListener('click', () => {
            this.openGameDetail(game);
        });

        // Animate in
        setTimeout(() => {
            gameElement.style.transition = 'all 0.5s ease';
            gameElement.style.opacity = '1';
            gameElement.style.transform = 'translateY(0)';
        }, 100);

        return gameElement;
    }

    openGameDetail(game) {
        // Show game detail modal
        this.showGameDetailModal(game);
    }

    async showGameDetailModal(game) {
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
        
        // Create game detail modal with loading state
        const modal = document.createElement('div');
        modal.className = 'modal game-detail-modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content game-detail-content">
                <div class="game-detail-header">
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="game-detail-hero">
                    <img src="${game.image}" alt="${game.name}" class="game-detail-image">
                    <div class="game-detail-overlay">
                        <h1 class="game-detail-title">${game.name}</h1>
                        <div class="game-detail-genres">
                            ${(game.genres || []).map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="game-detail-body">
                    <div class="game-detail-description">
                        <h3>Beschreibung</h3>
                        <div class="loading-placeholder">
                            <div class="loading-spinner"></div>
                            <p>Lade Spielinformationen von Steam...</p>
                        </div>
                    </div>
                </div>
                
                <div class="game-detail-actions">
                    ${(() => {
                        const gameLink = game.steamLink || game.link || game.itchIoLink;
                        const isItchIo = this.isValidItchIoLink(gameLink);
                        const isSteam = this.isValidSteamLink(gameLink);
                        
                        if (isItchIo) {
                            return `
                                <a href="${gameLink}" target="_blank" class="steam-btn" style="background: linear-gradient(45deg, #fa5c5c, #ff6b6b);">
                                    <i class="fas fa-gamepad"></i>
                                    Auf Itch.io ansehen
                                </a>
                            `;
                        } else if (isSteam) {
                            return `
                                <a href="${gameLink}" target="_blank" class="steam-btn">
                                    <i class="fab fa-steam"></i>
                                    Auf Steam ansehen
                                </a>
                                <a href="https://steamdb.info/app/${this.extractSteamAppId(gameLink)}/" target="_blank" class="trailer-btn">
                                    <i class="fas fa-database"></i>
                                    SteamDB
                                </a>
                            `;
                        } else {
                            return `
                                <div class="steam-btn-disabled">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    Ungültiger Link
                                </div>
                            `;
                        }
                    })()}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        
        // Load Steam data
        await this.loadSteamGameData(game, modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeGameDetailModal(modal);
            }
        });
        
        // Close modal with close button
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeGameDetailModal(modal);
            });
        }
        
        // Close modal with Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeGameDetailModal(modal);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    async loadSteamGameData(game, modal) {
        // Show loading state immediately
        const descriptionElement = modal.querySelector('.game-detail-description');
        if (descriptionElement) {
            const gameLink = game.steamLink || game.link || game.itchIoLink;
            const isItchIo = this.isValidItchIoLink(gameLink);
            const loadingText = isItchIo ? 'Lade Spielinformationen von Itch.io...' : 'Lade Spielinformationen von Steam...';
            
            descriptionElement.innerHTML = `
                <h3>Beschreibung</h3>
                <div class="loading-placeholder">
                    <div class="loading-spinner"></div>
                    <p>${loadingText}</p>
                </div>
            `;
        }
        
        try {
            // Get the correct game link (check all fields)
            const gameLink = game.steamLink || game.link || game.itchIoLink;
            const isItchIo = this.isValidItchIoLink(gameLink);
            
            // Handle Itch.io games
            if (isItchIo) {
                try {
                    const itchData = await this.fetchItchIoGameData(gameLink);
                    this.updateGameInfo(modal, itchData, game);
                } catch (error) {
                    console.warn('Could not fetch Itch.io data, using fallback');
                    this.updateGameInfoWithFallback(modal, game);
                }
                return;
            }
            
            // Validate Steam link first
            if (!gameLink || !this.isValidSteamLink(gameLink)) {
                console.warn('Invalid or missing Steam link, using fallback data');
                this.updateGameInfoWithFallback(modal, game);
                return;
            }

            // Extract Steam App ID from Steam URL
            const steamAppId = this.extractSteamAppId(gameLink);
            
            if (!steamAppId) {
                console.warn('No Steam App ID found, using fallback data');
                this.updateGameInfoWithFallback(modal, game);
                return;
            }

            // Fetch Steam data with timeout
            const steamData = await Promise.race([
                this.fetchSteamData(steamAppId),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Zeitüberschreitung')), 8000)
                )
            ]);
            
            this.updateGameInfo(modal, steamData, game);
            
        } catch (error) {
            console.error('Error loading Steam data:', error);
            
            // Show user-friendly error message
            if (descriptionElement) {
                const errorMessage = error.message.includes('Zeitüberschreitung') 
                    ? 'Die Anfrage dauerte zu lange. Bitte versuchen Sie es später erneut.'
                    : 'Steam-Daten konnten nicht geladen werden.';
                
                descriptionElement.innerHTML = `
                    <h3>Beschreibung</h3>
                    <p>${game.description || 'Keine Beschreibung verfügbar.'}</p>
                    <div style="margin-top: 15px; padding: 10px; background: rgba(255, 107, 107, 0.1); border-left: 3px solid #ff6b6b; border-radius: 5px;">
                        <small style="color: #ff6b6b;">
                            <i class="fas fa-exclamation-triangle"></i> 
                            ${errorMessage}
                            <a href="${game.steamLink || game.link}" target="_blank" style="color: #ff6b6b; margin-left: 5px;">Auf Steam ansehen</a> für aktuelle Informationen.
                        </small>
                    </div>
                `;
            } else {
                this.updateGameInfoWithFallback(modal, game);
            }
        }
    }

    isValidSteamLink(steamUrl) {
        if (!steamUrl || typeof steamUrl !== 'string') return false;
        
        // Check if it's a valid Steam store URL
        const steamPattern = /^https?:\/\/(store\.steampowered\.com|steamcommunity\.com)\/app\/\d+/;
        return steamPattern.test(steamUrl);
    }

    extractSteamAppId(steamUrl) {
        if (!steamUrl) return null;
        
        // Extract App ID from Steam URL
        const match = steamUrl.match(/store\.steampowered\.com\/app\/(\d+)/);
        return match ? match[1] : null;
    }

    async fetchSteamData(appId) {
        // Check cache first
        const cacheKey = `steam_${appId}_de`;
        const cached = this.getSteamCache(cacheKey);
        if (cached) {
            return cached;
        }
        
        // Fast CORS proxy - tried and tested
        const proxies = [
            'https://corsproxy.io/?',
            'https://api.allorigins.win/raw?url=',
            'https://cors-anywhere.herokuapp.com/'
        ];
        
        // Try fastest proxy first (corsproxy.io)
        const steamUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&l=german`;
        
        // Try proxies in parallel - use first successful response
        const fetchPromises = proxies.map((proxy, index) => {
            return this.fetchWithTimeout(
                proxy + encodeURIComponent(steamUrl),
                4000, // 4 second timeout per proxy
                index
            ).catch(error => {
                // Return null on error so Promise.race continues
                return null;
            });
        });
        
        // Race: Use the first successful response
        const results = await Promise.allSettled(fetchPromises);
        
        // Find first successful result
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                // Cache the result
                this.setSteamCache(cacheKey, result.value);
                return result.value;
            }
        }
        
        // If all failed, try direct fetch as last resort
        try {
            const directResponse = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=german`, {
                mode: 'no-cors'
            }).catch(() => null);
            
            if (directResponse && directResponse.ok) {
                const data = await directResponse.json();
                const gameData = data[appId]?.data;
                if (gameData) {
                    this.setSteamCache(cacheKey, gameData);
                    return gameData;
                }
            }
        } catch (e) {
            // Ignore direct fetch errors
        }
        
        throw new Error('Steam API nicht verfügbar - alle Proxies fehlgeschlagen');
    }
    
    async fetchWithTimeout(url, timeout, proxyIndex) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const appId = Object.keys(data)[0];
            
            if (data[appId] && data[appId].success) {
                return data[appId].data;
            }
            throw new Error('Steam data not found');
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(`Proxy ${proxyIndex + 1} timeout`);
            }
            throw error;
        }
    }
    
    // Cache management
    getSteamCache(key) {
        // Check memory cache first
        if (this.steamDataCache.has(key)) {
            const cached = this.steamDataCache.get(key);
            // Check if cache is still valid (24 hours)
            if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
                return cached.data;
            }
            this.steamDataCache.delete(key);
        }
        
        // Check localStorage cache
        try {
            const stored = localStorage.getItem(`steam_cache_${key}`);
            if (stored) {
                const cached = JSON.parse(stored);
                if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
                    // Also store in memory cache
                    this.steamDataCache.set(key, cached);
                    return cached.data;
                }
                localStorage.removeItem(`steam_cache_${key}`);
            }
        } catch (e) {
            console.warn('Cache read error:', e);
        }
        
        return null;
    }
    
    setSteamCache(key, data) {
        const cacheEntry = {
            data: data,
            timestamp: Date.now()
        };
        
        // Store in memory cache
        this.steamDataCache.set(key, cacheEntry);
        
        // Store in localStorage (limit to 50 entries to avoid storage issues)
        try {
            const keys = Object.keys(localStorage).filter(k => k.startsWith('steam_cache_'));
            if (keys.length >= 50) {
                // Remove oldest entries
                const entries = keys.map(k => ({
                    key: k,
                    timestamp: JSON.parse(localStorage.getItem(k)).timestamp
                })).sort((a, b) => a.timestamp - b.timestamp);
                
                // Remove oldest 10 entries
                entries.slice(0, 10).forEach(e => localStorage.removeItem(e.key));
            }
            
            localStorage.setItem(`steam_cache_${key}`, JSON.stringify(cacheEntry));
        } catch (e) {
            console.warn('Cache write error:', e);
            // If storage is full, clear old entries
            if (e.name === 'QuotaExceededError') {
                const keys = Object.keys(localStorage).filter(k => k.startsWith('steam_cache_'));
                keys.slice(0, 20).forEach(k => localStorage.removeItem(k));
            }
        }
    }

    updateGameInfo(modal, steamData, game) {
        // Update description with rich content
        const descriptionElement = modal.querySelector('.game-detail-description');
        const description = steamData.short_description || game.description || 'Keine Beschreibung verfügbar.';
        
        // Add additional info if available
        let additionalInfo = '';
        
        if (steamData.release_date && steamData.release_date.date) {
            additionalInfo += `<div class="info-item">
                <span class="info-label"><i class="fas fa-calendar"></i> Veröffentlichung:</span>
                <span class="info-value">${steamData.release_date.date}</span>
            </div>`;
        }
        
        if (steamData.developers && steamData.developers.length > 0) {
            additionalInfo += `<div class="info-item">
                <span class="info-label"><i class="fas fa-code"></i> Entwickler:</span>
                <span class="info-value">${steamData.developers.join(', ')}</span>
            </div>`;
        }
        
        if (steamData.publishers && steamData.publishers.length > 0) {
            additionalInfo += `<div class="info-item">
                <span class="info-label"><i class="fas fa-building"></i> Publisher:</span>
                <span class="info-value">${steamData.publishers.join(', ')}</span>
            </div>`;
        }
        
        if (steamData.price_overview) {
            const price = steamData.price_overview.final_formatted || steamData.price_overview.final / 100 + '€';
            additionalInfo += `<div class="info-item">
                <span class="info-label"><i class="fas fa-euro-sign"></i> Preis:</span>
                <span class="info-value">${price}</span>
            </div>`;
        }
        
        descriptionElement.innerHTML = `
            <h3>Beschreibung</h3>
            <p>${description}</p>
            ${additionalInfo ? `<div class="info-grid" style="margin-top: 20px;">${additionalInfo}</div>` : ''}
        `;
    }

    updateGameInfoWithFallback(modal, game) {
        // Update description
        const descriptionElement = modal.querySelector('.game-detail-description');
        
        // Check if link is valid (check all fields)
        const gameLink = game.steamLink || game.link || game.itchIoLink;
        const isItchIo = this.isValidItchIoLink(gameLink);
        const isSteam = this.isValidSteamLink(gameLink);
        
        descriptionElement.innerHTML = `
            <h3>Beschreibung</h3>
            <p>${game.description || 'Keine Beschreibung verfügbar.'}</p>
            ${isItchIo ? `
                <div style="margin-top: 15px; padding: 10px; background: rgba(250, 92, 92, 0.1); border-left: 3px solid #fa5c5c; border-radius: 5px;">
                    <small style="color: #fa5c5c;">
                        <i class="fas fa-info-circle"></i> 
                        Itch.io-Spiel. 
                        <a href="${gameLink}" target="_blank" style="color: #fa5c5c;">Auf Itch.io ansehen</a> für aktuelle Informationen.
                    </small>
                </div>
            ` : isSteam ? `
                <div style="margin-top: 15px; padding: 10px; background: rgba(255, 193, 7, 0.1); border-left: 3px solid #ffc107; border-radius: 5px;">
                    <small style="color: #ffc107;">
                        <i class="fas fa-info-circle"></i> 
                        Steam-Daten nicht verfügbar (CORS-Beschränkungen). 
                        <a href="${gameLink}" target="_blank" style="color: #ffc107;">Auf Steam ansehen</a> für aktuelle Informationen.
                    </small>
                </div>
            ` : `
                <div style="margin-top: 15px; padding: 10px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 5px;">
                    <small style="color: #ef4444;">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Ungültiger oder fehlender Link. Bitte kontaktieren Sie den Administrator.
                    </small>
                </div>
            `}
        `;
    }


    closeGameDetailModal(modal) {
        // Restore background scrolling
        document.body.style.overflow = '';
        
        // Remove modal
        if (modal && modal.parentNode) {
            modal.remove();
        }
    }

    createGenreTags(genres) {
        if (!genres || !Array.isArray(genres)) return '';

        if (!this._genreColorMap) this._genreColorMap = {};

        return genres.map(originalGenre => {
            const genre = this.translateGenreToEnglish(originalGenre);
            if (!this._genreColorMap[genre]) {
                const style = this.generateDeterministicGenreStyle(genre);
                this._genreColorMap[genre] = style;
            }
            const styleAttr = `style=\"${this._genreColorMap[genre]}\"`;
            return `<div class=\"genre-tag\" data-genre=\"${genre}\" ${styleAttr}>${genre}</div>`;
        }).join('');
    }

    // Erzeugt eine deterministische Farb-Gradient-Style-String pro Genre
    generateDeterministicGenreStyle(genre) {
        const hue = this.hashStringToHue(genre);
        const color1 = `hsl(${hue}, 72%, 56%)`;
        const color2 = `hsl(${(hue + 28) % 360}, 72%, 42%)`;
        // Textfarbe fix auf weiß, damit gute Lesbarkeit – mit !important um CSS-Overrides zu schlagen
        return `background: linear-gradient(45deg, ${color1}, ${color2}) !important; color: #fff !important;`;
    }

    // Wandelt String deterministisch in einen Hue-Wert [0,360)
    hashStringToHue(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0; // 32-bit
        }
        // Golden angle offset für bessere Verteilung verschiedener Genres
        const golden = 137.508;
        const base = Math.abs(hash % 360);
        return Math.floor((base + golden) % 360);
    }

    createAdminButtons(game) {
        if (document.getElementById('admin-panel').classList.contains('hidden') || !this.isEditMode) {
            return '';
        }

        const isHorror = game.isHorror || (game.genres && game.genres.includes('Horror'));
        
        return `
            <div class="admin-buttons">
                <button class="delete-game" onclick="gamingPlatform.deleteGame('${game.id}')" title="Spiel löschen">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="edit-game" onclick="gamingPlatform.editGame('${game.id}')" title="Spiel bearbeiten">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="toggle-unreleased-btn" onclick="gamingPlatform.toggleUnreleased('${game.id}', ${game.unreleased})" title="${game.unreleased ? 'Als Released markieren' : 'Als Unreleased markieren'}">
                    <i class="fas fa-${game.unreleased ? 'check' : 'clock'}"></i>
                </button>
                <button class="toggle-played-btn" onclick="gamingPlatform.togglePlayed('${game.id}', ${game.played})" title="${game.played ? 'Als nicht gespielt markieren' : 'Als gespielt markieren'}">
                    <i class="fas fa-${game.played ? 'undo' : 'check-circle'}"></i>
                </button>
                <button class="toggle-horror-btn" onclick="gamingPlatform.toggleHorror('${game.id}', ${isHorror})" title="${isHorror ? 'Horror-Markierung entfernen' : 'Als Horror markieren'}">
                    <i class="fas fa-${isHorror ? 'ghost' : 'ghost'}"></i>
                </button>
            </div>
        `;
    }

    createStreamerButtons(game) {
        if (!this.isStreamerLoggedIn) {
            return '';
        }

        return `
            <div class="streamer-buttons">
                <button class="streamer-played-btn" onclick="gamingPlatform.toggleStreamerPlayed('${game.id}', ${game.played})" title="${game.played ? 'Als nicht im Stream gespielt markieren' : 'Als im Stream gespielt markieren'}">
                    <i class="fas fa-${game.played ? 'undo' : 'check-circle'}"></i>
                    ${game.played ? 'Nicht gespielt' : 'Gespielt'}
                </button>
            </div>
        `;
    }

    // Admin Game Management
    async deleteGame(gameId) {
        if (!confirm('Möchten Sie dieses Spiel wirklich löschen?')) return;
        
        try {
            await db.collection("games").doc(gameId).delete();
            await this.renderGames();
            this.showNotification('Spiel erfolgreich gelöscht! 🗑️', 'success');
                    } catch (error) {
                        console.error("Error deleting game:", error);
            this.showNotification('Fehler beim Löschen des Spiels', 'error');
        }
    }

    async editGame(gameId) {
        try {
            this.currentGameId = gameId;
            const gameDoc = await db.collection("games").doc(gameId).get();
            
            if (!gameDoc.exists) {
                this.showNotification('Spiel nicht gefunden!', 'error');
                return;
            }
            
            const gameData = gameDoc.data();
            
            // Determine if it's an Itch.io game
            const gameLink = gameData.steamLink || gameData.link || gameData.itchIoLink || '';
            const isItchIo = this.isValidItchIoLink(gameLink);
            
            // Set link type selector
            const linkTypeSelect = document.getElementById('game-link-type');
            if (linkTypeSelect) {
                linkTypeSelect.value = isItchIo ? 'itchio' : 'steam';
                const linkLabel = document.getElementById('link-label');
                const linkInput = document.getElementById('steam-link');
                if (isItchIo) {
                    linkLabel.textContent = 'Itch.io-Link';
                    linkInput.placeholder = 'Itch.io-Link einfügen (z.B. https://username.itch.io/gamename)';
                } else {
                    linkLabel.textContent = 'Steam-Link';
                    linkInput.placeholder = 'Steam-Link einfügen';
                }
            }
            
            // Populate form with existing data
            document.getElementById('steam-link').value = gameLink;
            document.getElementById('steam-name').textContent = gameData.name || '';
            document.getElementById('steam-genres').textContent = (gameData.genres || []).map(g => g.description || g).join(", ");
            
            // Populate manual fields
            document.getElementById('game-name').value = gameData.name || '';
            document.getElementById('game-description').value = gameData.description || '';
            
            // Show preview if image exists
            if (gameData.image) {
                document.getElementById('steam-image').src = gameData.image;
                document.getElementById('steam-preview').classList.remove('hidden');
            }
            
            // Change form title and button
            const formTitle = document.querySelector('#game-form h2');
            const saveButton = document.getElementById('save-game');
            
            formTitle.innerHTML = '<i class="fas fa-edit"></i> Spiel bearbeiten';
            saveButton.innerHTML = '<i class="fas fa-save"></i> Änderungen speichern';
            
            this.openModal('game-form');
            
        } catch (error) {
            console.error('Error loading game for edit:', error);
            this.showNotification('Fehler beim Laden des Spiels', 'error');
        }
    }

    async toggleUnreleased(gameId, currentStatus) {
        try {
            await db.collection("games").doc(gameId).update({ unreleased: !currentStatus });
            await this.renderGames();
            this.showNotification(`Spiel als ${!currentStatus ? 'Unreleased' : 'Released'} markiert!`, 'success');
        } catch (error) {
            console.error("Error toggling unreleased:", error);
            this.showNotification('Fehler beim Umschalten des Status', 'error');
        }
    }

    async togglePlayed(gameId, currentStatus) {
        try {
            await db.collection("games").doc(gameId).update({ played: !currentStatus });
            await this.renderGames();
            this.showNotification(`Spiel als ${!currentStatus ? 'gespielt' : 'nicht gespielt'} markiert!`, 'success');
        } catch (error) {
            console.error("Error toggling played:", error);
            this.showNotification('Fehler beim Umschalten des Status', 'error');
        }
    }

    async toggleHorror(gameId, currentStatus) {
        try {
            const gameDoc = await db.collection("games").doc(gameId).get();
            if (!gameDoc.exists) {
                this.showNotification('Spiel nicht gefunden!', 'error');
                return;
            }
            
            const gameData = gameDoc.data();
            const currentGenres = gameData.genres || [];
            const hasHorrorGenre = currentGenres.includes('Horror');
            const newHorrorStatus = !currentStatus;
            
            let updatedGenres = [...currentGenres];
            
            if (newHorrorStatus && !hasHorrorGenre) {
                // Horror hinzufügen
                updatedGenres.push('Horror');
            } else if (!newHorrorStatus && hasHorrorGenre) {
                // Horror entfernen
                updatedGenres = updatedGenres.filter(g => g !== 'Horror');
            }
            
            await db.collection("games").doc(gameId).update({ 
                isHorror: newHorrorStatus,
                genres: updatedGenres
            });
            
            await this.renderGames();
            await this.updateGenreFilterButtons();
            this.showNotification(`Spiel als ${newHorrorStatus ? 'Horror' : 'nicht Horror'} markiert! 👻`, 'success');
        } catch (error) {
            console.error("Error toggling horror:", error);
            this.showNotification('Fehler beim Umschalten der Horror-Markierung', 'error');
        }
    }

    // Streamer Game Management
    async toggleStreamerPlayed(gameId, currentStatus) {
        try {
            await db.collection("games").doc(gameId).update({ played: !currentStatus });
            await this.renderGames();
            this.showNotification(`Spiel als ${!currentStatus ? 'im Stream gespielt' : 'nicht im Stream gespielt'} markiert!`, 'success');
        } catch (error) {
            console.error("Error toggling streamer played:", error);
            this.showNotification('Fehler beim Umschalten des Streamer-Status', 'error');
        }
    }

    // Randomizer Functions
    async startRandomizer() {
        try {
            const snapshot = await db.collection('games').get();
            const games = [];
            
            snapshot.forEach(doc => {
                const game = doc.data();
                // Nur normale Spiele (nicht unreleased, nicht played, nicht pending)
                if (!game.isPending && !game.unreleased && !game.played) {
                    games.push(game);
                }
            });

            if (games.length === 0) {
                this.showNotification('Keine verfügbaren Spiele für den Randomizer!', 'error');
                return;
            }

            this.showRandomizerModal(games);
        } catch (error) {
            console.error('Randomizer error:', error);
            this.showNotification('Fehler beim Laden der Spiele', 'error');
        }
    }

    showRandomizerModal(games) {
        this.openModal('randomizer-modal');
        this.animateRandomizer(games);
    }

    async animateRandomizer(games) {
        const previewContainer = document.querySelector('.preview-container');
        const gameCard = document.querySelector('.game-card');
        
        // Clear previous content
        previewContainer.innerHTML = '';
            gameCard.classList.remove('active');
            
        // Select random game
        const selectedGame = games[Math.floor(Math.random() * games.length)];
        
        // Show preview animation
            previewContainer.classList.add('active');
            
        // Create preview sequence
        const previewGames = [...games].sort(() => Math.random() - 0.5).slice(0, 15);
            previewGames.push(selectedGame);

            let currentIndex = 0;
            const showNextPreview = () => {
                const prevPreview = previewContainer.querySelector('.preview-image.active');
                if (prevPreview) {
                    prevPreview.classList.add('fade-out');
                setTimeout(() => prevPreview.remove(), 150);
                }

                const previewDiv = document.createElement('div');
                previewDiv.className = 'preview-image';
            previewDiv.innerHTML = `<img src="${previewGames[currentIndex].image}" alt="${previewGames[currentIndex].name}">`;
                previewContainer.appendChild(previewDiv);

            setTimeout(() => previewDiv.classList.add('active'), 50);

                currentIndex++;

                if (currentIndex < previewGames.length) {
                setTimeout(showNextPreview, 100);
                } else {
                    setTimeout(() => {
                        previewContainer.classList.remove('active');
                    gameCard.querySelector('img').src = selectedGame.image;
                    gameCard.querySelector('h3').textContent = selectedGame.name;
                        gameCard.classList.add('active');
                    
                    // Store selected game for play button
                    gameCard.dataset.gameLink = selectedGame.link;
                }, 300);
            }
        };

            showNextPreview();
    }

    playRandomGame() {
        const gameCard = document.querySelector('.game-card');
        const gameLink = gameCard.dataset.gameLink;
        if (gameLink) {
            window.open(gameLink, '_blank');
        }
    }

    closeRandomizer() {
        const previewContainer = document.querySelector('.preview-container');
        const gameCard = document.querySelector('.game-card');
        
                gameCard.classList.remove('active');
                previewContainer.classList.remove('active');
                previewContainer.innerHTML = '';
        
        this.closeModal('randomizer-modal');
    }

    // Utility Functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    closeAllModals() {
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
            // Don't close support modal
            if (!modal.classList.contains('support-modal-no-close')) {
                this.closeModal(modal.id);
            }
        });
    }

    resetGameForm() {
        document.getElementById("steam-link").value = "";
        document.getElementById("steam-fetch-status").classList.add('hidden');
        document.getElementById("steam-preview").classList.add('hidden');
        document.getElementById("steam-name").textContent = "";
        document.getElementById("steam-genres").textContent = "";
        document.getElementById("steam-image").src = "";
        document.getElementById('game-form').dataset.steamGame = "";
        
        // Reset manual fields
        document.getElementById("game-name").value = "";
        document.getElementById("game-description").value = "";
        
        // Reset link type selector
        const linkTypeSelect = document.getElementById('game-link-type');
        if (linkTypeSelect) {
            linkTypeSelect.value = 'steam';
            const linkLabel = document.getElementById('link-label');
            if (linkLabel) linkLabel.textContent = 'Steam-Link';
            const linkInput = document.getElementById('steam-link');
            if (linkInput) linkInput.placeholder = 'Steam-Link einfügen';
        }
    }

    resetSuggestForm() {
        document.getElementById('suggest-steam-link').value = '';
        document.getElementById('suggest-steam-fetch-status').classList.add('hidden');
        document.getElementById('suggest-steam-preview').classList.add('hidden');
    }

    showLoading() {
        this.isLoading = true;
        document.getElementById('loading-indicator').classList.remove('hidden');
    }

    hideLoading() {
        this.isLoading = false;
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas fa-${icons[type]}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Manual close
        notification.querySelector('.notification-close').onclick = () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        };
    }

    async updateGenreFilterButtons() {
        try {
            const genreSet = new Set();
            const snapshot = await db.collection("games").get();

            snapshot.forEach(doc => {
                const game = doc.data();
                let includeByTab = false;
                if (this.currentTab === 'unreleased') {
                    includeByTab = game.unreleased === true && game.played !== true && !game.isPending;
                } else if (this.currentTab === 'played') {
                    includeByTab = game.played === true && !game.isPending;
                } else if (this.currentTab === 'itchio') {
                    const link = game.steamLink || game.link || '';
                    includeByTab = this.isValidItchIoLink(link) && !game.unreleased && !game.played && !game.isPending;
                } else {
                    const link = game.steamLink || game.link || '';
                    includeByTab = !game.unreleased && !game.played && !game.isPending && !this.isValidItchIoLink(link);
                }
                if (!includeByTab) return;

                if (Array.isArray(game.genres)) {
                    game.genres.forEach(g => genreSet.add(this.translateGenreToEnglish(g)));
                }
            });

            const container = document.querySelector('.genre-filter-buttons');
            if (container) {
                const existingButtons = container.querySelectorAll('.genre-filter-btn:not([data-genre="all"])');

                existingButtons.forEach(btn => {
                    if (!genreSet.has(btn.dataset.genre)) {
                        btn.remove();
                    }
                });

                Array.from(genreSet).sort().forEach(genre => {
                    if (!container.querySelector(`[data-genre="${genre}"]`)) {
                        const btn = document.createElement('button');
                        btn.className = 'genre-filter-btn';
                        btn.dataset.genre = genre;
                        btn.innerHTML = `<i class="fas fa-${this.getGenreIcon(genre)}"></i> ${genre}`;
                        btn.addEventListener('click', () => this.handleGenreFilter(genre));
                        container.appendChild(btn);
                    }
                });
            }
        } catch (error) {
            console.error('Error updating genre filters:', error);
            // Continue even if genre filters fail to load
        }
    }

    getGenreIcon(genre) {
        const icons = {
            'Action': 'fire',
            'Adventure': 'compass',
            'Soulslike': 'skull',
            'Shooter': 'crosshairs',
            'Sports': 'futbol',
            'Strategy': 'chess',
            'Puzzle': 'puzzle-piece',
            'Roblox': 'cube',
            'Horror': 'ghost',
            'Story': 'book-open',
            'Survival': 'shield-alt',
            'Indie': 'record-vinyl',
            'Simulation': 'vials',
            'RPG': 'hat-wizard',
            'Casual': 'gamepad',
            'Free To Play': 'ticket-alt',
            'Multiplayer': 'users',
            'Singleplayer': 'user',
            'Racing': 'flag-checkered',
            'Platformer': 'grip-lines'
        };
        return icons[genre] || 'gamepad';
    }

    async updateSuggestionCount() {
        try {
            const snapshot = await db.collection('games').where('isPending', '==', true).get();
            const count = snapshot.size;
            const badge = document.getElementById('suggestion-count');
            
            if (badge) {
                if (count > 0) {
                    badge.textContent = count;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('Error updating suggestion count:', error);
            // Continue even if suggestion count fails to load
        }
    }

    // Function to validate and fix Steam links
    async validateSteamLinks() {
        try {
            this.showNotification('Validiere Steam-Links...', 'info');
            const snapshot = await db.collection('games').get();
            const invalidGames = [];
            const validGames = [];
            
            snapshot.forEach(doc => {
                const game = doc.data();
                if (!game.isPending) {
                    const steamLink = game.steamLink || game.link;
                    if (!this.isValidSteamLink(steamLink)) {
                        invalidGames.push({
                            id: doc.id,
                            name: game.name,
                            link: steamLink
                        });
                    } else {
                        validGames.push({
                            id: doc.id,
                            name: game.name
                        });
                    }
                }
            });
            
            if (invalidGames.length > 0) {
                console.warn('Found games with invalid Steam links:', invalidGames);
                this.showNotification(`${invalidGames.length} Spiele haben ungültige Steam-Links`, 'warning');
                
                // Show detailed modal with invalid games
                this.showInvalidLinksModal(invalidGames);
            } else {
                this.showNotification(`Alle ${validGames.length} Spiele haben gültige Steam-Links! ✅`, 'success');
            }
            
            return invalidGames;
        } catch (error) {
            console.error('Error validating Steam links:', error);
            this.showNotification('Fehler beim Validieren der Steam-Links', 'error');
            return [];
        }
    }

    showInvalidLinksModal(invalidGames) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        let gamesListHtml = '';
        invalidGames.forEach(game => {
            gamesListHtml += `
                <div class="invalid-game-item">
                    <div class="game-info">
                        <h4>${game.name}</h4>
                        <p class="invalid-link">${game.link || 'Kein Link vorhanden'}</p>
                    </div>
                    <div class="game-actions">
                        <button onclick="gamingPlatform.editGame('${game.id}')" class="edit-invalid-btn">
                            <i class="fas fa-edit"></i> Bearbeiten
                        </button>
                    </div>
                </div>
            `;
        });
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2><i class="fas fa-exclamation-triangle"></i> Ungültige Steam-Links gefunden</h2>
                <div class="invalid-games-list">
                    ${gamesListHtml}
                </div>
                <div class="modal-actions">
                    <button onclick="this.closest('.modal').remove()" class="close-btn">
                        <i class="fas fa-times"></i> Schließen
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').onclick = () => {
            modal.remove();
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
    }

    async migrateUnreleasedFlag() {
        try {
            const snapshot = await db.collection('games').get();
            const batch = db.batch();
            let needsUpdate = false;
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (typeof data.unreleased === 'undefined') {
                    batch.update(db.collection('games').doc(doc.id), { unreleased: false });
                    needsUpdate = true;
                }
            });
            
            if (needsUpdate) {
                await batch.commit();
            }
        } catch (error) {
            console.error('Migration error:', error);
            // Continue even if migration fails
        }
    }

    async migrateGenresToEnglish() {
        try {
            const snapshot = await db.collection('games').get();
            const batch = db.batch();
            let needsUpdate = false;
            
            // Mapping von deutschen zu englischen Genres
            const genreMapping = {
                'Sport': 'Sports',
                'Sports': 'Sports',
                'Strategie': 'Strategy',
                'Rätsel': 'Puzzle',
                'Abenteuer': 'Adventure',
                'Simulation': 'Simulation',
                'Simulationen': 'Simulation',
                'Gelegenheitsspiele': 'Casual',
                'Gelegenheitsspiel': 'Casual',
                'Rollenspiel': 'RPG',
                'Überleben': 'Survival',
                'Kostenlos': 'Free To Play',
                'Kostenlos spielen': 'Free To Play',
                'Einzelspieler': 'Singleplayer',
                'Mehrspieler': 'Multiplayer',
                'Rennen': 'Racing',
                'Plattform': 'Platformer',
                'Plattformer': 'Platformer'
            };
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.genres && Array.isArray(data.genres)) {
                    const updatedGenres = data.genres.map(genre => {
                        const key = typeof genre === 'string' ? genre.trim() : genre;
                        return genreMapping[key] || key;
                    });
                    
                    // Prüfen ob sich etwas geändert hat
                    if (JSON.stringify(updatedGenres) !== JSON.stringify(data.genres)) {
                        batch.update(db.collection('games').doc(doc.id), { genres: updatedGenres });
                        needsUpdate = true;
                    }
                }
            });
            
            if (needsUpdate) {
                await batch.commit();
                console.log('Genre migration completed');
            }
        } catch (error) {
            console.error('Genre migration error:', error);
            // Continue even if genre migration fails
        }
    }

    async migrateSteamLinks() {
        try {
            const snapshot = await db.collection('games').get();
            const batch = db.batch();
            let needsUpdate = false;
            
            snapshot.forEach(doc => {
                const data = doc.data();
                
                // If game has 'link' but no 'steamLink', copy it
                if (data.link && !data.steamLink) {
                    batch.update(db.collection('games').doc(doc.id), { steamLink: data.link });
                    needsUpdate = true;
                }
            });
            
            if (needsUpdate) {
                await batch.commit();
                console.log('Steam links migration completed');
            }
        } catch (error) {
            console.error('Steam links migration error:', error);
            // Continue even if migration fails
        }
    }

    async migrateHorrorFlag() {
        try {
            const snapshot = await db.collection('games').get();
            const batch = db.batch();
            let needsUpdate = false;
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const hasHorrorGenre = data.genres && Array.isArray(data.genres) && data.genres.includes('Horror');
                
                // If game has Horror genre but no isHorror flag, set it
                if (hasHorrorGenre && !data.isHorror) {
                    batch.update(db.collection('games').doc(doc.id), { isHorror: true });
                    needsUpdate = true;
                }
                // If game doesn't have Horror genre but has isHorror flag, remove flag
                else if (!hasHorrorGenre && data.isHorror) {
                    batch.update(db.collection('games').doc(doc.id), { isHorror: false });
                    needsUpdate = true;
                }
            });
            
            if (needsUpdate) {
                await batch.commit();
                console.log('Horror flag migration completed');
            }
        } catch (error) {
            console.error('Horror flag migration error:', error);
            // Continue even if migration fails
        }
    }

    async viewSuggestions() {
        try {
            const snapshot = await db.collection('games').where('isPending', '==', true).get();
            
            if (snapshot.empty) {
                this.showNotification('Keine Vorschläge vorhanden', 'info');
                return;
            }

            let suggestionsHtml = '<div class="suggestions-list">';
            
            snapshot.forEach(doc => {
                const suggestion = doc.data();
                const genresHtml = suggestion.genres && suggestion.genres.length > 0 
                    ? suggestion.genres.map(genre => 
                        `<span class="genre-tag" data-genre="${genre}">${genre}</span>`
                    ).join('') 
                    : '';

                suggestionsHtml += `
                    <div class="suggestion-item">
                        <img src="${suggestion.image}" alt="${suggestion.name}">
                        <div class="suggestion-details">
                            <h3>${suggestion.name}</h3>
                            <div class="suggestion-genres">
                                ${genresHtml}
                            </div>
                        </div>
                        <div class="suggestion-actions">
                            <button onclick="gamingPlatform.acceptSuggestion('${doc.id}')" class="accept-btn">
                                <i class="fas fa-check"></i> Akzeptieren
                            </button>
                            <button onclick="gamingPlatform.deleteSuggestion('${doc.id}')" class="delete-btn">
                                <i class="fas fa-times"></i> Ablehnen
                            </button>
                        </div>
                    </div>
                `;
            });
            
            suggestionsHtml += '</div>';

            // Create modal for suggestions
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content suggest-content">
                    <span class="close-modal">&times;</span>
                    <h2><i class="fas fa-lightbulb"></i> Spielvorschläge</h2>
                    ${suggestionsHtml}
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('.close-modal').onclick = () => {
                modal.remove();
            };
            
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            };
        } catch (error) {
            console.error('Error loading suggestions:', error);
            this.showNotification('Fehler beim Laden der Vorschläge', 'error');
        }
    }

    async acceptSuggestion(id) {
        try {
            const suggestionDoc = await db.collection('games').doc(id).get();
            const suggestionData = suggestionDoc.data();

            const { isPending, ...gameData } = suggestionData;
            
            await db.collection('games').add({
                ...gameData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            await db.collection('games').doc(id).delete();
            await this.updateSuggestionCount();
            
            document.querySelector('.modal').remove();
            this.showNotification('Vorschlag wurde akzeptiert! ✅', 'success');
            await this.renderGames();
        } catch (error) {
            console.error('Error accepting suggestion:', error);
            this.showNotification('Fehler beim Akzeptieren des Vorschlags', 'error');
        }
    }

    async deleteSuggestion(id) {
        if (!confirm('Möchten Sie diesen Vorschlag wirklich ablehnen?')) return;
        
        try {
            await db.collection('games').doc(id).delete();
            await this.updateSuggestionCount();
            
            document.querySelector('.modal').remove();
            this.showNotification('Vorschlag wurde abgelehnt! ❌', 'success');
        } catch (error) {
            console.error('Error deleting suggestion:', error);
            this.showNotification('Fehler beim Ablehnen des Vorschlags', 'error');
        }
    }
}

// Initialize the platform when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Ensure page starts at the top
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    window.gamingPlatform = new GamingPlatform();
});

// Ensure page stays at top on window load
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
});

// Ensure page stays at top when navigating back/forward
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
});

// Global functions for backward compatibility
window.removeGenre = (gameId, genre) => {
    gamingPlatform.removeGenre(gameId, genre);
};

window.acceptSuggestion = (id) => {
    gamingPlatform.acceptSuggestion(id);
};

window.deleteSuggestion = (id) => {
    gamingPlatform.deleteSuggestion(id);
};
