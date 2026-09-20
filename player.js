
const fs = require("fs");
const { spawn } = require("child_process");

process.stdin.setRawMode(true);

let userChoice = 0;
let isPaused = true;
let playerProcess = undefined;
let elapsedDuration = 0;
let totalDuration = 0;
let isShuffle = false;
let isRepeat = false;

// DYNAMIC SONGS FOLDER READING
let songMenu = [];

try {
    songMenu = fs.readdirSync("./songs").filter(file => !file.startsWith("."));
    if (songMenu.length === 0) {
        console.log("No songs found in ./songs/ directory!");
        process.exit(1);
    }
} catch (err) {
    console.log("Could not read ./songs/ directory. Make sure it exists!");
    process.exit(1);
}

// PLAY CURRENT SONG
function playCurrentSong() {
    if (playerProcess !== undefined) {
        playerProcess.kill("SIGINT");
    }

    elapsedDuration = 0;
    totalDuration = 0;
    getTotalDuration(`./songs/${songMenu[userChoice]}`);

    playerProcess = spawn(
        "vlc",
        ["--intf", "rc", `./songs/${songMenu[userChoice]}`]
    );

    isPaused = false;
}

// NEXT SONG
function nextSong() {
    if (isShuffle) {
        userChoice = Math.floor(Math.random() * songMenu.length);
    } else {
        userChoice += 1;
        if (userChoice >= songMenu.length) userChoice = 0;
    }
    playCurrentSong();
}

// KEYBOARD INPUT
process.stdin.on("data", (data) => {
    // NEXT
    if (data[0] === 0x6e) {
        nextSong();
        return;
    }

    // BACK
    if (data[0] === 0x62) {
        userChoice -= 1;
        if (userChoice < 0) userChoice = songMenu.length - 1;
        playCurrentSong();
        return;
    }

    // SHUFFLE
    if (data[0] === 0x73) {
        isShuffle = !isShuffle;
        listSongs();
        return;
    }

    // REPEAT
    if (data[0] === 0x72) {
        isRepeat = !isRepeat;
        listSongs();
        return;
    }

    // ARROW KEYS
    if (data[0] === 0x1b && data[1] === 0x5b) {
        // UP
        if (data[2] === 0x41) {
            if (userChoice > 0) {
                userChoice -= 1;
                listSongs();
            }
        }
        // DOWN
        else if (data[2] === 0x42) {
            if (userChoice < songMenu.length - 1) {
                userChoice += 1;
                listSongs();
            }
        }
        // RIGHT - SEEK FORWARD
        else if (data[2] === 0x43) {
            if (playerProcess !== undefined) {
                playerProcess.stdin.write("seek +10\n");
                elapsedDuration += 10;
                if (totalDuration > 0 && elapsedDuration > totalDuration) {
                    elapsedDuration = totalDuration;
                }
                listSongs();
            }
        }
        // LEFT - SEEK BACKWARD
        else if (data[2] === 0x44) {
            if (playerProcess !== undefined) {
                playerProcess.stdin.write("seek -10\n");
                elapsedDuration -= 10;
                if (elapsedDuration < 0) elapsedDuration = 0;
                listSongs();
            }
        }
        return;
    }

    // CTRL + C
    if (data[0] === 0x03) {
        process.exit(0);
    }

    // ENTER
    if (data[0] === 0x0d) {
        playCurrentSong();
    }

    // PLAY / PAUSE
    if (data[0] === 0x70) {
        if (playerProcess !== undefined) {
            playerProcess.stdin.write("pause\n");
            isPaused = !isPaused;
            listSongs();
        }
    }
});

// LIST SONGS + PROGRESS BAR
function listSongs() {
    console.clear();

    songMenu.forEach((song, ind) => {
        if (ind === userChoice) {
            process.stdout.write(`> ${ind} : ${song}\x1B[0K\n`);
        } else {
            process.stdout.write(` ${ind} : ${song}\x1B[0K\n`);
        }
    });

    const ratio = Math.min(1, elapsedDuration / Math.max(1, totalDuration));
    const barLength = 100;
    const filledBars = Math.round(ratio * barLength);
    const emptyBars = barLength - filledBars;

    const progressBar = "=".repeat(filledBars) + "-".repeat(emptyBars);

    process.stdout.write(`\n[${progressBar}]\n`);
    process.stdout.write(
        `Elapsed Duration: ${Math.round(elapsedDuration)} / ${Math.round(totalDuration)} seconds\n`
    );
    process.stdout.write(
        `Shuffle: ${isShuffle ? "ON" : "OFF"} | Repeat: ${isRepeat ? "ON" : "OFF"}\n`
    );
}

// GET TOTAL SONG DURATION
function getTotalDuration(songPath) {
    const afinfoProcess = spawn("afinfo", [songPath]);

    afinfoProcess.stdout.on("data", (data) => {
        const output = data.toString();
        const duration = output.split("estimated duration: ")[1];

        if (duration) {
            totalDuration = Number(duration.split(".")[0]);
            listSongs();
        }
    });
}

// INITIAL SONG DURATION
getTotalDuration(`./songs/${songMenu[userChoice]}`);

// TIMER
setInterval(() => {
    if (isPaused === false && playerProcess !== undefined) {
        elapsedDuration += 0.05;

        if (totalDuration > 0 && elapsedDuration >= totalDuration) {
            if (isRepeat) {
                playCurrentSong();
            } else {
                nextSong();
            }
        }
    }

    listSongs();
}, 50);

