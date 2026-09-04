/**
 * Modular Expansion Card Behaviors & Actions
 *
 * CPUはカードを使用しない。
 * P1のカード機能は通常通り使用可能。
 */

let modSelection = {
    newcard: false,
    min: false,
    ringo: false,
    tantal: false
};

let activePool = [];
let playerCards = {
    1: [],
    2: []
};

let activeCard = null;
let activeCardIdx = null;
let customSelectState = null;

let startHandSize = 2;
const MAX_HAND_SIZE = 2;


// ============================================================
// カードプール
// ============================================================

function buildActivePool() {
    activePool = [];

    const baseWeight = 5;

    if (modSelection.newcard) {
        for (let i = 0; i < baseWeight; i++) {
            activePool.push(...MOD_CARDS.newcard);
        }
    }

    if (modSelection.min) {
        for (let i = 0; i < baseWeight; i++) {
            activePool.push(...MOD_CARDS.min);
        }
    }

    if (modSelection.ringo) {
        for (let i = 0; i < baseWeight; i++) {
            activePool.push(...MOD_CARDS.ringo);
        }
    }

    if (modSelection.tantal) {
        activePool.push(...MOD_CARDS.tantal);
    }
}

function hasAnyMod() {
    return (
        modSelection.newcard ||
        modSelection.min ||
        modSelection.ringo ||
        modSelection.tantal
    );
}


// ============================================================
// カード表示
// ============================================================

function renderCards() {
    if (!hasAnyMod()) {
        return;
    }

    const p1Container =
        document.getElementById('p1CardsContainer');

    const p2Container =
        document.getElementById('p2CardsContainer');

    if (!p1Container || !p2Container) {
        return;
    }

    p1Container.innerHTML = '';
    p2Container.innerHTML = '';

    // --------------------------------------------------------
    // P1
    // --------------------------------------------------------

    playerCards[1].forEach((card, idx) => {
        const cardEl = document.createElement('div');

        cardEl.classList.add('card');

        if (
            currentPlayer === 1 &&
            activeCardIdx === idx
        ) {
            cardEl.classList.add('active-use');
        }

        if (
            currentPlayer !== 1 ||
            isCpuThinking ||
            isProcessingChain
        ) {
            cardEl.classList.add('disabled');
        }

        cardEl.innerHTML = `
            <div class="card-header-row">
                <div class="card-inner-text">${card.name}</div>
                <span class="card-tag" style="${
                    card.tag === 'tnt'
                        ? 'color:#9b7cd6;border-color:#9b7cd6;'
                        : ''
                }">${card.tag}</span>
            </div>
            <div class="card-desc">${card.desc}</div>
        `;

        if (
            currentPlayer === 1 &&
            !isCpuThinking &&
            !isProcessingChain
        ) {
            cardEl.addEventListener(
                'click',
                () => useCard(idx)
            );
        }

        p1Container.appendChild(cardEl);
    });


    // --------------------------------------------------------
    // P2
    // --------------------------------------------------------

    playerCards[2].forEach((card, idx) => {
        const cardEl =
            document.createElement('div');

        if (gameMode === 'CPU') {

            // CPUのカードは表示だけする。
            // CPU自身はカードを使用しない。
            cardEl.classList.add(
                'card',
                'facedown'
            );

            cardEl.innerHTML =
                `<div class="card-inner-text">M</div>`;

        } else {

            cardEl.classList.add('card');

            if (
                currentPlayer === 2 &&
                activeCardIdx === idx
            ) {
                cardEl.classList.add('active-use');
            }

            if (
                currentPlayer !== 2 ||
                isProcessingChain
            ) {
                cardEl.classList.add('disabled');
            }

            cardEl.innerHTML = `
                <div class="card-header-row">
                    <div class="card-inner-text">${card.name}</div>
                    <span class="card-tag" style="${
                        card.tag === 'tnt'
                            ? 'color:#9b7cd6;border-color:#9b7cd6;'
                            : ''
                    }">${card.tag}</span>
                </div>
                <div class="card-desc">${card.desc}</div>
            `;

            if (
                currentPlayer === 2 &&
                !isProcessingChain
            ) {
                cardEl.addEventListener(
                    'click',
                    () => useCard(idx)
                );
            }
        }

        p2Container.appendChild(cardEl);
    });
}


// ============================================================
// ターン終了時のカード補充
// ============================================================

function drawCardForCurrentPlayer() {
    if (activePool.length === 0) {
        return;
    }

    if (
        Math.random() < 0.6 &&
        playerCards[currentPlayer].length <
            MAX_HAND_SIZE
    ) {
        const randomIndex =
            Math.floor(
                Math.random() *
                activePool.length
            );

        playerCards[currentPlayer].push(
            activePool[randomIndex]
        );
    }
}


