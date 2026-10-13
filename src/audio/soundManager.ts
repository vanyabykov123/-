// Web Audio API Sound and Chiptune Synthesizer Engine
class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private musicInterval: number | null = null;
  private isMusicPlaying: boolean = false;
  private customAudio: HTMLAudioElement | null = null;
  public onLyricsUpdate: ((lyric: string, progress: number) => void) | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playJump() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Audio error ignored
    }
  }

  public playCoin() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Note 1: B5 (987.77 Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.09);

      // Note 2: E6 (1318.51 Hz)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.08);
      gain2.gain.setValueAtTime(0.25, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.35);
    } catch {
      // Audio error ignored
    }
  }

  public playStomp() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio error ignored
    }
  }

  public playHurt() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Audio error ignored
    }
  }

  public playPowerUp() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [330, 392, 659, 523, 587, 784];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.12, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.07);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + (idx + 1) * 0.07);
      });
    } catch {
      // Audio error ignored
    }
  }

  public playBlockBump() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio error ignored
    }
  }

  public playScratch() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Noise buffer for scratch effect
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800 + Math.random() * 400, now);
      filter.Q.setValueAtTime(2.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.045);
    } catch {
      // Audio error ignored
    }
  }

  // --- SEKTOR GAZA "МНЕ СЕГОДНЯ 30 ЛЕТ" SYNTHESIZER ---
  public playSectorGaza30(onEnd?: () => void) {
    this.stopMusic();
    this.isMusicPlaying = true;

    // Check if custom audio track is set
    if (this.customAudio) {
      this.customAudio.currentTime = 0;
      this.customAudio.play().catch(() => {});
      return;
    }

    try {
      this.initContext();
      if (!this.ctx) return;

      // Note frequency map
      const noteFreqs: Record<string, number> = {
        'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
        'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99,
        'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
        'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99,
        'A5': 880.00
      };

      // Melody sequence of "Мне сегодня 30 лет" (Сектор Газа)
      // Verse:
      // "В этот день родили меня на свет"
      // "В этот день с иголочки я одет"
      // "В этот день поздравит меня родня"
      // "В этот день родиться мог кто угодно, но не я..."
      // Chorus:
      // "Солнце осветило в горизонте..."
      // "Потому что мне сегодня 30 лет! Мне сегодня 30 лет!"
      const songData: Array<{ note: string; dur: number; bass: string; lyric?: string }> = [
        // Intro riff
        { note: 'D4', dur: 0.25, bass: 'D3', lyric: '🎸 Вступление: Сектор Газа - 30 лет!' },
        { note: 'F4', dur: 0.25, bass: 'D3' },
        { note: 'A4', dur: 0.25, bass: 'D3' },
        { note: 'D5', dur: 0.25, bass: 'D3' },
        { note: 'C5', dur: 0.25, bass: 'C3' },
        { note: 'A4', dur: 0.25, bass: 'C3' },
        { note: 'G4', dur: 0.25, bass: 'G3' },
        { note: 'A4', dur: 0.5, bass: 'A3' },

        // Verse 1: "В этот день родили меня на свет"
        { note: 'D4', dur: 0.25, bass: 'D3', lyric: 'В этот день родили меня на свет!' },
        { note: 'D4', dur: 0.25, bass: 'D3' },
        { note: 'D4', dur: 0.25, bass: 'D3' },
        { note: 'F4', dur: 0.25, bass: 'D3' },
        { note: 'F4', dur: 0.25, bass: 'F3' },
        { note: 'E4', dur: 0.25, bass: 'F3' },
        { note: 'D4', dur: 0.25, bass: 'D3' },
        { note: 'C#4', dur: 0.25, bass: 'A3' },
        { note: 'D4', dur: 0.5, bass: 'D3' },

        // Verse 1 line 2: "В этот день с иголочки я одет"
        { note: 'D4', dur: 0.25, bass: 'D3', lyric: 'В этот день с иголочки я одет!' },
        { note: 'D4', dur: 0.25, bass: 'D3' },
        { note: 'D4', dur: 0.25, bass: 'D3' },
        { note: 'F4', dur: 0.25, bass: 'D3' },
        { note: 'F4', dur: 0.25, bass: 'F3' },
        { note: 'E4', dur: 0.25, bass: 'F3' },
        { note: 'D4', dur: 0.25, bass: 'D3' },
        { note: 'C#4', dur: 0.25, bass: 'A3' },
        { note: 'D4', dur: 0.5, bass: 'D3' },

        // Verse 1 line 3: "В этот день поздравит меня родня"
        { note: 'F4', dur: 0.25, bass: 'F3', lyric: 'В этот день поздравит меня родня!' },
        { note: 'F4', dur: 0.25, bass: 'F3' },
        { note: 'F4', dur: 0.25, bass: 'F3' },
        { note: 'A4', dur: 0.25, bass: 'F3' },
        { note: 'A4', dur: 0.25, bass: 'A3' },
        { note: 'G4', dur: 0.25, bass: 'A3' },
        { note: 'F4', dur: 0.25, bass: 'F3' },
        { note: 'E4', dur: 0.25, bass: 'C3' },
        { note: 'F4', dur: 0.5, bass: 'F3' },

        // Verse 1 line 4: "В этот день скажу юности: «Привет!»"
        { note: 'F4', dur: 0.25, bass: 'F3', lyric: 'И подруги выпьют за меня!' },
        { note: 'A4', dur: 0.25, bass: 'A3' },
        { note: 'G4', dur: 0.25, bass: 'G3' },
        { note: 'F4', dur: 0.25, bass: 'F3' },
        { note: 'E4', dur: 0.25, bass: 'E3' },
        { note: 'D4', dur: 0.25, bass: 'D3' },
        { note: 'C#4', dur: 0.25, bass: 'A3' },
        { note: 'D4', dur: 0.6, bass: 'D3' },

        // CHORUS 1: "Солнце осветило в горизонте"
        { note: 'G4', dur: 0.25, bass: 'G3', lyric: '🔥 Солнце осветило в горизонте!' },
        { note: 'G4', dur: 0.25, bass: 'G3' },
        { note: 'G4', dur: 0.25, bass: 'G3' },
        { note: 'A4', dur: 0.25, bass: 'G3' },
        { note: 'Bb4', dur: 0.35, bass: 'G3' },
        { note: 'A4', dur: 0.25, bass: 'F3' },
        { note: 'G4', dur: 0.25, bass: 'F3' },
        { note: 'F4', dur: 0.5, bass: 'F3' },

        // CHORUS 2: "Утро оборвало мой сладкий сон"
        { note: 'F4', dur: 0.25, bass: 'F3', lyric: '✨ Утро оборвало мой сладкий сон!' },
        { note: 'F4', dur: 0.25, bass: 'F3' },
        { note: 'F4', dur: 0.25, bass: 'F3' },
        { note: 'A4', dur: 0.25, bass: 'F3' },
        { note: 'G4', dur: 0.35, bass: 'C3' },
        { note: 'F4', dur: 0.25, bass: 'C3' },
        { note: 'E4', dur: 0.5, bass: 'A3' },

        // CHORUS CLIMAX 1: "ПОТОМУ ЧТО МНЕ СЕГОДНЯ ТРИДЦАТЬ ЛЕТ!"
        { note: 'A4', dur: 0.25, bass: 'D3', lyric: '🎉 ПОТОМУ ЧТО МНЕ СЕГОДНЯ ТРИДЦАТЬ ЛЕТ! 🎉' },
        { note: 'Bb4', dur: 0.25, bass: 'D3' },
        { note: 'A4', dur: 0.25, bass: 'D3' },
        { note: 'G4', dur: 0.25, bass: 'G3' },
        { note: 'F4', dur: 0.25, bass: 'F3' },
        { note: 'E4', dur: 0.25, bass: 'A3' },
        { note: 'D4', dur: 0.7, bass: 'D3' },

        // CHORUS CLIMAX 2: "МНЕ СЕГОДНЯ ТРИДЦАТЬ ЛЕТ!"
        { note: 'F4', dur: 0.25, bass: 'D3', lyric: '🎂 МНЕ СЕГОДНЯ ТРИДЦАТЬ ЛЕТ! 🎂' },
        { note: 'G4', dur: 0.25, bass: 'G3' },
        { note: 'A4', dur: 0.35, bass: 'A3' },
        { note: 'F4', dur: 0.25, bass: 'F3' },
        { note: 'E4', dur: 0.25, bass: 'A3' },
        { note: 'D4', dur: 0.8, bass: 'D3' },

        // Solo / Celebration Outro
        { note: 'D5', dur: 0.25, bass: 'D3', lyric: '🥂 С ДНЁМ РОЖДЕНИЯ, ПОДРУГА! ТАЙНЫЙ СУНДУК ЖДЁТ ТЕБЯ!' },
        { note: 'C5', dur: 0.25, bass: 'C3' },
        { note: 'Bb4', dur: 0.25, bass: 'G3' },
        { note: 'A4', dur: 0.25, bass: 'D3' },
        { note: 'G4', dur: 0.25, bass: 'G3' },
        { note: 'F4', dur: 0.25, bass: 'F3' },
        { note: 'E4', dur: 0.25, bass: 'A3' },
        { note: 'D4', dur: 1.0, bass: 'D3' }
      ];

      let noteIdx = 0;
      const playStep = () => {
        if (!this.isMusicPlaying || !this.ctx) return;
        const current = songData[noteIdx];
        if (!current) {
          // Loop song
          noteIdx = 0;
          setTimeout(playStep, 500);
          if (onEnd) onEnd();
          return;
        }

        if (current.lyric && this.onLyricsUpdate) {
          const progress = Math.round((noteIdx / songData.length) * 100);
          this.onLyricsUpdate(current.lyric, progress);
        }

        if (!this.isMuted) {
          const now = this.ctx.currentTime;
          const duration = current.dur * 1.1;

          // Lead synth (sawtooth + square blend)
          const leadFreq = noteFreqs[current.note] || 440;
          const oscLead = this.ctx.createOscillator();
          const gainLead = this.ctx.createGain();
          oscLead.type = 'sawtooth';
          oscLead.frequency.setValueAtTime(leadFreq, now);

          gainLead.gain.setValueAtTime(0.12, now);
          gainLead.gain.exponentialRampToValueAtTime(0.01, now + duration);
          oscLead.connect(gainLead);
          gainLead.connect(this.ctx.destination);
          oscLead.start(now);
          oscLead.stop(now + duration);

          // Bass synth
          const bassFreq = noteFreqs[current.bass] || 110;
          const oscBass = this.ctx.createOscillator();
          const gainBass = this.ctx.createGain();
          oscBass.type = 'triangle';
          oscBass.frequency.setValueAtTime(bassFreq, now);

          gainBass.gain.setValueAtTime(0.18, now);
          gainBass.gain.exponentialRampToValueAtTime(0.02, now + duration);
          oscBass.connect(gainBass);
          gainBass.connect(this.ctx.destination);
          oscBass.start(now);
          oscBass.stop(now + duration);

          // Chiptune snare/kick on beats
          if (noteIdx % 2 === 0) {
            // Kick drum
            const kick = this.ctx.createOscillator();
            const kickGain = this.ctx.createGain();
            kick.type = 'sine';
            kick.frequency.setValueAtTime(130, now);
            kick.frequency.exponentialRampToValueAtTime(30, now + 0.1);
            kickGain.gain.setValueAtTime(0.2, now);
            kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            kick.connect(kickGain);
            kickGain.connect(this.ctx.destination);
            kick.start(now);
            kick.stop(now + 0.11);
          }
        }

        noteIdx++;
        const nextDelay = current.dur * 1000 * 0.9;
        this.musicInterval = window.setTimeout(playStep, nextDelay);
      };

      playStep();
    } catch {
      // Audio error ignored
    }
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearTimeout(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
  }

  public setCustomAudio(url: string) {
    this.customAudio = new Audio(url);
    this.customAudio.loop = true;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.customAudio) {
      this.customAudio.muted = this.isMuted;
    }
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();
