// Sound effects for CardinalAI IDE

class SoundManager {
  private enabled: boolean = true;
  private volume: number = 0.3;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  private play(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }

  // UI Sounds
  click() {
    this.play(800, 0.05, 'sine');
  }

  hover() {
    this.play(600, 0.03, 'sine');
  }

  // AI Agent Sounds
  aiThinking() {
    this.play(440, 0.1, 'sine');
    setTimeout(() => this.play(554, 0.1, 'sine'), 100);
  }

  aiResponse() {
    this.play(660, 0.15, 'sine');
  }

  // Success/Error Sounds
  success() {
    this.play(523, 0.1, 'sine');
    setTimeout(() => this.play(659, 0.1, 'sine'), 100);
    setTimeout(() => this.play(784, 0.15, 'sine'), 200);
  }

  error() {
    this.play(300, 0.2, 'sawtooth');
  }

  // Notification Sound
  notification() {
    this.play(880, 0.1, 'sine');
    setTimeout(() => this.play(1047, 0.15, 'sine'), 100);
  }

  // Tab/File Sounds
  fileOpen() {
    this.play(700, 0.08, 'sine');
  }

  fileClose() {
    this.play(500, 0.08, 'sine');
  }

  // Command Palette
  commandOpen() {
    this.play(1000, 0.1, 'sine');
  }
}

export const soundManager = new SoundManager();
