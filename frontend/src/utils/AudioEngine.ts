// frontend/src/utils/audioEngine.ts

class AudioEngine {
  private ctx: AudioContext | null = null;

  // Initialize the audio context lazily on user interaction
  private init() {
    if (!this.ctx) {
      // Modern browsers restrict audio until a user clicks something
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Plays a distinct frequency tone based on a value's size
   * @param value The current number being sorted
   * @param maxVal The maximum possible number in the array (for mapping pitch)
   * @param duration How long the beep lasts in seconds (default 0.05s)
   */
  public playTone(value: number, maxVal: number, duration: number = 0.05) {
    this.init();
    if (!this.ctx) return;

    // 1. Calculate Pitch: Map the value to a pleasant audible frequency range (e.g., 200Hz to 1000Hz)
    const minFreq = 200;
    const maxFreq = 1000;
    const frequency = minFreq + (value / maxVal) * (maxFreq - minFreq);

    // 2. Create nodes
    const oscillator = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    // 3. Configure Sound Properties
    oscillator.type = 'sine'; // 'sine' is pure and pleasant. Alternatives: 'triangle', 'sawtooth'
    oscillator.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    // 4. Clean Volume Envelope (Prevents annoying audio "popping" clicks)
    gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime); // Keep volume low (10%)
    
    // Exponentially decay the sound volume to zero right before stopping
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    // 5. Start and Schedule Destruction
    oscillator.start();
    oscillator.stop(this.ctx.currentTime + duration);
  }
}

export const audioEngine = new AudioEngine();