// ============================================================
// カード状態解除
// ============================================================

function consumeActiveCard() {

    if (activeCardIdx !== null) {
        playerCards[currentPlayer].splice(
            activeCardIdx,
            1
        );
    }

    activeCard = null;
    activeCardIdx = null;
    customSelectState = null;

    document
        .querySelectorAll('.cell')
        .forEach(el => {
            el.classList.remove(
                'card-selectable'
            );
        });

    renderCards();
}


function cancelCardActive() {
    activeCard = null;
    activeCardIdx = null;
    customSelectState = null;

    document
        .querySelectorAll('.cell')
        .forEach(el => {
            el.classList.remove(
                'card-selectable'
            );
        });

    renderCards();
}


// ============================================================
// カード使用
// ============================================================

function useCard(idx) {

    // CPUターンではカードを使用しない
    if (gameMode === 'CPU' && currentPlayer === 2) {
        return;
    }

    if (
        isCpuThinking ||
        isProcessingChain ||
        isGameOver
    ) {
        return;
    }

    if (activeCardIdx === idx) {
        cancelCardActive();
        return;
    }

    cancelCardActive();

    const card =
        playerCards[currentPlayer][idx];

    if (!card) {
        return;
    }

    activeCard = card;
    activeCardIdx = idx;

    if (card.id.startsWith('t_')) {
    playTantalActivationEffect(card.id);
    executeTantalCard(card.id);
    return;
}
    if (card.id === 'n_shuffle') {
        executeShuffleCard();

    } else if (
        card.id === 'n_double' ||
        card.id === 'r_sweet'
    ) {

        hasDoubleTurn = true;

        consumeActiveCard();

        playSound('start');
        updateStatus();

    } else if (card.id === 'n_growth') {
        executeGrowthCard();

    } else if (card.id === 'n_trade') {
        executeTradeCard();

    } else if (card.id === 'm_minus1') {
        executeDirectMinusCard(-1);

    } else if (card.id === 'm_minus3') {
        executeDirectMinusCard(-3);

    } else if (card.id === 'm_clear_row') {
        executeClearMinRowCard();

    } else if (card.id === 'm_half') {
        executeHalfCutCard();

    } else if (card.id === 'm_redraw') {

        playerCards[currentPlayer] = [];

        for (let i = 0; i < 2; i++) {
            if (activePool.length > 0) {
                playerCards[currentPlayer].push(
                    activePool[
                        Math.floor(
                            Math.random() *
                            activePool.length
                        )
                    ]
                );
            }
        }

        cancelCardActive();

        playSound('start');

        endTurn();

    } else if (card.id === 'm_enemy_down') {
        executeEnemyDownCard(3);

    } else if (card.id === 'm_dice') {
        executeMinDiceCard();

    } else if (card.id === 'm_compress') {
        executeCompressCard();

    } else if (card.id === 'm_equal') {
        executeEqualCard();

    } else if (card.id === 'r_seed') {
        executeRingoSeedCard();

    } else if (card.id === 'r_peel') {
        executeRingoPeelCard();

    } else if (card.id === 'r_roulette') {
        executeRingoRouletteCard();

    } else if (card.id === 'r_gold') {
        executeGoldCard();

    } else if (card.id === 'r_harvest') {
        executeHarvestCard();

    } else {
        highlightCardTargets();
        renderCards();
    }
}

// ============================================================
// TANTAL専用発動演出
// ============================================================

