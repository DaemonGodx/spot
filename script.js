let audio = new Audio();
let songarray = [];
let currentindex = 0;
let close = document.querySelector(".close");
let ham = document.querySelector(".hamburger");
let seekBar = document.querySelector(".seek-bar");

async function getsongs(folder) {
    let a = await fetch(`songs/${encodeURIComponent(folder)}/`);
    let song = await a.text();
    let div = document.createElement("div");
    div.innerHTML = song;
    let x = div.getElementsByTagName("a");
    let arr = [];
    for (let y of x) {
        let s = y.textContent.trim();
        if (s.endsWith(".mp3") || s.endsWith(".wav") || s.endsWith(".ogg") || s.endsWith(".m4a")) {
            arr.push(y);
        }
    }
    return arr;
}

async function getfolders() {
    let a = await fetch(`songs/`);
    let folders = await a.text();
    let div = document.createElement("div");
    div.innerHTML = folders;
    let x = div.getElementsByTagName("a");
    let arr = [];
    for (let y of x) {
        arr.push(y);
    }
    let folderList = document.querySelector(".cards");
    folderList.innerHTML = "";
    for (let i = 1; i < arr.length; i++) {
        let folderName = arr[i].textContent.trim();
        let a = await fetch(`songs/${folderName}/info.json`);
        let response = await a.json();
        folderList.innerHTML += `<div class="playlist" data-folder="${folderName}">
                <img class="cover" src="songs/${folderName}/cover.jpg" alt="Playlist Cover">
                <p>${response.title},${response.artist}</p>
        </div>`;
    }
}

async function main() {
    let lastLoadedFolder = null;
    await getfolders();
    let playButton = document.querySelector(".play-btn");
    let nextButton = document.querySelector(".next-btn");
    let prevButton = document.querySelector(".prev-btn");
    let songlist = document.querySelectorAll(".playlist");

    songlist.forEach((media, index) => {
        media.addEventListener("click", async () => {
            let f = media.getAttribute("data-folder");
            let left = document.querySelector(".left");
            left.classList.toggle("leftout");
            ham.classList.toggle("hamout");
            close.classList.toggle("closeout");

            if (lastLoadedFolder !== f) {
                let x = await getsongs(f);
                songarray = x;
                lastLoadedFolder = f;
                let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
                songUl.innerHTML = "";

                for (let i = 0; i < songarray.length; i++) {
                    let sname = songarray[i].textContent.trim();
                    songUl.innerHTML += `<li>
                    <img src="images/deco/music.svg" alt="">
                    <p style="overflow:hidden; width:60%; max-height:90%; background-color: #191818;">${sname}</p>
                    <span style="margin-left: auto; display: flex; justify-content: center; align-items: center; background-color: #191818;">
                        Play <img src="images/button/paly.svg" alt="">
                    </span>
                </li>`;
                }

                audio.src = songarray[0].href;
                audio.play();
                playButton.innerHTML = '<img src="images/button/pause.svg" alt="">';
                let songs = document.querySelectorAll(".songList ul li");
                songs[0].classList.add("playing");

                songs.forEach((song, index) => {
                    song.addEventListener("click", () => {
                        seekBar.value = 0;
                        currentindex = index;
                        audio.src = songarray[currentindex].href;
                        audio.play();
                        playButton.innerHTML = '<img src="images/button/pause.svg" alt="">';
                        songs.forEach(s => s.classList.remove("playing"));
                        song.classList.add("playing");
                    });
                });
            }
        });
    });

    playButton.addEventListener("click", () => {
        if (audio.src) {
            if (audio.paused) {
                audio.play();
                playButton.innerHTML = '<img src="images/button/pause.svg" alt="">';
            } else {
                audio.pause();
                playButton.innerHTML = '<img src="images/button/paly.svg" alt="">';
            }
        }
    });

    audio.addEventListener("timeupdate", () => {
        if (audio.duration > 0) {
            let progress = (audio.currentTime / audio.duration) * 100;
            seekBar.value = progress;
        }
    });

    seekBar.addEventListener("input", () => {
        if (audio.duration > 0) {
            audio.currentTime = (seekBar.value / 100) * audio.duration;
        }
    });

    nextButton.addEventListener("click", () => {
        if (audio.src && currentindex < songarray.length - 1) {
            currentindex++;
            seekBar.value = 0;
            audio.src = songarray[currentindex].href;
            audio.play();
            playButton.innerHTML = '<img src="images/button/pause.svg" alt="">';
            let allSongs = document.querySelectorAll(".songList ul li");
            allSongs.forEach(s => s.classList.remove("playing"));
            allSongs[currentindex].classList.add("playing");
            allSongs[currentindex].scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    });

    prevButton.addEventListener("click", () => {
        if (audio.src && currentindex > 0) {
            currentindex--;
            seekBar.value = 0;
            audio.src = songarray[currentindex].href;
            audio.play();
            playButton.innerHTML = '<img src="images/button/pause.svg" alt="">';
            let allSongs = document.querySelectorAll(".songList ul li");
            allSongs.forEach(s => s.classList.remove("playing"));
            allSongs[currentindex].classList.add("playing");
            allSongs[currentindex].scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    });
}

ham.addEventListener("click", () => {
    let left = document.querySelector(".left");
    left.classList.add("leftout");
    ham.classList.toggle("hamout");
    close.classList.toggle("closeout");
});

close.addEventListener("click", () => {
    let left = document.querySelector(".left");
    left.classList.remove("leftout");
    ham.classList.toggle("hamout");
    close.classList.toggle("closeout");
});

let volumeBar = document.querySelector(".volume-bar");
let muteButton = document.querySelector(".mute-btn");

audio.volume = volumeBar.value / 100;
let lastVolume = audio.volume;

volumeBar.addEventListener("input", () => {
    let volume = volumeBar.value / 100;
    audio.volume = volume;
    if (volume > 0) {
        lastVolume = volume;
        muteButton.innerHTML = '<img src="images/button/volume.svg" alt="Volume">';
    } else {
        muteButton.innerHTML = '<img src="images/button/mute.svg" alt="Muted">';
    }
});

muteButton.addEventListener("click", () => {
    if (audio.volume > 0) {
        lastVolume = audio.volume;
        audio.volume = 0;
        volumeBar.value = 0;
        muteButton.innerHTML = '<img src="images/button/mute.svg" alt="Muted">';
    } else {
        audio.volume = lastVolume;
        volumeBar.value = lastVolume * 100;
        muteButton.innerHTML = '<img src="images/button/volume.svg" alt="Volume">';
    }
});

audio.addEventListener("timeupdate", () => {
    if (audio.duration > 0) {
        let progress = (audio.currentTime / audio.duration) * 100;
        seekBar.value = progress;
        let current = formatTime(audio.currentTime);
        let total = formatTime(audio.duration);
        document.querySelector(".time-display").textContent = `${current} / ${total}`;
    }
});

main();

function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    if (sec < 10) sec = "0" + sec;
    return `${min}:${sec}`;
}
