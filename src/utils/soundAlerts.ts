/**
 * Web Audio API Sound Generator for HSE Field Alerts
 * Generates clear, high-contrast industrial audio warning signals without external audio files.
 */

// Key for persisting user's audio preference
const SOUND_ENABLED_KEY = 'hse_sound_alerts_enabled_v1';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn('Web Audio API not supported or blocked:', e);
    return null;
  }
}

/**
 * Check if sound alerts are enabled
 */
export function isSoundAlertsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(SOUND_ENABLED_KEY);
  return saved !== null ? saved === 'true' : true;
}

/**
 * Set sound alerts state
 */
export function setSoundAlertsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
}

/**
 * Play an urgent dual-pulse alarm tone when recording an incident or near-miss
 */
export function playIncidentAlertSound(): void {
  if (!isSoundAlertsEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Beep 1 (High attention pulse)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(880, now); // A5 note
  osc1.frequency.exponentialRampToValueAtTime(587.33, now + 0.18); // D5 note
  gain1.gain.setValueAtTime(0.3, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.2);

  // Beep 2 (Second urgent pulse after 0.15s)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(987.77, now + 0.22); // B5 note
  osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.42); // E5 note
  gain2.gain.setValueAtTime(0.35, now + 0.22);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.42);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.22);
  osc2.stop(now + 0.45);
}

/**
 * Play a cautionary chime alert when detecting a work permit expiring soon (< 12 hours)
 */
export function playPermitExpiryAlertSound(): void {
  if (!isSoundAlertsEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Warm chime note 1 (659.25 Hz - E5)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(659.25, now);
  gain1.gain.setValueAtTime(0.25, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.38);

  // Warm chime note 2 (880 Hz - A5)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(880, now + 0.15);
  gain2.gain.setValueAtTime(0.3, now + 0.15);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.15);
  osc2.stop(now + 0.6);
}

/**
 * Test sound function to provide immediate user feedback
 */
export function playTestBeepSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, now); // C5
  osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}
