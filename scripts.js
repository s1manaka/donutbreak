// ゲーム更新
function updateGame() {
    balls.forEach((ball) => {
        // ボールの移動
        ball.x += ball.dx;
        ball.y += ball.dy;

        // 壁との衝突
        if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
            ball.dx *= -1;
            updateBallDirection(ball);
        }
        if (ball.y < ball.radius) {
            ball.dy *= -1;
            updateBallDirection(ball);
        }

        // パドルとの衝突判定
        if (
            ball.y + ball.radius > paddle.y &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.width
        ) {
            const hitPosition = (ball.x - paddle.x) / paddle.width; // 0~1の範囲で衝突位置を計算
            const angle = (hitPosition - 0.5) * Math.PI / 2; // 反射角を計算
            const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy); // ボール速度を一定に

            ball.dx = speed * Math.sin(angle);
            ball.dy = -speed * Math.cos(angle);
        }

        // ブロックとの衝突判定部分を修正
        blocks.forEach((block) => {
            if (!block.hit && isColliding(ball, block)) {
                block.hit = true;
                ball.dy *= -1;
                updateBallDirection(ball);

                // ブロックの半数が壊れた時にボールを1回だけ追加
                if (
                    !ballAddedOnce && // まだボールが追加されていない
                    blocks.filter((b) => b.hit).length > blocks.length / 2
                ) {
                    balls.push({
                        x: canvas.width / 2,
                        y: canvas.height - 60,
                        dx: ballSpeed,
                        dy: -ballSpeed,
                        radius: 10,
                        img: new Image(),
                    });
                    balls[balls.length - 1].img.src = "boll2.png"; // 追加ボール画像
                    ballAddedOnce = true; // ボール追加フラグを立てる
                }
            }
        });

        // ボールが画面外に出た場合
        if (ball.y > canvas.height) {
            balls.splice(balls.indexOf(ball), 1);
            if (balls.length === 0) endGame(false);
        }
    });

    // すべてのブロックが壊れた場合
    if (blocks.every((block) => block.hit)) {
        endGame(true);
    }
}

// ゲームループ
function gameLoop() {
    if (!gameRunning) return;

    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop); // ゲームループの再帰
}

// ゲームを開始する
playButton.addEventListener('click', () => {
    titleScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    initGame();
    requestAnimationFrame(gameLoop); // ゲーム開始
});
});
