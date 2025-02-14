// Bestehender Code bleibt...

const editSocialBtn = document.getElementById("edit-social-btn");
const socialForm = document.getElementById("social-form");
const saveSocialBtn = document.getElementById("save-social");

// Social Media Links aus Firebase laden
async function loadSocialLinks() {
    const doc = await db.collection("settings").doc("social").get();
    if (doc.exists) {
        const data = doc.data();
        document.getElementById("tiktok-btn").href = data.tiktok || "#";
        document.getElementById("discord-btn").href = data.discord || "#";
        document.getElementById("instagram-btn").href = data.instagram || "#";
        document.getElementById("kick-btn").href = data.kick || "#";
    }
}

// Social Media Modal öffnen
editSocialBtn.addEventListener("click", async () => {
    const doc = await db.collection("settings").doc("social").get();
    if (doc.exists) {
        const data = doc.data();
        document.getElementById("tiktok-link").value = data.tiktok || "";
        document.getElementById("discord-link").value = data.discord || "";
        document.getElementById("instagram-link").value = data.instagram || "";
        document.getElementById("kick-link").value = data.kick || "";
    }
    socialForm.classList.remove("hidden");
    socialForm.style.display = 'block';
});

// Social Media Links speichern
saveSocialBtn.addEventListener("click", async () => {
    const socialData = {
        tiktok: document.getElementById("tiktok-link").value,
        discord: document.getElementById("discord-link").value,
        instagram: document.getElementById("instagram-link").value,
        kick: document.getElementById("kick-link").value
    };

    await db.collection("settings").doc("social").set(socialData);
    loadSocialLinks();
    socialForm.classList.add("hidden");
    socialForm.style.display = 'none';
});

// Schließen-Button für Social Media Modal
document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', () => {
        button.closest('.modal').classList.add("hidden");
        button.closest('.modal').style.display = 'none';
    });
});

// Social Media Links beim Laden der Seite laden
document.addEventListener("DOMContentLoaded", () => {
    renderGames();
    loadSocialLinks();
});
