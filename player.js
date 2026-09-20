const fs = require("fs");
const { spawn } = require("child_process");

process.stdin.setRawMode(true);

let userChoice = 0;
let isPaused = true;
let playerProcess = undefined;

let elapsedDuration = 0;
let totalDuration = 0;

// DYNAMIC SONGS FOLDER READING
let songMenu = [];

try {
    songMenu = fs.readdirSync("./songs")
        .filter(file => !file.startsWith("."));

    if (songMenu.length === 0) {
        console.log("No songs found in ./songs/ directory!");
        process.exit(1);
    }
} catch (err) {
    console.log("Could not read ./songs/ directory. Make sure it exists!");
    process.exit(1);
}

// KEYBOARD INPUT
process.stdin.on("data", (data) => {
    // NEXT SONG
    if (data[0] === 0x6e) {
        userChoice += 1;

        if (userChoice >= songMenu.length) {
            userChoice = 0;
        }

        if (playerProcess !== undefined) {
            playerProcess.kill("SIGINT");
        }

        playerProcess = spawn(
            "vlc",
            ["--intf", "rc", `./songs/${songMenu[userChoice]}`]
        );

        isPaused = false;
        elapsedDuration = 0;
        getTotalDuration(`./songs/${songMenu[userChoice]}`);
        return;
    }

    // BACK SONG
    if (data[0] === 0x62) {
        userChoice -= 1;

        if (userChoice < 0) {
            userChoice = songMenu.length - 1;
        }

        if (playerProcess !== undefined) {
            playerProcess.kill("SIGINT");
        }

        playerProcess = spawn(
            "vlc",
            ["--intf", "rc", `./songs/${songMenu[userChoice]}`]
        );

        isPaused = false;
        elapsedDuration = 0;
        getTotalDuration(`./songs/${songMenu[userChoice]}`);
        return;
    }

    // UP / DOWN ARROW KEYS
    if (data[0] === 0x1b) {
        if (data[1] === 0x5b) {
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
        }

        if (data[0] === 0x03) {
            process.exit(0);
        }
    }

    // CTRL + C
    if (data[0] === 0x03) {
        process.exit(0);
    }

    // ENTER - PLAY SONG
    if (data[0] === 0x0d) {
        if (playerProcess !== undefined) {
            playerProcess.kill("SIGINT");
        }

        elapsedDuration = 0;
        getTotalDuration(`./songs/${songMenu[userChoice]}`);

        playerProcess = spawn(
            "vlc",
            ["--intf", "rc", `./songs/${songMenu[userChoice]}`]
        );

        isPaused = false;
    }

    // P - PLAY / PAUSE
    if (data[0] === 0x70) {
        if (playerProcess !== undefined) {
            playerProcess.stdin.write("pause\n");
            isPaused = !isPaused;
            console.log("User hit Play/Pause");
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

    // PROGRESS BAR
    const ratio = Math.min(
        1,
        elapsedDuration / Math.max(1, totalDuration)
    );

    const barLength = 100;
    const filledBars = Math.round(ratio * barLength);
    const emptyBars = barLength - filledBars;

    const progressBar =
        "=".repeat(filledBars) +
        "-".repeat(emptyBars);

    process.stdout.write(`\n[${progressBar}]\n`);

    // ELAPSED / TOTAL TIME
    process.stdout.write(
        `Elapsed Duration: ${Math.round(elapsedDuration)} / ${Math.round(totalDuration)} seconds\n`
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
    }

    listSongs();
}, 50);