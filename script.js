const games = [
    { name: "Life is Strange Remastered", link: "https://store.steampowered.com/app/1265920/Life_is_Strange_Remastered/", image: "https://cdn.discordapp.com/attachments/1267504630884073545/1267672838236667944/bJYCCmymxvgviuuolfOx8srg.png?ex=67aeacd4&is=67ad5b54&hm=065ff82dea913b8dffd6392c1254b68a8e1646f03d90d6c2b7d857a527a62f3f&" },
     { name: "Life is Strange 2", link: "https://store.steampowered.com/app/532210/Life_is_Strange_2/", image: "https://cdn.discordapp.com/attachments/1267504630884073545/1267672838954025031/11307PfTcSkzoUXV6-OCmgIfOFz33WYgxJA1_7h5460YrKv021DjJMMWauCtY46PJ-Ld-eVv5nTteZikwBFKRvgC4CsAJw-B.png?ex=67aeacd5&is=67ad5b55&hm=f27b7f309b5f84508fd41ebc98c677d100848d0c845aaabc5b57056f4fa55783&" },
    { name: "Life is Strange True Colors", link: "https://store.steampowered.com/app/936790/Life_is_Strange_True_Colors/", image: "https://media.discordapp.net/attachments/1267504630884073545/1267672839977177138/3dyuKyHwI92XXR28jyN8PRgt.png?ex=67aeacd5&is=67ad5b55&hm=8d1dda410ee28a588c008af27e456613d6c650d2f72acf2a6dd72db112134305&=&format=webp&quality=lossless&width=398&height=597" }
];

const gameList = document.getElementById("game-list");

games.forEach(game => {
    const div = document.createElement("div");
    div.classList.add("game");
    div.innerHTML = `<img src="${game.image}" alt="${game.name}" onclick="window.open('${game.link}', '_blank')"><h2>${game.name}</h2>`;
    gameList.appendChild(div);
});
