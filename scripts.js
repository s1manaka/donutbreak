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
let paddle, balls, blocks, ballAdded;
let paddleLastX = 0; // パドルの最後の位置を追跡
const ballSpeed = 4; // ボールの速度
let ballAddedOnce = false;

let timer = 0; // 経過時間（秒）
let timerInterval; // タイマー用のインターバルID

// スワイプ操作用変数
let isSwiping = false; // スワイプ中かどうかのフラグ
let touchStartX = 0;   // スワイプ開始位置
let currentDirection = ""; // 現在のパドルの向き ("left" or "right")
let previousPaddleX = 0; // 前回のパドル位置
    
// ゲーム初期化
function initGame() {
    gameRunning = true; // ゲームを実行状態に
    ballAddedOnce = false; // ボール追加のフラグをリセット

    // パドル（paddle）の設定
    paddle = {
        x: canvas.width / 2 - 50,
        y: canvas.height * 0.8,
        width: 100,
        height: 80,
        img: new Image(),
        speed: 6,
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

        // 描画の初期化
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 画面をクリア
    drawGame(); // 初期状態を描画
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

    // タイマーの初期化
function resetTimer() {
    timer = 0;
    clearInterval(timerInterval);
}

// タイマーの開始
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
    }, 1000); // 毎秒1回カウントアップ
}

// タイマーの停止
function stopTimer() {
    clearInterval(timerInterval);
}
    
