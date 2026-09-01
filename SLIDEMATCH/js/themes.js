/**
 * Visual Color Themes Manager
 */
const themes = {
    modern: { bg: '#fcfbf7', text: '#1a1a1a', board: '#1a1a1a', empty: '#f3f0e8', hover: '#e8e3d5', p1: '#4a7bb0', p2: '#ce6a6a' },
    forest: { bg: '#faf9f5', text: '#263428', board: '#263428', empty: '#e7eae4', hover: '#d6ded4', p1: '#61b1b8', p2: '#dca060' },
    sakura: { bg: '#fdfbfa', text: '#3a2d2d', board: '#3a2d2d', empty: '#f3ecea', hover: '#e8dbd7', p1: '#e295b3', p2: '#80bd94' },
    latte: { bg: '#faf8f5', text: '#332921', board: '#332921', empty: '#eee4dc', hover: '#dfcebf', p1: '#8d79b9', p2: '#be6b45' },
    dark: { bg: '#181a1b', text: '#e8e6e3', board: '#e8e6e3', empty: '#242729', hover: '#33373b', p1: '#9b7cd6', p2: '#db6fa1' },
    midnight: { bg: '#11141a', text: '#8e9aa8', board: '#8e9aa8', empty: '#1b2028', hover: '#262d3a', p1: '#4d8ee4', p2: '#6d7b8d' }
};

function changeColorTheme(themeKey) {
    const t = themes[themeKey];
    if (!t) return;
    const r = document.documentElement;
    r.style.setProperty('--bg-color', t.bg);
    r.style.setProperty('--text-color', t.text);
    r.style.setProperty('--board-color', t.board);
    r.style.setProperty('--empty-color', t.empty);
    r.style.setProperty('--target-hover', t.hover);
    r.style.setProperty('--btn-bg', t.bg);
    r.style.setProperty('--btn-text', t.text);
    r.style.setProperty('--p1-color', t.p1);
    r.style.setProperty('--p2-color', t.p2);
}
