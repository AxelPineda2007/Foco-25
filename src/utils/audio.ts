// Web Audio API sound generator - no external MP3 dependencies required

export type AmbientSoundType = 'none' | 'lluvia' | 'ruidoblanco' | 'cafe' | 'binaural';

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentAmbientType: AmbientSoundType = 'none';
  private ambientVolume: number = 0.40;
  private cafeClinkInterval: NodeJS.Timeout | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopAmbient();
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public getCurrentAmbient(): AmbientSoundType {
    return this.currentAmbientType;
  }

  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  public setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.ambientVolume * 0.45, this.ctx.currentTime);
    }
  }

  // Pleasant bell when starting focus session
  public playStart() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, now);
    osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.8);
    osc2.stop(now + 0.8);
  }

  // Celebratory 4-note chime when 25 minutes completed
  public playCompleted() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, index) => {
      const noteTime = now + index * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 1.4);
    });
  }

  // Break finished chime
  public playBreakFinished() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.0);
  }

  // Abandon / Alert subtle warning tone
  public playAbandonAlert() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.25);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Phone trap alert / tab escaping warning
  public playTabAlert() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(440.00, now + 0.12); // A4

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Ambient sound synthesis: Lluvia, Ruido Blanco, Café de Estudio, Ondas Binaurales
  public startAmbient(type: AmbientSoundType) {
    this.stopAmbient();
    if (type === 'none' || !this.soundEnabled) {
      this.currentAmbientType = 'none';
      return;
    }

    const ctx = this.getContext();
    if (!ctx) return;

    this.currentAmbientType = type;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(this.ambientVolume * 0.45, ctx.currentTime + 0.8);
    gain.connect(ctx.destination);
    this.ambientGain = gain;

    if (type === 'lluvia' || type === 'ruidoblanco' || type === 'cafe') {
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;

        if (type === 'ruidoblanco') {
          // Smooth, balanced white noise (not harsh)
          data[i] = white * 0.6;
        } else if (type === 'lluvia') {
          // Pink noise algorithm for authentic rainfall + random raindrop splash impulses
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          b6 = white * 0.115926;
          const droplet = Math.random() > 0.998 ? (Math.random() - 0.5) * 0.9 : 0;
          data[i] = (pink * 0.18 + droplet) * 2.2;
        } else if (type === 'cafe') {
          // Warm brown noise murmur for coffee shop background rumble
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 3.8;
        }
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const filter = ctx.createBiquadFilter();
      if (type === 'lluvia') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
      } else if (type === 'ruidoblanco') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
      } else if (type === 'cafe') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);
      }

      noiseNode.connect(filter);
      filter.connect(gain);
      noiseNode.start(ctx.currentTime);
      this.ambientSource = noiseNode;

      // For Café: generate soft coffee cup / saucer clinks at random cozy intervals
      if (type === 'cafe') {
        const playCupClink = () => {
          if (this.currentAmbientType !== 'cafe' || !this.ctx || !this.ambientGain) return;
          const now = this.ctx.currentTime;
          const clinkOsc = this.ctx.createOscillator();
          const clinkGain = this.ctx.createGain();
          
          // Frequencies characteristic of porcelain/ceramic cups
          const clinkFreqs = [2400, 2800, 3200, 3600];
          const chosenFreq = clinkFreqs[Math.floor(Math.random() * clinkFreqs.length)];
          clinkOsc.type = 'sine';
          clinkOsc.frequency.setValueAtTime(chosenFreq, now);

          clinkGain.gain.setValueAtTime(0, now);
          clinkGain.gain.linearRampToValueAtTime(this.ambientVolume * 0.08, now + 0.005);
          clinkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

          clinkOsc.connect(clinkGain);
          clinkGain.connect(gain);

          clinkOsc.start(now);
          clinkOsc.stop(now + 0.18);
        };

        const scheduleNextClink = () => {
          if (this.currentAmbientType !== 'cafe') return;
          const delay = Math.random() * 4000 + 2500; // clink every 2.5 to 6.5s
          this.cafeClinkInterval = setTimeout(() => {
            playCupClink();
            scheduleNextClink();
          }, delay);
        };

        scheduleNextClink();
      }

    } else if (type === 'binaural') {
      // 40Hz Gamma Focus frequency (200Hz in left ear, 240Hz in right ear)
      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();
      const merger = ctx.createChannelMerger(2);

      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(200, ctx.currentTime);

      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(240, ctx.currentTime);

      oscLeft.connect(merger, 0, 0);
      oscRight.connect(merger, 0, 1);
      merger.connect(gain);

      oscLeft.start(ctx.currentTime);
      oscRight.start(ctx.currentTime);
      this.ambientSource = oscLeft;
    }
  }

  public stopAmbient() {
    if (this.cafeClinkInterval) {
      clearTimeout(this.cafeClinkInterval);
      this.cafeClinkInterval = null;
    }
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
      } catch {}
    }
    setTimeout(() => {
      if (this.ambientSource) {
        try {
          // @ts-ignore
          this.ambientSource.stop?.();
        } catch {}
        this.ambientSource = null;
      }
      this.ambientGain = null;
    }, 450);
    this.currentAmbientType = 'none';
  }
}

export const soundManager = new SoundManager();

