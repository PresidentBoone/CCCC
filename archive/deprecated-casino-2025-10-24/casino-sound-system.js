/**
 * 🎵 CASINO SOUND SYSTEM - Audio Dopamine Triggers
 *
 * Lightweight sound system using Web Audio API and HTML5 Audio
 * All sounds are procedurally generated to avoid loading audio files
 *
 * @author Claude Code
 * @version 1.0.0
 */

class CasinoSoundSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3; // Default volume (0-1)
        this.initializeAudioContext();
    }

    /**
     * Initialize Web Audio API context
     */
    initializeAudioContext() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    /**
     * Resume audio context (required for mobile browsers)
     */
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * Play a sound effect
     */
    play(soundName) {
        if (!this.enabled || !this.audioContext) return;

        this.resumeContext();

        switch (soundName) {
            case 'correct':
                this.playCorrectAnswer();
                break;
            case 'incorrect':
                this.playIncorrectAnswer();
                break;
            case 'streak_bonus':
                this.playStreakBonus();
                break;
            case 'high_streak':
                this.playHighStreak();
                break;
            case 'epic_streak':
                this.playEpicStreak();
                break;
            case 'streak_broken':
                this.playStreakBroken();
                break;
            case 'common_drop':
                this.playCommonDrop();
                break;
            case 'rare_drop':
                this.playRareDrop();
                break;
            case 'epic_drop':
                this.playEpicDrop();
                break;
            case 'legendary_drop':
                this.playLegendaryDrop();
                break;
            case 'level_up':
                this.playLevelUp();
                break;
            case 'tier_upgrade':
                this.playTierUpgrade();
                break;
            case 'jackpot':
                this.playJackpot();
                break;
            case 'wheel_spin':
                this.playWheelSpin();
                break;
            case 'coin_collect':
                this.playCoinCollect();
                break;
            case 'button_click':
                this.playButtonClick();
                break;
        }
    }

    /**
     * Correct answer sound - pleasant chime
     */
    playCorrectAnswer() {
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Ascending notes
        oscillator.frequency.setValueAtTime(523.25, now); // C5
        oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5

        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }

    /**
     * Incorrect answer sound - buzzer
     */
    playIncorrectAnswer() {
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(110, now); // Low A
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(this.volume * 0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        oscillator.start(now);
        oscillator.stop(now + 0.4);
    }

    /**
     * Streak bonus sound - ascending chime
     */
    playStreakBonus() {
        const now = this.audioContext.currentTime;

        for (let i = 0; i < 3; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(440 * (1 + i * 0.5), now + i * 0.1);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(this.volume * 0.3, now + i * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);

            oscillator.start(now + i * 0.1);
            oscillator.stop(now + i * 0.1 + 0.3);
        }
    }

    /**
     * High streak sound - energetic fanfare
     */
    playHighStreak() {
        const now = this.audioContext.currentTime;
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C chord

        frequencies.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(freq, now);
            oscillator.type = 'triangle';

            gainNode.gain.setValueAtTime(this.volume * 0.2, now + i * 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            oscillator.start(now + i * 0.05);
            oscillator.stop(now + 0.5);
        });
    }

    /**
     * Epic streak sound - triumphant
     */
    playEpicStreak() {
        const now = this.audioContext.currentTime;
        const frequencies = [261.63, 329.63, 392.00, 523.25, 659.25]; // Major scale

        frequencies.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(freq, now + i * 0.08);
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(this.volume * 0.3, now + i * 0.08);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

            oscillator.start(now + i * 0.08);
            oscillator.stop(now + 0.7);
        });
    }

    /**
     * Streak broken sound - sad trombone
     */
    playStreakBroken() {
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Descending sad notes
        oscillator.frequency.setValueAtTime(392, now); // G
        oscillator.frequency.exponentialRampToValueAtTime(196, now + 0.5); // G octave lower
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(this.volume * 0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        oscillator.start(now);
        oscillator.stop(now + 0.6);
    }

    /**
     * Common drop sound - simple ding
     */
    playCommonDrop() {
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(800, now);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.volume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }

    /**
     * Rare drop sound - magical chime
     */
    playRareDrop() {
        const now = this.audioContext.currentTime;
        const frequencies = [1047, 1319, 1568]; // C-E-G high octave

        frequencies.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(freq, now + i * 0.1);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(this.volume * 0.3, now + i * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);

            oscillator.start(now + i * 0.1);
            oscillator.stop(now + i * 0.1 + 0.3);
        });
    }

    /**
     * Epic drop sound - dramatic fanfare
     */
    playEpicDrop() {
        const now = this.audioContext.currentTime;

        // Play ascending arpeggio
        for (let i = 0; i < 8; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(440 * Math.pow(2, i / 12), now + i * 0.05);
            oscillator.type = 'triangle';

            gainNode.gain.setValueAtTime(this.volume * 0.2, now + i * 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.4);

            oscillator.start(now + i * 0.05);
            oscillator.stop(now + i * 0.05 + 0.4);
        }
    }

    /**
     * Legendary drop sound - massive explosion
     */
    playLegendaryDrop() {
        const now = this.audioContext.currentTime;

        // Play explosion chord
        const frequencies = [130.81, 164.81, 196.00, 246.94, 293.66, 392.00];

        frequencies.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(freq, now);
            oscillator.type = 'sawtooth';

            gainNode.gain.setValueAtTime(this.volume * 0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);

            oscillator.start(now);
            oscillator.stop(now + 1);
        });

        // Add sparkle sounds
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.frequency.setValueAtTime(1000 + Math.random() * 2000, this.audioContext.currentTime);
                osc.type = 'sine';

                gain.gain.setValueAtTime(this.volume * 0.1, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

                osc.start();
                osc.stop(this.audioContext.currentTime + 0.1);
            }, i * 100);
        }
    }

    /**
     * Level up sound - triumphant fanfare
     */
    playLevelUp() {
        const now = this.audioContext.currentTime;
        const melody = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C

        melody.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(freq, now + i * 0.15);
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(this.volume * 0.3, now + i * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.5);

            oscillator.start(now + i * 0.15);
            oscillator.stop(now + i * 0.15 + 0.5);
        });
    }

    /**
     * Tier upgrade sound - epic fanfare
     */
    playTierUpgrade() {
        this.playLevelUp();

        // Add extra sparkle
        setTimeout(() => {
            this.playLegendaryDrop();
        }, 500);
    }

    /**
     * Jackpot sound - slot machine win
     */
    playJackpot() {
        const now = this.audioContext.currentTime;

        // Play rapid ascending notes
        for (let i = 0; i < 20; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(440 + i * 50, now + i * 0.05);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(this.volume * 0.2, now + i * 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.2);

            oscillator.start(now + i * 0.05);
            oscillator.stop(now + i * 0.05 + 0.2);
        }
    }

    /**
     * Wheel spin sound - spinning ratchet
     */
    playWheelSpin() {
        const now = this.audioContext.currentTime;

        // Simulate ratchet clicking sound
        for (let i = 0; i < 30; i++) {
            const delay = i * 0.05 * (1 + i * 0.02); // Slow down gradually

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(200, now + delay);
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(this.volume * 0.2, now + delay);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.05);

            oscillator.start(now + delay);
            oscillator.stop(now + delay + 0.05);
        }
    }

    /**
     * Coin collect sound - cash register
     */
    playCoinCollect() {
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(1200, now);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.volume * 0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    /**
     * Button click sound - subtle feedback
     */
    playButtonClick() {
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(600, now);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.volume * 0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }

    /**
     * Toggle sound on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Set volume (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}

// ============================================
// EXPORT TO WINDOW
// ============================================

if (typeof window !== 'undefined') {
    window.CasinoSoundSystem = CasinoSoundSystem;

    // Create global instance
    window.casinoSound = new CasinoSoundSystem();

    // Global helper function
    window.playSound = (soundName) => {
        window.casinoSound?.play(soundName);
    };
}
