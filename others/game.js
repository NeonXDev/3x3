const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0];
let state = [...SOLVED];
let moves = 0, startTime = null, timer = null, won = false;
let currentimg = "https://picsum.photos/id/237/300/300";

function changePresent() {
    const val = document.getElementById("present").value;
    const customWrap = document.getElementById("customWrap");
    if (val === "custom") {
        customWrap.style.display = "flex";
        currentimg = document.getElementById("imgURL").value;
    } else {
        customWrap.style.display = "none";
        currentimg = val;
        initGame();
    }
}

function initGame() {
    if (document.getElements)