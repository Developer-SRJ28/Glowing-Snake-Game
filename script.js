const board = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const startBtn = document.getElementById("start-btn");
const eatSound = document.getElementById("eat-sound");
const countdownSound = document.getElementById("countdown-sound");
const gameOverSound = document.getElementById("gameOver-sound");
const boardSize = 18;
const cellSize = 18;
const skinBtns = document.querySelectorAll('.skin-btn');
const restartBtn = document.getElementById("restart-btn");

let selectedSkin = 'green'; // default skin

board.style.width = `${boardSize * cellSize}px`;
board.style.height = `${boardSize * cellSize}px`;
board.style.display = "grid";
board.style.gridTemplateColumns = `repeat(${boardSize}, ${cellSize}px)`;
board.style.gridTemplateRows = `repeat(${boardSize}, ${cellSize}px)`;

let canSelectColor = true; // Flag to control skin selection
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
let gameSpeed = 450; // speed in milliseconds (lower = faster)
let playerName= sessionStorage.getItem("playerName") || null;
let snake = [];
let food = {};
let direction = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameInterval;
let isGameOver = false; // better name, no conflict

skinBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!canSelectColor) return; // Prevent skin change if not allowed
    skinBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedSkin = btn.getAttribute('data-skin');
    // Call your function to change the snake skin here, e.g.:
    if (typeof setSnakeSkin === 'function') setSnakeSkin(selectedSkin);
  });
});
// Optionally, select the default on load
document.querySelector('.skin-btn[data-skin="green"]').classList.add('selected');

// Initialize the game
function startGame() {
  
  document.getElementById("game-over").style.display = "none";
  startBtn.style.display = "none";
  restartBtn.style.display = "inline-block";

  clearInterval(gameInterval);
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  score = 0;
  placeFood();
  updateScore();
  isGameOver= false; // reset game over state
  gameInterval = setInterval(update, gameSpeed);
}
window.addEventListener("DOMContentLoaded", () => {
  if (!playerName) {
    setTimeout(() => {
      playerName = prompt("Enter your player name:");
      if (playerName) {
        sessionStorage.setItem("playerName", playerName);
      }
    }, 100); // slight delay to ensure prompt after page load
  }
});
startBtn.addEventListener("click",() => {
  if (!selectedSkin) {
    alert("Please choose a snake color before starting");
    return;
  }
  canSelectColor = false; // Lock color selection
  document.getElementById("choose-color-prompt").style.display = "none";
startCountdown(startGame);
unlockAudio();

if (!playerName) {
   if (!playerName) {
    alert("Please reload and enter your name to play.");
    return;

}}});

function startCountdown(callback) {
  const overlay = document.getElementById("countdown-overlay");
  const countdownText = document.getElementById("countdown-text");
    
  let count = 10;
  overlay.classList.add("show");
  countdownText.textContent = count;

  if (countdownSound){ 
    countdownSound.currentTime = 0; // Reset sound to start
    countdownSound.play();}

  const countdownInterval = setInterval(() => {
    count--;
    countdownText.textContent = count > 0 ? count : "Go!";
    if (count < 0) {
      clearInterval(countdownInterval);
      overlay.classList.remove("show");
      if (callback) callback();
    }
  }, 1000);
}


function placeFood() {
  food = {
    x: Math.floor(Math.random() * boardSize) + 1,
    y: Math.floor(Math.random() * boardSize) + 1,
  };
}

function restartGame() {
  canSelectColor = true; // Allow color selection again
  document.getElementById("choose-color-prompt").style.display = "block";
  console.log("Restarting...");
  board.innerHTML = "";
  placeFood();// fixed
  console.log("New food at:", food);
  snake = [{ x: 10, y: 10 }]; 
  direction = { x: 1, y: 0 }; 
  score = 0; 
  isGameOver = false;
  updateScore();
  renderLeaderboard();

  // Clear and restart loop
  clearInterval(gameInterval);
  gameInterval = setInterval(update, 400);
  document.getElementById("game-over").style.display = "none";
}

restartBtn.addEventListener("click", ()=>{
  startCountdown(restartGame);
});

function update() {
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (
    head.x < 1 || head.x > boardSize ||
    head.y < 1 || head.y > boardSize ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) 
  {
   gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    eatSound.play(); 
    score++;
    updateScore();
    placeFood();
  } else {
     snake.pop();
    }

  draw();
}

function draw() {
  board.innerHTML = "";

  snake.forEach(segment => {
    const el = document.createElement("div");
    el.classList.add("snake", selectedSkin);
    el.style.gridColumnStart = segment.x;
    el.style.gridRowStart = segment.y;
    board.appendChild(el);
  });

  const foodEl = document.createElement("div");
  foodEl.classList.add("food");
  foodEl.style.gridColumnStart = food.x;
  foodEl.style.gridRowStart = food.y;
  board.appendChild(foodEl);
}


function gameOver() {
  clearInterval(gameInterval);
  isGameOver=true;
  gameOverSound.play();

  document.getElementById("game-over").style.display = "block";

  if (playerName) {
    saveScore(playerName, score);
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    let entry = leaderboard.find(e => e.name === playerName);
    if (entry && entry.score === score && score > 0) {
      alert("Congratulations! New Personal Best: " + score);
    }
  }
  canSelectColor = true; // Allow color selection again
  document.getElementById("choose-color-prompt").style.display = "block";
  updateScore();
  direction = { x: 0, y: 0 };
}


function updateScore() {
  scoreDisplay.textContent = `Score: ${score} | High Score: ${highScore}`;
}

function saveScore(name, score) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  // Check if player already exists
  const existing = leaderboard.find(entry => entry.name === name);
  if (existing) {
    // Only update if new score is higher
    if (score > existing.score) {
      existing.score = score;
    }
  } else {
    leaderboard.push({ name, score });
  }
  // Sort and keep top 10
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  renderLeaderboard();

};

function updateLeaderboard(name, score) {
saveScore(name, score);
  
}
function renderLeaderboard() {
  const leaderboardList = document.getElementById("leaderboard-list");
  leaderboardList.innerHTML = "";

  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard
    .filter(entry => entry.score > 0)
    .forEach((entry, index) => {
      const li = document.createElement("li");
      li.textContent = `${entry.name}: ${entry.score}`;
      leaderboardList.appendChild(li);
  });
}


window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
});
 document.getElementById("up-btn").addEventListener("click", () => {
  if (direction.y === 0) direction = { x: 0, y: -1 };});

  document.getElementById("down-btn").addEventListener("click", () => {  
  if (direction.y === 0) direction = { x: 0, y: 1 };});

  document.getElementById("left-btn").addEventListener("click", () => {
  if (direction.x === 0) direction = { x: -1, y: 0 };} );

  document.getElementById("right-btn").addEventListener("click", () => {
  if (direction.x === 0) direction = { x: 1, y: 0 };});
  renderLeaderboard(); 

document.getElementById("reset-leaderboard-btn").addEventListener("click", () => {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard = leaderboard.filter(entry => entry.score > 0 && entry.name.trim() !== "");
 const bestScores = {};
  leaderboard.forEach(entry => {
    const name = entry.name.trim();
    if (!bestScores[name] || entry.score > bestScores[name].score) {
      bestScores[name] = entry;
    }
  });
  leaderboard = Object.values(bestScores).sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  renderLeaderboard();
  alert("Leaderboard cleaned: only highest score per player, no zero or nameless scores.");
});
