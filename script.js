const player = document.getElementById('player');
const levelIndicator = document.getElementById('level-indicator');
const scoreCounter = document.getElementById('score-counter');
const timer = document.getElementById('timer');
const levelMenu = document.getElementById('level-menu');
const levelSelectButtons = document.querySelectorAll('.level-select-button');
const gameContainer = document.getElementById('game-container');

let playerX = 100; // Initial player position (X-axis)
let playerY = 400; // Initial player position (Y-axis)
let velocityY = 0; // Player's vertical velocity
let isJumping = false; // Is the player jumping?
let currentLevel = 1; // Current level number
let gameRunning = false; // Is the game running?
let score = 0; // Player's score
let time = 0; // Timer value
let timerInterval; // Interval for the timer
const gravity = 0.5; // Gravity effect

// Backgrounds for each level
const backgrounds = {
  1: 'url("Background 5 (Bonus).png")',
  2: 'url("Background 6 (Bonus).png")',
  3: 'url("Background 7 (Bonus).png")',
};

// Key controls (Arrow keys and WASD)
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  KeyA: false,
  KeyD: false,
  KeyW: false,
};

// Function to load a level
function loadLevel(level) {
  gameContainer.style.backgroundImage = backgrounds[level];
  document.querySelectorAll('.platform, .goal, .collectible, .spike, .gravity-zone').forEach((el) => {
    el.style.display = el.classList.contains(`level${level}`) ? 'block' : 'none';
  });
  levelIndicator.textContent = `Level ${level}: ${getLevelName(level)}`;
}

// Get the name of a level based on its number
function getLevelName(level) {
  switch (level) {
    case 1:
      return 'The Dawn';
    case 2:
      return 'Forest of Lights';
    case 3:
      return 'The Ruined City';
    default:
      return 'Unknown';
  }
}

// Start the game at a specific level
function startGameAtLevel(level) {
  currentLevel = level;
  resetGame();
  loadLevel(currentLevel);
  levelMenu.style.display = 'none';
  gameRunning = true;
  startTimer();
}

// Update the player's score display
function updateScore() {
  scoreCounter.textContent = `Score: ${score}`;
}

// Start the timer
function startTimer() {
  time = 0;
  timerInterval = setInterval(() => {
    time++;
    timer.textContent = `Time: ${time}`;
  }, 1000);
}

// Stop the timer
function stopTimer() {
  clearInterval(timerInterval);
}

// Reset the timer
function resetTimer() {
  stopTimer();
  time = 0;
  timer.textContent = `Time: 0`;
}

// Check for collectible collisions
function checkCollectibles() {
  const collectibles = document.querySelectorAll(`.collectible.level${currentLevel}`);
  collectibles.forEach((collectible) => {
    const collectibleRect = collectible.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
      playerRect.bottom > collectibleRect.top &&
      playerRect.top < collectibleRect.bottom &&
      playerRect.right > collectibleRect.left &&
      playerRect.left < collectibleRect.right
    ) {
      collectible.style.display = 'none';
      score += 10;
      updateScore();
    }
  });
}

// Check for hazard collisions
function checkHazards() {
  const hazards = document.querySelectorAll(`.spike.level${currentLevel}`);
  hazards.forEach((hazard) => {
    const hazardRect = hazard.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
      playerRect.bottom > hazardRect.top &&
      playerRect.top < hazardRect.bottom &&
      playerRect.right > hazardRect.left &&
      playerRect.left < hazardRect.right
    ) {
      alert('You hit a hazard! Restarting level...');
      resetGame();
    }
  });
}

// Check for gravity zones
function checkGravityZones() {
  const gravityZones = document.querySelectorAll(`.gravity-zone.level${currentLevel}`);
  gravityZones.forEach((zone) => {
    const zoneRect = zone.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
      playerRect.bottom > zoneRect.top &&
      playerRect.top < zoneRect.bottom &&
      playerRect.right > zoneRect.left &&
      playerRect.left < zoneRect.right
    ) {
      velocityY -= 0.5; // Reduce gravity effect
    }
  });
}

// Move platforms (for moving platform mechanics)
function movePlatforms() {
  const movingPlatforms = document.querySelectorAll('.moving-platform');
  movingPlatforms.forEach((platform) => {
    const top = parseFloat(platform.style.top);
    platform.style.top = `${top + Math.sin(Date.now() / 500) * 2}px`; // Smooth oscillation
  });
}

// Update player position and handle collisions
function updatePlayer() {
  if (!gameRunning) return;

  // Horizontal movement
  if (keys.ArrowLeft || keys.KeyA) playerX -= 5;
  if (keys.ArrowRight || keys.KeyD) playerX += 5;

  // Jumping
  if ((keys.ArrowUp || keys.KeyW) && !isJumping) {
    velocityY = -10;
    isJumping = true;
  }

  // Apply gravity
  velocityY += gravity;
  playerY += velocityY;

  // Collision detection with platforms
  const platforms = document.querySelectorAll(`.platform.level${currentLevel}`);
  platforms.forEach((platform) => {
    const platformRect = platform.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
      playerRect.bottom > platformRect.top &&
      playerRect.top < platformRect.bottom &&
      playerRect.right > platformRect.left &&
      playerRect.left < platformRect.right &&
      velocityY > 0
    ) {
      playerY = platformRect.top - playerRect.height - gameContainer.offsetTop;
      velocityY = 0;
      isJumping = false;
    }
  });

  // Check interactions
  checkCollectibles();
  checkHazards();
  checkGravityZones();

  // Check for goal collisions
  const goal = document.querySelector(`.goal.level${currentLevel}`);
  const goalRect = goal.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();

  if (
    playerRect.bottom > goalRect.top &&
    playerRect.top < goalRect.bottom &&
    playerRect.right > goalRect.left &&
    playerRect.left < goalRect.right
  ) {
    nextLevel();
  }

  // Update player's position
  player.style.left = `${playerX}px`;
  player.style.top = `${playerY}px`;
}

// Advance to the next level
function nextLevel() {
  alert('Level Completed!');
  currentLevel++;
  if (currentLevel > 3) {
    alert('Congratulations! You finished the game!');
    resetGame();
  } else {
    loadLevel(currentLevel);
  }
}

// Reset the game to the initial state
function resetGame() {
  currentLevel = 1;
  loadLevel(currentLevel);
  playerX = 100;
  playerY = 400;
  velocityY = 0;
  isJumping = false;
  resetTimer();
  score = 0;
  updateScore();
  gameRunning = false;
  levelMenu.style.display = 'block';
}

// Event listeners for key controls
function handleKeyDown(e) {
  keys[e.code] = true;
}

function handleKeyUp(e) {
  keys[e.code] = false;
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Event listeners for level menu
levelSelectButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    const level = parseInt(e.target.dataset.level, 10);
    startGameAtLevel(level);
  });
});

// Game loop
function gameLoop() {
  updatePlayer();
  movePlatforms();
  requestAnimationFrame(gameLoop);
}

// Initialize the game
gameLoop();
resetGame();
