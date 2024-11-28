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

// スワイプ操作用変数
let swipeStartX = 0; // スワイプの開始位置
let swipeDistance = 0; // スワイプの移動距離

// ゲーム初期化
function initGame() {
    gameRunning = true;
    ballAdded = false;
    ballAddedOnce = false;

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

// 衝突判定（ボールと矩形）
function isColliding(ball, rect) {
    const closestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.height));
    const distanceX = ball.x - closestX;
    const distanceY = ball.y - closestY;
    return distanceX * distanceX + distanceY * distanceY < ball.radius * ball.radius;
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

// パドルをスワイプで動かす関数
function movePaddleBySwipe(distance) {
    // スワイプ距離に応じてパドルの位置を移動
    paddle.x += distance;

    // 画面外にパドルが出ないように制限
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;

    // スワイプ方向に応じた画像を設定
    paddle.img.src = distance > 0 ? "kanou4.png" : "kanou.png"; // 右スワイプならkanou4.png、左スワイプならkanou.png
}

// タッチイベントの設定
canvas.addEventListener('touchstart', (event) => {
    // 最初のタッチ位置を記録
    swipeStartX = event.touches[0].clientX;
});

canvas.addEventListener('touchend', (event) => {
    // スワイプ距離を計算
    const swipeEndX = event.changedTouches[0].clientX;
    swipeDistance = swipeEndX - swipeStartX;

    // スワイプの移動距離が閾値以上ならパドルを動かす
    if (Math.abs(swipeDistance) > 10) { // 10px以上のスワイプのみ反応
        movePaddleBySwipe(swipeDistance);
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