function playTantalActivationEffect(cardId) {

    // 同じ演出が残っていたら消す
    const oldOverlay =
        document.getElementById('tantalActivationOverlay');

    if (oldOverlay) {
        oldOverlay.remove();
    }

    // 初回だけ演出用CSSを追加
    if (!document.getElementById('tantalEffectStyle')) {

        const style =
            document.createElement('style');

        style.id = 'tantalEffectStyle';

        style.textContent = `
            @keyframes tantalFlash {
                0% {
                    opacity: 0;
                    transform: scale(0.7);
                }

                15% {
                    opacity: 1;
                    transform: scale(1.05);
                }

                35% {
                    opacity: 0.9;
                    transform: scale(1);
                }

                100% {
                    opacity: 0;
                    transform: scale(1.15);
                }
            }

            @keyframes tantalText {
                0% {
                    opacity: 0;
                    transform: scale(0.5);
                    letter-spacing: 0px;
                }

                20% {
                    opacity: 1;
                    transform: scale(1.1);
                    letter-spacing: 12px;
                }

                60% {
                    opacity: 1;
                    transform: scale(1);
                    letter-spacing: 8px;
                }

                100% {
                    opacity: 0;
                    transform: scale(1.2);
                    letter-spacing: 16px;
                }
            }

            @keyframes tantalShake {
                0%, 100% {
                    transform: translate(0, 0);
                }

                20% {
                    transform: translate(-5px, 3px);
                }

                40% {
                    transform: translate(5px, -3px);
                }

                60% {
                    transform: translate(-4px, -2px);
                }

                80% {
                    transform: translate(4px, 2px);
                }
            }

            .tantal-activation-overlay {
                position: fixed;
                inset: 0;
                z-index: 99999;
                pointer-events: none;
                display: flex;
                align-items: center;
                justify-content: center;
                background:
                    radial-gradient(
                        circle,
                        rgba(170, 110, 255, 0.38) 0%,
                        rgba(100, 40, 180, 0.18) 35%,
                        rgba(20, 10, 40, 0) 70%
                    );
                animation:
                    tantalFlash 650ms
                    cubic-bezier(.2,.8,.2,1)
                    forwards;
            }

            .tantal-activation-text {
                color: #e7d5ff;
                font-family:
                    Arial,
                    Helvetica,
                    sans-serif;
                font-size: clamp(42px, 9vw, 100px);
                font-weight: 900;
                text-shadow:
                    0 0 8px #ffffff,
                    0 0 20px #b56cff,
                    0 0 45px #7b2cff;
                animation:
                    tantalText 650ms
                    cubic-bezier(.2,.8,.2,1)
                    forwards;
            }

            .tantal-shake {
                animation:
                    tantalShake 180ms
                    ease-in-out;
            }
        `;

        document.head.appendChild(style);
    }

    // 画面中央の TANTAL 表示
    const overlay =
        document.createElement('div');

    overlay.id = 'tantalActivationOverlay';
    overlay.className =
        'tantal-activation-overlay';

    const text =
        document.createElement('div');

    text.className =
        'tantal-activation-text';

    text.textContent = 'TANTAL';

    overlay.appendChild(text);
    document.body.appendChild(overlay);

    // 画面を一瞬だけ揺らす
    document.body.classList.remove('tantal-shake');

    // 再適用させるために1フレーム待つ
    requestAnimationFrame(() => {
        document.body.classList.add('tantal-shake');

        setTimeout(() => {
            document.body.classList.remove(
                'tantal-shake'
            );
        }, 200);
    });

    // タンタル発動音
    playSound('score');

    // 演出終了
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.remove();
        }
    }, 700);
}


// ============================================================
// TANTALカード
// ============================================================

