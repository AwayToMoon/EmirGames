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

const ADMIN_PASSWORD = "9966";

adminLoginBtn.addEventListener("click", () => {
    const password = prompt("Bitte Admin-Passwort eingeben:");
    if (password === ADMIN_PASSWORD) {
        adminPanel.classList.remove("hidden");
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
    document.querySelector('.modal h2').textContent = "Neues Spiel hinzufügen";
    gameForm.classList.remove("hidden");
    gameForm.style.display = 'block';
});

editGamesBtn.addEventListener("click", () => {
    isEditMode = !isEditMode;
    renderGames();
    editGamesBtn.textContent = isEditMode ? "Bearbeiten beenden" : "Spiele bearbeiten";
});

// Social Media Links aus Firebase laden
async function loadSocialLinks() {
    const doc = await db.collection("settings").doc("social").get();
    if (doc.exists) {
        const data = doc.data();
        document.getElementById("tiktok-btn").href = data.tiktok || "#";
        document.getElementById("discord-btn").href = data.discord || "#";
        document.getElementById("instagram-btn").href = data.instagram || "#";
        document.getElementById("kick-btn").href = data.kick || "#";
    }
}

// Social Media Modal öffnen
editSocialBtn.addEventListener("click", async () => {
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
});

// Social Media Links speichern
saveSocialBtn.addEventListener("click", async () => {
    const socialData = {
        tiktok: document.getElementById("tiktok-link").value,
        discord: document.getElementById("discord-link").value,
        instagram: document.getElementById("instagram-link").value,
        kick: document.getElementById("kick-link").value
    };

    await db.collection("settings").doc("social").set(socialData);
    loadSocialLinks();
    socialForm.classList.add("hidden");
    socialForm.style.display = 'none';
});

// Schließen-Buttons für alle Modals
document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', () => {
        button.closest('.modal').classList.add("hidden");
        button.closest('.modal').style.display = 'none';
    });
});

// Klick außerhalb der Modals schließt sie
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
            // Spiel aktualisieren
            await db.collection("games").doc(currentGameId).update({
                name, link, image
            });
        } else {
            // Neues Spiel hinzufügen
            await db.collection("games").add({
                name, link, image
            });
        }
        
        gameNameInput.value = "";
        gameLinkInput.value = "";
        gameImageInput.value = "";
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
        div.innerHTML = `
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
                document.querySelector('.modal h2').textContent = "Spiel bearbeiten";
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
document.addEventListener("DOMContentLoaded", () => {
    renderGames();
    loadSocialLinks();
});
