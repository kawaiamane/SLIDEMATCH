/**
 * Board Logic, Grid Processing, Drag & Drop Mechanics
 */
const SIZE = 12;
let board = [];
let dragParams = { cellEl: null, cloneEl: null, startR: -1, startC: -1, offsetX: 0, offsetY: 0 };
let isDragSetup = false;
let boardPieces = { 1: 0, 2: 0 };

function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            if (board[r][c] === 1) cell.classList.add('p1');
            if (board[r][c] === 2) cell.classList.add('p2');
            boardEl.appendChild(cell);
        }
    }
    highlightCardTargets();
}

function checkInitialMatch() {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c <= SIZE - 5; c++) {
            const p = board[r][c];
            if (p !== 0 && board[r][c+1]===p && board[r][c+2]===p && board[r][c+3]===p && board[r][c+4]===p) return true;
        }
    }
    for (let c = 0; c < SIZE; c++) {
        for (let r = 0; r <= SIZE - 5; r++) {
            const p = board[r][c];
            if (p !== 0 && board[r+1][c]===p && board[r+2][c]===p && board[r+3][c]===p && board[r+4][c]===p) return true;
        }
    }
    for (let r = 0; r <= SIZE - 5; r++) {
        for (let c = 0; c <= SIZE - 5; c++) {
            const p = board[r][c];
            if (p !== 0 && board[r+1][c+1]===p && board[r+2][c+2]===p && board[r+3][c+3]===p && board[r+4][c+4]===p) return true;
        }
    }
    for (let r = 4; r < SIZE; r++) {
        for (let c = 0; c <= SIZE - 5; c++) {
            const p = board[r][c];
            if (p !== 0 && board[r-1][c+1]===p && board[r-2][c+2]===p && board[r-3][c+3]===p && board[r-4][c+4]===p) return true;
        }
    }
    return false;
}