// ボールの壁との衝突処理を修正
function handleWallCollision(ball) {
    // 左右の壁との衝突
    if (ball.x - ball.radius < 0) {
        ball.dx = Math.abs(ball.dx); // 右方向へ反転
        ball.x = ball.radius; // ボールを壁の内側に補正
    } else if (ball.x + ball.radius > canvas.width) {
        ball.dx = -Math.abs(ball.dx); // 左方向へ反転
        ball.x = canvas.width - ball.radius; // ボールを壁の内側に補正
    }

    // 上部の壁との衝突
    if (ball.y - ball.radius < 0) {
        ball.dy = Math.abs(ball.dy); // 下方向へ反転
        ball.y = ball.radius; // ボールを壁の内側に補正
    }

    // ボールの速度を少しランダムに変化（直線移動防止）
    ball.dx += (Math.random() - 0.5) * 0.1;
    ball.dy += (Math.random() - 0.5) * 0.1;

    // 速度を正規化して一定のスピードを維持
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


// パドルを移動する関数（最適化）
function movePaddle(newX) {
    // パドルの中心位置を指定されたX座標に更新
    paddle.x = newX - paddle.width / 2;

    // 画面外に出ないように制限
    paddle.x = Math.max(0, Math.min(paddle.x, canvas.width - paddle.width));
}

// マウス移動イベント
canvas.addEventListener('mousemove', (event) => {
    movePaddle(event.offsetX); // マウス位置を直接渡す
});

// タッチ移動イベント
canvas.addEventListener('touchmove', (event) => {
    if (!isSwiping) return;

    const touchX = event.touches[0].clientX;
    movePaddle(touchX); // タッチ位置を直接渡す
});



// ゲームの描画処理（最適化）
function drawGame() {
    if (!gameRunning) return;

    // 背景画像の描画
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 前フレームをクリア
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

    // 次のフレームを描画
    requestAnimationFrame(drawGame);
}



// パドルを指に追従させる関数（左右の移動で画像を変更）
function movePaddleTo(touchX) {
    // パドルの中心を指の位置に合わせる
    paddle.x = touchX - paddle.width / 2;

    // パドルが画面外に出ないように制限
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;

    // 移動方向を判定して画像を変更
    if (paddle.x > previousPaddleX) {
        paddle.img.src = "kanou4.png"; // 右向き画像
    } else if (paddle.x < previousPaddleX) {
        paddle.img.src = "kanou.png"; // 左向き画像
    }
    previousPaddleX = paddle.x; // 前回の位置を更新
}

// タッチ開始イベント
canvas.addEventListener('touchstart', (event) => {
    isSwiping = true; // スワイプ開始
    const touchX = event.touches[0].clientX;
    movePaddleTo(touchX); // 初期位置にパドルを移動
});

// タッチ移動イベント
canvas.addEventListener('touchmove', (event) => {
    if (!isSwiping) return; // スワイプ中でない場合は無視

    const touchX = event.touches[0].clientX; // 現在のタッチ位置を取得
    movePaddleTo(touchX); // 指の位置にリアルタイムで追従
});

// タッチ終了イベント
canvas.addEventListener('touchend', () => {
    isSwiping = false; // スワイプ終了
});

// マウス操作もサポート
canvas.addEventListener('mousemove', (event) => {
    const mouseX = event.offsetX;
     movePaddleTo(mouseX); 

    // 画面外にパドルが出ないように制限
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;

    // マウス移動の方向で画像を変更
    paddle.img.src = mouseX > paddleLastX ? "kanou4.png" : "kanou.png";
    paddleLastX = mouseX;
});

setTimeout(() => {
    if (currentDirection === "right") {
        paddle.img.src = "kanou4.png";
    } else if (currentDirection === "left") {
        paddle.img.src = "kanou.png";
    }
}, 100); // 100ms後に画像を変更

// ゲーム更新処理
function updateGame() {
    balls.forEach((ball) => {
        // ボールの移動
        ball.x += ball.dx;
        ball.y += ball.dy;

        // 壁との衝突判定（関数を呼び出し）
        handleWallCollision(ball);

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

        // ブロックとの衝突処理
        blocks.forEach((block) => {
            if (!block.hit && isColliding(ball, block)) {
                block.hit = true;
                ball.dy *= -1;

                // ランダムな変化を加える
                ball.dy += (Math.random() - 0.5) * 0.2;
            }
        });

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

    // ゲームの開始時にタイマーをリセットしてスタート
playButton.addEventListener('click', () => {
    titleScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    resetTimer(); // タイマーをリセット
    startTimer(); // タイマーを開始
    initGame();
    gameRunning = true;
    gameLoop();
});

// ゲームクリア時にタイマーを停止してスコアを表示
function endGame(isWin) {
    gameRunning = false;
    stopTimer(); // タイマーを停止

    gameOverImg.src = "";
    gameClearImg.src = "";

    if (isWin) {
        gameClearImg.src = "gamekuria.png";
        gameScreen.classList.add('hidden');
        gameClearScreen.classList.remove('hidden');
        displayClearScreen(); // スコアを表示
    } else {
        gameOverImg.src = "gameover.png";
        gameScreen.classList.add('hidden');
        gameOverScreen.classList.remove('hidden');
    }
}


// ゲームクリア画面にスコアを表示
function displayClearScreen() {
    const scoreText = document.createElement('div');
    scoreText.innerText = `スコア: ${timer}秒`;
    scoreText.style.fontSize = "24px";
    scoreText.style.color = "black";
    scoreText.style.textAlign = "center";
    gameClearScreen.appendChild(scoreText);
}

// ゲームループ
function gameLoop() {
    if (!gameRunning) return;

    updateGame();  // ボールやパドルの状態を更新
    requestAnimationFrame(gameLoop); // 描画処理は別で管理
}

// タイトル画面に戻る
function backToTitle() {
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameClearScreen.classList.add('hidden');
    titleScreen.classList.remove('hidden');
}

// プレイボタンの動作（ループ開始）
playButton.addEventListener('click', () => {
    titleScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    initGame();
    gameRunning = true;
    gameLoop(); // 更新をスタート
    drawGame(); // 描画をスタート
});

// リトライボタンの動作（ゲームオーバー画面）
retryButton.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    initGame(); // ゲーム状態をリセット
    gameRunning = true; // ゲームを開始状態に設定
    gameLoop(); // ゲームループを再スタート
});

// リトライボタンの動作（ゲームクリア画面）
retryButtonClear.addEventListener('click', () => {
    gameClearScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    initGame(); // ゲーム状態をリセット
    gameRunning = true; // ゲームを開始状態に設定
    gameLoop(); // ゲームループを再スタート
});


// タイトルボタン
titleButton.addEventListener('click', backToTitle);
titleButtonClear.addEventListener('click', backToTitle);
});
