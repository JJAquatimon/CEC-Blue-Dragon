  // Game Constants
        const GRID_SIZE = 10;
        const INITIAL_SPEEDS = {
            easy: 150,
            medium: 130,
            hard: 100,
            extreme: 75
        };
        let currentDifficulty = 'easy';

        // Game Elements
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const eatSound = document.getElementById('eatSound');

        // Game State
        let dragon = [];
        let food = {};
        let direction = 'right';
        let score = 0;
        let gameSpeed = INITIAL_SPEEDS[currentDifficulty];
        let gameLoop;
        let mouthOpen = 0; // For mouth animation
        let lastEatenTime = 0; // Track when dragon last ate
        let isPaused = false;

        // Initialize game state
        function initGame() {
            dragon = [
                {x: 300, y: 200},
                {x: 290, y: 200},
                {x: 280, y: 200}
            ];
            direction = 'right';
            score = 0;
            mouthOpen = 0;
            lastEatenTime = 0;
            document.getElementById('score').textContent = `Score: ${score}`;
            spawnFood();
        }

        // Generate new food position
        function spawnFood() {
            food = {
                x: Math.floor(Math.random() * (canvas.width / GRID_SIZE)) * GRID_SIZE,
                y: Math.floor(Math.random() * (canvas.height / GRID_SIZE)) * GRID_SIZE
            };
            // Ensure food doesn't spawn on dragon
            dragon.forEach(segment => {
                if (segment.x === food.x && segment.y === food.y) spawnFood();
            });
        }

        // Update game speed based on difficulty and score
        function updateGameSpeed() {
            switch(currentDifficulty) {
                case 'medium':
                    gameSpeed = Math.max(50, INITIAL_SPEEDS.medium - dragon.length);
                    break;
                case 'hard':
                    gameSpeed = Math.max(30, INITIAL_SPEEDS.hard - (score * 0.5));
                    break;
                case 'extreme':
                    gameSpeed = Math.max(10, INITIAL_SPEEDS.extreme - (score * 1));
                    break;
            }
        }

        // Move dragon and check collisions
        function moveDragon() {
            updateGameSpeed();
            const head = {x: dragon[0].x, y: dragon[0].y};

            // Update head position based on direction
            switch(direction) {
                case 'right': head.x += GRID_SIZE; break;
                case 'left': head.x -= GRID_SIZE; break;
                case 'up': head.y -= GRID_SIZE; break;
                case 'down': head.y += GRID_SIZE; break;
            }

            // Wall wrapping
            head.x = (head.x + canvas.width) % canvas.width;
            head.y = (head.y + canvas.height) % canvas.height;

            // Check self-collision
            if (dragon.some(segment => segment.x === head.x && segment.y === head.y)) {
                gameOver();
                return;
            }

            dragon.unshift(head);

            // Check food collision
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                document.getElementById('score').textContent = `Score: ${score}`;
                eatSound.play();
                mouthOpen = 1; // Trigger mouth animation
                lastEatenTime = Date.now();
                spawnFood();
            } else {
                dragon.pop();
                // Animate mouth closing over time
                const timeSinceEaten = Date.now() - lastEatenTime;
                mouthOpen = Math.max(0, 1 - (timeSinceEaten / 500));
            }
        }

        // Draw dragon head with animated mouth facing direction
        function drawDragonHead(x, y) {
            ctx.save();
            ctx.translate(x + GRID_SIZE/2, y + GRID_SIZE/2);

            // Rotate head based on direction
            switch(direction) {
                case 'left': ctx.rotate(Math.PI); break;
                case 'up': ctx.rotate(-Math.PI/2); break;
                case 'down': ctx.rotate(Math.PI/2); break;
            }

            // Head shape (dragon head facing right)
            ctx.beginPath();
            ctx.moveTo(-15, 0);  // Back of head
            ctx.bezierCurveTo(-10, -12, 10, -12, 15, -5);  // Top curve
            ctx.lineTo(20, 0);  // Snout tip
            ctx.lineTo(15, 5);  // Bottom curve
            ctx.bezierCurveTo(10, 12, -10, 12, -15, 0);  // Bottom curve back
            ctx.fillStyle = '#2196F3';
            ctx.fill();
            ctx.strokeStyle = '#1976D2';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Animated mouth (opens when eating)
            ctx.beginPath();
            ctx.moveTo(10, -3 * mouthOpen);
            ctx.lineTo(20, 0);
            ctx.lineTo(10, 3 * mouthOpen);
            ctx.strokeStyle = '#FF4081';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Horns
            ctx.beginPath();
            ctx.moveTo(-5, -8);
            ctx.lineTo(-8, -15);
            ctx.lineTo(-2, -8);
            ctx.strokeStyle = '#1976D2';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(5, -10);
            ctx.lineTo(8, -18);
            ctx.lineTo(11, -10);
            ctx.strokeStyle = '#1976D2';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Eyes
            ctx.beginPath();
            ctx.arc(8, -3, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#FF4081';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(8, -3, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();

            ctx.restore();
        }

        // Draw dragon body with visible growth
        function drawDragonBody(x, y, index) {
            const alpha = Math.max(0.3, 1 - (index * 0.08));
            ctx.fillStyle = `rgba(33, 150, 243, ${alpha})`;
            ctx.strokeStyle = `rgba(25, 118, 210, ${alpha})`;
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(x + GRID_SIZE/2, y + GRID_SIZE/2, GRID_SIZE/2 - 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // Main draw function
        function draw() {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw food
            ctx.fillStyle = '#FF4081';
            ctx.beginPath();
            ctx.arc(food.x + GRID_SIZE/2, food.y + GRID_SIZE/2, GRID_SIZE/2, 0, Math.PI * 2);
            ctx.fill();

            // Draw dragon
            dragon.forEach((segment, index) => {
                if (index === 0) {
                    drawDragonHead(segment.x, segment.y);
                } else {
                    drawDragonBody(segment.x, segment.y, index);
                }
            });
        }

        // Game loop function
        function gameStep() {
            if (!isPaused) {
                moveDragon();
                draw();
            }
            gameLoop = setTimeout(gameStep, gameSpeed);
        }

        // Start game
        function startGame() {
            document.getElementById('mainMenu').style.display = 'none';
            document.getElementById('optionsMenu').style.display = 'none';
            document.getElementById('gameContainer').classList.add('visible');
            
            // Ensure proper button visibility when game starts
            document.getElementById('pauseButton').style.display = 'inline-block';
            document.getElementById('resumeButton').style.display = 'none';
            document.getElementById('quitGameButton').style.display = 'inline-block';
            
            initGame();
            gameStep();
        }

        // Game over function
        function gameOver() {
            clearTimeout(gameLoop);
            document.getElementById('gameOver').style.display = 'block';
        }

        // Restart game
        function restartGame() {
            document.getElementById('gameOver').style.display = 'none';
            startGame();
        }

        // Pause game
        function pauseGame() {
            isPaused = true;
            document.getElementById('pauseButton').style.display = 'none';
            document.getElementById('resumeButton').style.display = 'inline-block';
        }

        // Resume game
        function resumeGame() {
            isPaused = false;
            document.getElementById('pauseButton').style.display = 'inline-block';
            document.getElementById('resumeButton').style.display = 'none';
        }

        // Quit game
        function quitGame() {
            clearTimeout(gameLoop);
            document.getElementById('gameContainer').classList.remove('visible');
            document.getElementById('mainMenu').style.display = 'block';
            document.getElementById('optionsMenu').style.display = 'none';
            
            // Reset game state and button visibility
            isPaused = false;
            document.getElementById('pauseButton').style.display = 'inline-block';
            document.getElementById('resumeButton').style.display = 'none';
        }

        // Show exit confirmation dialog
        function showExitDialog() {
            document.getElementById('exitDialog').style.display = 'block';
        }

        // Hide exit confirmation dialog
        function hideExitDialog() {
            document.getElementById('exitDialog').style.display = 'none';
        }

        // Exit the game (close window or redirect)
        function exitGame() {
            hideExitDialog();
            // Try to close the window (works for popup windows)
            if (window.opener) {
                window.close();
            } else {
                // For main window, provide a friendly message
                alert('Thank you for playing CEC Blue Dragon!\n\nYou can close this tab or window to exit.');
            }
        }

        // Event Listeners
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': if (direction !== 'down') direction = 'up'; break;
                case 'ArrowDown': if (direction !== 'up') direction = 'down'; break;
                case 'ArrowLeft': if (direction !== 'right') direction = 'left'; break;
                case 'ArrowRight': if (direction !== 'left') direction = 'right'; break;
                case 'Enter': if (document.getElementById('gameOver').style.display === 'block') restartGame(); break;
                case ' ': if (isPaused) resumeGame(); else pauseGame(); break;
            }
        });

        // Button Handlers
        document.getElementById('playButton').addEventListener('click', startGame);

        document.getElementById('optionsButton').addEventListener('click', () => {
            document.getElementById('mainMenu').style.display = 'none';
            document.getElementById('optionsMenu').style.display = 'block';
        });

        document.querySelectorAll('.difficultyButton').forEach(button => {
            button.addEventListener('click', (e) => {
                currentDifficulty = e.target.dataset.difficulty;
                document.getElementById('optionsMenu').style.display = 'none';
                document.getElementById('mainMenu').style.display = 'block';
            });
        });

        document.getElementById('quitButton').addEventListener('click', quitGame);

        // Fixed Exit Button functionality
        document.getElementById('exitButton').addEventListener('click', showExitDialog);

        document.getElementById('confirmExitButton').addEventListener('click', exitGame);
        document.getElementById('cancelExitButton').addEventListener('click', hideExitDialog);

        document.getElementById('infoButton').addEventListener('click', () => {
            alert('CEC Blue Dragon Game\n\nUse arrow keys to control the dragon.\nEat the pink orbs to grow and increase your score.\nAvoid hitting yourself or the walls!\n\nDifficulty levels:\n- Easy: Slow speed\n- Medium: Moderate speed with increasing difficulty\n- Hard: Fast speed with score-based acceleration\n- Extreme: Very fast with rapid acceleration');
        });

        // Game control button handlers
        document.getElementById('pauseButton').addEventListener('click', pauseGame);
        document.getElementById('resumeButton').addEventListener('click', resumeGame);
        document.getElementById('quitGameButton').addEventListener('click', quitGame);