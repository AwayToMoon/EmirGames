const games = [
    { name: "Minecraft", link: "https://minecraft.net", image: "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png" },
    { name: "Fortnite", link: "https://www.epicgames.com/fortnite/", image: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Fortnite_cover.jpeg/220px-Fortnite_cover.jpeg" },
    { name: "Among Us", link: "https://innersloth.com/gameAmongUs.php", image: "https://upload.wikimedia.org/wikipedia/en/9/9a/Among_Us_cover_art.jpg" }
];

const gameList = document.getElementById("game-list");

games.forEach(game => {
    const div = document.createElement("div");
    div.classList.add("game");
    div.innerHTML = `<img src="${game.image}" alt="${game.name}"><h2>${game.name}</h2><a href="${game.link}" target="_blank">Spielen</a>`;
    gameList.appendChild(div);
});
