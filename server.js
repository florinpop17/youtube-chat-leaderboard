const puppeteer = require("puppeteer");
const axios = require("axios");

const videoURL = "fKMZTR7X5Uk";

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
    check: "#superfan",
    users: [],
};

const youTubeChatURL = `https://youtube.com/live_chat?v=${videoURL}`;

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36"
    );

    await page.setViewport({ width: 800, height: 800 });
    await page.goto(youTubeChatURL, { waitUntil: "networkidle2" });

    // initial run
    await getAllMessages(page);

    setInterval(async () => {
        await getAllMessages(page);
    }, 60000);

    console.log("All good, bruh!");
})();

async function getAllMessages(page) {
    const messagesEls = await page.$$("yt-live-chat-text-message-renderer");

    for (let messageEl of messagesEls) {
        const message = await messageEl.$eval(
            "#message",
            (el) => el.textContent
        );

        const name = await messageEl.$eval(
            "#author-name",
            (el) => el.textContent
        );

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
            // This is dumb but I don't know how else to get the id 🤷‍♂️
            let id = await messageEl.$eval(
                "#author-photo",
                (el) => el.parentNode.id
            );

            // a trick to trick the algo
            id = id.replace("=", "").replace("%3D", "");

            // check if the id is not already in the DB AND check if the user hasn't yet received a point for this
            await axios
                .get(`http://localhost:3000/messages/${id}`)
                .catch(async () => {
                    const image = await messageEl.$eval("#img", (el) => el.src);

                    const user = {
                        image,
                        name,
                        id,
                        message,
                    };

                    await axios
                        .post("http://localhost:3000/messages", user)
                        .then((res) => {
                            console.log("Added new stuff");
                        })
                        .catch((error) => {
                            console.error("Some error on adding");
                        });
                });
        }
    }
}
