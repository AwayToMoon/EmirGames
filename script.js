const games = [
    { name: "Minecraft", link: "https://minecraft.net" },
    { name: "Fortnite", link: "https://www.epicgames.com/fortnite/" },
    { name: "Among Us", link: "https://innersloth.com/gameAmongUs.php" }
];

const gameList = document.getElementById("game-list");

games.forEach(game => {
    const div = document.createElement("div");
    div.classList.add("game");
    div.innerHTML = `<h2>${game.name}</h2><a href="${game.link}" target="_blank">Spielen</a>`;
    gameList.appendChild(div);
});
