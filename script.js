const games = [
    { name: "Minecraft", link: "https://minecraft.net", image: "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png" },
    { name: "Fortnite", link: "https://www.epicgames.com/fortnite/", image: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Fortnite_cover.jpeg/220px-Fortnite_cover.jpeg" },
    { name: "Among Us", link: "https://innersloth.com/gameAmongUs.php", image: "https://upload.wikimedia.org/wikipedia/en/9/9a/Among_Us_cover_art.jpg" }
];

const gameList = document.getElementById("game-list");
const addGameBtn = document.getElementById("add-game-btn");
const gameForm = document.getElementById("game-form");
const saveGameBtn = document.getElementById("save-game");
const gameNameInput = document.getElementById("game-name");
const gameLinkInput = document.getElementById("game-link");
const gameImageInput = document.getElementById("game-image");

addGameBtn.addEventListener("click", () => {
    gameForm.classList.toggle("hidden");
});

saveGameBtn.addEventListener("click", () => {
    const name = gameNameInput.value;
    const link = gameLinkInput.value;
    const image = gameImageInput.value;

    if (name && link && image) {
        const div = document.createElement("div");
        div.classList.add("game");
        div.innerHTML = `<img src="${image}" alt="${name}" onclick="window.open('${link}', '_blank')"><h2>${name}</h2>`;
        gameList.appendChild(div);
        
        gameNameInput.value = "";
        gameLinkInput.value = "";
        gameImageInput.value = "";
        gameForm.classList.add("hidden");
    }
});

games.forEach(game => {
    const div = document.createElement("div");
    div.classList.add("game");
    div.innerHTML = `<img src="${game.image}" alt="${game.name}" onclick="window.open('${game.link}', '_blank')"><h2>${game.name}</h2>`;
    gameList.appendChild(div);
});
