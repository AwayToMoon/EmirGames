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
        this.discordSession = null;
        
        this.init();
    }

    async init() {
        try {
            this.showLoading();
            await this.setupEventListeners();
            await this.loadInitialData();
            this.hideLoading();
            this.showNotification('Plattform erfolgreich geladen! 🎮', 'success');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Fehler beim Laden der Plattform', 'error');
        }
    }

    async setupEventListeners() {
        // Admin Panel Events
        this.setupAdminEvents();
        
        // Game Management Events
        this.setupGameEvents();
        
        // Social Media Events
        this.setupSocialEvents();
        
        // Filter and Tab Events
        this.setupFilterEvents();
        
        // Modal Events
        this.setupModalEvents();
        
        // Randomizer Events
        this.setupRandomizerEvents();
        
        // Keyboard Events
        this.setupKeyboardEvents();
    }

    setupAdminEvents() {
        // Discord OAuth Login
        document.getElementById('admin-login-btn').addEventListener('click', () => {
            if (this.discordSession) {
                // Already logged in, show admin panel
                document.getElementById('admin-panel').classList.remove('hidden');
                } else {
                // Start Discord OAuth flow
                this.startDiscordOAuth();
            }
        });

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logoutDiscord();
            });
        }

        // Admin Panel Buttons
        document.getElementById('add-game-btn').addEventListener('click', () => {
            this.openGameForm();
        });

        document.getElementById('edit-games-btn').addEventListener('click', () => {
            this.toggleEditMode();
        });

        document.getElementById('edit-social-btn').addEventListener('click', () => {
            this.openSocialForm();
        });

        document.getElementById('view-suggestions-btn').addEventListener('click', () => {
            this.viewSuggestions();
        });
    }

    // Discord OAuth Functions
    startDiscordOAuth() {
        const DISCORD_CLIENT_ID = '1399190229214302208';
        const DISCORD_REDIRECT_URI = 'https://emir-games.vercel.app/';
        
        const params = new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            redirect_uri: DISCORD_REDIRECT_URI,
            response_type: 'code',
            scope: 'identify'
        });
        
        window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
    }

    async handleDiscordCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            await this.exchangeCodeForToken(code);
        }
    }

    async exchangeCodeForToken(code) {
        try {
            // In a real implementation, you'd exchange the code server-side
            // For now, we'll simulate a successful login
            const mockSession = {
                id: '933524419882676254',
                username: 'Away',
                avatar: null, // Will use default Discord avatar
                access_token: 'mock_token'
            };
            
            this.saveDiscordSession(mockSession);
            this.updateUIForLoggedInUser(mockSession);
            window.history.replaceState({}, document.title, window.location.pathname);
            this.showNotification('Erfolgreich mit Discord angemeldet! 🎉', 'success');
        } catch (error) {
            console.error('Discord OAuth error:', error);
            this.showNotification('Fehler bei der Discord-Anmeldung', 'error');
        }
    }

    saveDiscordSession(session) {
        this.discordSession = session;
        localStorage.setItem('discord_session', JSON.stringify(session));
    }

    loadDiscordSession() {
        const session = localStorage.getItem('discord_session');
        if (session) {
            this.discordSession = JSON.parse(session);
            this.updateUIForLoggedInUser(this.discordSession);
            return true;
        }
        return false;
    }

    updateUIForLoggedInUser(session) {
        const loginBtn = document.getElementById('admin-login-btn');
        const loginText = document.getElementById('login-text');
        const adminPanel = document.getElementById('admin-panel');
        const adminAvatar = document.getElementById('admin-avatar');
        const adminUsername = document.getElementById('admin-username');
        
        loginBtn.classList.add('logged-in');
        loginText.textContent = 'Admin';
        adminPanel.classList.remove('hidden');
        
        if (adminAvatar) {
            if (session.avatar && session.avatar !== 'default') {
                adminAvatar.src = `https://cdn.discordapp.com/avatars/${session.id}/${session.avatar}.png`;
            } else {
                // Fallback to default Discord avatar
                adminAvatar.src = `https://cdn.discordapp.com/embed/avatars/${session.id % 5}.png`;
            }
        }
        
        if (adminUsername) {
            adminUsername.textContent = session.username || 'Admin';
        }
    }

    updateUIForLoggedOutUser() {
        const loginBtn = document.getElementById('admin-login-btn');
        const loginText = document.getElementById('login-text');
        const adminPanel = document.getElementById('admin-panel');
        
        loginBtn.classList.remove('logged-in');
        loginText.textContent = 'Admin Login';
        adminPanel.classList.add('hidden');
    }

    logoutDiscord() {
        this.discordSession = null;
        localStorage.removeItem('discord_session');
        this.updateUIForLoggedOutUser();
        this.showNotification('Erfolgreich abgemeldet! 👋', 'success');
    }

    // Check if user is admin
    isAdmin() {
        if (!this.discordSession) return false;
        return this.discordSession.id === '933524419882676254'; // Replace with your Discord User ID
    }

    setupGameEvents() {
        // Game Form Events
        document.getElementById('steam-link').addEventListener('input', this.debounce(async (e) => {
            await this.handleSteamLinkInput(e.target.value);
        }, 500));

        document.getElementById('save-game').addEventListener('click', async () => {
            await this.saveGame();
        });

        // Suggest Game Events
        document.getElementById('suggest-game-btn').addEventListener('click', () => {
            this.openModal('suggest-form');
        });

        document.getElementById('suggest-steam-link').addEventListener('input', this.debounce(async (e) => {
            await this.handleSuggestSteamLinkInput(e.target.value);
        }, 500));

        document.getElementById('submit-suggestion').addEventListener('click', async () => {
            await this.submitSuggestion();
        });
    }

    setupSocialEvents() {
        document.getElementById('save-social').addEventListener('click', async () => {
            await this.saveSocialLinks();
        });
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
                this.closeModal(button.closest('.modal').id);
            });
        });

        // Modal Overlay Click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    setupRandomizerEvents() {
        document.getElementById('game-randomizer').addEventListener('click', async () => {
            await this.startRandomizer();
        });

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
        // Escape key for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    async loadInitialData() {
        // Load Discord session first
        this.loadDiscordSession();
        
        // Handle Discord callback if present
        await this.handleDiscordCallback();
        
        await Promise.all([
            this.loadSocialLinks(),
            this.renderGames(),
            this.updateGenreFilterButtons(),
            this.updateSuggestionCount(),
            this.migrateUnreleasedFlag()
        ]);
    }

    // Discord OAuth Admin Functions
    async handleDiscordLogin() {
        if (this.discordSession) {
            document.getElementById('admin-panel').classList.remove('hidden');
            this.showNotification('Willkommen zurück! 🎉', 'success');
            } else {
            this.startDiscordOAuth();
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

    openSocialForm() {
        this.loadSocialLinks();
        this.openModal('social-form');
    }

    // Game Management Functions
    async handleSteamLinkInput(link) {
        const status = document.getElementById("steam-fetch-status");
        const preview = document.getElementById("steam-preview");
        
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
            this.displaySteamPreview(gameData, 'steam');
            status.classList.add('hidden');
        } catch (error) {
            console.error('Steam fetch error:', error);
            status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Fehler beim Laden der Spieldaten!';
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
        const response = await fetch(`https://corsproxy.io/?https://store.steampowered.com/api/appdetails?appids=${appid}&l=german`);
        const data = await response.json();
        
            if (!data[appid] || !data[appid].success) {
            throw new Error('Spiel nicht gefunden');
        }
        
        return data[appid].data;
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
    }

    async saveGame() {
        const steamLink = document.getElementById('steam-link').value.trim();
        if (!steamLink) {
            this.showNotification('Bitte gib einen Steam-Link ein!', 'error');
                    return;
                }

        try {
            const appid = this.extractSteamAppId(steamLink);
            if (!appid) {
                this.showNotification('Ungültiger Steam-Link!', 'error');
                    return;
                }

            const gameData = await this.fetchSteamGameData(appid);
            const gameToSave = {
                name: gameData.name,
                steamLink: steamLink,
                image: gameData.header_image,
                genres: (gameData.genres || []).map(g => g.description),
                description: gameData.short_description || "",
                unreleased: gameData.release_date && gameData.release_date.coming_soon === true,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

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
            }
        } catch (error) {
            console.error("Error loading social links:", error);
        }
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
            if (element && url) {
                element.href = url;
            }
        });

        // Update logos
        if (data.headerLogo) document.getElementById("header-logo").src = data.headerLogo;
        if (data.logo) document.getElementById("favicon").href = data.logo;
        if (data.adminLogo) document.getElementById("admin-logo").src = data.adminLogo;
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
            'admin-logo-link': data.adminLogo || ''
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
                adminLogo: document.getElementById("admin-logo-link").value || "#"
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
    }

    // Game Rendering Functions
    async renderGames() {
        try {
            this.showLoading();
            const gameList = document.getElementById("game-list");
            gameList.innerHTML = "";
            
            const snapshot = await db.collection("games").get();
            let games = [];
            
            snapshot.forEach(doc => {
                const gameData = doc.data();
                if (!gameData.isPending) {
                    if (this.shouldShowGame(gameData)) {
                            games.push({ id: doc.id, ...gameData });
                        }
                }
            });

            // Sort games based on current tab and filters
            this.sortGames(games);
            
            // Render games with animation
            games.forEach((game, index) => {
                const gameElement = this.createGameElement(game);
                gameElement.style.animationDelay = `${index * 0.1}s`;
                gameList.appendChild(gameElement);
            });

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
            showByTab = gameData.unreleased === true;
        } else if (this.currentTab === 'played') {
            showByTab = gameData.played === true;
        } else {
            showByTab = !gameData.unreleased && !gameData.played;
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
        
        gameElement.innerHTML = `
            <img src="${game.image}" alt="${game.name}" loading="lazy">
            <div class="game-content">
                <h2>${game.name}</h2>
                ${game.description ? `<div class="game-description">${game.description}</div>` : ''}
                <div class="game-divider"></div>
                <div class="game-genres">
                    ${this.createGenreTags(game.genres)}
                </div>
                ${this.createAdminButtons(game)}
            </div>
        `;

        // Add click event to open game
        gameElement.querySelector('img').addEventListener('click', () => {
            window.open(game.link, '_blank');
        });

        // Animate in
        setTimeout(() => {
            gameElement.style.transition = 'all 0.5s ease';
            gameElement.style.opacity = '1';
            gameElement.style.transform = 'translateY(0)';
        }, 100);

        return gameElement;
    }

    createGenreTags(genres) {
        if (!genres || !Array.isArray(genres)) return '';
        
        return genres.map(genre => `
            <div class="genre-tag" data-genre="${genre}">
                ${genre}
            </div>
        `).join('');
    }

    createAdminButtons(game) {
        if (!this.discordSession || !this.isEditMode) {
            return '';
        }

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
            
            // Populate form with existing data
            document.getElementById('steam-link').value = gameData.steamLink || '';
            document.getElementById('steam-name').textContent = gameData.name || '';
            document.getElementById('steam-genres').textContent = (gameData.genres || []).map(g => g.description || g).join(", ");
            
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
            this.closeModal(modal.id);
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
        document.getElementById('loading-indicator').classList.add('hidden');
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
                if (Array.isArray(game.genres)) {
                    game.genres.forEach(genre => genreSet.add(genre));
                }
            });

            // Update existing buttons or create new ones
            const container = document.querySelector('.genre-filter-buttons');
            const existingButtons = container.querySelectorAll('.genre-filter-btn:not([data-genre="all"])');
            
            existingButtons.forEach(btn => {
                if (!genreSet.has(btn.dataset.genre)) {
                    btn.remove();
                }
            });

            genreSet.forEach(genre => {
                if (!container.querySelector(`[data-genre="${genre}"]`)) {
                    const btn = document.createElement('button');
                    btn.className = 'genre-filter-btn';
                    btn.dataset.genre = genre;
                    btn.innerHTML = `<i class="fas fa-${this.getGenreIcon(genre)}"></i> ${genre}`;
                    btn.addEventListener('click', () => this.handleGenreFilter(genre));
                    container.appendChild(btn);
                }
            });
        } catch (error) {
            console.error('Error updating genre filters:', error);
        }
    }

    getGenreIcon(genre) {
        const icons = {
            'Action': 'fire',
            'Adventure': 'compass',
            'Soulslike': 'skull',
            'Shooter': 'crosshairs',
            'Sport': 'futbol',
            'Strategie': 'chess',
            'Rätsel': 'puzzle-piece',
            'Roblox': 'cube',
            'Horror': 'ghost',
            'Story': 'book-open'
        };
        return icons[genre] || 'gamepad';
    }

    async updateSuggestionCount() {
        try {
            const snapshot = await db.collection('games').where('isPending', '==', true).get();
            const count = snapshot.size;
            const badge = document.getElementById('suggestion-count');
            
            if (count > 0) {
                badge.textContent = count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error updating suggestion count:', error);
        }
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
    window.gamingPlatform = new GamingPlatform();
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
