const leaderboard = document.getElementById("leaderboard");

const users = {};

const localhost = "127.0.0.1";
const dbPath =
    window.location.hostname === localhost ? "/client/db.json" : "/db.json";

getUsers();

async function getUsers() {
    const res = await fetch(dbPath);
    const data = await res.json();

    const { messages } = data;

    // create userProfile
    messages.forEach((message) => {
        const { color, name } = message;
        if (users[name]) {
            users[name].points++;
        } else {
            users[name] = {
                name,
                color,
                points: 1,
            };
        }
    });

    createLeaderboard();
}

function createLeaderboard() {
    // find a better way to do sorting
    const arr = [];
    for (const user in users) {
        arr.push(users[user]);
    }

    arr.sort((a, b) => b.points - a.points);

    arr.forEach((user, idx) => {
        const userEl = document.createElement("div");
        userEl.innerHTML = `
            <span>${idx + 1}.</span>
            <div class="image-wrapper">
                <div class="round" style="background: ${user.color}">${user.name
            .slice(0, 2)
            .toUpperCase()}</div>
                ${addCrown(idx)}
            </div>
            <p>${user.name} <span>${user.points} point${
            user.points < 2 ? "" : "s"
        }</span></p>
        `;
        userEl.classList.add("item");
        leaderboard.appendChild(userEl);
    });
}

function addCrown(idx) {
    if (idx === 0) {
        return crown("#ffec00");
    } else if (idx === 1) {
        return crown("#D7D7D7");
    } else if (idx === 2) {
        return crown("#824A02");
    } else {
        return "";
    }
}

function crown(color) {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" class="crown" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="${color}" fill="${color}" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z" />
    </svg>`;
}
