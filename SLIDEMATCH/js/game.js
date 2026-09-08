/**
 * Core Game Loop, Turn Management, & Matching Logic
 */
let currentPlayer = 1;
let gameMode = 'CPU';
let counts = { 1: 50, 2: 50 };
let isCpuThinking = false;
let isGameOver = false;
let isProcessingChain = false;
let hasDoubleTurn = false;

function startGame(mode) {
    gameMode = mode;
    document.getElementById('p2Label').innerText = (mode === 'CPU') ? 'CPU' : 'P2';
    document.getElementById('p2FieldLabel').innerText = (mode === 'CPU') ? 'CPU HAND (MAX 2)' : 'P2 HAND (MAX 2)';
    document.getElementById('homeScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    playSound('start');
    initGame();
}

function backToHome() {
    cancelDrag();
    document.getElementById('gameScreen').classList.remove('active');
    jumpToHomeDirectly();
}

function initGame() {
    cancelDrag();
    isGameOver = false;
    isCpuThinking = false;
    isProcessingChain = false;
    currentPlayer = 1;
    hasDoubleTurn = false;
    counts = { 1: 50, 2: 50 };
    updateCounterUI();

    buildActivePool();
    playerCards = { 1: [], 2: [] };
    cancelCardActive();

    const sideContainer = document.getElementById('sideHandsContainer');
    const mainArea = document.getElementById('mainPlayArea');
    const p1F = document.getElementById('p1Field');
    const p2F = document.getElementById('p2Field');

    if (hasAnyMod()) {
        mainArea.classList.remove('no-mods');
        sideContainer.classList.remove('hide-completely');
        p1F.classList.add('mod-enabled-field');
        p2F.classList.add('mod-enabled-field');

        for (let p of [1, 2]) {
            for (let i = 0; i < startHandSize; i++) {
                if (activePool.length > 0) {
                    playerCards[p].push(
                        activePool[Math.floor(Math.random() * activePool.length)]
                    );
                }
            }
        }
    } else {
        mainArea.classList.add('no-mods');
        sideContainer.classList.add('hide-completely');
        p1F.classList.remove('mod-enabled-field');
        p2F.classList.remove('mod-enabled-field');
    }

    let validBoard = false;

    while (!validBoard) {
        board = Array.from(
            { length: SIZE },
            () => Array(SIZE).fill(0)
        );

        let count1 = 0;
        let count2 = 0;

        while (count1 < 32) {
            let r = Math.floor(Math.random() * SIZE);
            let c = Math.floor(Math.random() * SIZE);

            if (board[r][c] === 0) {
                board[r][c] = 1;
                count1++;
            }
        }

        while (count2 < 32) {
            let r = Math.floor(Math.random() * SIZE);
            let c = Math.floor(Math.random() * SIZE);

            if (board[r][c] === 0) {
                board[r][c] = 2;
                count2++;
            }
        }

        if (!checkInitialMatch()) {
            validBoard = true;
        }
    }

    recalculateBoardPieces();
    renderBoard();
    updateStatus();
    setupDragAndDrop();
    renderCards();
}

function executeMove(fromR, fromC, toR, toC) {
    // タッチフォーカスおよび残留要素を強制クリア
    document.activeElement?.blur();
    document.querySelectorAll('.dragging').forEach(el => el.remove());

    board[toR][toC] = board[fromR][fromC];
    board[fromR][fromC] = 0;

    renderBoard();
    playSound('slide');

    counts[currentPlayer]--;
    updateCounterUI();
    recalculateBoardPieces();

    if (checkWinCondition()) return;

    isProcessingChain = true;
    checkMatchAndProcessChain();
}

/**
 * 盤面のマッチング判定および連鎖処理
 */
function checkMatchAndProcessChain() {
    let matchedCells = [];

    // 横5連
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c <= SIZE - 5; c++) {
            const p = board[r][c];

            if (
                p !== 0 &&
                board[r][c + 1] === p &&
                board[r][c + 2] === p &&
                board[r][c + 3] === p &&
                board[r][c + 4] === p
            ) {
                for (let i = 0; i < 5; i++) {
                    matchedCells.push({
                        r: r,
                        c: c + i,
                        p: p
                    });
                }
            }
        }
    }

    // 縦5連
    for (let c = 0; c < SIZE; c++) {
        for (let r = 0; r <= SIZE - 5; r++) {
            const p = board[r][c];

            if (
                p !== 0 &&
                board[r + 1][c] === p &&
                board[r + 2][c] === p &&
                board[r + 3][c] === p &&
                board[r + 4][c] === p
            ) {
                for (let i = 0; i < 5; i++) {
                    matchedCells.push({
                        r: r + i,
                        c: c,
                        p: p
                    });
                }
            }
        }
    }

    // 右下がり斜め5連
    for (let r = 0; r <= SIZE - 5; r++) {
        for (let c = 0; c <= SIZE - 5; c++) {
            const p = board[r][c];

            if (
                p !== 0 &&
                board[r + 1][c + 1] === p &&
                board[r + 2][c + 2] === p &&
                board[r + 3][c + 3] === p &&
                board[r + 4][c + 4] === p
            ) {
                for (let i = 0; i < 5; i++) {
                    matchedCells.push({
                        r: r + i,
                        c: c + i,
                        p: p
                    });
                }
            }
        }
    }

    // 右上がり斜め5連
    for (let r = 4; r < SIZE; r++) {
        for (let c = 0; c <= SIZE - 5; c++) {
            const p = board[r][c];

            if (
                p !== 0 &&
                board[r - 1][c + 1] === p &&
                board[r - 2][c + 2] === p &&
                board[r - 3][c + 3] === p &&
                board[r - 4][c + 4] === p
            ) {
                for (let i = 0; i < 5; i++) {
                    matchedCells.push({
                        r: r - i,
                        c: c + i,
                        p: p
                    });
                }
            }
        }
    }

    // マッチが存在する場合
    if (matchedCells.length > 0) {
        playSound('score');

        let uniqueMatches = [];
        let visited = Array.from(
            { length: SIZE },
            () => Array(SIZE).fill(false)
        );

        matchedCells.forEach(coord => {
            if (!visited[coord.r][coord.c]) {
                visited[coord.r][coord.c] = true;
                uniqueMatches.push(coord);

                const cellEl = document.querySelector(
                    `[data-row="${coord.r}"][data-col="${coord.c}"]`
                );

                if (cellEl) {
                    cellEl.classList.add('matched-vanish');
                }
            }
        });

        setTimeout(() => {
            uniqueMatches.forEach(coord => {
                board[coord.r][coord.c] = 0;
            });

            recalculateBoardPieces();
            renderBoard();

            if (checkWinCondition()) {
                isProcessingChain = false;
                isCpuThinking = false;
                return;
            }

            checkMatchAndProcessChain();
        }, 300);

    } else {
        // マッチがなくなったので連鎖終了
        isProcessingChain = false;

        if (checkWinCondition()) {
            isCpuThinking = false;
            return;
        }

        // ダブルターン
        if (hasDoubleTurn) {
            hasDoubleTurn = false;

            cancelCardActive();
            updateStatus();
            renderCards();

            if (currentPlayer === 2 && gameMode === 'CPU') {
                setTimeout(executeCpuMove, 600);
            }

        } else {
            endTurn();
        }
    }
}

