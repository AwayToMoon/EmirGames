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

const ADMIN_PASSWORD = "ilnaruto9966"; // Ändere dies zu deinem gewünschten Passwort

let games = JSON.parse(localStorage.getItem("games")) || [
    { name: "Minecraft", link: "https://minecraft.net", image: "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png" },
    { name: "Fortnite", link: "https://www.epicgames.com/fortnite/", image: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Fortnite_cover.jpeg/220px-Fortnite_cover.jpeg" },
    { name: "Among Us", link: "https://innersloth.com/gameAmongUs.php", image: "https://upload.wikimedia.org/wikipedia/en/9/9a/Among_Us_cover_art.jpg" }
];

adminLoginBtn.addEventListener("click", () => {
    const password = prompt("Bitte Admin-Passwort eingeben:");
    if (password === ADMIN_PASSWORD) {
        adminPanel.classList.remove("hidden");
    } else {
        alert("Falsches Passwort!");
    }
});

addGameBtn.addEventListener("click", () => {
    gameForm.classList.toggle("hidden");
});

clearGamesBtn.addEventListener("click", () => {
    games = [];
    localStorage.setItem("games", JSON.stringify(games));
    renderGames();
});

saveGameBtn.addEventListener("click", () => {
    const name = gameNameInput.value;
    const link = gameLinkInput.value;
    const image = gameImageInput.value;

    if (name && link && image) {
        games.push({ name, link, image });
        localStorage.setItem("games", JSON.stringify(games));
        renderGames();
        gameNameInput.value = "";
        gameLinkInput.value = "";
        gameImageInput.value = "";
        gameForm.classList.add("hidden");
    }
});

function renderGames() {
    gameList.innerHTML = "";
    games.forEach((game, index) => {
        const div = document.createElement("div");
        div.classList.add("game");
        div.innerHTML = `<img src="${game.image}" alt="${game.name}" onclick="window.open('${game.link}', '_blank')"><h2>${game.name}</h2>`;
        
        if (!adminPanel.classList.contains("hidden")) {
            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("delete-game");
            deleteBtn.innerText = "X";
            deleteBtn.addEventListener("click", () => {
                games.splice(index, 1);
                localStorage.setItem("games", JSON.stringify(games));
                renderGames();
            });
            div.appendChild(deleteBtn);
        }
        
        gameList.appendChild(div);
    });
}

renderGames();
