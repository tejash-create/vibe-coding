// Define game constants
const PIPE_GAP = 180
const PIPE_WIDTH = 60
const BIRD_SIZE = 32
const GRAVITY = 320      // Significantly reduced gravity
const FLAP_FORCE = 240   // Adjusted flap force
const PIPE_SPEED = 160
const GROUND_HEIGHT = 112

// Initialize Kaboom
kaboom({
    width: 800,
    height: 600,
    background: [135, 206, 235], // Sky blue background
    global: true,
})

// Create a game object to track state
const gameState = {
    score: 0,
    isGameOver: false
}

// Load assets and set up scene
scene("game", () => {
    // Set gravity
    setGravity(GRAVITY)

    // Add mountains in background
    function createMountain(x) {
        add([
            polygon([
                vec2(0, 0),
                vec2(300, 0),
                vec2(150, -200),
            ]),
            pos(x, height() - GROUND_HEIGHT),
            color(101, 67, 33), // Brown
            z(-1), // Behind everything
            "mountain"
        ])
    }

    // Add some mountains
    for (let i = 0; i < 3; i++) {
        createMountain(i * 400)
    }

    // Add trees in background
    function createTree(x) {
        const trunkHeight = randi(50, 100)
        // Trunk
        add([
            rect(20, trunkHeight),
            pos(x, height() - GROUND_HEIGHT - trunkHeight),
            color(139, 69, 19), // Brown
            z(-1)
        ])
        // Leaves
        add([
            circle(40),
            pos(x + 10, height() - GROUND_HEIGHT - trunkHeight - 30),
            color(34, 139, 34), // Forest green
            z(-1)
        ])
    }

    // Add some trees
    for (let i = 0; i < 5; i++) {
        createTree(randi(0, width()))
    }

    // Create ground with proper collision
    const ground = add([
        rect(width(), GROUND_HEIGHT),
        pos(0, height() - GROUND_HEIGHT),
        color(34, 139, 34), // Forest green
        area(),
        body({ isStatic: true }),
        "ground"
    ])

    // Add bird with revised physics
    const bird = add([
        circle(BIRD_SIZE / 2),
        pos(120, height() / 2),
        color(255, 255, 0), // Yellow
        area(),
        body(),
        {
            isAlive: true,
            flap() {
                this.vel.y = -FLAP_FORCE
            }
        }
    ])

    // Score display
    const scoreText = add([
        text("Score: 0", { size: 24 }),
        pos(24, 24),
        { value: 0 },
    ])

    // Game instructions
    const instructions = add([
        text("Press SPACE to flap", { size: 16 }),
        pos(24, 50),
        color(0, 0, 0),
    ])

    // Bird update logic
    bird.onUpdate(() => {
        if (!gameState.isGameOver && bird.isAlive) {
            // Keep bird in bounds
            if (bird.pos.y < 0) {
                bird.pos.y = 0
                bird.vel.y = 0
            }
        }
    })

    // Spawn pipes periodically
    loop(2.5, () => {
        spawnPipes()
    })

    // Update pipes
    onUpdate("pipe", (p) => {
        if (!gameState.isGameOver) {
            p.move(-p.speed, 0)
            
            if (!p.passed && p.pos.x + PIPE_WIDTH < bird.pos.x) {
                p.passed = true
                scoreText.value += 0.5
                scoreText.text = "Score: " + Math.floor(scoreText.value)
            }
            
            if (p.pos.x < -PIPE_WIDTH) {
                destroy(p)
            }
        }
    })

    // Flap controls
    onKeyPress("space", () => {
        if (!gameState.isGameOver && bird.isAlive) {
            bird.flap()
        }
    })

    // Collision detection
    bird.onCollide("pipe", () => {
        if (bird.isAlive) {
            bird.isAlive = false
            gameState.isGameOver = true
            createExplosion(bird)
            bird.hidden = true
            addGameOver()
        }
    })

    bird.onCollide("ground", () => {
        if (bird.isAlive) {
            bird.isAlive = false
            gameState.isGameOver = true
            createExplosion(bird)
            bird.hidden = true
            addGameOver()
        }
    })

    function addGameOver() {
        add([
            text("Game Over!\nPress R to restart", { size: 32, align: "center" }),
            pos(width() / 2, height() / 2),
            anchor("center"),
            color(255, 0, 0),
        ])
    }

    // Function to create a pair of pipes
    function spawnPipes() {
        if (gameState.isGameOver) return

        const pipeGapY = randi(PIPE_GAP, height() - PIPE_GAP - GROUND_HEIGHT)
        
        // Top pipe
        add([
            rect(PIPE_WIDTH, pipeGapY),
            pos(width(), 0),
            color(76, 175, 80),
            area(),
            "pipe",
            {
                passed: false,
                speed: PIPE_SPEED
            }
        ])
        
        // Bottom pipe
        add([
            rect(PIPE_WIDTH, height() - pipeGapY - PIPE_GAP),
            pos(width(), pipeGapY + PIPE_GAP),
            color(76, 175, 80),
            area(),
            "pipe",
            {
                passed: false,
                speed: PIPE_SPEED
            }
        ])
    }

    // Function to create explosion particles
    function createExplosion(p) {
        const PARTICLE_COUNT = 20
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const angle = (2 * Math.PI * i) / PARTICLE_COUNT
            const speed = randi(100, 200)
            add([
                circle(4),
                pos(p.pos),
                color(255, 255, 0),
                opacity(1),
                lifespan(0.5),
                move(angle, speed),
            ])
        }
    }

    // Restart game
    onKeyPress("r", () => {
        if (gameState.isGameOver) {
            go("game")
        }
    })
})

// Start the game
go("game") 