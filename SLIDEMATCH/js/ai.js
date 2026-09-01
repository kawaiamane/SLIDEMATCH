/**
 * CPU Computer Player AI
 *
 * CPUはカードを一切使用しない。
 * 通常のコマ移動だけを行う。
 *
 * フリーズ対策：
 * - CPUの二重実行を防止
 * - 7秒の安全タイマー
 * - 移動可能場所がなくても必ずターン終了
 * - エラーが起きても必ずターン終了
 * - カード処理を一切呼ばない
 */

let cpuTimeoutId = null;


// ============================================================
// CPUターン開始
// ============================================================

function executeCpuMove() {

    // --------------------------------------------------------
    // ゲーム状態チェック
    // --------------------------------------------------------

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

    // CPUの二重実行を防ぐ
    if (isCpuThinking) {
        return;
    }

    isCpuThinking = true;
    isProcessingChain = false;

    clearTimeout(cpuTimeoutId);
    cpuTimeoutId = null;


    // --------------------------------------------------------
    // CPUが何かの理由で止まった場合の安全装置
    // --------------------------------------------------------

    cpuTimeoutId = setTimeout(() => {

        cpuTimeoutId = null;

        if (!isCpuThinking) {
            return;
        }

        console.warn(
            'CPUが7秒以上処理されなかったため、ターンを終了します。'
        );

        isCpuThinking = false;
        isProcessingChain = false;

        // CPUカード処理の残骸を完全解除
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
    // 少し待ってからCPUを動かす
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

    }, 600);
}


// ============================================================
// CPU通常移動
// ============================================================

function performCpuNormalMove() {

    // --------------------------------------------------------
    // CPUはカードを絶対に使わない
    // --------------------------------------------------------

    if (typeof cancelCardActive === 'function') {
        cancelCardActive();
    }

    activeCard = null;
    activeCardIdx = null;
    customSelectState = null;


    // --------------------------------------------------------
    // 移動可能な場所を集める
    // --------------------------------------------------------

    const moves = [];

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    for (let r = 0; r < SIZE; r++) {

        for (let c = 0; c < SIZE; c++) {

            // CPUのコマだけ調べる
            if (board[r][c] !== 2) {
                continue;
            }

            for (let i = 0; i < 4; i++) {

                const nr = r + dr[i];
                const nc = c + dc[i];

                // 盤面外
                if (
                    nr < 0 ||
                    nr >= SIZE ||
                    nc < 0 ||
                    nc >= SIZE
                ) {
                    continue;
                }

                // 空いている場所だけ移動可能
                if (board[nr][nc] === 0) {

                    moves.push({
                        fr: r,
                        fc: c,
                        tr: nr,
                        tc: nc
                    });
                }
            }
        }
    }


    // --------------------------------------------------------
    // 動ける場所がない
    // --------------------------------------------------------

    if (moves.length === 0) {

        console.warn(
            'CPUに移動可能な場所がありません。ターン終了。'
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

        return;
    }


    // --------------------------------------------------------
    // ランダムに移動先を選ぶ
    // --------------------------------------------------------

    const move =
        moves[
            Math.floor(
                Math.random() * moves.length
            )
        ];


    // --------------------------------------------------------
    // 移動直前の安全確認
    // --------------------------------------------------------

    if (
        !move ||
        board[move.fr][move.fc] !== 2 ||
        board[move.tr][move.tc] !== 0
    ) {

        console.warn(
            'CPU移動の安全確認に失敗しました。'
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

        return;
    }


    // --------------------------------------------------------
    // CPUコマを移動
    // --------------------------------------------------------

    board[move.tr][move.tc] = 2;
    board[move.fr][move.fc] = 0;


    // --------------------------------------------------------
    // 表示更新
    // --------------------------------------------------------

    renderBoard();

    playSound('slide');


    // --------------------------------------------------------
    // CPUの残り手数を減らす
    // --------------------------------------------------------

    counts[2]--;

    updateCounterUI();

    recalculateBoardPieces();


    // --------------------------------------------------------
    // タイマー解除
    // --------------------------------------------------------

    clearCpuTimer();


    // --------------------------------------------------------
    // 勝利判定
    // --------------------------------------------------------

    if (checkWinCondition()) {

        isCpuThinking = false;
        isProcessingChain = false;

        return;
    }


    // --------------------------------------------------------
    // 5連・連鎖処理
    // --------------------------------------------------------

    isProcessingChain = true;

    /*
     * ここでは endTurn() を直接呼ばない。
     *
     * checkMatchAndProcessChain() が
     *
     * 1. 5連を探す
     * 2. あれば消す
     * 3. もう一度連鎖を確認
     * 4. なければ endTurn()
     *
     * という流れを担当する。
     */

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
// CPUタイマー解除
// ============================================================

function clearCpuTimer() {

    if (cpuTimeoutId !== null) {

        clearTimeout(cpuTimeoutId);

        cpuTimeoutId = null;
    }
}