/**
 * Voice & Audio Alert Service for Boki Admin Dashboard.
 * Utilizes Web Audio API for an alert chime and Web Speech API for real-time Vietnamese text-to-speech.
 */

const STORAGE_KEY_MUTED = 'boki_voice_alert_muted';

class VoiceAlertService {
  private audioCtx: AudioContext | null = null;
  private isBrowser: boolean = typeof window !== 'undefined';

  private getAudioContext(): AudioContext | null {
    if (!this.isBrowser) return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Check if sound/voice alerts are muted in local storage.
   */
  public isMuted(): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem(STORAGE_KEY_MUTED) === 'true';
  }

  /**
   * Set mute preference.
   */
  public setMuted(muted: boolean): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEY_MUTED, String(muted));
  }

  /**
   * Plays a crisp, dual-tone alert chime (880Hz -> 587Hz) using Web Audio API.
   */
  public playChime(): Promise<void> {
    if (this.isMuted()) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) {
          resolve();
          return;
        }

        const now = ctx.currentTime;

        // First tone (high chime: 880Hz - A5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        // Second tone (alert tone: 587.33Hz - D5)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(587.33, now + 0.15);
        gain2.gain.setValueAtTime(0.35, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.6);

        setTimeout(resolve, 650);
      } catch (e) {
        console.warn('Web Audio API chime failed:', e);
        resolve();
      }
    });
  }

  /**
   * Speaks the given Vietnamese text aloud using Web Speech API (speechSynthesis).
   */
  public speak(text: string): Promise<void> {
    if (this.isMuted() || !this.isBrowser || !('speechSynthesis' in window)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      try {
        // Cancel any pending speech to avoid overlapping
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 1.05; // Slightly brisk for urgency
        utterance.pitch = 1.0;

        // Try to pick a Vietnamese voice if available
        const voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VI'));
        if (viVoice) {
          utterance.voice = viVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
        resolve();
      }
    });
  }

  /**
   * Plays the full fraud alert sequence: Chime sound -> Vietnamese Voice announcement.
   */
  public async playFraudVoiceAlert(message: string): Promise<void> {
    if (this.isMuted()) return;
    await this.playChime();
    await this.speak(message);
  }

  /**
   * Helper to preview / test the voice alert from the UI.
   */
  public async testVoiceAlert(): Promise<void> {
    await this.playChime();
    await this.speak('Cảnh báo thử nghiệm: Phát hiện đơn hàng khả nghi có rủi ro cao từ tài khoản vãng lai! Hệ thống Autopilot đã tạm giữ đơn để kiểm tra.');
  }
}

export const voiceAlertService = new VoiceAlertService();
