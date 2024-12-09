// DOM Elements: Getting references to HTML elements used in the game
const player = document.getElementById('player'); // The player's character
const levelIndicator = document.getElementById('level-indicator'); // Displays the current level name
const scoreCounter = document.getElementById('score-counter'); // Displays the player's current score
const timer = document.getElementById('timer'); // Displays the elapsed time
const levelMenu = document.getElementById('level-menu'); // Menu for selecting levels
const levelSelectButtons = document.querySelectorAll('.level-select-button'); // Buttons to select levels
const gameContainer = document.getElementById('game-container'); // The container for the entire game

// Game State Variables
let playerX = 100; // Initial X-axis position of the player
let playerY = 400; // Initial Y-axis position of the player
let velocityY = 0; // Player's vertical velocity for jumping and falling
let isJumping = false; // Boolean to track if the player is jumping
let currentLevel = 1; // Current level number
let gameRunning = false; // Tracks whether the game is running
let score = 0; // The player's score
let time = 0; // Timer value for the game
let timerInterval; // Reference for the timer interval
const gravity = 0.5; // Gravity value affecting the player's fall

// Backgrounds for each level
const backgrounds = {
  1: 'url("Background 5 (Bonus).png")', // Background for Level 1
  2: 'url("Background 6 (Bonus).png")', // Background for Level 2
  3: 'url("Background 7 (Bonus).png")', // Background for Level 3
};

// Key controls: Tracks whether specific keys are pressed
const keys = {
  ArrowLeft: false, // Move left
  ArrowRight: false, // Move right
  ArrowUp: false, // Jump
  KeyA: false, // Alternate key for moving left
  KeyD: false, // Alternate key for moving right
  KeyW: false, // Alternate key for jumping
};

// Function to load a level
function loadLevel(level) {
  // Set the background for the current level
  gameContainer.style.backgroundImage = backgrounds[level];

  // Show elements for the current level and hide others
  document.querySelectorAll('.platform, .goal, .collectible, .spike, .gravity-zone').forEach((el) => {
    el.style.display = el.classList.contains(`level${level}`) ? 'block' : 'none';
  });

  // Update the level indicator with the current level name
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
  currentLevel = level; // Set the current level
  resetGame(); // Reset the game state
  loadLevel(currentLevel); // Load the level elements
  levelMenu.style.display = 'none'; // Hide the level menu
  gameRunning = true; // Mark the game as running
  startTimer(); // Start the game timer
}

// Update the player's score display
function updateScore() {
  scoreCounter.textContent = `Score: ${score}`; // Update the score counter
}

// Start the timer
function startTimer() {
  time = 0; // Initialize the timer
  timerInterval = setInterval(() => {
    time++;
    timer.textContent = `Time: ${time}`; // Update the timer display
  }, 1000);
}

// Stop the timer
function stopTimer() {
  clearInterval(timerInterval); // Stop the timer interval
}

// Reset the timer
function resetTimer() {
  stopTimer(); // Stop the current timer
  time = 0; // Reset the timer value
  timer.textContent = `Time: 0`; // Reset the timer display
}

// Check for collectible collisions
function checkCollectibles() {
  const collectibles = document.querySelectorAll(`.collectible.level${currentLevel}`);
  collectibles.forEach((collectible) => {
    const collectibleRect = collectible.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    // Collision detection
    if (
      playerRect.bottom > collectibleRect.top &&
      playerRect.top < collectibleRect.bottom &&
      playerRect.right > collectibleRect.left &&
      playerRect.left < collectibleRect.right
    ) {
      collectible.style.display = 'none'; // Hide the collectible
      score += 10; // Increase the score
      updateScore(); // Update the score display
    }
  });
}

// Check for hazard collisions
function checkHazards() {
  const hazards = document.querySelectorAll(`.spike.level${currentLevel}`);
  hazards.forEach((hazard) => {
    const hazardRect = hazard.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    // Collision detection
    if (
      playerRect.bottom > hazardRect.top &&
      playerRect.top < hazardRect.bottom &&
      playerRect.right > hazardRect.left &&
      playerRect.left < hazardRect.right
    ) {
      alert('You hit a hazard! Restarting level...'); // Alert the player
      resetGame(); // Reset the game
    }
  });
}

// Check for gravity zones
function checkGravityZones() {
  const gravityZones = document.querySelectorAll(`.gravity-zone.level${currentLevel}`);
  gravityZones.forEach((zone) => {
    const zoneRect = zone.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    // If the player is within a gravity zone, reduce gravity effect
    if (
      playerRect.bottom > zoneRect.top &&
      playerRect.top < zoneRect.bottom &&
      playerRect.right > zoneRect.left &&
      playerRect.left < zoneRect.right
    ) {
      velocityY -= 0.5;
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
  if (!gameRunning) return; // Stop if the game isn't running

  // Horizontal movement
  if (keys.ArrowLeft || keys.KeyA) playerX -= 5;
  if (keys.ArrowRight || keys.KeyD) playerX += 5;

  // Jumping
  if ((keys.ArrowUp || keys.KeyW) && !isJumping) {
    velocityY = -10; // Set vertical velocity for jumping
    isJumping = true; // Mark the player as jumping
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
      playerY = platformRect.top - playerRect.height - gameContainer.offsetTop; // Adjust position
      velocityY = 0; // Stop falling
      isJumping = false; // Reset jumping state
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
    nextLevel(); // Move to the next level
  }

  // Update the player's position on screen
  player.style.left = `${playerX}px`;
  player.style.top = `${playerY}px`;
}

// Advance to the next level
function nextLevel() {
  alert('Level Completed!');
  currentLevel++;
  if (currentLevel > 3) {
    alert('Congratulations! You finished the game!'); // Notify player of game completion
    resetGame(); // Reset the game
  } else {
    loadLevel(currentLevel); // Load the next level
  }
}

// Reset the game to the initial state
function resetGame() {
  currentLevel = 1; // Set the initial level
  loadLevel(currentLevel); // Load the first level
  playerX = 100; // Reset player's X position
  playerY = 400; // Reset player's Y position
  velocityY = 0; // Reset velocity
  isJumping = false; // Reset jumping state
  resetTimer(); // Reset the timer
  score = 0; // Reset the score
  updateScore(); // Update the score display
  gameRunning = false; // Stop the game
  levelMenu.style.display = 'block'; // Show the level menu
}

// Event listeners for key controls
function handleKeyDown(e) {
  keys[e.code] = true; // Mark the key as pressed
}

function handleKeyUp(e) {
  keys[e.code] = false; // Mark the key as released
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Event listeners for level menu
levelSelectButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    const level = parseInt(e.target.dataset.level, 10); // Get level from button data
    startGameAtLevel(level); // Start the game at the selected level
  });
});

// Game loop
function gameLoop() {
  updatePlayer(); // Update the player state
  movePlatforms(); // Move the platforms
  requestAnimationFrame(gameLoop); // Loop the game logic
}

// Initialize the game
gameLoop();
resetGame();
