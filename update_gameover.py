#!/usr/bin/env python3
import re

def update_gameover():
    with open("snake/script.js", "r") as f:
        content = f.read()

    # New gameOver method
    new_method = """    // Handle game over
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
    }"""

    # Replace the entire gameOver method using regex
    pattern = r'/\*.*?Handle game over.*?\*/\s*gameOver\(\) \{.*?\n    \}'
    # We'll match the method body more specifically
    content = re.sub(
        r'    // Handle game over\n    gameOver\(\) \{.*?\n    }',
        new_method,
        content,
        flags=re.DOTALL
    )

    with open("snake/script.js", "w") as f:
        f.write(content)

if __name__ == "__main__":
    update_gameover()