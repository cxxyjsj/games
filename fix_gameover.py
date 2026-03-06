#!/usr/bin/env python3
"""Script to safely replace the gameOver method in snake game"""
import re

# Read the script file
with open("snake/script.js", "r") as f:
    content = f.read()

# Define the new gameOver method
new_gameover = '''    // Handle game over
    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameInterval);

        // Create a game over overlay
        const gameOverDiv = document.createElement('div');
        gameOverDiv.id = 'gameOver';
        gameOverDiv.className = 'game-over';
        gameOverDiv.style.position = 'absolute';
        gameOverDiv.style.top = '50%';
        gameOverDiv.style.left = '50%';
        gameOverDiv.style.transform = 'translate(-50%, -50%)';
        gameOverDiv.style.background = 'rgba(0, 0, 0, 0.9)';
        gameOverDiv.style.color = 'white';
        gameOverDiv.style.padding = '30px';
        gameOverDiv.style.borderRadius = '10px';
        gameOverDiv.style.textAlign = 'center';
        gameOverDiv.style.zIndex = '100';
        gameOverDiv.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        gameOverDiv.innerHTML = `
            <h2 style="color: #ff6b6b; margin-bottom: 15px;">GAME OVER</h2>
            <p style="font-size: 18px; margin: 10px 0;">最终分数: <span id="final-score">${this.scoreManager.getCurrentScore()}</span></p>
            <button id="playAgainBtn" style="
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 12px 24px;
                margin-top: 15px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                transition: background-color 0.3s;
            ">继续游戏</button>
        `;

        // Add the game over div to the game container
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.appendChild(gameOverDiv);

        // Add event listener to the play again button
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restart();
            gameOverDiv.remove();
        });

        // Allow restarting with space key
        document.addEventListener('keydown', this.spaceKeyListener = (e) => {
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                this.restart();
                gameOverDiv.remove();
                document.removeEventListener('keydown', this.spaceKeyListener);
            }
        });
    }'''

# Pattern to match the entire gameOver method including all its content
# Find the method from the comment to the closing brace
pattern = r'/\*.*?Handle game over.*?\*/\s*gameOver\(\)\s*\{[^}]*\}(?=\s*[^\s]|\s*$|[a-zA-Z_])'

# More precise pattern: match from the comment to the corresponding closing brace
# We'll use a more specific approach - find the method by line markers

lines = content.split('\n')

# Find the range of the gameOver method by identifying its start and end
game_over_start = None
game_over_end = None

for i, line in enumerate(lines):
    if "gameOver() {" in line and "// Handle game over" in lines[max(0, i-1)]:
        game_over_start = i
        # Now find the corresponding closing brace
        brace_count = 0
        for j in range(i, len(lines)):
            brace_count += lines[j].count('{') - lines[j].count('}')
            if brace_count == 0 and lines[j].strip().endswith('}'):
                game_over_end = j
                break
        break

if game_over_start is not None and game_over_end is not None:
    # Reconstruct the file with the new method
    new_content = []
    new_content.extend(lines[:game_over_start])
    new_content.append(new_gameover)
    new_content.extend(lines[game_over_end+1:])

    # Write the updated content back
    with open("snake/script.js", "w") as f:
        f.write('\n'.join(new_content))

    print(f"Successfully replaced gameOver method (lines {game_over_start+1} to {game_over_end+1})")
else:
    print("Could not locate the gameOver method in the file")