const games = [
    { name: "Life is Strange Remastered", link: "https://store.steampowered.com/app/1265920/Life_is_Strange_Remastered/", image: "https://cdn.discordapp.com/attachments/1267504630884073545/1267672838236667944/bJYCCmymxvgviuuolfOx8srg.png?ex=67aeacd4&is=67ad5b54&hm=065ff82dea913b8dffd6392c1254b68a8e1646f03d90d6c2b7d857a527a62f3f&" },
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
