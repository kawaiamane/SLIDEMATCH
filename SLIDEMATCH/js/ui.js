
/**
 * Screen Transitions & Modal UI Controller
 */

// ============================================================
// EX pack設定の保存
// ============================================================

const EXPACK_STORAGE_KEY = 'slide_match_expack_settings';

function saveExpackSettings() {
    try {
        localStorage.setItem(
            EXPACK_STORAGE_KEY,
            JSON.stringify({
                newcard: !!modSelection.newcard,
                min: !!modSelection.min,
                ringo: !!modSelection.ringo,
                tantal: !!modSelection.tantal
            })
        );
    } catch (error) {
        console.warn('EX pack設定の保存に失敗:', error);
    }
}

function loadExpackSettings() {
    try {
        const saved =
            localStorage.getItem(EXPACK_STORAGE_KEY);

        if (!saved) return;

        const settings = JSON.parse(saved);

        if (!settings || typeof settings !== 'object') {
            return;
        }

        modSelection.newcard = !!settings.newcard;
        modSelection.min = !!settings.min;
        modSelection.ringo = !!settings.ringo;
        modSelection.tantal = !!settings.tantal;

    } catch (error) {
        console.warn('EX pack設定の読み込みに失敗:', error);
    }
}


// ============================================================
// Splash Screen
// ============================================================

function runFullSplashScreen() {
    const splash =
        document.getElementById('splashScreen');

    const home =
        document.getElementById('homeScreen');

    const logo =
        document.getElementById('logoContainer');

    const buttons =
        document.getElementById('menuButtons');

    const header =
        document.getElementById('homeHeader');

    splash.classList.remove(
        'hide-instantly',
        'open-shutter',
        'scanning'
    );

    home.classList.remove('active');

    logo.classList.remove(
        'show',
        'show-instantly'
    );

    buttons.classList.remove(
        'show',
        'show-instantly'
    );

    header.classList.remove(
        'show',
        'show-instantly'
    );

    setTimeout(() => {
        splash.classList.add('scanning');
    }, 100);

    setTimeout(() => {
        splash.classList.add('open-shutter');
        home.classList.add('active');
    }, 1800);

    setTimeout(() => {
        logo.classList.add('show');
        buttons.classList.add('show');
        header.classList.add('show');

        updateModPackButtons();
    }, 2200);

    setTimeout(() => {
        splash.classList.add('hide-instantly');
    }, 3200);
}


function jumpToHomeDirectly() {

    document
        .getElementById('splashScreen')
        .classList.add('hide-instantly');

    document
        .getElementById('homeScreen')
        .classList.add('active');

    document
        .getElementById('logoContainer')
        .classList.add('show-instantly');

    document
        .getElementById('menuButtons')
        .classList.add('show-instantly');

    document
        .getElementById('homeHeader')
        .classList.add('show-instantly');

    updateModPackButtons();
}


// ============================================================
// 通常設定
// ============================================================

function toggleModal(show) {

    document
        .getElementById('settingsModal')
        .classList.toggle(
            'active',
            show
        );
}


// ============================================================
// EX pack設定
// ============================================================

function toggleModModal(show) {

    document
        .getElementById('modSettingsModal')
        .classList.toggle(
            'active',
            show
        );

    if (show) {
        updateModPackButtons();
    }
}


function updateModPackButtons() {

    const packNames = {
        newcard: 'NEW CARD',
        min: 'MIN PACK',
        ringo: 'RiNgO PACK',
        tantal: 'TANTAL NEW Geams'
    };

    Object.keys(packNames).forEach(packKey => {

        const btn =
            document.getElementById(
                `mod_${packKey}_btn`
            );

        if (!btn) return;

        if (modSelection[packKey]) {

            btn.classList.add('enabled');

            btn.innerText =
                `${packNames[packKey]}: ON`;

        } else {

            btn.classList.remove('enabled');

            btn.innerText =
                `${packNames[packKey]}: OFF`;
        }
    });
}


function toggleModPack(packKey) {

    if (
        !Object.prototype.hasOwnProperty.call(
            modSelection,
            packKey
        )
    ) {
        return;
    }

    modSelection[packKey] =
        !modSelection[packKey];

    // 変更した瞬間に保存
    saveExpackSettings();

    updateModPackButtons();

    playSound('slide');
}


// ============================================================
// スコア表示
// ============================================================

function updateCounterUI() {

    document.getElementById('s1').innerText =
        counts[1];

    document.getElementById('s2').innerText =
        counts[2];
}


// ============================================================
// ステータス表示
// ============================================================

function updateStatus() {

    const status =
        document.getElementById('status');

    const p2Name =
        gameMode === 'CPU'
            ? 'CPU'
            : 'P2';

    if (activeCard) {

        status.innerText =
            'CARD EFFECT ACTIVE: PLACE / SELECT TARGET';

    } else {

        status.innerText =
            currentPlayer === 1
                ? 'YOUR TURN (P1) — DRAG PIECE'
                : `${p2Name} TURN — THINKING/MOVING`;
    }
}


// ============================================================
// 起動時に保存済みEX pack設定を復元
// ============================================================

loadExpackSettings();

