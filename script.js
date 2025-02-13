const games = [
    { name: "Minecraft", link: "https://minecraft.net", image: "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png" },
    { name: "Fortnite", link: "https://www.epicgames.com/fortnite/", image: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Fortnite_cover.jpeg/220px-Fortnite_cover.jpeg" },
    { name: "Among Us", link: "https://innersloth.com/gameAmongUs.php", image: "https://upload.wikimedia.org/wikipedia/en/9/9a/Among_Us_cover_art.jpg" }
];

const gameList = document.getElementById("game-list");
const addGameBtn = document.getElementById("add-game-btn");
const clearGamesBtn = document.getElementById("clear-games-btn");
const gameForm = document.getElementById("game-form");
const saveGameBtn = document.getElementById("save-game");
const gameNameInput = document.getElementById("game-name");
const gameLinkInput = document.getElementById("game-link");
const gameImageInput = document.getElementById("game-image");

addGameBtn.addEventListener("click", () => {
    gameForm.classList.toggle("hidden");
});

clearGamesBtn.addEventListener("click", () => {
    gameList.innerHTML = "";
});

saveGameBtn.addEventListener("click", () => {
    const name = gameNameInput.value;
    const link = gameLinkInput.value;
    const image = gameImageInput.value;

    if (name && link && image) {
        addGameToList(name, link, image);
        gameNameInput.value = "";
        gameLinkInput.value = "";
        gameImageInput.value = "";
        gameForm.classList.add("hidden");
    }
});

function addGameToList(name, link, image) {
    const div = document.createElement("div");
    div.classList.add("game");
    div.innerHTML = `<button class="delete-game">X</button><img src="${image}" alt="${name}" onclick="window.open('${link}', '_blank')"><h2>${name}</h2>`;
    
    div.querySelector(".delete-game").addEventListener("click", () => {
        div.remove();
    });
    
    gameList.appendChild(div);
}

games.forEach(game => {
    addGameToList(game.name, game.link, game.image);
});