function executeTantalCard(id) {

    const opp =
        currentPlayer === 1 ? 2 : 1;

    let isBoardChanged = false;

    // ========================================================
    // 盤面系タンタル
    // ========================================================

    if (
        [
            't_wipe',
            't_dominate',
            't_genesis',
            't_meteor',
            't_obliterate'
        ].includes(id)
    ) {

        let targets = [];

        // ----------------------------------------------------
        // WIPE OUT
        // 相手の駒を最大5個
        // ----------------------------------------------------

        if (id === 't_wipe') {

            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {

                    if (board[r][c] === opp) {
                        targets.push({ r, c });
                    }
                }
            }

            for (let i = 0; i < 5; i++) {

                if (targets.length === 0) {
                    break;
                }

                const t =
                    targets.splice(
                        Math.floor(
                            Math.random() *
                            targets.length
                        ),
                        1
                    )[0];

                board[t.r][t.c] = 0;
            }

            isBoardChanged = true;
        }


        // ----------------------------------------------------
        // GENESIS
        // 空きマスを最大5個
        // ----------------------------------------------------

        if (id === 't_genesis') {

            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {

                    if (board[r][c] === 0) {
                        targets.push({ r, c });
                    }
                }
            }

            for (let i = 0; i < 5; i++) {

                if (targets.length === 0) {
                    break;
                }

                const t =
                    targets.splice(
                        Math.floor(
                            Math.random() *
                            targets.length
                        ),
                        1
                    )[0];

                board[t.r][t.c] =
                    currentPlayer;
            }

            isBoardChanged = true;
        }


        // ----------------------------------------------------
        // METEOR
        // 相手の駒を最大3個
        // ----------------------------------------------------

        if (id === 't_meteor') {

            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {

                    if (board[r][c] === opp) {
                        targets.push({ r, c });
                    }
                }
            }

            for (let i = 0; i < 3; i++) {

                if (targets.length === 0) {
                    break;
                }

                const t =
                    targets.splice(
                        Math.floor(
                            Math.random() *
                            targets.length
                        ),
                        1
                    )[0];

                board[t.r][t.c] = 0;
            }

            isBoardChanged = true;
        }


        // ----------------------------------------------------
        // DOMINATE
        // 相手の駒を最大3個、自分の駒に
        // ----------------------------------------------------

        if (id === 't_dominate') {

            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {

                    if (board[r][c] === opp) {
                        targets.push({ r, c });
                    }
                }
            }

            for (let i = 0; i < 3; i++) {

                if (targets.length === 0) {
                    break;
                }

                const t =
                    targets.splice(
                        Math.floor(
                            Math.random() *
                            targets.length
                        ),
                        1
                    )[0];

                board[t.r][t.c] =
                    currentPlayer;
            }

            isBoardChanged = true;
        }


        // ----------------------------------------------------
        // OBLITERATE
        // 全消去ではなく最大6個をランダム消去
        // ----------------------------------------------------

        if (id === 't_obliterate') {

            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {

                    if (board[r][c] !== 0) {
                        targets.push({ r, c });
                    }
                }
            }

            for (let i = 0; i < 6; i++) {

                if (targets.length === 0) {
                    break;
                }

                const t =
                    targets.splice(
                        Math.floor(
                            Math.random() *
                            targets.length
                        ),
                        1
                    )[0];

                board[t.r][t.c] = 0;
            }

            isBoardChanged = true;
        }

    } else {

        // ====================================================
        // 手数系タンタル
        // ====================================================

        // SUPER HEAL
        if (id === 't_heal') {
            counts[currentPlayer] += 10;
        }


        // ECLIPSE
        // 相手を5ではなく10まで落とす
        if (id === 't_eclipse') {
            counts[opp] =
                Math.min(
                    10,
                    counts[opp]
                );
        }


        // TIME SWAP
        // これは強力だが、相手との差を
        // 直接作るカードではないので維持
        if (id === 't_swap') {

            const temp =
                counts[currentPlayer];

            counts[currentPlayer] =
                counts[opp];

            counts[opp] = temp;
        }


        // STEAL TIME
        // 10 → 5
        if (id === 't_steal_count') {

            const steal =
                Math.min(
                    5,
                    Math.max(
                        0,
                        counts[opp] - 1
                    )
                );

            counts[opp] -= steal;
            counts[currentPlayer] += steal;
        }


        // WEALTH
        // 1.5倍 → 1.25倍
        if (id === 't_wealth') {

            counts[currentPlayer] =
                Math.floor(
                    counts[currentPlayer] * 1.25
                );
        }

        updateCounterUI();
    }

    consumeActiveCard();

    // タンタル専用の強めの音
    playSound('score');

    if (isBoardChanged) {

        renderBoard();
        recalculateBoardPieces();

        if (checkWinCondition()) {
            return;
        }

        isProcessingChain = true;
        checkMatchAndProcessChain();

    } else {

        updateStatus();
        endTurn();
    }
}

// ============================================================
// カード対象ハイライト
// ============================================================

function highlightCardTargets() {

    document
        .querySelectorAll('.cell')
        .forEach(el => {
            el.classList.remove(
                'card-selectable'
            );
        });

    if (!activeCard) {
        return;
    }

    document
        .querySelectorAll('.cell')
        .forEach(el => {

            const r =
                parseInt(el.dataset.row);

            const c =
                parseInt(el.dataset.col);

            const val = board[r][c];

            const opp =
                currentPlayer === 1 ? 2 : 1;

            if (
                activeCard.id === 'n_delete' ||
                activeCard.id === 'r_poison'
            ) {

                if (val === opp) {
                    el.classList.add(
                        'card-selectable'
                    );
                }

            } else if (
                activeCard.id === 'n_steal'
            ) {

                if (val === opp) {
                    el.classList.add(
                        'card-selectable'
                    );
                }

            } else if (
                activeCard.id === 'n_wild' ||
                activeCard.id === 'r_apple'
            ) {

                if (val === 0) {
                    el.classList.add(
                        'card-selectable'
                    );
                }

            } else if (
                activeCard.id === 'n_bomb' ||
                activeCard.id === 'r_juicer'
            ) {

                el.classList.add(
                    'card-selectable'
                );

            } else if (
                activeCard.id === 'n_flip' &&
                c === 0
            ) {

                el.classList.add(
                    'card-selectable'
                );

            } else if (
                activeCard.id === 'r_tree' &&
                r === 0
            ) {

                el.classList.add(
                    'card-selectable'
                );

            } else if (
                activeCard.id === 'm_isolated'
            ) {

                if (
                    val === 0 &&
                    isCellIsolated(r, c)
                ) {
                    el.classList.add(
                        'card-selectable'
                    );
                }

            } else if (
                activeCard.id === 'n_replace'
            ) {

                if (!customSelectState) {

                    if (val === currentPlayer) {
                        el.classList.add(
                            'card-selectable'
                        );
                    }

                } else {

                    const dr =
                        [-1, 1, 0, 0];

                    const dc =
                        [0, 0, -1, 1];

                    for (let i = 0; i < 4; i++) {

                        if (
                            r ===
                                customSelectState.r +
                                dr[i] &&
                            c ===
                                customSelectState.c +
                                dc[i]
                        ) {
                            el.classList.add(
                                'card-selectable'
                            );
                        }
                    }
                }
            }
        });
}


