const gameList = document.getElementById("game-list");
const adminLoginBtn = document.getElementById("admin-login-btn");
const adminPanel = document.getElementById("admin-panel");
const addGameBtn = document.getElementById("add-game-btn");
const clearGamesBtn = document.getElementById("clear-games-btn");
const gameForm = document.getElementById("game-form");
const saveGameBtn = document.getElementById("save-game");
const gameNameInput = document.getElementById("game-name");
const gameLinkInput = document.getElementById("game-link");
const gameImageInput = document.getElementById("game-image");

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
    gameForm.style.display = 'block';
});

// Schließen-Button Funktionalität
document.querySelector('.close-modal').addEventListener('click', () => {
    gameForm.style.display = 'none';
});

// Klick außerhalb des Modals schließt es
window.addEventListener('click', (event) => {
    if (event.target === gameForm) {
        gameForm.style.display = 'none';
    }
});

clearGamesBtn.addEventListener("click", async () => {
    const gamesRef = db.collection("games");
    const snapshot = await gamesRef.get();
    snapshot.forEach(doc => doc.ref.delete());
    renderGames();
});

saveGameBtn.addEventListener("click", async () => {
    const name = gameNameInput.value;
    const link = gameLinkInput.value;
    const image = gameImageInput.value;

    if (name && link && image) {
        await db.collection("games").add({ name, link, image });
        renderGames();
        gameNameInput.value = "";
        gameLinkInput.value = "";
        gameImageInput.value = "";
        gameForm.style.display = 'none';
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
        div.innerHTML = `<img src="${game.image}" alt="${game.name}" onclick="window.open('${game.link}', '_blank')"><h2>${game.name}</h2>`;
        
        if (!adminPanel.classList.contains("hidden")) {
            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("delete-game");
            deleteBtn.innerText = "X";
            deleteBtn.addEventListener("click", async () => {
                await db.collection("games").doc(doc.id).delete();
                renderGames();
            });
            div.appendChild(deleteBtn);
        }
        
        gameList.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", renderGames);
