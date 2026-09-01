/**
 * Web Audio API Manager
 */
let seType = 'modern';
let volumePercent = 50; 
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (volumePercent == 0) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const baseVolume = volumePercent / 100;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'slide') {
        osc.type = seType === 'retro' ? 'square' : (seType === 'scifi' ? 'sine' : 'triangle');
        osc.frequency.setValueAtTime(320, now);
        gain.gain.setValueAtTime(0.08 * baseVolume, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.09);
        osc.start(); osc.stop(now + 0.1);
    } else if (type === 'score') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.3, now);
        gain.gain.setValueAtTime(0.15 * baseVolume, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.22);
        osc.start(); osc.stop(now + 0.3);
    } else if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        gain.gain.setValueAtTime(0.1 * baseVolume, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(); osc.stop(now + 0.2);
    }
}

function changeSeType(type) { seType = type; }
function changeVolume(val) { volumePercent = parseInt(val); }
