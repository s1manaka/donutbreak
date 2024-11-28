document.addEventListener('DOMContentLoaded', () => {
    // HTML要素の取得
    const titleScreen = document.getElementById('title-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameClearScreen = document.getElementById('game-clear-screen');
    const playButton = document.getElementById('play-button');
    const retryButton = document.getElementById('retry-button');
    const retryButtonClear = document.getElementById('retry-button-clear');
    const titleButton = document.getElementById('title-button');
    const titleButtonClear = document.getElementById('title-button-clear');
    const canvas = document.getElementById('game-canvas');
    const gameOverImg = document.getElementById('game-over-img');
    const gameClearImg = document.getElementById('game-clear-img');
    let ctx = canvas.getContext('2d');

    // ゲーム設定
    canvas.width = 360;
    canvas.height = 640;

    let gameRunning = false;
    let paddle = {}; // ここで空のオブジェクトを初期化
    let balls, blocks, ballAdded;
    let paddleLastX = 0; // パドルの最後の位置を追跡
    let paddleTargetX = 0; // パドルの目標位置を追跡
    const ballSpeed = 4; // ボールの速度
    let ballAddedOnce = false;

    // スワイプ操作用変数
    let isSwiping = false; // スワイプ中かどうかのフラグ
    let touchStartX = 0;   // スワイプ開始位置
    let currentDirection = ""; // 現在のパドルの向き ("left" or "right")

    // ゲーム初期化
    function initGame() {
        // パドルが初期化されることを確認
        paddle = {
            x: canvas.width / 2 - 50,
            y: canvas.height * 0.8,
            width: 100,
            height: 80,
            img: new Image(),
            speed: 12, // パドルの移動速度を加速
        };
        paddle.img.src = "kanou.png"; // 初期のパドル画像

        // ボールの初期化
        balls = [
            {
                x: paddle.x + paddle.width / 2,
                y: paddle.y - 10,
                dx: ballSpeed,
                dy: -ballSpeed,
                radius: 10,
                img: new Image(),
            },
        ];
        balls[0].img.src = "boll.png"; // ボール画像

        // ブロック生成
        blocks = createBlocks();

        gameRunning = true;
        ballAdded = false;
        ballAddedOnce = false;
    }

    // ブロック生成
    function createBlocks() {
        const rows = 7; // 行数
        const cols = 7; // 列数
        const blockWidth = canvas.width / cols;
        const blockHeight = 40;
        const blocksArray = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                blocksArray.push({
                    x: col * blockWidth,
                    y: row * blockHeight,
                    width: blockWidth,
                    height: blockHeight,
                    hit: false,
                    img: new Image(),
                });
                blocksArray[blocksArray.length - 1].img.src = "tyoko.png"; // ブロック画像
            }
        }
        return blocksArray;
    }

     // 衝突チェック関数を改善（ボールが画面端で止まる問題の修正）
function updateBallDirection(ball) {
    // 小さなランダム値を加え、完全な直線移動を防ぐ
    ball.dx += (Math.random() - 0.5) * 0.1;
    ball.dy += (Math.random() - 0.5) * 0.1;

    // ボール速度の再正規化
    const speed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
    ball.dx = (ball.dx / speed) * ballSpeed;
    ball.dy = (ball.dy / speed) * ballSpeed;
}
// 衝突判定（ボールと矩形）
function isColliding(ball, rect) {
    const closestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.height));
    const distanceX = ball.x - closestX;
    const distanceY = ball.y - closestY;
    return distanceX * distanceX + distanceY * distanceY < ball.radius * ball.radius;
}

    // タッチ開始イベント
    canvas.addEventListener('touchstart', (event) => {
        isSwiping = true; // スワイプ開始
        touchStartX = event.touches[0].clientX; // スワイプ開始位置を記録
    });

    canvas.addEventListener('touchmove', (event) => {
        if (!isSwiping) return; // スワイプ中でない場合は無視

        const touchX = event.touches[0].clientX; // 現在のタッチ位置を取得
        const distance = touchX - touchStartX;  // 移動距離を計算
        touchStartX = touchX; // タッチ位置を更新

        if (Math.abs(distance) < 5) return; // 5px未満の移動を無視

        // 目標位置を設定
        paddleTargetX = paddle.x + distance;

        // 目標位置を画面内に収める
        if (paddleTargetX < 0) paddleTargetX = 0;
        if (paddleTargetX + paddle.width > canvas.width) paddleTargetX = canvas.width - paddle.width;

        // スワイプ方向に応じた画像を設定
        if (distance > 0) {
            paddle.img.src = "kanou4.png"; // 右移動ならkanou4.png
            currentDirection = "right"; // 現在の向きを右に設定
        } else if (distance < 0) {
            paddle.img.src = "kanou.png"; // 左移動ならkanou.png
            currentDirection = "left"; // 現在の向きを左に設定
        }
    });

    // マウス操作もサポート
canvas.addEventListener('mousemove', (event) => {
    const mouseX = event.offsetX;
    paddle.x = mouseX - paddle.width / 2;

    // 画面外にパドルが出ないように制限
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;

    // マウス移動の方向で画像を変更
    paddle.img.src = mouseX > paddleLastX ? "kanou4.png" : "kanou.png";
    paddleLastX = mouseX;
});

    // パドルを滑らかに移動させる
    function smoothMovePaddle() {
        // 現在の位置から目標位置に向かってスムーズに移動
        const moveSpeed = 0.5; // 移動速度を加速
        paddle.x += (paddleTargetX - paddle.x) * moveSpeed;

        // 画面外に出ないように制限
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
    }


    // ゲームの描画処理
    function drawGame() {
        if (!gameRunning) return;

        // 背景画像の描画
        const backgroundImage = new Image();
        backgroundImage.src = "haikeigame.png";
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        // パドルの描画
        ctx.drawImage(paddle.img, paddle.x, paddle.y, paddle.width, paddle.height);

        // ボールの描画
        balls.forEach((ball) => {
            ctx.drawImage(ball.img, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
        });

        // ブロックの描画
        blocks.forEach((block) => {
            if (!block.hit) {
                ctx.drawImage(block.img, block.x, block.y, block.width, block.height);
            }
        });
    }

    // ゲーム更新
    function updateGame() {
        smoothMovePaddle(); // パドルの位置を滑らかに更新
        updateBalls(); // ボールの位置を更新
    }

    // ゲーム終了
    function endGame(isWin) {
        gameRunning = false;
        gameOverImg.src = "";
        gameClearImg.src = "";

        if (isWin) {
            gameClearImg.src = "gamekuria.png";
            gameScreen.classList.add('hidden');
            gameClearScreen.classList.remove('hidden');
        } else {
            gameOverImg.src = "gameover.png";
            gameScreen.classList.add('hidden');
            gameOverScreen.classList.remove('hidden');
        }
    }

    // ゲームループ
    function gameLoop() {
        if (!gameRunning) return;

        updateGame();
        drawGame();

        requestAnimationFrame(gameLoop); // ゲームの更新を繰り返す
    }

    // ゲーム開始
    playButton.addEventListener('click', () => {
        titleScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        initGame();
        gameLoop();
    });

    // ゲームリトライ
    retryButton.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        initGame();
        gameLoop();
    });

    retryButtonClear.addEventListener('click', () => {
        gameClearScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        initGame();
        gameLoop();
    });

    titleButton.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        gameClearScreen.classList.add('hidden');
        titleScreen.classList.remove('hidden');
    });

    titleButtonClear.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        gameClearScreen.classList.add('hidden');
        titleScreen.classList.remove('hidden');
    });
});
