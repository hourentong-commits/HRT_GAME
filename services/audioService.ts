

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlayingBgm: boolean = false;
  private bgmTimeout: any = null;

  // Engine loop nodes
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineMode: 'IDLE' | 'BOOST' | 'BRAKE' = 'IDLE';

  private getContext(): AudioContext {
    if (!this.ctx) {
      // Support standard and webkit prefix for broader compatibility
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  // Ensure context is running (must be called from user gesture)
  async init() {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  playButtonTap() {
    if (this.isMuted) return;
    try {
        const ctx = this.getContext();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
        
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
    } catch(e) {}
  }

  playMissileLaunch() {
    if (this.isMuted) return;
    try {
        const ctx = this.getContext();
        const t = ctx.currentTime;
        
        // White noise buffer for whoosh
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(200, t);
        noiseFilter.frequency.linearRampToValueAtTime(800, t + 0.2);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, t);
        noiseGain.gain.linearRampToValueAtTime(0, t + 0.5);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(t);

        // Tone for rocket
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);
        oscGain.gain.setValueAtTime(0.05, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);

    } catch(e) {}
  }

  playExplosion() {
      if (this.isMuted) return;
      try {
        const ctx = this.getContext();
        const t = ctx.currentTime;

        const bufferSize = ctx.sampleRate * 1.0;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1000, t);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 0.5);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(t);
      } catch(e) {}
  }

  playElectricShock() {
    if (this.isMuted) return;
    try {
        const ctx = this.getContext();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sawtooth for electric buzzing feel
        osc.type = 'sawtooth';
        // Random pitch variation to sound erratic
        const freq = 100 + Math.random() * 200;
        osc.frequency.setValueAtTime(freq, t);
        
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 500;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(t);
        osc.stop(t + 0.1);
    } catch(e) {}
  }

  setEngineSound(mode: 'IDLE' | 'BOOST' | 'BRAKE') {
      if (this.isMuted) {
          this.stopEngineSound();
          return;
      }
      
      if (mode === this.engineMode && this.engineOsc) return;
      this.engineMode = mode;

      const ctx = this.getContext();
      const t = ctx.currentTime;

      // Initialize if not exists
      if (!this.engineOsc) {
          this.engineOsc = ctx.createOscillator();
          this.engineGain = ctx.createGain();
          
          this.engineOsc.type = 'triangle';
          this.engineOsc.frequency.setValueAtTime(100, t);
          this.engineGain.gain.setValueAtTime(0, t);
          
          this.engineOsc.connect(this.engineGain);
          this.engineGain.connect(ctx.destination);
          this.engineOsc.start(t);
      }

      // Modulation based on mode
      if (this.engineGain && this.engineOsc) {
          if (mode === 'IDLE') {
              this.engineGain.gain.setTargetAtTime(0, t, 0.1); 
          } else if (mode === 'BOOST') {
              this.engineOsc.frequency.setTargetAtTime(220, t, 0.2); // Higher pitch
              this.engineGain.gain.setTargetAtTime(0.08, t, 0.1); // Audibility
          } else if (mode === 'BRAKE') {
              this.engineOsc.frequency.setTargetAtTime(60, t, 0.2); // Lower pitch
              this.engineGain.gain.setTargetAtTime(0.05, t, 0.1);
          }
      }
  }

  stopEngineSound() {
      if (this.engineGain && this.ctx) {
          this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      }
      this.engineMode = 'IDLE';
  }

  playCollect() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.setValueAtTime(659.25, t + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, t + 0.16); // G5
      
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    } catch (e) {}
  }

  playRareCollect() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Twinkle sound (High pitch arpeggio)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, t); // A5
      osc.frequency.setValueAtTime(1108, t + 0.1); // C#6
      osc.frequency.setValueAtTime(1318, t + 0.2); // E6
      osc.frequency.setValueAtTime(1760, t + 0.3); // A6
      
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    } catch(e) {}
  }

  playReaction() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Magical shimmer sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.linearRampToValueAtTime(880, t + 0.2);
      osc.frequency.linearRampToValueAtTime(1760, t + 0.4);
      
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.8);
    } catch(e) {}
  }

  playAdvancedReaction() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Power chord sound
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, t); // A3
      osc1.frequency.exponentialRampToValueAtTime(880, t + 0.5);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(330, t); // E4
      osc2.frequency.exponentialRampToValueAtTime(1320, t + 0.5);
      
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 1.2);
      osc2.stop(t + 1.2);
    } catch(e) {}
  }

  playHeartbeat() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Low thud
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch(e) {}
  }

  playBossAttack() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Aggressive slide down
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);
      
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    } catch(e) {}
  }

  playRankUp() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Epic low boom to high
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 1.0);
      
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.5);
    } catch(e) {}
  }

  playAchievement() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Happy major chord
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.setValueAtTime(659.25, t + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, t + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, t + 0.3); // C6
      
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.0);
    } catch(e) {}
  }

  playLevelComplete() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(523.25, t); 
      osc.frequency.setValueAtTime(659.25, t + 0.1); 
      osc.frequency.setValueAtTime(783.99, t + 0.2); 
      osc.frequency.setValueAtTime(1046.50, t + 0.3); 
      
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.5);
    } catch (e) {}
  }

  playGameOver() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.linearRampToValueAtTime(300, t + 0.3);
      osc.frequency.linearRampToValueAtTime(200, t + 0.6);
      osc.frequency.linearRampToValueAtTime(100, t + 0.9);
      
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.6);
      gain.gain.linearRampToValueAtTime(0.001, t + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.2);
    } catch (e) {}
  }

  startBgm() {
    if (this.isMuted || this.isPlayingBgm) return;
    this.isPlayingBgm = true;
    const ctx = this.getContext();

    const melody = [
      { f: 261.63, d: 0.2 }, { f: 0, d: 0.2 },
      { f: 329.63, d: 0.2 }, { f: 0, d: 0.2 },
      { f: 392.00, d: 0.2 }, { f: 0, d: 0.2 },
      { f: 440.00, d: 0.2 }, { f: 0, d: 0.2 },
      { f: 392.00, d: 0.4 }, { f: 0, d: 0.4 },
      { f: 329.63, d: 0.2 }, { f: 0, d: 0.2 },
      { f: 293.66, d: 0.2 }, { f: 0, d: 0.2 },
      { f: 261.63, d: 0.6 }, { f: 0, d: 0.6 },
    ];

    let noteIndex = 0;
    let nextNoteTime = ctx.currentTime;

    const playLoop = () => {
      if (!this.isPlayingBgm) return;

      while (nextNoteTime < ctx.currentTime + 0.5) {
        const note = melody[noteIndex % melody.length];
        
        if (note.f > 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.value = note.f;
          gain.gain.value = 0.02;
          gain.gain.linearRampToValueAtTime(0.02, nextNoteTime + note.d * 0.8);
          gain.gain.linearRampToValueAtTime(0.001, nextNoteTime + note.d);

          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(nextNoteTime);
          osc.stop(nextNoteTime + note.d);
        }

        nextNoteTime += note.d;
        noteIndex++;
      }
      this.bgmTimeout = setTimeout(playLoop, 200);
    };

    playLoop();
  }

  stopBgm() {
    this.isPlayingBgm = false;
    if (this.bgmTimeout) {
      clearTimeout(this.bgmTimeout);
      this.bgmTimeout = null;
    }
  }

  toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.isMuted) {
        this.stopBgm();
        this.stopEngineSound();
      }
      return this.isMuted;
  }
}

export const audioService = new AudioService();