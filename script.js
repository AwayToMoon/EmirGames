document.addEventListener('DOMContentLoaded', function() {
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

    let currentGameId = null;
    let isEditMode = false;
    let selectedGenres = [];

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

    adminLoginBtn.addEventListener("click", async () => {
        const password = prompt("Bitte Admin-Passwort eingeben:");
        if (await checkAdminPassword(password)) {
            adminPanel.classList.remove("hidden");
            loadSocialLinks();
        } else {
            alert("Falsches Passwort!");
        }
    });

    addGameBtn.addEventListener("click", () => {
        currentGameId = null;
        isEditMode = false;
        gameNameInput.value = "";
        gameLinkInput.value = "";
        gameImageInput.value = "";
        selectedGenres = [];
        updateGenreSelection([]);
        document.querySelector('#game-form h2').textContent = "Neues Spiel hinzufügen";
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

    saveGameBtn.addEventListener("click", async () => {
        const name = gameNameInput.value;
        const link = gameLinkInput.value;
        const image = gameImageInput.value;

        if (name && link && image) {
            try {
                if (currentGameId) {
                    await db.collection("games").doc(currentGameId).update({
                        name,
                        link,
                        image,
                        genres: selectedGenres
                    });
                } else {
                    await db.collection("games").add({
                        name,
                        link,
                        image,
                        genres: selectedGenres
                    });
                }

                gameNameInput.value = "";
                gameLinkInput.value = "";
                gameImageInput.value = "";
                selectedGenres = [];
                updateGenreSelection([]);
                gameForm.classList.add("hidden");
                gameForm.style.display = 'none';
                currentGameId = null;
                await renderGames();
            } catch (error) {
                console.error("Error saving game:", error);
                alert("Fehler beim Speichern des Spiels");
            }
        } else {
            alert('Bitte füllen Sie alle Felder aus');
        }
    });

    function createGenreTag(genre, container, isEditable = false) {
        const tag = document.createElement('div');
        tag.className = 'genre-tag';
        tag.setAttribute('data-genre', genre);
        tag.textContent = genre;
        
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

    function displayGame(game, isEditable = false) {
        const gameElement = document.createElement('div');
        gameElement.className = 'game';
        
        const img = document.createElement('img');
        img.src = game.image;
        img.alt = game.name;
        img.onclick = () => window.open(game.link, '_blank');
        gameElement.appendChild(img);
        
        const content = document.createElement('div');
        content.className = 'game-content';
        
        const h2 = document.createElement('h2');
        h2.textContent = game.name;
        content.appendChild(h2);
        
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
                games.push({ id: doc.id, ...doc.data() });
            });
            
            games.forEach(game => {
                const gameElement = displayGame(game, !adminPanel.classList.contains("hidden") && isEditMode);
                gameList.appendChild(gameElement);
            });
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
});
