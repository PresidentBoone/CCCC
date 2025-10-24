/**
 * Casino Module - Confetti System
 *
 * Canvas-based confetti particle animation system.
 * Features physics simulation, multiple particle shapes, and customizable bursts.
 *
 * @module casino/animations/ConfettiSystem
 * @author CollegeClimb Casino Team
 * @version 1.0.0
 */

class ConfettiSystem {
  /**
   * Create a new ConfettiSystem
   *
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.container - Container element (optional, uses body)
   * @param {Object} options.config - Confetti configuration (optional)
   *
   * @example
   * const confetti = new ConfettiSystem();
   * confetti.burst({ particleCount: 100, colors: ['#FF0000', '#00FF00'] });
   */
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.config = options.config || this._getDefaultConfig();

    // Canvas
    this.canvas = null;
    this.ctx = null;

    // Particles
    this.particles = [];

    // Animation
    this.animationFrame = null;
    this.isAnimating = false;

    // Create canvas
    this._createCanvas();
  }

  /**
   * Trigger confetti burst
   *
   * @param {Object} options - Burst options
   * @param {number} options.particleCount - Number of particles (default: 100)
   * @param {string[]} options.colors - Array of colors (default: rainbow)
   * @param {number} options.x - X origin (0-1, default: 0.5 center)
   * @param {number} options.y - Y origin (0-1, default: 0.5 center)
   * @param {number} options.spread - Spread angle in degrees (default: 360)
   * @param {number} options.force - Initial force (default: 15)
   * @param {number} options.gravity - Gravity (default: 0.5)
   * @param {number} options.duration - Duration in ms (default: 3000)
   */
  burst(options = {}) {
    const particleCount = options.particleCount || 100;
    const colors = options.colors || this.config.colors;
    const originX = (options.x !== undefined ? options.x : 0.5) * this.canvas.width;
    const originY = (options.y !== undefined ? options.y : 0.5) * this.canvas.height;
    const spread = options.spread !== undefined ? options.spread : 360;
    const force = options.force || 15;
    const gravity = options.gravity !== undefined ? options.gravity : 0.5;
    const duration = options.duration || 3000;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(this._createParticle({
        x: originX,
        y: originY,
        colors,
        spread,
        force,
        gravity,
        duration
      }));
    }

    // Start animation if not already running
    if (!this.isAnimating) {
      this._startAnimation();
    }

    // Show canvas
    this.canvas.style.display = 'block';
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles = [];
    this._stopAnimation();
    this.canvas.style.display = 'none';
  }

  /**
   * Destroy confetti system
   */
  destroy() {
    this.clear();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }

  // ============================================
  // INTERNAL METHODS
  // ============================================

  /**
   * Create canvas element
   * @private
   */
  _createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '10003';
    this.canvas.style.display = 'none';

    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Set canvas size
    this._resizeCanvas();

    // Handle window resize
    window.addEventListener('resize', () => this._resizeCanvas());
  }

  /**
   * Resize canvas to match window
   * @private
   */
  _resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Create a single particle
   * @private
   */
  _createParticle(options) {
    const { x, y, colors, spread, force, gravity, duration } = options;

    // Random angle within spread
    const spreadRad = (spread * Math.PI) / 180;
    const angle = Math.random() * spreadRad - (spreadRad / 2) - (Math.PI / 2); // -90deg is up

    // Random velocity
    const velocity = force * (0.5 + Math.random() * 0.5);
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    // Random color
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Random shape
    const shapes = ['square', 'circle', 'triangle', 'rectangle'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    // Random size
    const size = 8 + Math.random() * 8; // 8-16px

    // Random rotation
    const rotation = Math.random() * Math.PI * 2;
    const rotationSpeed = (Math.random() - 0.5) * 0.2;

    return {
      x,
      y,
      vx,
      vy,
      color,
      shape,
      size,
      rotation,
      rotationSpeed,
      gravity,
      opacity: 1,
      createdAt: Date.now(),
      duration
    };
  }

  /**
   * Start animation loop
   * @private
   */
  _startAnimation() {
    this.isAnimating = true;

    const animate = () => {
      this._update();
      this._render();

      // Continue if particles exist
      if (this.particles.length > 0) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this._stopAnimation();
      }
    };

    animate();
  }

  /**
   * Stop animation loop
   * @private
   */
  _stopAnimation() {
    this.isAnimating = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Hide canvas
    this.canvas.style.display = 'none';
  }

  /**
   * Update particle physics
   * @private
   */
  _update() {
    const now = Date.now();

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Apply gravity
      particle.vy += particle.gravity;

      // Apply wind (slight horizontal drift)
      particle.vx += (Math.random() - 0.5) * 0.1;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Update rotation
      particle.rotation += particle.rotationSpeed;

      // Fade out based on duration
      const elapsed = now - particle.createdAt;
      const progress = elapsed / particle.duration;
      particle.opacity = Math.max(0, 1 - progress);

      // Remove if off screen or faded
      if (
        particle.y > this.canvas.height + 50 ||
        particle.x < -50 ||
        particle.x > this.canvas.width + 50 ||
        particle.opacity <= 0
      ) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render particles to canvas
   * @private
   */
  _render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw particles
    for (const particle of this.particles) {
      this.ctx.save();

      // Move to particle position
      this.ctx.translate(particle.x, particle.y);

      // Rotate
      this.ctx.rotate(particle.rotation);

      // Set opacity
      this.ctx.globalAlpha = particle.opacity;

      // Set color
      this.ctx.fillStyle = particle.color;

      // Draw shape
      switch (particle.shape) {
        case 'square':
          this.ctx.fillRect(
            -particle.size / 2,
            -particle.size / 2,
            particle.size,
            particle.size
          );
          break;

        case 'circle':
          this.ctx.beginPath();
          this.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
          break;

        case 'triangle':
          this.ctx.beginPath();
          this.ctx.moveTo(0, -particle.size / 2);
          this.ctx.lineTo(particle.size / 2, particle.size / 2);
          this.ctx.lineTo(-particle.size / 2, particle.size / 2);
          this.ctx.closePath();
          this.ctx.fill();
          break;

        case 'rectangle':
          this.ctx.fillRect(
            -particle.size / 2,
            -particle.size / 4,
            particle.size,
            particle.size / 2
          );
          break;
      }

      this.ctx.restore();
    }
  }

  /**
   * Get default configuration
   * @private
   */
  _getDefaultConfig() {
    return {
      colors: [
        '#FF6B6B', // Red
        '#4ECDC4', // Teal
        '#45B7D1', // Blue
        '#FFA07A', // Orange
        '#98D8C8', // Mint
        '#F7DC6F', // Yellow
        '#BB8FCE', // Purple
        '#85C1E2', // Light blue
        '#F8B739', // Gold
        '#EC7063'  // Coral
      ]
    };
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.ConfettiSystem = ConfettiSystem;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfettiSystem;
}
