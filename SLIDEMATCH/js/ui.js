/**
 * Screen Transitions & Modal UI Controller
 */
function runFullSplashScreen() {
    const splash = document.getElementById('splashScreen');
    const home = document.getElementById('homeScreen');
    const logo = document.getElementById('logoContainer');
    const buttons = document.getElementById('menuButtons');
    const header = document.getElementById('homeHeader');
    splash.classList.remove('hide-instantly', 'open-shutter', 'scanning');
    home.classList.remove('active');
    logo.classList.remove('show', 'show-instantly');
    buttons.classList.remove('show', 'show-instantly');
    header.classList.remove('show', 'show-instantly');
    setTimeout(() => { splash.classList.add('scanning'); }, 100);
    setTimeout(() => { splash.classList.add('open-shutter'); home.classList.add('active'); }, 1800);
    setTimeout(() => { logo.classList.add('show'); buttons.classList.add('show'); header.classList.add('show'); }, 2200);
    setTimeout(() => { splash.classList.add('hide-instantly'); }, 3200);
}

function jumpToHomeDirectly() {
    document.getElementById('splashScreen').classList.add('hide-instantly');
    document.getElementById('homeScreen').classList.add('active');
    document.getElementById('logoContainer').classList.add('show-instantly');
    document.getElementById('menuButtons').classList.add('show-instantly');
    document.getElementById('homeHeader').classList.add('show-instantly');
}

function toggleModal(show) {
    document.getElementById('settingsModal').classList.toggle('active', show);
}

function toggleModModal(show) {
    document.getElementById('modSettingsModal').classList.toggle('active', show);
}

function toggleModPack(packKey) {
    modSelection[packKey] = !modSelection[packKey];
    const btn = document.getElementById(`mod_${packKey}_btn`);
    const packNames = { newcard: 'NEW CARD', min: 'MIN PACK', ringo: 'RiNgO PACK', tantal: 'TANTAL NEW Geams' };
    if (modSelection[packKey]) {
        btn.classList.add('enabled');
        btn.innerText = `${packNames[packKey]}: ON`;
    } else {
        btn.classList.remove('enabled');
        btn.innerText = `${packNames[packKey]}: OFF`;
    }
    playSound('slide');
}

function updateCounterUI() {
    document.getElementById('s1').innerText = counts[1];
    document.getElementById('s2').innerText = counts[2];
}

function updateStatus() {
    const status = document.getElementById('status');
    const p2Name = gameMode === 'CPU' ? 'CPU' : 'P2';
    if (activeCard) {
        status.innerText = `CARD EFFECT ACTIVE: PLACE / SELECT TARGET`;
    } else {
        status.innerText = (currentPlayer === 1) ? "YOUR TURN (P1) — DRAG PIECE" : `${p2Name} TURN — THINKING/MOVING`;
    }
}
