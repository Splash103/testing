const frog = document.getElementById("frog");
const obstacle = document.getElementById("obstacle");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const messageDisplay = document.getElementById("message");
const restartButton = document.getElementById("restart");

const frogWidth = 72;
const obstacleWidth = 70;
const frogHeight = 60;
const jumpVelocity = 16;
const gravity = 0.9;
const baseObstacleSpeed = 6;
const speedIncrease = 0.005;

let frogY = 0;
let frogVelocity = 0;
let obstacleX = 0;
let obstacleSpeed = baseObstacleSpeed;
let score = 0;
let isJumping = false;
let isGameRunning = false;
let isGameOver = false;
let lastTimestamp = null;
let lastEncouragement = 0;

function resetGame() {
  const containerWidth = gameContainer.clientWidth;
  frogY = 0;
  frogVelocity = 0;
  obstacleX = containerWidth + 100;
  obstacleSpeed = baseObstacleSpeed;
  score = 0;
  isJumping = false;
  isGameRunning = false;
  isGameOver = false;
  lastTimestamp = null;
  lastEncouragement = 0;

  frog.style.transform = `translateY(0px)`;
  obstacle.style.transform = `translateX(${obstacleX}px)`;
  messageDisplay.textContent = "Jump to begin!";
  scoreDisplay.textContent = "0 m";
  gameContainer.classList.remove("shake");
}

function startGame() {
  if (!isGameRunning) {
    isGameRunning = true;
    messageDisplay.textContent = "";
  }
}

function setFrogPosition(y) {
  frog.style.transform = `translateY(${-y}px)`;
}

function setObstaclePosition(x) {
  obstacle.style.transform = `translateX(${x}px)`;
}

function triggerJump() {
  if (isGameOver) {
    return;
  }

  startGame();

  if (!isJumping) {
    isJumping = true;
    frogVelocity = jumpVelocity;
  }
}

function updateGame(delta) {
  if (!isGameRunning || isGameOver) {
    return;
  }

  // Update frog physics
  frogVelocity -= gravity * delta;
  frogY += frogVelocity * delta;

  if (frogY <= 0) {
    frogY = 0;
    frogVelocity = 0;
    isJumping = false;
  }

  setFrogPosition(frogY);

  // Update obstacle movement
  obstacleX -= obstacleSpeed * delta * 2; // multiply to account for frame delta scaling
  const containerWidth = gameContainer.clientWidth;

  if (obstacleX < -obstacleWidth - 10) {
    obstacleX = containerWidth + Math.random() * 200 + 120;
    obstacleSpeed += speedIncrease * score;
  }

  setObstaclePosition(obstacleX);

  // Collision detection
  const frogLeft = 48;
  const frogRight = frogLeft + frogWidth;
  const obstacleLeft = obstacleX;
  const obstacleRight = obstacleX + obstacleWidth;
  const horizontalCollision = frogRight > obstacleLeft && frogLeft < obstacleRight;
  const verticalCollision = frogY < frogHeight * 0.35;

  if (horizontalCollision && verticalCollision) {
    endGame();
  }

  // Score keeping
  score += obstacleSpeed * delta * 0.04;
  scoreDisplay.textContent = `${Math.floor(score)} m`;

  // Update message occasionally to encourage
  if (score - lastEncouragement >= 50) {
    lastEncouragement = score;
    messageDisplay.textContent = "Keep hopping!";
  } else if (!messageDisplay.textContent) {
    messageDisplay.textContent = "";
  }
}

function endGame() {
  isGameOver = true;
  isGameRunning = false;
  messageDisplay.textContent = "SPLASH! Tap restart to try again.";
  gameContainer.classList.add("shake");
}

function gameLoop(timestamp) {
  if (lastTimestamp == null) {
    lastTimestamp = timestamp;
  }

  const delta = (timestamp - lastTimestamp) / 16.6667;
  lastTimestamp = timestamp;

  updateGame(delta);
  requestAnimationFrame(gameLoop);
}

function handleKeyDown(event) {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    triggerJump();
  } else if (event.code === "Enter" && isGameOver) {
    resetGame();
  }
}

function handlePointer(event) {
  event.preventDefault();
  if (isGameOver) {
    resetGame();
  } else {
    triggerJump();
  }
}

restartButton.addEventListener("click", () => {
  resetGame();
});

document.addEventListener("keydown", handleKeyDown);
gameContainer.addEventListener("pointerdown", handlePointer);

resetGame();
requestAnimationFrame(gameLoop);