// ============================================================
// カード対象セルの処理
// ============================================================

function handleCellClickForCard(r, c) {

    const isCpuCardAction =
        currentPlayer === 2 &&
        gameMode === 'CPU' &&
        isCpuThinking;

    // CPUは現在カードを使用しない。
    // 念のためCPUから呼ばれても処理を許可する構造は残す。
    if (
        !activeCard ||
        isGameOver ||
        (
            isCpuThinking &&
            !isCpuCardAction
        )
    ) {
        return false;
    }

    if (
        r < 0 ||
        r >= SIZE ||
        c < 0 ||
        c >= SIZE
    ) {
        return false;
    }

    const cellEl =
        document.querySelector(
            `[data-row="${r}"][data-col="${c}"]`
        );

    if (!isCpuCardAction) {

        if (
            !cellEl ||
            !cellEl.classList.contains(
                'card-selectable'
            )
        ) {
            return false;
        }
    }

    try {

        // ----------------------------------------------------
        // n_delete / r_poison
        // ----------------------------------------------------

        if (
            activeCard.id === 'n_delete' ||
            activeCard.id === 'r_poison'
        ) {

            board[r][c] = 0;

            if (
                activeCard.id === 'r_poison'
            ) {
                counts[currentPlayer] =
                    Math.max(
                        1,
                        counts[currentPlayer] - 1
                    );
            }

            consumeActiveCard();

            renderBoard();

            playSound('score');

            updateCounterUI();
            recalculateBoardPieces();

            if (checkWinCondition()) {
                isCpuThinking = false;
                return true;
            }

            isProcessingChain = true;
            checkMatchAndProcessChain();

            return true;
        }


        // ----------------------------------------------------
        // n_steal
        // ----------------------------------------------------

        if (
            activeCard.id === 'n_steal'
        ) {

            board[r][c] =
                currentPlayer;

            consumeActiveCard();

            renderBoard();

            playSound('score');

            recalculateBoardPieces();

            if (checkWinCondition()) {
                isCpuThinking = false;
                return true;
            }

            isProcessingChain = true;
            checkMatchAndProcessChain();

            return true;
        }


        // ----------------------------------------------------
        // n_wild / r_apple
        // ----------------------------------------------------

        if (
            activeCard.id === 'n_wild' ||
            activeCard.id === 'r_apple'
        ) {

            board[r][c] =
                currentPlayer;

            consumeActiveCard();

            renderBoard();

            playSound('slide');

            recalculateBoardPieces();

            if (checkWinCondition()) {
                isCpuThinking = false;
                return true;
            }

            isProcessingChain = true;
            checkMatchAndProcessChain();

            return true;
        }


        // ----------------------------------------------------
        // n_bomb
        // ----------------------------------------------------

        if (
            activeCard.id === 'n_bomb'
        ) {

            board[r][c] = 0;

            if (r > 0) {
                board[r - 1][c] = 0;
            }

            if (r < SIZE - 1) {
                board[r + 1][c] = 0;
            }

            if (c > 0) {
                board[r][c - 1] = 0;
            }

            if (c < SIZE - 1) {
                board[r][c + 1] = 0;
            }

            consumeActiveCard();

            renderBoard();

            playSound('score');

            recalculateBoardPieces();

            if (checkWinCondition()) {
                isCpuThinking = false;
                return true;
            }

            isProcessingChain = true;
            checkMatchAndProcessChain();

            return true;
        }


        // ----------------------------------------------------
        // r_juicer
        // ----------------------------------------------------

        if (
            activeCard.id === 'r_juicer'
        ) {

            for (let dr = 0; dr <= 1; dr++) {
                for (let dc = 0; dc <= 1; dc++) {

                    const nr = r + dr;
                    const nc = c + dc;

                    if (
                        nr >= 0 &&
                        nr < SIZE &&
                        nc >= 0 &&
                        nc < SIZE
                    ) {
                        board[nr][nc] = 0;
                    }
                }
            }

            consumeActiveCard();

            renderBoard();

            playSound('score');

            recalculateBoardPieces();

            if (checkWinCondition()) {
                isCpuThinking = false;
                return true;
            }

            isProcessingChain = true;
            checkMatchAndProcessChain();

            return true;
        }


        // ----------------------------------------------------
        // n_flip
        // ----------------------------------------------------

        if (
            activeCard.id === 'n_flip'
        ) {

            for (let i = 0; i < SIZE; i++) {

                if (board[r][i] === 1) {
                    board[r][i] = 2;

                } else if (board[r][i] === 2) {
                    board[r][i] = 1;
                }
            }

            consumeActiveCard();

            renderBoard();

            playSound('start');

            recalculateBoardPieces();

            if (checkWinCondition()) {
                isCpuThinking = false;
                return true;
            }

            isProcessingChain = true;
            checkMatchAndProcessChain();

            return true;
        }


        // ----------------------------------------------------
        // r_tree
        // ----------------------------------------------------

        if (
            activeCard.id === 'r_tree'
        ) {

            for (let i = 0; i < SIZE; i++) {
                board[i][c] =
                    currentPlayer;
            }

            consumeActiveCard();

            renderBoard();

            playSound('start');

            recalculateBoardPieces();

            if (checkWinCondition()) {
                isCpuThinking = false;
                return true;
            }

            isProcessingChain = true;
            checkMatchAndProcessChain();

            return true;
        }


        // ----------------------------------------------------
        // m_isolated
        // ----------------------------------------------------

        if (
            activeCard.id === 'm_isolated'
        ) {

            board[r][c] =
                currentPlayer;

            consumeActiveCard();

            renderBoard();

            playSound('slide');

            recalculateBoardPieces();

            if (checkWinCondition()) {
                isCpuThinking = false;
                return true;
            }

            isProcessingChain = true;
            checkMatchAndProcessChain();

            return true;
        }


        // ----------------------------------------------------
        // n_replace
        // ----------------------------------------------------

        if (
            activeCard.id === 'n_replace'
        ) {

            if (!customSelectState) {

                customSelectState = {
                    r: r,
                    c: c
                };

                document
                    .querySelectorAll('.cell')
                    .forEach(el => {
                        el.classList.remove(
                            'card-selectable'
                        );
                    });

                highlightCardTargets();

                return true;
            }

            const p1 =
                board[
                    customSelectState.r
                ][
                    customSelectState.c
                ];

            const p2 =
                board[r][c];

            board[
                customSelectState.r
            ][
                customSelectState.c
            ] = p2;

            board[r][c] = p1;

            customSelectState = null;

            consumeActiveCard();

            renderBoard();

            playSound('slide');

            recalculateBoardPieces();

            if (checkWinCondition()) {
                isCpuThinking = false;
                return true;
            }

            isProcessingChain = true;
            checkMatchAndProcessChain();

            return true;
        }


        // ----------------------------------------------------
        // 未対応カード
        // ----------------------------------------------------

        console.warn(
            'handleCellClickForCard: 未対応カード',
            activeCard.id
        );

        cancelCardActive();

        if (
            isCpuCardAction &&
            currentPlayer === 2 &&
            !isGameOver
        ) {
            isCpuThinking = false;
            endTurn();
        }

        return false;

    } catch (error) {

        console.error(
            'カード効果処理エラー:',
            error
        );

        cancelCardActive();

        isProcessingChain = false;

        if (
            isCpuCardAction &&
            currentPlayer === 2 &&
            !isGameOver
        ) {
            isCpuThinking = false;
            endTurn();
        }

        return false;
    }
}


