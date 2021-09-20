const tmi = require("tmi.js");
const axios = require("axios");

const client = new tmi.Client({
    channels: ["FlorinPop17"],
});

client.connect();

const earlyGang = {
    isOpen: false,
    check: "#earlygang",
    users: [],
};

const lateGang = {
    isOpen: true,
    check: "#lategang",
    users: [],
};

const secretKey = {
    isOpen: false,
    check: "#toobad",
    users: [],
};

console.log("Leaderboard started!");

client.on("message", (channel, tags, message, self) => {
    const name = tags["display-name"];
    const { color } = tags;
    let isValid = false;

    if (
        lateGang.isOpen &&
        message.toLowerCase().includes(lateGang.check) &&
        !lateGang.users.includes(name)
    ) {
        isValid = true;
        lateGang.users.push(name);
    }

    if (
        earlyGang.isOpen &&
        message.toLowerCase().includes(earlyGang.check) &&
        !earlyGang.users.includes(name)
    ) {
        isValid = true;
        earlyGang.users.push(name);
    }

    if (
        secretKey.isOpen &&
        message.toLowerCase().includes(secretKey.check) &&
        !secretKey.users.includes(name)
    ) {
        isValid = true;
        secretKey.users.push(name);
    }

    if (isValid) {
        const user = {
            name,
            message,
            color,
        };

        axios
            .post("http://localhost:3000/messages", user)
            .then((res) => {
                console.log("Added new stuff");
            })
            .catch((error) => {
                console.error("Some error on adding");
            });
    }
});