/**
 * ターン終了
 */
function endTurn() {
    isCpuThinking = false;
    isProcessingChain = false;

    drawCardForCurrentPlayer();

    currentPlayer = currentPlayer === 1 ? 2 : 1;

    updateStatus();
    renderCards();

    if (currentPlayer === 1) {

        enablePlayerControls();

    } else if (
        currentPlayer === 2 &&
        gameMode === 'CPU' &&
        !isGameOver
    ) {

        // CPUターンを必ず開始
        setTimeout(() => {
            if (
                !isGameOver &&
                currentPlayer === 2 &&
                gameMode === 'CPU' &&
                !isCpuThinking
            ) {
                executeCpuMove();
            }
        }, 600);
    }
}

function checkWinCondition() {

    if (isGameOver) {
        return true;
    }

    let winMsg = "";

    const p2Name =
        gameMode === 'CPU'
            ? 'CPU'
            : 'P2';


    // ========================================================
    // ① 自分のブロックを全部消したら「自分の勝ち」
    // ========================================================

    if (boardPieces[1] <= 0) {

        // P1のブロックが0
        winMsg = "P1 WINS!";

    } else if (boardPieces[2] <= 0) {

        // P2 / CPUのブロックが0
        winMsg = `${p2Name} WINS!`;
    }


    // ========================================================
    // ② 手数を使い切ったら「そのプレイヤーの負け」
    //
    // ブロック0の判定を先にする。
    // ========================================================

    else if (counts[1] <= 0) {

        // P1が手数切れ
        winMsg = `${p2Name} WINS!`;

    } else if (counts[2] <= 0) {

        // P2 / CPUが手数切れ
        winMsg = "P1 WINS!";
    }


    // ========================================================
    // 勝敗が決まっていない
    // ========================================================

    if (winMsg === "") {
        return false;
    }


    // ========================================================
    // ゲーム終了
    // ========================================================

    isGameOver = true;

    // CPU処理を停止
    isCpuThinking = false;
    isProcessingChain = false;


    // CPUの安全タイマーを停止
    if (
        typeof cpuTimeoutId !== 'undefined' &&
        cpuTimeoutId !== null
    ) {

        clearTimeout(cpuTimeoutId);

        cpuTimeoutId = null;
    }


    // カード選択状態を解除
    if (
        typeof cancelCardActive === 'function'
    ) {

        cancelCardActive();
    }


    // 結果表示
    document
        .getElementById('winMessage')
        .innerText = winMsg;

    document
        .getElementById('gameResultModal')
        .classList.add('active');


    return true;
}

function closeResultAndGoHome() {
    document.getElementById('gameResultModal').classList.remove('active');
    backToHome();
}