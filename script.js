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

    adminLoginBtn.addEventListener("click", async () => {
        const password = prompt("Bitte Admin-Passwort eingeben:");
        if (await checkAdminPassword(password)) {
            adminPanel.classList.remove("hidden");
            initializeSocialLinks();
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

    function updateGenreSelection(genres) {
        document.querySelectorAll('.genre-option').forEach(option => {
            option.classList.remove('selected');
            if (genres.includes(option.dataset.genre)) {
                option.classList.add('selected');
            }
        });
        selectedGenres = genres;
    }

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
                kick: document.getElementById("kick-link").value || "#"
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
            renderGames();
        } else {
            alert('Bitte füllen Sie alle Felder aus');
        }
    });

    async function renderGames() {
        gameList.innerHTML = "";
        const snapshot = await db.collection("games").get();
        snapshot.forEach(doc => {
            const game = doc.data();
            const div = document.createElement("div");
            div.classList.add("game");

            // Genre-Tags erstellen
            const genreTags = game.genres ? game.genres.map(genre => 
                `<span class="genre-tag">${genre}</span>`
            ).join('') : '';

            div.innerHTML = `
                <div class="game-genres">${genreTags}</div>
                <img src="${game.image}" alt="${game.name}" onclick="window.open('${game.link}', '_blank')">
                <h2>${game.name}</h2>
            `;
            
            if (!adminPanel.classList.contains("hidden") && isEditMode) {
                const buttonContainer = document.createElement("div");
                
                const deleteBtn = document.createElement("button");
                deleteBtn.classList.add("delete-game");
                deleteBtn.innerText = "X";
                deleteBtn.addEventListener("click", async () => {
                    if (confirm('Möchten Sie dieses Spiel wirklich löschen?')) {
                        await db.collection("games").doc(doc.id).delete();
                        renderGames();
                    }
                });
                
                const editBtn = document.createElement("button");
                editBtn.classList.add("edit-game");
                editBtn.innerText = "✎";
                editBtn.addEventListener("click", () => {
                    currentGameId = doc.id;
                    gameNameInput.value = game.name;
                    gameLinkInput.value = game.link;
                    gameImageInput.value = game.image;
                    updateGenreSelection(game.genres || []);
                    document.querySelector('#game-form h2').textContent = "Spiel bearbeiten";
                    gameForm.classList.remove("hidden");
                    gameForm.style.display = 'block';
                });
                
                buttonContainer.appendChild(deleteBtn);
                buttonContainer.appendChild(editBtn);
                div.appendChild(buttonContainer);
            }
            
            gameList.appendChild(div);
        });
    }

    // Initialisierung beim Laden der Seite
    renderGames();
    loadSocialLinks();
});
