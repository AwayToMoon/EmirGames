document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('admin-panel').classList.add('hidden');
    const gameList = document.getElementById("game-list");
    const adminLoginBtn = document.getElementById("admin-login-btn");
    const adminPanel = document.getElementById("admin-panel");
    const addGameBtn = document.getElementById("add-game-btn");
    const editGamesBtn = document.getElementById("edit-games-btn");
    const editSocialBtn = document.getElementById("edit-social-btn");
    const gameForm = document.getElementById("game-form");
    const socialForm = document.getElementById("social-form");
    const saveGameBtn = document.getElementById("save-game");
    const saveSocialBtn = document.getElementById("save-social");
    const gameNameInput = document.getElementById("game-name");
    const gameLinkInput = document.getElementById("game-link");
    const gameImageInput = document.getElementById("game-image");
    const gameDescriptionInput = document.getElementById("game-description");

    let currentGameId = null;
    let isEditMode = false;
    let selectedGenres = [];

    // Genre Filter Funktionalität
    const genreButtons = document.querySelectorAll('.genre-filter-btn');
    let activeGenres = new Set(['all']);

    // Progress Filter Funktionalität
    const progressButtons = document.querySelectorAll('.progress-filter-btn');
    let activeProgress = 'all';

    // Dynamische Genre-Filter-Buttons
    async function updateGenreFilterButtons() {
        const genreSet = new Set();
        const snapshot = await db.collection("games").get();
        snapshot.forEach(doc => {
            const game = doc.data();
            if (Array.isArray(game.genres)) {
                game.genres.forEach(genre => genreSet.add(genre));
            }
        });

        const container = document.querySelector('.genre-filter-buttons');
        // Nur den „Alle“-Button behalten
        container.innerHTML = '';
        const allBtn = document.createElement('button');
        allBtn.className = 'genre-filter-btn active';
        allBtn.dataset.genre = 'all';
        allBtn.textContent = 'Alle';
        container.appendChild(allBtn);

        genreSet.forEach(genre => {
            const btn = document.createElement('button');
            btn.className = 'genre-filter-btn';
            btn.dataset.genre = genre;
            btn.textContent = genre;
            container.appendChild(btn);
        });

        // Event Listener neu setzen
        document.querySelectorAll('.genre-filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                const genre = button.dataset.genre;
                if (genre === 'all') {
                    activeGenres.clear();
                    activeGenres.add('all');
                    document.querySelectorAll('.genre-filter-btn').forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                } else {
                    activeGenres.delete('all');
                    document.querySelector('.genre-filter-btn[data-genre="all"]').classList.remove('active');
                    if (activeGenres.has(genre)) {
                        activeGenres.delete(genre);
                        button.classList.remove('active');
                        if (activeGenres.size === 0) {
                            activeGenres.add('all');
                            document.querySelector('.genre-filter-btn[data-genre="all"]').classList.add('active');
                        }
                    } else {
                        activeGenres.add(genre);
                        button.classList.add('active');
                    }
                }
                filterGames();
            });
        });
    }

    progressButtons.forEach(button => {
        button.addEventListener('click', () => {
            progressButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            activeProgress = button.dataset.progress;
            filterGames();
        });
    });

    function filterGames() {
        const gameElements = Array.from(document.querySelectorAll('.game'));
        const gameListContainer = document.getElementById('game-list');
        
        gameListContainer.innerHTML = '';
        
        const sortedGames = gameElements.sort((a, b) => {
            const aGenres = Array.from(a.querySelectorAll('.genre-tag')).map(tag => tag.dataset.genre);
            const bGenres = Array.from(b.querySelectorAll('.genre-tag')).map(tag => tag.dataset.genre);
            
            const aProgress = a.querySelector('.progress-badge')?.dataset.status || '';
            const bProgress = b.querySelector('.progress-badge')?.dataset.status || '';
            
            const aMatchesGenre = activeGenres.has('all') || aGenres.some(genre => activeGenres.has(genre));
            const bMatchesGenre = activeGenres.has('all') || bGenres.some(genre => activeGenres.has(genre));
            
            const aMatchesProgress = activeProgress === 'all' || aProgress === activeProgress;
            const bMatchesProgress = activeProgress === 'all' || bProgress === activeProgress;
            
            if (aMatchesGenre && aMatchesProgress && (!bMatchesGenre || !bMatchesProgress)) return -1;
            if (bMatchesGenre && bMatchesProgress && (!aMatchesGenre || !aMatchesProgress)) return 1;
            return 0;
        });
        
        sortedGames.forEach(game => {
            const genreTags = Array.from(game.querySelectorAll('.genre-tag')).map(tag => tag.dataset.genre);
            const progress = game.querySelector('.progress-badge')?.dataset.status || '';
            
            const matchesGenre = activeGenres.has('all') || genreTags.some(genre => activeGenres.has(genre));
            const matchesProgress = activeProgress === 'all' || progress === activeProgress;
            
            if (matchesGenre && matchesProgress) {
                game.classList.remove('filtered-out');
            } else {
                game.classList.add('filtered-out');
            }
            
            gameListContainer.appendChild(game);
        });
    }

    async function checkAdminPassword(inputPassword) {
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

    async function loadSocialLinks() {
        try {
            const doc = await db.collection("settings").doc("social").get();
            if (doc.exists) {
                const data = doc.data();
                document.getElementById("tiktok-btn").href = data.tiktok || "#";
                document.getElementById("discord-btn").href = data.discord || "#";
                document.getElementById("instagram-btn").href = data.instagram || "#";
                document.getElementById("kick-btn").href = data.kick || "#";
                if (document.getElementById("logo-link")) {
                    document.getElementById("logo-link").value = data.logo || "";
                }
                if (data.logo) {
                    document.getElementById("favicon").href = data.logo;
                }
            }
        } catch (error) {
            console.error("Error loading social links:", error);
        }
    }

    // Genre-Auswahl Event Listener
    document.querySelectorAll('.genre-option').forEach(option => {
        option.addEventListener('click', () => {
            option.classList.toggle('selected');
            const genre = option.dataset.genre;
            if (option.classList.contains('selected')) {
                if (!selectedGenres.includes(genre)) {
                    selectedGenres.push(genre);
                }
            } else {
                selectedGenres = selectedGenres.filter(g => g !== genre);
            }
        });
    });

    function updateGenreSelection(genres) {
        document.querySelectorAll('.genre-option').forEach(option => {
            option.classList.remove('selected');
            if (genres && genres.includes(option.dataset.genre)) {
                option.classList.add('selected');
            }
        });
        selectedGenres = genres || [];
    }

    // Funktion zum Entfernen eines Genres
    async function removeGenre(gameId, genre) {
        try {
            const gameRef = db.collection("games").doc(gameId);
            const doc = await gameRef.get();
            if (doc.exists) {
                const game = doc.data();
                const updatedGenres = (game.genres || []).filter(g => g !== genre);
                await gameRef.update({ genres: updatedGenres });
                renderGames();
            }
        } catch (error) {
            console.error("Error removing genre:", error);
            alert("Fehler beim Entfernen des Genres");
        }
    }

    adminLoginBtn.addEventListener("click", () => {
        const loginModal = document.getElementById('login-modal');
        const passwordInput = document.getElementById('admin-password');
        loginModal.style.display = 'block';
        loginModal.classList.remove('hidden');
        passwordInput.focus();
    });

    document.getElementById('login-submit').addEventListener('click', async () => {
        const password = document.getElementById('admin-password').value;
        
        if (password.trim() === "") {
            alert("Bitte geben Sie ein Passwort ein");
            return;
        }
        
        if (await checkAdminPassword(password)) {
            adminPanel.classList.remove("hidden");
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('admin-password').value = '';
            loadSocialLinks();
        } else {
            alert("Falsches Passwort!");
        }
    });

    document.getElementById('login-cancel').addEventListener('click', () => {
        const loginModal = document.getElementById('login-modal');
        loginModal.style.display = 'none';
        document.getElementById('admin-password').value = '';
        adminPanel.classList.add("hidden");
    });

    document.getElementById('admin-password').addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const password = e.target.value;
            
            if (password.trim() === "") {
                alert("Bitte geben Sie ein Passwort ein");
                return;
            }
            
            if (await checkAdminPassword(password)) {
                adminPanel.classList.remove("hidden");
                document.getElementById('login-modal').style.display = 'none';
                e.target.value = '';
                loadSocialLinks();
            } else {
                alert("Falsches Passwort!");
            }
        }
    });

    addGameBtn.addEventListener("click", () => {
        currentGameId = null;
        isEditMode = false;
        document.getElementById("steam-link").value = "";
        document.getElementById("steam-fetch-status").style.display = "none";
        document.getElementById("steam-preview").style.display = "none";
        document.querySelector('#game-form h2').textContent = "Spiel hinzufügen";
        gameForm.classList.remove("hidden");
        gameForm.style.display = 'block';
    });

    editGamesBtn.addEventListener("click", () => {
        isEditMode = !isEditMode;
        renderGames();
        editGamesBtn.textContent = isEditMode ? "Bearbeiten beenden" : "Spiele bearbeiten";
    });

    editSocialBtn.addEventListener("click", async () => {
        try {
            const doc = await db.collection("settings").doc("social").get();
            if (doc.exists) {
                const data = doc.data();
                document.getElementById("tiktok-link").value = data.tiktok || "";
                document.getElementById("discord-link").value = data.discord || "";
                document.getElementById("instagram-link").value = data.instagram || "";
                document.getElementById("kick-link").value = data.kick || "";
                if (document.getElementById("logo-link")) {
                    document.getElementById("logo-link").value = data.logo || "";
                }
            }
            socialForm.classList.remove("hidden");
            socialForm.style.display = 'block';
        } catch (error) {
            console.error("Error opening social modal:", error);
            alert("Fehler beim Laden der Social Media Links");
        }
    });

    saveSocialBtn.addEventListener("click", async () => {
        try {
            const socialData = {
                tiktok: document.getElementById("tiktok-link").value || "#",
                discord: document.getElementById("discord-link").value || "#",
                instagram: document.getElementById("instagram-link").value || "#",
                kick: document.getElementById("kick-link").value || "#",
                logo: document.getElementById("logo-link").value || ""
            };

            await db.collection("settings").doc("social").set(socialData);
            await loadSocialLinks();
            socialForm.classList.add("hidden");
            socialForm.style.display = 'none';
            alert("Social Media Links wurden gespeichert!");
        } catch (error) {
            console.error("Error saving social links:", error);
            alert("Fehler beim Speichern der Social Media Links");
        }
    });

    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').classList.add("hidden");
            button.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.classList.add("hidden");
            event.target.style.display = 'none';
        }
    });

    // --- Admin: Spiel speichern ---
    saveGameBtn.addEventListener("click", async () => {
        const steamGameRaw = gameForm.dataset.steamGame;
        if (!steamGameRaw) {
            alert('Bitte gib einen gültigen Steam-Link ein und warte auf die Vorschau!');
            return;
        }
        const steamGame = JSON.parse(steamGameRaw);
        try {
            await db.collection("games").add({
                name: steamGame.name,
                link: steamGame.link,
                image: steamGame.image,
                genres: steamGame.genres,
                description: steamGame.description || "",
                isNew: true
            });
            gameForm.classList.add("hidden");
            gameForm.style.display = 'none';
            gameForm.dataset.steamGame = "";
            await renderGames();
        } catch (error) {
            alert('Fehler beim Speichern des Spiels!');
        }
    });

    // --- Admin: Steam-Link Verarbeitung ---
    document.getElementById("steam-link").addEventListener("change", async function() {
        const link = this.value.trim();
        const status = document.getElementById("steam-fetch-status");
        const preview = document.getElementById("steam-preview");
        status.style.display = "block";
        status.textContent = "Lade Spieldaten von Steam...";
        preview.style.display = "none";
        let appid = null;
        try {
            // Versuche die AppID aus dem Link zu extrahieren
            const match = link.match(/store\.steampowered\.com\/app\/(\d+)/);
            if (match) {
                appid = match[1];
            } else {
                status.textContent = "Ungültiger Steam-Link!";
                return;
            }
            // Hole Spieldaten
            const res = await fetch(`https://corsproxy.io/?https://store.steampowered.com/api/appdetails?appids=${appid}&l=german`);
            const data = await res.json();
            if (!data[appid] || !data[appid].success) {
                status.textContent = "Spiel nicht gefunden!";
                return;
            }
            const game = data[appid].data;
            // Zeige Vorschau
            document.getElementById("steam-image").src = game.header_image;
            document.getElementById("steam-name").textContent = game.name;
            document.getElementById("steam-genres").textContent = (game.genres||[]).map(g=>g.description).join(", ");
            preview.style.display = "block";
            status.style.display = "none";
            // Speichere für später
            gameForm.dataset.steamGame = JSON.stringify({
                name: game.name,
                image: game.header_image,
                genres: (game.genres||[]).map(g=>g.description),
                link: link,
                description: game.short_description || ""
            });
        } catch (e) {
            status.textContent = "Fehler beim Laden der Spieldaten!";
        }
    });

    // --- Vorschlagsformular: Steam-Link Verarbeitung ---
    const suggestSteamLinkInput = document.getElementById("suggest-steam-link");
    if (suggestSteamLinkInput) {
        suggestSteamLinkInput.addEventListener("change", async function() {
            const link = this.value.trim();
            const status = document.getElementById("suggest-steam-fetch-status");
            const preview = document.getElementById("suggest-steam-preview");
            status.style.display = "block";
            status.textContent = "Lade Spieldaten von Steam...";
            preview.style.display = "none";
            let appid = null;
            try {
                // Versuche die AppID aus dem Link zu extrahieren
                const match = link.match(/store\.steampowered\.com\/app\/(\d+)/);
                if (match) {
                    appid = match[1];
                } else {
                    status.textContent = "Ungültiger Steam-Link!";
                    return;
                }
                // Hole Spieldaten (mit CORS-Proxy wie im Admin-Formular)
                const res = await fetch(`https://corsproxy.io/?https://store.steampowered.com/api/appdetails?appids=${appid}&l=german`);
                const data = await res.json();
                if (!data[appid] || !data[appid].success) {
                    status.textContent = "Spiel nicht gefunden!";
                    return;
                }
                const game = data[appid].data;
                // Zeige Vorschau
                document.getElementById("suggest-steam-image").src = game.header_image;
                document.getElementById("suggest-steam-name").textContent = game.name;
                document.getElementById("suggest-steam-genres").textContent = (game.genres||[]).map(g=>g.description).join(", ");
                preview.style.display = "block";
                status.style.display = "none";
                // Speichere Beschreibung für später
                suggestSteamLinkInput.dataset.description = game.short_description || "";
            } catch (e) {
                status.textContent = "Fehler beim Laden der Spieldaten!";
            }
        });
    }

    // --- Vorschlagsformular: Spiel einreichen ---
    document.getElementById('submit-suggestion').addEventListener('click', async () => {
        try {
            const steamLink = document.getElementById('suggest-steam-link').value.trim();
            if (!steamLink) {
                alert('Bitte einen Steam-Link eingeben!');
                return;
            }

            // Hole Spieldaten von Steam API
            let appid = null;
            const match = steamLink.match(/store\.steampowered\.com\/app\/(\d+)/);
            if (match) {
                appid = match[1];
            } else {
                alert('Ungültiger Steam-Link!');
                return;
            }
            let gameData = {};
            try {
                const res = await fetch(`https://corsproxy.io/?https://store.steampowered.com/api/appdetails?appids=${appid}&l=german`);
                const data = await res.json();
                if (data[appid] && data[appid].success) {
                    const game = data[appid].data;
                    gameData = {
                        name: game.name,
                        link: steamLink,
                        image: game.header_image,
                        genres: (game.genres||[]).map(g=>g.description),
                        description: game.short_description || "",
                        isPending: true,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    };
                } else {
                    alert('Spiel nicht gefunden!');
                    return;
                }
            } catch (e) {
                alert('Fehler beim Laden der Spieldaten!');
                return;
            }

            // Vorschlag zur games Collection hinzufügen
            await db.collection('games').add(gameData);

            // Formular zurücksetzen
            document.getElementById('suggest-steam-link').value = '';
            document.getElementById('suggest-steam-fetch-status').style.display = 'none';
            document.getElementById('suggest-steam-preview').style.display = 'none';
            document.getElementById('suggest-form').style.display = 'none';

            // Erfolgsmeldung anzeigen
            alert('Vielen Dank für deinen Vorschlag!');

            // Vorschlagszähler aktualisieren
            await updateSuggestionCount();
        } catch (error) {
            console.error('Error adding suggestion:', error);
            alert('Fehler beim Speichern des Vorschlags. Bitte versuche es später erneut.');
        }
    });

    function getGenreColor(genre) {
        // Bekannte Farben (wie in style.css)
        const genreColors = {
            "Action": "#6a0dad",
            "Adventure": "#4CAF50",
            "Soulslike": "#00ff00",
            "Shooter": "#ff9800",
            "Sport": "#2196F3",
            "Strategie": "#607D8B",
            "Rätsel": "#E91E63",
            "Roblox": "#FFC107",
            "Horror": "#990000",
            "Story": "#ff69b4"
        };
        if (genreColors[genre]) return genreColors[genre];
        // Für unbekannte Genres: Hash zu Farbe
        let hash = 0;
        for (let i = 0; i < genre.length; i++) {
            hash = genre.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = `hsl(${hash % 360}, 60%, 45%)`;
        return color;
    }

    function createGenreTag(genre, container, isEditable = false) {
        const tag = document.createElement('div');
        tag.className = 'genre-tag';
        tag.setAttribute('data-genre', genre);
        tag.textContent = genre;

        // Dynamische Farbe für unbekannte Genres
        if (!document.querySelector(`style[data-genre-style="${genre}"]`)) {
            const color = getGenreColor(genre);
            const style = document.createElement('style');
            style.setAttribute('data-genre-style', genre);
            style.innerHTML = `
                .genre-tag[data-genre="${genre}"] {
                    background: ${color};
                    border: 1px solid ${color};
                }
            `;
            document.head.appendChild(style);
        }

        if (isEditable) {
            const removeButton = document.createElement('span');
            removeButton.className = 'remove-genre';
            removeButton.innerHTML = '×';
            removeButton.onclick = () => tag.remove();
            tag.appendChild(removeButton);
        }

        container.appendChild(tag);
        return tag;
    }

    // --- Anzeige: Beschreibung im Spiel-Listing ---
    function displayGame(game, isEditable = false) {
        const gameElement = document.createElement('div');
        gameElement.className = 'game';
        
        if (game.isNew) {
            const newLabel = document.createElement('div');
            newLabel.className = 'new-label';
            newLabel.textContent = 'NEU';
            gameElement.appendChild(newLabel);
        }

        const img = document.createElement('img');
        img.src = game.image;
        img.alt = game.name;
        img.onclick = () => window.open(game.link, '_blank');
        gameElement.appendChild(img);
        
        const content = document.createElement('div');
        content.className = 'game-content';

        if (game.progress) {
            const progressBadge = document.createElement('div');
            progressBadge.className = 'progress-badge';
            progressBadge.setAttribute('data-status', game.progress);
            
            const progressTexts = {
                'not-started': 'Nicht begonnen',
                'in-progress': 'In Arbeit',
                'completed': 'Abgeschlossen',
                'planned': 'Geplant'
            };
            
            progressBadge.textContent = progressTexts[game.progress] || '';
            if (progressBadge.textContent) {
                content.appendChild(progressBadge);
            }
        }
        
        const h2 = document.createElement('h2');
        h2.textContent = game.name;
        content.appendChild(h2);
        
        if (game.description) {
            const description = document.createElement('div');
            description.className = 'game-description';
            description.textContent = game.description;
            content.appendChild(description);
        }
        
        const divider = document.createElement('div');
        divider.className = 'game-divider';
        content.appendChild(divider);
        
        const genresContainer = document.createElement('div');
        genresContainer.className = 'game-genres';
        
        if (game.genres && Array.isArray(game.genres)) {
            game.genres.forEach(genre => {
                createGenreTag(genre, genresContainer, isEditable);
            });
        }
        
        content.appendChild(genresContainer);
        gameElement.appendChild(content);
        
        if (!adminPanel.classList.contains("hidden") && isEditMode) {
            const buttonContainer = document.createElement("div");

            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("delete-game");
            deleteBtn.innerText = "X";
            deleteBtn.onclick = async (e) => {
                e.stopPropagation();
                if (confirm('Möchten Sie dieses Spiel wirklich löschen?')) {
                    try {
                        await db.collection("games").doc(game.id).delete();
                        await renderGames();
                    } catch (error) {
                        console.error("Error deleting game:", error);
                        alert("Fehler beim Löschen des Spiels");
                    }
                }
            };

            const editBtn = document.createElement("button");
            editBtn.classList.add("edit-game");
            editBtn.innerText = "✎";
            editBtn.onclick = (e) => {
                e.stopPropagation();
                currentGameId = game.id;
                gameNameInput.value = game.name;
                gameLinkInput.value = game.link;
                gameImageInput.value = game.image;
                gameDescriptionInput.value = game.description || "";
                document.getElementById('is-new-game').checked = game.isNew || false;
                updateGenreSelection(game.genres || []);
                document.querySelector('#game-form h2').textContent = "Spiel bearbeiten";
                gameForm.classList.remove("hidden");
                gameForm.style.display = 'block';
            };

            buttonContainer.appendChild(deleteBtn);
            buttonContainer.appendChild(editBtn);
            gameElement.appendChild(buttonContainer);
        }
        
        return gameElement;
    }

    async function renderGames() {
        try {
            gameList.innerHTML = "";
            const snapshot = await db.collection("games").get();
            const games = [];
            snapshot.forEach(doc => {
                const gameData = doc.data();
                if (!gameData.isPending) {
                    games.push({ id: doc.id, ...gameData });
                }
            });
            
            games.forEach(game => {
                const gameElement = displayGame(game, !adminPanel.classList.contains("hidden") && isEditMode);
                gameList.appendChild(gameElement);
            });
            
            // Wende den aktuellen Filter an
            filterGames();
        } catch (error) {
            console.error("Error rendering games:", error);
            alert("Fehler beim Laden der Spiele");
        }
    }

    // Globale Funktion für Genre-Entfernung
    window.removeGenre = removeGenre;

    // Initialisierung beim Laden der Seite
    renderGames();
    loadSocialLinks();
    updateGenreFilterButtons();

    // Randomizer Funktionalität
    document.getElementById('game-randomizer').addEventListener('click', async () => {
        try {
            const snapshot = await db.collection('games').get();
            
            const games = [];
            snapshot.forEach(doc => {
                const game = doc.data();
                if (!game.isPending && !game.progress) {
                    games.push(game);
                }
            });

            if (games.length === 0) {
                alert('Keine verfügbaren Spiele für den Randomizer!');
                return;
            }

            const modal = document.querySelector('.randomizer-modal');
            const overlay = document.querySelector('.modal-overlay');
            const gameCard = document.querySelector('.game-card');
            const gameImage = gameCard.querySelector('img');
            const gameTitle = gameCard.querySelector('h3');
            const previewContainer = document.querySelector('.preview-container');
            
            // Zufälliges Spiel auswählen
            const selectedGame = games[Math.floor(Math.random() * games.length)];
            
            // Modal und Overlay anzeigen
            modal.style.display = 'block';
            overlay.style.display = 'none';
            
            // Karte initial verstecken
            gameCard.classList.remove('active');
            
            // Preview Container aktivieren
            previewContainer.classList.add('active');
            
            // Mische die Spiele für die Vorschau
            const previewGames = [...games]
                .sort(() => Math.random() - 0.5)
                .slice(0, 25); // Reduziere auf 6 zufällige Spiele
            
            // Füge das ausgewählte Spiel am Ende hinzu
            previewGames.push(selectedGame);
            
            // Bilder vorladen
            const preloadPromises = previewGames.map(game => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve();
                    img.src = game.image;
                });
            });

            // Warte bis alle Bilder geladen sind
            await Promise.all(preloadPromises);

            let currentIndex = 0;
            const showNextPreview = () => {
                // Entferne vorheriges Vorschaubild
                const prevPreview = previewContainer.querySelector('.preview-image.active');
                if (prevPreview) {
                    prevPreview.classList.add('fade-out');
                    setTimeout(() => prevPreview.remove(), 150); // Schnelleres Entfernen
                }

                // Erstelle neues Vorschaubild
                const previewDiv = document.createElement('div');
                previewDiv.className = 'preview-image';
                const img = document.createElement('img');
                img.src = previewGames[currentIndex].image;
                previewDiv.appendChild(img);
                previewContainer.appendChild(previewDiv);

                // Aktiviere das neue Vorschaubild
                setTimeout(() => previewDiv.classList.add('active'), 0,5); // Schnelleres Einblenden

                currentIndex++;

                // Wenn noch nicht alle Bilder gezeigt wurden, zeige nächstes
                if (currentIndex < previewGames.length) {
                    setTimeout(showNextPreview, 100); // Schnellerer Bildwechsel
                } else {
                    // Animation beenden und finale Karte zeigen
                    setTimeout(() => {
                        previewContainer.classList.remove('active');
                        gameImage.src = selectedGame.image;
                        gameTitle.textContent = selectedGame.name;
                        gameCard.classList.add('active');
                        overlay.style.display = 'block'; // Zeige Overlay erst am Ende
                    }, 300); // Schnellerer Übergang zur finalen Karte
                }
            };

            // Starte die Vorschau-Animation
            showNextPreview();

            // Event Listener für Buttons
            document.getElementById('play-random-game').onclick = () => {
                window.open(selectedGame.link, '_blank');
            };

            function closeRandomizer() {
                gameCard.classList.remove('active');
                previewContainer.classList.remove('active');
                previewContainer.innerHTML = '';
                setTimeout(() => {
                    modal.style.display = 'none';
                    overlay.style.display = 'none';
                }, 300);
            }

            document.getElementById('close-random-game').onclick = closeRandomizer;
            overlay.onclick = closeRandomizer;

        } catch (error) {
            console.error('Error in randomizer:', error);
            alert('Fehler beim Laden der Spiele');
        }
    });

    function showRandomGame() {
        const modal = document.querySelector('.randomizer-modal');
        const overlay = document.querySelector('.modal-overlay');
        const gameCard = document.querySelector('.game-card');
        const gameImage = gameCard.querySelector('img');
        const gameTitle = gameCard.querySelector('h3');
        const playButton = document.getElementById('play-random-game');
        const closeButton = document.getElementById('close-random-game');

        // Zufälliges Spiel auswählen
        const randomGame = games[Math.floor(Math.random() * games.length)];
        
        // Karte zurücksetzen
        gameCard.style.transform = 'rotateY(90deg)';
        
        modal.style.display = 'block';
        overlay.style.display = 'block';
        
        // Verzögerung für Animation
        setTimeout(() => {
            gameImage.src = randomGame.image;
            gameTitle.textContent = randomGame.title;
            gameCard.style.transform = 'rotateY(0deg)';
        }, 500);

        playButton.onclick = () => {
            window.location.href = randomGame.link;
        };

        closeButton.onclick = () => {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        };

        overlay.onclick = () => {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        };
    }

    document.getElementById('random-game-button').addEventListener('click', showRandomGame);
});
