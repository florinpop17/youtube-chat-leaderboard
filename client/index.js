// this is bad code. no no code.
const root = document.getElementById("root");

const winners = [];
let users;
let allMessages;

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

getUsers();

db.from("points")
    .on("INSERT", (payload) => {
        getUsers();
        console.log("inserted");
    })
    .subscribe();

async function getPoints() {
    const { data, error } = await db.from("points").select("*");

    if (error) {
        console.log(error);
    }

    return data;
}

async function getUsers() {
    // cleanup the users object
    users = {};

    const messages = await getPoints();

    allMessages = [...messages];

    // create userProfile
    messages.forEach((message) => {
        const { color, username, message: text } = message;

        let eg = false;
        let lg = false;
        let rg = false;

        if (text.toLowerCase().includes("#earlygang")) {
            eg = true;
        } else if (text.toLowerCase().includes("#lategang")) {
            lg = true;
        } else {
            rg = true;
        }

        if (users[username]) {
            users[username].points++;
            users[username].earlyGangPoints += +eg;
            users[username].lateGangPoints += +lg;
            users[username].randomGangPoints += +rg;
        } else {
            users[username] = {
                username,
                color,
                points: 1,
                earlyGangPoints: +eg,
                lateGangPoints: +lg,
                randomGangPoints: +rg,
            };
        }
    });

    createLeaderboard();
}

function createLeaderboard() {
    // reset the root
    root.innerHTML = "";

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
                <div class="round" style="background: ${
                    user.color
                }">${user.username.slice(0, 2).toUpperCase()}</div>
                ${addCrown(idx)}
            </div>
            <p>${user.username} 
            <span>${user.earlyGangPoints}p</span>    
            <span>${user.lateGangPoints}p</span>  
            <span>${user.randomGangPoints}p</span>  
            <span class="total">${user.points}p</p>
        `;
        userEl.classList.add("item");
        root.appendChild(userEl);
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

function selectWinner() {
    let winner =
        allMessages[Math.floor(Math.random() * allMessages.length)].username;

    while (winners.includes(winner)) {
        winner =
            allMessages[Math.floor(Math.random() * allMessages.length)]
                .username;
    }

    console.log(winner);
    winners.push(winner);
}
