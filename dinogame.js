// Canvas setup
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 450;
document.body.appendChild(canvas);

// Game variables
let dino = {
    x: 75,
    y: 300,
    width: 90,
    height: 60,
    jumping: false,
    velocity: 0,
    canDoubleJump: false,
    hitbox: {
        x: 90,
        y: 305,
        width: 45,
        height: 38
    }
};

let obstacles = [];
let score = 0;
let baseGameSpeed = 5;
let gameSpeed = baseGameSpeed;
let gameOver = false;
let distanceTraveled = 0;

// Sprite creation (16-bit style)
function drawDino() {
    // Body (main body shape)
    ctx.fillStyle = '#000000';  // Toothless is black
    ctx.beginPath();
    ctx.ellipse(dino.x + dino.width * 0.4, dino.y + dino.height * 0.5, dino.width * 0.4, dino.height * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head (rounder shape)
    ctx.beginPath();
    ctx.arc(dino.x + dino.width * 0.7, dino.y + dino.height * 0.3, dino.width * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Big eyes (now white)
    ctx.fillStyle = '#FFFFFF';  // White eyes
    ctx.beginPath();
    ctx.arc(dino.x + dino.width * 0.8, dino.y + dino.height * 0.25, dino.width * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils (larger)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(dino.x + dino.width * 0.82, dino.y + dino.height * 0.25, dino.width * 0.06, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings (more curved)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(dino.x + dino.width * 0.3, dino.y + dino.height * 0.4);
    ctx.quadraticCurveTo(
        dino.x + dino.width * 0.2, dino.y + dino.height * 0.1,
        dino.x + dino.width * 0.1, dino.y + dino.height * 0.3
    );
    ctx.quadraticCurveTo(
        dino.x + dino.width * 0.2, dino.y + dino.height * 0.5,
        dino.x + dino.width * 0.3, dino.y + dino.height * 0.4
    );
    ctx.fill();
    
    // Tail (more curved)
    ctx.beginPath();
    ctx.moveTo(dino.x + dino.width * 0.1, dino.y + dino.height * 0.5);
    ctx.quadraticCurveTo(
        dino.x - dino.width * 0.1, dino.y + dino.height * 0.4,
        dino.x - dino.width * 0.2, dino.y + dino.height * 0.5
    );
    ctx.quadraticCurveTo(
        dino.x - dino.width * 0.1, dino.y + dino.height * 0.6,
        dino.x + dino.width * 0.1, dino.y + dino.height * 0.5
    );
    ctx.fill();
    
    // Legs (slightly curved)
    ctx.beginPath();
    ctx.ellipse(dino.x + dino.width * 0.3, dino.y + dino.height * 0.8, dino.width * 0.08, dino.height * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(dino.x + dino.width * 0.5, dino.y + dino.height * 0.8, dino.width * 0.08, dino.height * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ear plates (more defined)
    ctx.beginPath();
    ctx.moveTo(dino.x + dino.width * 0.6, dino.y + dino.height * 0.1);
    ctx.quadraticCurveTo(
        dino.x + dino.width * 0.7, dino.y,
        dino.x + dino.width * 0.8, dino.y + dino.height * 0.1
    );
    ctx.fill();
}

function createCactus() {
    return {
        x: canvas.width,
        y: 300,
        width: 45,
        height: 75
    };
}

function drawCactus(cactus) {
    // Main body
    ctx.fillStyle = '#2f4f2f';
    ctx.fillRect(cactus.x, cactus.y, cactus.width, cactus.height);
    
    // Add spikes
    ctx.fillStyle = '#1a331a';  // Darker green for spikes
    
    // Left side spikes
    for(let i = 5; i < cactus.height - 5; i += 8) {
        ctx.beginPath();
        ctx.moveTo(cactus.x - 3, cactus.y + i);
        ctx.lineTo(cactus.x, cactus.y + i + 4);
        ctx.lineTo(cactus.x, cactus.y + i);
        ctx.fill();
    }
    
    // Right side spikes
    for(let i = 10; i < cactus.height - 5; i += 8) {
        ctx.beginPath();
        ctx.moveTo(cactus.x + cactus.width + 3, cactus.y + i);
        ctx.lineTo(cactus.x + cactus.width, cactus.y + i + 4);
        ctx.lineTo(cactus.x + cactus.width, cactus.y + i);
        ctx.fill();
    }
    
    // Add highlights
    ctx.fillStyle = '#3a5f3a';  // Lighter green for highlights
    ctx.fillRect(cactus.x + cactus.width/4, cactus.y + 5, cactus.width/6, cactus.height - 10);
    
    // Optional: Add small branches
    ctx.fillStyle = '#2f4f2f';
    ctx.fillRect(cactus.x - 8, cactus.y + cactus.height/3, 8, 6);  // Left branch
    ctx.fillRect(cactus.x + cactus.width, cactus.y + cactus.height/2, 8, 6);  // Right branch
}

// Game mechanics
function jump() {
    if (!dino.jumping) {
        dino.jumping = true;
        dino.velocity = -15;
        dino.canDoubleJump = true;
    } else if (dino.canDoubleJump) {
        dino.velocity = -12;
        dino.canDoubleJump = false;
    }
}

function update() {
    if (gameOver) return;

    // Update hitbox position
    dino.hitbox.x = dino.x + 8;
    dino.hitbox.y = dino.y + 5;

    // Jump physics
    if (dino.jumping) {
        dino.y += dino.velocity;
        dino.velocity += 0.6;

        if (dino.y > 300) {
            dino.y = 300;
            dino.jumping = false;
            dino.canDoubleJump = false;
        }
    }

    // Progressive difficulty
    distanceTraveled += gameSpeed;
    gameSpeed = baseGameSpeed + Math.floor(distanceTraveled / 1000) * 0.5;
    
    // Spawn obstacles with dynamic spacing based on game speed
    if (Math.random() < 0.008) {
        const lastCactus = obstacles[obstacles.length - 1];
        const minGap = 300 + (gameSpeed * 10); // Larger gaps at higher speeds
        if (!lastCactus || lastCactus.x < canvas.width - minGap) {
            obstacles.push(createCactus());
        }
    }

    // Update obstacles
    obstacles = obstacles.filter(cactus => {
        cactus.x -= gameSpeed;
        
        // More forgiving collision detection using hitbox
        if (
            dino.hitbox.x < cactus.x + cactus.width &&
            dino.hitbox.x + dino.hitbox.width > cactus.x &&
            dino.hitbox.y < cactus.y + cactus.height &&
            dino.hitbox.y + dino.hitbox.height > cactus.y
        ) {
            gameOver = true;
        }

        return cactus.x > -cactus.width;
    });

    // Update score based on distance and obstacles cleared
    score = Math.floor(distanceTraveled / 10);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#535353';
    ctx.fillRect(0, 375, canvas.width, 2);

    // Draw game elements
    drawDino();
    obstacles.forEach(drawCactus);

    // Draw score and speed
    ctx.fillStyle = '#535353';
    ctx.font = '30px Arial';
    ctx.fillText(`Score: ${score}`, 975, 45);
    ctx.fillText(`Speed: ${gameSpeed.toFixed(1)}x`, 975, 90);

    if (gameOver) {
        ctx.fillStyle = '#535353';
        ctx.font = '60px Arial';
        ctx.fillText('Game Over', 450, 225);
        ctx.font = '30px Arial';
        ctx.fillText('Press Space to Restart', 450, 270);
        ctx.fillText(`Final Score: ${score}`, 450, 315);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (gameOver) {
            // Reset game
            gameOver = false;
            score = 0;
            distanceTraveled = 0;
            gameSpeed = baseGameSpeed;
            obstacles = [];
            dino.y = 300;
            dino.jumping = false;
            dino.canDoubleJump = false;
        } else {
            jump();
        }
    }
});

// Start game
gameLoop();
