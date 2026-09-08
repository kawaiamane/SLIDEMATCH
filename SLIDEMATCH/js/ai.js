/**
 * CPU Computer Player AI
 *
 * CPUはカードを使用しない。
 *
 * CPUの考え方：
 *
 * ① 相手の5連を止める
 * ② 同時に自分の5連を作れるなら、それを最優先
 * ③ 自分の5連を作る
 * ④ 5連につながりやすい場所へ動く
 *
 * 重要：
 * 「相手を邪魔するだけ」のCPUにはしない。
 * できるだけ自分の5連も同時に狙う。
 *
 * フリーズ対策：
 * - 1手先だけを見る
 * - 深い読みをしない
 * - CPUの二重実行を防止
 * - 7秒安全タイマー
 */


let cpuTimeoutId = null;


// ============================================================
// CPUターン開始
// ============================================================

function executeCpuMove() {

    if (isGameOver) {
        isCpuThinking = false;
        return;
    }

    if (gameMode !== 'CPU') {
        isCpuThinking = false;
        return;
    }

    if (currentPlayer !== 2) {
        isCpuThinking = false;
        return;
    }

    if (isCpuThinking) {
        return;
    }

    isCpuThinking = true;
    isProcessingChain = false;

    clearCpuTimer();


    // --------------------------------------------------------
    // CPUが止まった場合の安全装置
    // --------------------------------------------------------

    cpuTimeoutId = setTimeout(() => {

        cpuTimeoutId = null;

        if (!isCpuThinking) {
            return;
        }

        console.warn(
            'CPUが7秒以上処理されなかったためターン終了'
        );

        isCpuThinking = false;
        isProcessingChain = false;

        if (typeof cancelCardActive === 'function') {
            cancelCardActive();
        }

        if (
            !isGameOver &&
            currentPlayer === 2
        ) {
            endTurn();
        }

    }, 7000);


    // --------------------------------------------------------
    // 少し待ってからCPUを考える
    // --------------------------------------------------------

    setTimeout(() => {

        if (isGameOver) {
            clearCpuTimer();
            isCpuThinking = false;
            return;
        }

        if (
            gameMode !== 'CPU' ||
            currentPlayer !== 2
        ) {
            clearCpuTimer();
            isCpuThinking = false;
            return;
        }

        try {

            performCpuNormalMove();

        } catch (error) {

            console.error(
                'CPU Turn Error:',
                error
            );

            clearCpuTimer();

            isCpuThinking = false;
            isProcessingChain = false;

            if (
                !isGameOver &&
                currentPlayer === 2
            ) {
                endTurn();
            }
        }

    }, 400);
}


// ============================================================
// CPUの通常移動
// ============================================================

