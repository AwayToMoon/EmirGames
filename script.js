const gameLinkInput = document.getElementById("game-link");
const gameImageInput = document.getElementById("game-image");

const ADMIN_PASSWORD = "ilnaruto9966"; // Ändere dies zu deinem gewünschten Passwort
let games = JSON.parse(localStorage.getItem("games")) || [
    { name: "Minecraft", link: "https://minecraft.net", image: "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png" },
    { name: "Fortnite", link: "https://www.epicgames.com/fortnite/", image: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Fortnite_cover.jpeg/220px-Fortnite_cover.jpeg" },
    { name: "Among Us", link: "https://innersloth.com/gameAmongUs.php", image: "https://upload.wikimedia.org/wikipedia/en/9/9a/Among_Us_cover_art.jpg" }
];
const ADMIN_PASSWORD = "9966";

adminLoginBtn.addEventListener("click", () => {
    const password = prompt("Bitte Admin-Passwort eingeben:");
@@ -30,20 +24,20 @@ addGameBtn.addEventListener("click", () => {
    gameForm.classList.toggle("hidden");
});

clearGamesBtn.addEventListener("click", () => {
    games = [];
    localStorage.setItem("games", JSON.stringify(games));
clearGamesBtn.addEventListener("click", async () => {
    const gamesRef = db.collection("games");
    const snapshot = await gamesRef.get();
    snapshot.forEach(doc => doc.ref.delete());
    renderGames();
});

saveGameBtn.addEventListener("click", () => {
saveGameBtn.addEventListener("click", async () => {
    const name = gameNameInput.value;
    const link = gameLinkInput.value;
    const image = gameImageInput.value;

    if (name && link && image) {
        games.push({ name, link, image });
        localStorage.setItem("games", JSON.stringify(games));
        await db.collection("games").add({ name, link, image });
        renderGames();
        gameNameInput.value = "";
        gameLinkInput.value = "";
@@ -52,9 +46,11 @@ saveGameBtn.addEventListener("click", () => {
    }
});

function renderGames() {
async function renderGames() {
    gameList.innerHTML = "";
    games.forEach((game, index) => {
    const snapshot = await db.collection("games").get();
    snapshot.forEach(doc => {
        const game = doc.data();
        const div = document.createElement("div");
        div.classList.add("game");
        div.innerHTML = `<img src="${game.image}" alt="${game.name}" onclick="window.open('${game.link}', '_blank')"><h2>${game.name}</h2>`;
@@ -63,9 +59,8 @@ function renderGames() {
            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("delete-game");
            deleteBtn.innerText = "X";
            deleteBtn.addEventListener("click", () => {
                games.splice(index, 1);
                localStorage.setItem("games", JSON.stringify(games));
            deleteBtn.addEventListener("click", async () => {
                await db.collection("games").doc(doc.id).delete();
                renderGames();
            });
            div.appendChild(deleteBtn);
@@ -75,4 +70,4 @@ function renderGames() {
    });
}

renderGames();
document.addEventListener("DOMContentLoaded", renderGames);
