document.addEventListener("DOMContentLoaded", function () {
    const gameList = document.getElementById("game-list");
    const gameForm = document.getElementById("game-form");
    const editGameForm = document.getElementById("edit-game-form");

    const gameNameInput = document.getElementById("game-name");
    const gameLinkInput = document.getElementById("game-link");
    const gameImageInput = document.getElementById("game-image");
    const saveGameButton = document.getElementById("save-game");

    const editGameNameInput = document.getElementById("edit-game-name");
    const editGameLinkInput = document.getElementById("edit-game-link");
    const editGameImageInput = document.getElementById("edit-game-image");
    const updateGameButton = document.getElementById("update-game");
    const closeEditButton = document.getElementById("close-edit");

    let editingGameId = null;

    function renderGames() {
        gameList.innerHTML = "";
        db.collection("games").get().then(snapshot => {
            snapshot.forEach(doc => {
                const game = doc.data();
                const gameElement = document.createElement("div");
                gameElement.classList.add("game");

                gameElement.innerHTML = `
                    <img src="${game.image}" alt="${game.name}" onclick="window.open('${game.link}', '_blank')">
                    <h3>${game.name}</h3>
                    <button class="edit-game" data-id="${doc.id}">Bearbeiten</button>
                    <button class="delete-game" data-id="${doc.id}">Löschen</button>
                `;

                gameList.appendChild(gameElement);
            });

            document.querySelectorAll(".edit-game").forEach(button => {
                button.addEventListener("click", function () {
                    const gameId = this.getAttribute("data-id");
                    db.collection("games").doc(gameId).get().then(doc => {
                        if (doc.exists) {
                            const game = doc.data();
                            editingGameId = gameId;
                            editGameNameInput.value = game.name;
                            editGameLinkInput.value = game.link;
                            editGameImageInput.value = game.image;
                            editGameForm.classList.remove("hidden");
                        }
                    });
                });
            });

            document.querySelectorAll(".delete-game").forEach(button => {
                button.addEventListener("click", function () {
                    const gameId = this.getAttribute("data-id");
                    db.collection("games").doc(gameId).delete().then(() => {
                        renderGames();
                    });
                });
            });
        });
    }

    saveGameButton.addEventListener("click", function () {
        const newGame = {
            name: gameNameInput.value,
            link: gameLinkInput.value,
            image: gameImageInput.value
        };

        db.collection("games").add(newGame).then(() => {
            gameForm.classList.add("hidden");
            renderGames();
        });
    });

    updateGameButton.addEventListener("click", function () {
        if (editingGameId) {
            db.collection("games").doc(editingGameId).update({
                name: editGameNameInput.value,
                link: editGameLinkInput.value,
                image: editGameImageInput.value
            }).then(() => {
                editGameForm.classList.add("hidden");
                renderGames();
            });
        }
    });

    closeEditButton.addEventListener("click", function () {
        editGameForm.classList.add("hidden");
    });

    renderGames();
});