// ============================================================
// n_shuffle
// ============================================================

function executeShuffleCard() {

    let pieces = [];

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            pieces.push(board[r][c]);
        }
    }

    let valid = false;

    while (!valid) {

        pieces.sort(
            () => Math.random() - 0.5
        );

        let idx = 0;

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                board[r][c] =
                    pieces[idx++];
            }
        }

        if (!checkInitialMatch()) {
            valid = true;
        }
    }

    consumeActiveCard();

    renderBoard();

    playSound('start');

    recalculateBoardPieces();

    if (checkWinCondition()) {
        return;
    }

    endTurn();
}


// ============================================================
// n_growth
// ============================================================

function executeGrowthCard() {

    let empties = [];

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {

            if (board[r][c] === 0) {
                empties.push({ r, c });
            }
        }
    }

    for (let i = 0; i < 3; i++) {

        if (empties.length === 0) {
            break;
        }

        const target =
            empties.splice(
                Math.floor(
                    Math.random() *
                    empties.length
                ),
                1
            )[0];

        board[target.r][target.c] =
            currentPlayer;
    }

    consumeActiveCard();

    renderBoard();

    playSound('slide');

    recalculateBoardPieces();

    if (checkWinCondition()) {
        return;
    }

    isProcessingChain = true;
    checkMatchAndProcessChain();
}