function performCpuNormalMove() {

    // CPUはカードを使わない
    if (typeof cancelCardActive === 'function') {
        cancelCardActive();
    }


    // --------------------------------------------------------
    // CPUの移動候補
    // --------------------------------------------------------

    const moves = getCpuMoves();


    if (moves.length === 0) {

        clearCpuTimer();

        isCpuThinking = false;
        isProcessingChain = false;

        if (
            !isGameOver &&
            currentPlayer === 2
        ) {
            endTurn();
        }

        return;
    }


    // --------------------------------------------------------
    // P1が次の手で5連を作れる場所を取得
    // --------------------------------------------------------

    const dangerCells =
        findPlayerImmediateFiveThreats();


    // --------------------------------------------------------
    // CPUの最善手を探す
    //
    // scoreが高いほど優先。
    //
    // 「妨害」と「自分の5連」の両方を評価する。
    // --------------------------------------------------------

    let bestMove = null;
    let bestScore = -Infinity;


    for (const move of moves) {

        const isBlocking =
            isMoveBlockingThreat(
                move,
                dangerCells
            );


        const createsOwnFive =
            simulateCpuMoveAndCheckFive(
                move
            );


        // ----------------------------------------------------
        // スコア
        // ----------------------------------------------------

        let score = 0;


        // ====================================================
        // ① 両方できる手
        // ====================================================

        if (
            isBlocking &&
            createsOwnFive
        ) {

            // これが一番強い
            score += 20000;

        }


        // ====================================================
        // ② 相手の5連を妨害
        // ====================================================

        if (isBlocking) {

            score += 10000;

        }


        // ====================================================
        // ③ 自分の5連
        // ====================================================

        if (createsOwnFive) {

            score += 9000;

        }


        // ====================================================
        // ④ 5連に近づく手を評価
        // ====================================================

        const ownConnection =
            calculateLocalConnection(
                move.tr,
                move.tc,
                2
            );

        score += ownConnection * 300;


        // ====================================================
        // ⑤ 相手の5連候補に近い場所を軽く妨害
        // ====================================================

        if (
            isNearDangerCell(
                move.tr,
                move.tc,
                dangerCells
            )
        ) {

            score += 100;
        }


        // ----------------------------------------------------
        // 同点なら少しランダム
        // ----------------------------------------------------

        score += Math.random() * 20;


        if (score > bestScore) {

            bestScore = score;
            bestMove = move;
        }
    }


    // --------------------------------------------------------
    // 念のため手が決まらなかった場合
    // --------------------------------------------------------

    if (!bestMove) {

        bestMove =
            moves[
                Math.floor(
                    Math.random() * moves.length
                )
            ];
    }


    // --------------------------------------------------------
    // CPUの狙いをログに表示
    // --------------------------------------------------------

    const blocking =
        isMoveBlockingThreat(
            bestMove,
            dangerCells
        );

    const ownFive =
        simulateCpuMoveAndCheckFive(
            bestMove
        );


    if (blocking && ownFive) {

        console.log(
            'CPU: 相手の5連を妨害しながら自分も5連！'
        );

    } else if (blocking) {

        console.log(
            'CPU: 相手の5連を妨害'
        );

    } else if (ownFive) {

        console.log(
            'CPU: 自分の5連を作る'
        );

    } else {

        console.log(
            'CPU: 5連につながる通常移動'
        );
    }


    // ========================================================
    // 最終安全確認
    // ========================================================

    if (
        !bestMove ||
        board[bestMove.fr][bestMove.fc] !== 2 ||
        board[bestMove.tr][bestMove.tc] !== 0
    ) {

        clearCpuTimer();

        isCpuThinking = false;
        isProcessingChain = false;

        if (
            !isGameOver &&
            currentPlayer === 2
        ) {
            endTurn();
        }

        return;
    }


    // ========================================================
    // CPUを移動
    // ========================================================

    board[bestMove.tr][bestMove.tc] = 2;
    board[bestMove.fr][bestMove.fc] = 0;

    renderBoard();

    playSound('slide');


    // CPUの手数を減らす
    counts[2]--;

    updateCounterUI();

    recalculateBoardPieces();


    // ========================================================
    // 勝敗判定
    // ========================================================

    if (checkWinCondition()) {

        clearCpuTimer();

        isCpuThinking = false;
        isProcessingChain = false;

        return;
    }


    // ========================================================
    // 5連・連鎖処理
    // ========================================================

    clearCpuTimer();

    isProcessingChain = true;

    try {

        checkMatchAndProcessChain();

    } catch (error) {

        console.error(
            'CPU連鎖処理エラー:',
            error
        );

        isCpuThinking = false;
        isProcessingChain = false;

        if (
            !isGameOver &&
            currentPlayer === 2
        ) {
            endTurn();
        }
    }
}


// ============================================================
// CPUの移動候補を取得
// ============================================================

function getCpuMoves() {

    const moves = [];

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];


    for (let r = 0; r < SIZE; r++) {

        for (let c = 0; c < SIZE; c++) {

            if (board[r][c] !== 2) {
                continue;
            }


            for (const [dr, dc] of directions) {

                const nr = r + dr;
                const nc = c + dc;


                if (
                    nr < 0 ||
                    nr >= SIZE ||
                    nc < 0 ||
                    nc >= SIZE
                ) {
                    continue;
                }


                if (board[nr][nc] !== 0) {
                    continue;
                }


                moves.push({
                    fr: r,
                    fc: c,
                    tr: nr,
                    tc: nc
                });
            }
        }
    }


    return moves;
}


// ============================================================
// P1が次の手で5連を作れる場所を探す
// ============================================================

function findPlayerImmediateFiveThreats() {

    const threats = [];

    const moves =
        getPlayerMoves(1);


    // --------------------------------------------------------
    // 同じ到着地点は一度だけ調べる
    // --------------------------------------------------------

    const checked = Array.from(
        { length: SIZE },
        () => Array(SIZE).fill(false)
    );


    for (const move of moves) {

        const r = move.tr;
        const c = move.tc;


        if (checked[r][c]) {
            continue;
        }

        checked[r][c] = true;


        // P1の移動を一時実行
        board[r][c] = 1;
        board[move.fr][move.fc] = 0;


        const createsFive =
            hasFiveInARow(1);


        // 必ず元に戻す
        board[move.fr][move.fc] = 1;
        board[r][c] = 0;


        if (createsFive) {

            threats.push({
                r: r,
                c: c
            });
        }
    }


    return threats;
}


// ============================================================
// P1の移動候補
// ============================================================