function setupDragAndDrop() {
    if (isDragSetup) return;
    isDragSetup = true;

    const boardEl = document.getElementById('board');

    const getCoords = (e) => {
        const t = e.touches ? e.touches[0] : e;
        return { x: t.clientX, y: t.clientY };
    };

    const handleStart = (e) => {
        if (currentPlayer === 2 && gameMode === 'CPU') return;
        if (isCpuThinking || isProcessingChain || isGameOver) return;
        if (activeCard) {
            const cell = e.target.closest('.cell');
            if (cell) {
                handleCellClickForCard(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
            }
            return;
        }

        const cell = e.target.closest('.cell');
        if (!cell || board[parseInt(cell.dataset.row)][parseInt(cell.dataset.col)] !== currentPlayer) return;

        const r = parseInt(cell.dataset.row), c = parseInt(cell.dataset.col);
        if (!hasAdjacentEmpty(r, c)) return;

        e.preventDefault();
        const coords = getCoords(e);
        const rect = cell.getBoundingClientRect();

        dragParams.cellEl = cell;
        dragParams.startR = r;
        dragParams.startC = c;
        dragParams.offsetX = coords.x - rect.left;
        dragParams.offsetY = coords.y - rect.top;

        // js/board.js の handleStart 内

const clone = cell.cloneNode(true);
clone.classList.add('dragging');
// ポインターイベントの遮断を防ぎ、カーソル位置に正確に追従させる設定
clone.style.position = 'fixed';
clone.style.pointerEvents = 'none';
clone.style.zIndex = '1000';
clone.style.width = `${rect.width}px`;
clone.style.height = `${rect.height}px`;
document.body.appendChild(clone);
dragParams.cloneEl = clone;

        cell.style.opacity = '0.4';
        updateClonePosition(coords.x, coords.y);
        highlightValidTargets(r, c);
    };

    const handleMove = (e) => {
        if (!dragParams.cloneEl) return;
        e.preventDefault();
        const coords = getCoords(e);
        updateClonePosition(coords.x, coords.y);

        const target = document.elementFromPoint(coords.x, coords.y)?.closest('.cell');
        document.querySelectorAll('.cell.valid-target').forEach(el => el.classList.remove('hover'));
        if (target && target.classList.contains('valid-target')) {
            target.classList.add('hover');
        }
    };

    // js/board.js

    const handleEnd = (e) => {
        if (!dragParams.cloneEl) return;
        e.preventDefault();
        
        let endX = 0, endY = 0;
        if (e.changedTouches) {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
        } else {
            endX = e.clientX; endY = e.clientY;
        }

        const target = document.elementFromPoint(endX, endY)?.closest('.cell');
        if (target && target.classList.contains('valid-target')) {
            executeMove(dragParams.startR, dragParams.startC, parseInt(target.dataset.row), parseInt(target.dataset.col));
        } else {
            if (dragParams.cellEl) dragParams.cellEl.style.opacity = '1';
        }
        
        // 残留している拡大クローン（.dragging）をすべてDOMから削除[cite: 2]
        document.querySelectorAll('.dragging').forEach(el => el.remove());
        dragParams.cloneEl = null;
        dragParams.cellEl = null;
        clearHighlights();
    };

function cancelDrag() {
    if (dragParams.cloneEl) {
        dragParams.cloneEl.remove();
        dragParams.cloneEl = null;
    }
    // ドラッグキャンセル時にも全クローン要素を確実に削除[cite: 2]
    document.querySelectorAll('.dragging').forEach(el => el.remove());

    if (dragParams.cellEl) {
        dragParams.cellEl.style.opacity = '1';
        dragParams.cellEl = null;
    }
    clearHighlights();
}

    boardEl.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('mouseleave', cancelDrag);

    boardEl.addEventListener('touchstart', handleStart, { passive: false });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', cancelDrag);
}

function updateClonePosition(x, y) {
    dragParams.cloneEl.style.left = `${x - dragParams.offsetX}px`;
    dragParams.cloneEl.style.top = `${y - dragParams.offsetY}px`;
}

function cancelDrag() {
    if (dragParams.cloneEl) {
        dragParams.cloneEl.remove();
        dragParams.cloneEl = null;
    }
    if (dragParams.cellEl) {
        dragParams.cellEl.style.opacity = '1';
        dragParams.cellEl = null;
    }
    clearHighlights();
}

function hasAdjacentEmpty(r, c) {
    const dr = [-1, 1, 0, 0], dc = [0, 0, -1, 1];
    for (let i = 0; i < 4; i++) {
        const nr = r + dr[i], nc = c + dc[i];
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === 0) return true;
    }
    return false;
}

function highlightValidTargets(r, c) {
    const dr = [-1, 1, 0, 0], dc = [0, 0, -1, 1];
    for (let i = 0; i < 4; i++) {
        const nr = r + dr[i], nc = c + dc[i];
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === 0) {
            document.querySelector(`[data-row="${nr}"][data-col="${nc}"]`)?.classList.add('valid-target');
        }
    }
}

function clearHighlights() {
    document.querySelectorAll('.cell.valid-target').forEach(el => el.classList.remove('valid-target', 'hover'));
}

function recalculateBoardPieces() {
    boardPieces = { 1: 0, 2: 0 };
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === 1) boardPieces[1]++;
            if (board[r][c] === 2) boardPieces[2]++;
        }
    }
    
    const b1El = document.getElementById('b1');
    const b2El = document.getElementById('b2');
    if (b1El) b1El.innerText = boardPieces[1];
    if (b2El) b2El.innerText = boardPieces[2];
}

function isCellIsolated(r, c) {
    for(let dr=-1; dr<=1; dr++) {
        for(let dc=-1; dc<=1; dc++) {
            if(dr===0 && dc===0) continue;
            const nr=r+dr, nc=c+dc;
            if(nr>=0 && nr<SIZE && nc>=0 && nc<SIZE && board[nr][nc]!==0) return false;
        }
    }
    return true;
}