// ============================================================
// n_trade
// ============================================================

function executeTradeCard() {

    const opp =
        currentPlayer === 1 ? 2 : 1;

    let targets = [];

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {

            if (board[r][c] === opp) {
                targets.push({ r, c });
            }
        }
    }

    for (let i = 0; i < 3; i++) {

        if (targets.length === 0) {
            break;
        }

        const t =
            targets.splice(
                Math.floor(
                    Math.random() *
                    targets.length
                ),
                1
            )[0];

        board[t.r][t.c] = 0;
    }

    consumeActiveCard();

    renderBoard();

    playSound('score');

    recalculateBoardPieces();

    if (checkWinCondition()) {
        return;
    }

    isProcessingChain = true;
    checkMatchAndProcessChain();
}


// ============================================================
// m_minus
// ============================================================

function executeDirectMinusCard(val) {

    const opp =
        currentPlayer === 1 ? 2 : 1;

    counts[opp] =
        Math.max(
            1,
            counts[opp] + val
        );

    consumeActiveCard();

    playSound('score');

    updateCounterUI();
    updateStatus();

    endTurn();
}


// ============================================================
// m_clear_row
// ============================================================

function executeClearMinRowCard() {

    let minPieces = 999;
    let minRowIdx = -1;

    for (let r = 0; r < SIZE; r++) {

        let cnt = 0;

        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] !== 0) {
                cnt++;
            }
        }

        if (
            cnt > 0 &&
            cnt < minPieces
        ) {
            minPieces = cnt;
            minRowIdx = r;
        }
    }

    if (minRowIdx !== -1) {

        for (let c = 0; c < SIZE; c++) {
            board[minRowIdx][c] = 0;
        }
    }

    consumeActiveCard();

    renderBoard();

    playSound('score');

    recalculateBoardPieces();

    if (checkWinCondition()) {
        return;
    }

    isProcessingChain = true;
    checkMatchAndProcessChain();
}


// ============================================================
// m_half
// ============================================================

function executeHalfCutCard() {

    let pieces = [];

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {

            if (board[r][c] !== 0) {
                pieces.push({ r, c });
            }
        }
    }

    for (let i = 0; i < 8; i++) {

        if (pieces.length === 0) {
            break;
        }

        const t =
            pieces.splice(
                Math.floor(
                    Math.random() *
                    pieces.length
                ),
                1
            )[0];

        board[t.r][t.c] = 0;
    }

    consumeActiveCard();

    renderBoard();

    playSound('score');

    recalculateBoardPieces();

    if (checkWinCondition()) {
        return;
    }

    isProcessingChain = true;
    checkMatchAndProcessChain();
}


// ============================================================
// m_enemy_down
// ============================================================

function executeEnemyDownCard(count) {

    const opp =
        currentPlayer === 1 ? 2 : 1;

    let targets = [];

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {

            if (board[r][c] === opp) {
                targets.push({ r, c });
            }
        }
    }

    for (let i = 0; i < count; i++) {

        if (targets.length === 0) {
            break;
        }

        const t =
            targets.splice(
                Math.floor(
                    Math.random() *
                    targets.length
                ),
                1
            )[0];

        board[t.r][t.c] = 0;
    }

    consumeActiveCard();

    renderBoard();

    playSound('score');

    recalculateBoardPieces();

    if (checkWinCondition()) {
        return;
    }

    isProcessingChain = true;
    checkMatchAndProcessChain();
}


// ============================================================
// m_dice
// ============================================================

function executeMinDiceCard() {

    const diceRoll =
        Math.floor(
            Math.random() * 6
        ) + 1;

    executeEnemyDownCard(
        diceRoll
    );
}


// ============================================================
// m_compress
// ============================================================

function executeCompressCard() {

    for (let i = 0; i < 4; i++) {

        let edge = [];

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {

                if (
                    (
                        r === 0 ||
                        r === SIZE - 1 ||
                        c === 0 ||
                        c === SIZE - 1
                    ) &&
                    board[r][c] !== 0
                ) {
                    edge.push({ r, c });
                }
            }
        }

        if (edge.length === 0) {
            break;
        }

        const t =
            edge[
                Math.floor(
                    Math.random() *
                    edge.length
                )
            ];

        board[t.r][t.c] = 0;
    }

    consumeActiveCard();

    renderBoard();

    playSound('score');

    recalculateBoardPieces();

    if (checkWinCondition()) {
        return;
    }

    isProcessingChain = true;
    checkMatchAndProcessChain();
}


// ============================================================
// m_equal
// ============================================================