function getPlayerMoves(player) {

    const moves = [];

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];


    for (let r = 0; r < SIZE; r++) {

        for (let c = 0; c < SIZE; c++) {

            if (board[r][c] !== player) {
                continue;
            }


            for (const [dr, dc] of directions) {

                const nr = r + dr;
                const nc = c + dc;


                if (
                    nr < 0 ||
                    nr >= SIZE ||
                    nc < 0 ||
                    nc >= SIZE
                ) {
                    continue;
                }


                if (board[nr][nc] !== 0) {
                    continue;
                }


                moves.push({
                    fr: r,
                    fc: c,
                    tr: nr,
                    tc: nc
                });
            }
        }
    }


    return moves;
}


// ============================================================
// このCPU移動で相手の5連を止められるか
// ============================================================

function isMoveBlockingThreat(
    move,
    dangerCells
) {

    if (
        !move ||
        !dangerCells ||
        dangerCells.length === 0
    ) {
        return false;
    }


    return dangerCells.some(
        danger =>
            danger.r === move.tr &&
            danger.c === move.tc
    );
}


// ============================================================
// CPU移動で5連を作れるか
// ============================================================

function simulateCpuMoveAndCheckFive(move) {

    if (!move) {
        return false;
    }


    if (
        board[move.fr][move.fc] !== 2 ||
        board[move.tr][move.tc] !== 0
    ) {
        return false;
    }


    // CPU移動を一時実行
    board[move.tr][move.tc] = 2;
    board[move.fr][move.fc] = 0;


    const createsFive =
        hasFiveInARow(2);


    // 必ず元に戻す
    board[move.fr][move.fc] = 2;
    board[move.tr][move.tc] = 0;


    return createsFive;
}


// ============================================================
// 移動先の周囲に自分の駒が何個あるか
//
// 5連にならなくても、次の5連につながりやすい場所を評価。
// ============================================================

function calculateLocalConnection(
    r,
    c,
    player
) {

    let score = 0;


    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1]
    ];


    for (const [dr, dc] of directions) {

        const nr = r + dr;
        const nc = c + dc;


        if (
            nr < 0 ||
            nr >= SIZE ||
            nc < 0 ||
            nc >= SIZE
        ) {
            continue;
        }


        if (board[nr][nc] === player) {

            score++;
        }
    }


    return score;
}


// ============================================================
// 危険マスの近くか
// ============================================================

function isNearDangerCell(
    r,
    c,
    dangerCells
) {

    if (!dangerCells) {
        return false;
    }


    return dangerCells.some(
        danger => {

            const distance =
                Math.abs(danger.r - r) +
                Math.abs(danger.c - c);

            return distance <= 1;
        }
    );
}


// ============================================================
// 5連判定
// ============================================================

function hasFiveInARow(player) {

    // --------------------------------------------------------
    // 横
    // --------------------------------------------------------

    for (let r = 0; r < SIZE; r++) {

        for (let c = 0; c <= SIZE - 5; c++) {

            if (
                board[r][c] === player &&
                board[r][c + 1] === player &&
                board[r][c + 2] === player &&
                board[r][c + 3] === player &&
                board[r][c + 4] === player
            ) {
                return true;
            }
        }
    }


    // --------------------------------------------------------
    // 縦
    // --------------------------------------------------------

    for (let c = 0; c < SIZE; c++) {

        for (let r = 0; r <= SIZE - 5; r++) {

            if (
                board[r][c] === player &&
                board[r + 1][c] === player &&
                board[r + 2][c] === player &&
                board[r + 3][c] === player &&
                board[r + 4][c] === player
            ) {
                return true;
            }
        }
    }


    // --------------------------------------------------------
    // 右下がり
    // --------------------------------------------------------

    for (let r = 0; r <= SIZE - 5; r++) {

        for (let c = 0; c <= SIZE - 5; c++) {

            if (
                board[r][c] === player &&
                board[r + 1][c + 1] === player &&
                board[r + 2][c + 2] === player &&
                board[r + 3][c + 3] === player &&
                board[r + 4][c + 4] === player
            ) {
                return true;
            }
        }
    }


    // --------------------------------------------------------
    // 右上がり
    // --------------------------------------------------------

    for (let r = 4; r < SIZE; r++) {

        for (let c = 0; c <= SIZE - 5; c++) {

            if (
                board[r][c] === player &&
                board[r - 1][c + 1] === player &&
                board[r - 2][c + 2] === player &&
                board[r - 3][c + 3] === player &&
                board[r - 4][c + 4] === player
            ) {
                return true;
            }
        }
    }


    return false;
}


// ============================================================
// CPUタイマー解除
// ============================================================

function clearCpuTimer() {

    if (cpuTimeoutId !== null) {

        clearTimeout(cpuTimeoutId);

        cpuTimeoutId = null;
    }
}