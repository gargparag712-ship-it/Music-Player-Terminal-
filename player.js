const fs=require("fs");
const {spawn}=require("child_process");

process.stdin.setRawMode(true);

let userChoice=0,isPaused=true,playerProcess;
let elapsedDuration=0,totalDuration=0;
let isShuffle=false,isRepeat=false;

// HISTORY
const historyFile="./history.json";
let history={totalSongsPlayed:0,totalHoursPlayed:0,playHistory:[]};

if(fs.existsSync(historyFile)){
    try{
        const savedHistory=JSON.parse(fs.readFileSync(historyFile,"utf8"));
        history.totalSongsPlayed=savedHistory.totalSongsPlayed||0;
        history.totalHoursPlayed=savedHistory.totalHoursPlayed||0;
        history.playHistory=savedHistory.playHistory||[];
    }catch(err){}
}

function saveHistory(durationSeconds){
    if(durationSeconds>0){
        history.totalSongsPlayed++;
        history.totalHoursPlayed+=durationSeconds/3600;
        history.playHistory.push({index:userChoice,name:songMenu[userChoice]});
        fs.writeFileSync(historyFile,JSON.stringify(history,null,2));
    }
}

// DYNAMIC SONGS FOLDER
let songMenu=[];

try{
    songMenu=fs.readdirSync("./songs").filter(file=>!file.startsWith("."));
    if(songMenu.length===0){
        console.log("No songs found in ./songs/ directory!");
        process.exit(1);
    }
}catch(err){
    console.log("Could not read ./songs/ directory. Make sure it exists!");
    process.exit(1);
}

// REUSABLE PLAY FUNCTION
function playCurrentSong(){
    if(playerProcess) playerProcess.kill("SIGINT");
    elapsedDuration=0;
    totalDuration=0;
    getTotalDuration(`./songs/${songMenu[userChoice]}`);
    playerProcess=spawn("vlc",["--intf","rc",`./songs/${songMenu[userChoice]}`]);
    isPaused=false;
}

// NEXT SONG
function nextSong(){
    saveHistory(elapsedDuration);
    if(isShuffle) userChoice=Math.floor(Math.random()*songMenu.length);
    else{
        userChoice++;
        if(userChoice>=songMenu.length) userChoice=0;
    }
    playCurrentSong();
}

// AUTOMATIC NEXT / REPEAT
function checkSongEnd(){
    if(totalDuration>0&&elapsedDuration>=totalDuration){
        if(isRepeat){
            saveHistory(elapsedDuration);
            playCurrentSong();
        }else nextSong();
    }
}

// KEYBOARD INPUT
process.stdin.on("data",data=>{
    // NEXT
    if(data[0]===0x6e){
        nextSong();
        return;
    }

    // BACK
    if(data[0]===0x62){
        saveHistory(elapsedDuration);
        userChoice--;
        if(userChoice<0) userChoice=songMenu.length-1;
        playCurrentSong();
        return;
    }

    // SHUFFLE
    if(data[0]===0x73){
        isShuffle=!isShuffle;
        listSongs();
        return;
    }

    // REPEAT
    if(data[0]===0x72){
        isRepeat=!isRepeat;
        listSongs();
        return;
    }

    // ARROW KEYS
    if(data[0]===0x1b&&data[1]===0x5b){
        // UP
        if(data[2]===0x41){
            if(userChoice>0){
                userChoice--;
                listSongs();
            }
        }
        // DOWN
        else if(data[2]===0x42){
            if(userChoice<songMenu.length-1){
                userChoice++;
                listSongs();
            }
        }
        // RIGHT - SEEK FORWARD
        else if(data[2]===0x43){
            if(playerProcess){
                playerProcess.stdin.write("seek +10\n");
                elapsedDuration+=10;
                if(totalDuration>0&&elapsedDuration>totalDuration)
                    elapsedDuration=totalDuration;
                listSongs();
            }
        }
        // LEFT - SEEK BACKWARD
        else if(data[2]===0x44){
            if(playerProcess){
                playerProcess.stdin.write("seek -10\n");
                elapsedDuration-=10;
                if(elapsedDuration<0) elapsedDuration=0;
                listSongs();
            }
        }
        return;
    }

    // CTRL + C
    if(data[0]===0x03){
        saveHistory(elapsedDuration);
        process.exit(0);
    }

    // ENTER
    if(data[0]===0x0d){
        saveHistory(elapsedDuration);
        playCurrentSong();
        return;
    }

    // PLAY / PAUSE
    if(data[0]===0x70){
        if(playerProcess){
            playerProcess.stdin.write("pause\n");
            isPaused=!isPaused;
            listSongs();
        }
    }
});

// IMPROVED TERMINAL UI
function listSongs(){
    console.clear();
    process.stdout.write("\x1b[36m========================================\x1b[0m\n");
    process.stdout.write("\x1b[36m          CLI MUSIC PLAYER              \x1b[0m\n");
    process.stdout.write("\x1b[36m========================================\x1b[0m\n\n");

    songMenu.forEach((song,ind)=>{
        if(ind===userChoice)
            process.stdout.write(`\x1b[32m> ${ind} : ${song}\x1b[0m\n`);
        else
            process.stdout.write(`  ${ind} : ${song}\n`);
    });

    const ratio=Math.min(1,elapsedDuration/Math.max(1,totalDuration));
    const barLength=40;
    const filledBars=Math.round(ratio*barLength);
    const progressBar="=".repeat(filledBars)+"-".repeat(barLength-filledBars);

    process.stdout.write(`\n[${progressBar}]\n`);
    process.stdout.write(`Time: ${Math.round(elapsedDuration)}s / ${Math.round(totalDuration)}s\n\n`);
    process.stdout.write(`State: ${isPaused?"\x1b[31mPaused\x1b[0m":"\x1b[32mPlaying\x1b[0m"}\n`);
    process.stdout.write(`Shuffle: ${isShuffle?"\x1b[32mON\x1b[0m":"\x1b[31mOFF\x1b[0m"}  |  Repeat: ${isRepeat?"\x1b[32mON\x1b[0m":"\x1b[31mOFF\x1b[0m"}\n`);
    process.stdout.write(`History: ${history.totalSongsPlayed} songs | ${history.totalHoursPlayed.toFixed(2)} hours\n`);

    if(history.playHistory.length>0){
        process.stdout.write("\nRecently Played:\n");
        history.playHistory.slice(-5).forEach(item=>{
            process.stdout.write(`  ${item.index} : ${item.name}\n`);
        });
    }

    process.stdout.write("\n");
    process.stdout.write("\x1b[90mControls:\x1b[0m n=Next  b=Back  p=Play/Pause  s=Shuffle  r=Repeat  ←/→=Seek  Ctrl+C=Exit\n");
}

// GET TOTAL DURATION
function getTotalDuration(songPath){
    const afinfoProcess=spawn("afinfo",[songPath]);
    afinfoProcess.stdout.on("data",data=>{
        const output=data.toString();
        const duration=output.split("estimated duration: ")[1];
        if(duration){
            totalDuration=Number(duration.split(".")[0]);
            listSongs();
        }
    });
}

getTotalDuration(`./songs/${songMenu[userChoice]}`);

setInterval(()=>{
    if(!isPaused&&playerProcess){
        elapsedDuration+=0.05;
        checkSongEnd();
    }
    listSongs();
},50);