function executeEqualCard() {

    const opp =
        currentPlayer === 1 ? 2 : 1;

    if (
        counts[currentPlayer] >
        counts[opp]
    ) {

        executeMyPieceRemove(1);

    } else {

        consumeActiveCard();

        playSound('score');

        recalculateBoardPieces();

        if (checkWinCondition()) {
            return;
        }

        endTurn();
    }
}


// ============================================================
// r_seed
// ============================================================

function executeRingoSeedCard() {

    let empties = [];

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {

            if (board[r][c] === 0) {
                empties.push({ r, c });
            }
        }
    }

    for (let i = 0; i < 4; i++) {

        if (empties.length === 0) {
            break;
        }

        const t =
            empties.splice(
                Math.floor(
                    Math.random() *
                    empties.length
                ),
                1
            )[0];

        board[t.r][t.c] =
            currentPlayer;
    }

    consumeActiveCard();

    renderBoard();

    playSound('slide');

    recalculateBoardPieces();

    if (checkWinCondition()) {
        return;
    }

    isProcessingChain = true;
    checkMatchAndProcessChain();
}


// ============================================================
// r_peel
// ============================================================

function executeRingoPeelCard() {

    const opp =
        currentPlayer === 1 ? 2 : 1;

    for (let i = 0; i < 5; i++) {

        let edge = [];

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {

                if (
                    (
                        r === 0 ||
                        r === SIZE - 1 ||
                        c === 0 ||
                        c === SIZE - 1
                    ) &&
                    board[r][c] === opp
                ) {
                    edge.push({ r, c });
                }
            }
        }

        if (edge.length === 0) {
            break;
        }

        const t =
            edge[
                Math.floor(
                    Math.random() *
                    edge.length
                )
            ];

        board[t.r][t.c] = 0;
    }

    consumeActiveCard();

    renderBoard();

    playSound('score');

    recalculateBoardPieces();

    if (checkWinCondition()) {
        return;
    }

    isProcessingChain = true;
    checkMatchAndProcessChain();
}


// ============================================================
// r_roulette
// ============================================================

function executeRingoRouletteCard() {

    const diceRoll =
        Math.floor(
            Math.random() * 10
        ) + 1;

    let mine = [];

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {

            if (
                board[r][c] ===
                currentPlayer
            ) {
                mine.push({ r, c });
            }
        }
    }

    for (let i = 0; i < diceRoll; i++) {

        if (mine.length === 0) {
            break;
        }

        const t =
            mine.splice(
                Math.floor(
                    Math.random() *
                    mine.length
                ),
                1
            )[0];

        board[t.r][t.c] = 0;
    }

    consumeActiveCard();

    playSound('score');

    setTimeout(() => {

        renderBoard();

        recalculateBoardPieces();

        if (checkWinCondition()) {
            return;
        }

        isProcessingChain = true;
        checkMatchAndProcessChain();

    }, 600);
}


// ============================================================
// r_gold
// ============================================================

function executeGoldCard() {

    let empties = [];

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {

            if (board[r][c] === 0) {
                empties.push({ r, c });
            }
        }
    }

    for (let i = 0; i < 5; i++) {

        if (empties.length === 0) {
            break;
        }

        const t =
            empties.splice(
                Math.floor(
                    Math.random() *
                    empties.length
                ),
                1
            )[0];

        board[t.r][t.c] =
            currentPlayer;
    }

    counts[currentPlayer] =
        Math.max(
            1,
            counts[currentPlayer] - 5
        );

    updateCounterUI();

    consumeActiveCard();

    playSound('score');

    executeMyPieceRemove(2);
}


// ============================================================
// r_harvest
// ============================================================

function executeHarvestCard() {

    const opp =
        currentPlayer === 1 ? 2 : 1;

    const myPieceCount =
        board
            .flat()
            .filter(
                cell =>
                    cell === currentPlayer
            )
            .length;

    const reductionAmount =
        Math.min(
            10,
            myPieceCount
        );

    counts[opp] =
        Math.max(
            1,
            counts[opp] -
            reductionAmount
        );

    consumeActiveCard();

    playSound('score');

    updateCounterUI();

    updateStatus();

    endTurn();
}


// ============================================================
// 自分のコマを削除
// ============================================================

function executeMyPieceRemove(count) {

    let mine = [];

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {

            if (
                board[r][c] ===
                currentPlayer
            ) {
                mine.push({ r, c });
            }
        }
    }

    for (let i = 0; i < count; i++) {

        if (mine.length === 0) {
            break;
        }

        const t =
            mine.splice(
                Math.floor(
                    Math.random() *
                    mine.length
                ),
                1
            )[0];

        board[t.r][t.c] = 0;
    }

    renderBoard();

    recalculateBoardPieces();

    if (checkWinCondition()) {
        return;
    }

    isProcessingChain = true;
    checkMatchAndProcessChain();
}