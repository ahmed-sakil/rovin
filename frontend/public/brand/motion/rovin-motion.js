/**
 * ROVIN Brand Motion Engine — Vanilla JS Controller (Error-Resilient Edition)
 * Provides: Play/Pause, Precision Timeline Scrubbing, 3D Mouse Parallax, and Fail-Safe Fallbacks
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RovinMotion = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const TOTAL_DURATION_SEC = 3.4;

  class MotionEngine {
    constructor(options = {}) {
      try {
        this.stage = typeof options.stage === 'string' ? document.querySelector(options.stage) : options.stage;
        this.svg = this.stage ? this.stage.querySelector('svg') : null;
        
        this.playbackRate = options.playbackRate || 1.0;
        this.isPlaying = false;
        this.currentTime = 0;
        this.progress = 0; // 0.0 to 1.0
        this.rafId = null;
        this.lastTimestamp = 0;

        this.onUpdate = options.onUpdate || (() => {});
        this.onComplete = options.onComplete || (() => {});

        this.elements = {};
        if (this.stage) {
          this._bindElements();
        }
      } catch (err) {
        console.error('ROVIN MotionEngine init error, deploying fail-safe:', err);
        this._deployFailSafe();
      }
    }

    _bindElements() {
      this.elements = {
        grid: this.stage.querySelector('.motion-layer-grid'),
        outerHex: this.stage.querySelector('.motion-outer-hex'),
        tensionRail: this.stage.querySelector('.motion-tension-rail'),
        rivets: this.stage.querySelectorAll('.motion-rivet'),
        ticks: this.stage.querySelectorAll('.motion-ticks'),
        stanchion: this.stage.querySelector('.motion-stanchion'),
        upperLoop: this.stage.querySelector('.motion-upper-loop'),
        kickLeg: this.stage.querySelector('.motion-kick-leg'),
        notch: this.stage.querySelectorAll('.motion-notch'),
        wordmark: this.stage.querySelector('.motion-wordmark'),
        subtitle: this.stage.querySelector('.motion-subtitle'),
        datumGold: this.stage.querySelector('.motion-datum-gold'),
        datumGunmetal: this.stage.querySelector('.motion-datum-gunmetal'),
        datumLine: this.stage.querySelector('.motion-datum-line'),
        baselineFloor: this.stage.querySelector('.motion-baseline-floor'),
      };
    }

    _deployFailSafe() {
      if (this.stage) {
        this.stage.classList.remove('is-animating', 'is-scrubbing');
        this.stage.classList.add('motion-complete');
      }
    }

    play() {
      try {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.stage.classList.remove('is-scrubbing', 'motion-complete');
        this.stage.classList.add('is-animating');

        this.lastTimestamp = performance.now();
        this._loop(this.lastTimestamp);
      } catch (err) {
        console.error('ROVIN MotionEngine play error:', err);
        this._deployFailSafe();
      }
    }

    pause() {
      this.isPlaying = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    restart() {
      try {
        this.pause();
        this.currentTime = 0;
        this.progress = 0;
        
        // Clear all manual inline styles so CSS keyframes restart cleanly
        this._clearInlineStyles();

        this.stage.classList.remove('is-animating', 'motion-complete', 'is-scrubbing');
        void this.stage.offsetWidth; // Force DOM reflow
        this.play();
      } catch (err) {
        console.error('ROVIN MotionEngine restart error:', err);
        this._deployFailSafe();
      }
    }

    setSpeed(speed) {
      this.playbackRate = Math.max(0.2, Math.min(speed, 5.0));
      if (this.stage) {
        this.stage.style.setProperty('--motion-duration', `${(TOTAL_DURATION_SEC / this.playbackRate).toFixed(2)}s`);
      }
    }

    /**
     * Precision seek (scrub) to arbitrary progress (0.0 to 1.0)
     */
    seek(progress) {
      try {
        this.progress = Math.max(0, Math.min(progress, 1.0));
        this.currentTime = this.progress * TOTAL_DURATION_SEC;
        
        this.stage.classList.add('is-scrubbing');
        this.stage.classList.remove('is-animating', 'motion-complete');

        this._applyInterpolation(this.currentTime);
        this.onUpdate(this.progress, this.currentTime);

        if (this.progress >= 0.999) {
          this._finalizeAssembly();
        }
      } catch (err) {
        console.error('ROVIN MotionEngine seek error:', err);
        this._deployFailSafe();
      }
    }

    _finalizeAssembly() {
      this.isPlaying = false;
      this.progress = 1.0;
      this.currentTime = TOTAL_DURATION_SEC;
      this._clearInlineStyles();
      this.stage.classList.remove('is-animating', 'is-scrubbing');
      this.stage.classList.add('motion-complete');
      this.onComplete();
    }

    _clearInlineStyles() {
      const el = this.elements;
      if (!el) return;

      const clear = (node) => {
        if (node) {
          node.style.opacity = '';
          node.style.transform = '';
          node.style.strokeDashoffset = '';
          node.style.letterSpacing = '';
        }
      };

      clear(el.grid);
      clear(el.outerHex);
      clear(el.tensionRail);
      clear(el.stanchion);
      clear(el.upperLoop);
      clear(el.kickLeg);
      clear(el.wordmark);
      clear(el.subtitle);
      clear(el.datumGold);
      clear(el.datumGunmetal);
      clear(el.datumLine);
      clear(el.baselineFloor);

      if (el.rivets) el.rivets.forEach(clear);
      if (el.ticks) el.ticks.forEach(clear);
      if (el.notch) el.notch.forEach(clear);
    }

    _loop(timestamp) {
      if (!this.isPlaying) return;

      try {
        const delta = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        this.currentTime += delta * this.playbackRate;
        this.progress = Math.min(this.currentTime / TOTAL_DURATION_SEC, 1.0);

        this.onUpdate(this.progress, this.currentTime);

        if (this.currentTime >= TOTAL_DURATION_SEC) {
          this._finalizeAssembly();
          return;
        }

        this.rafId = requestAnimationFrame(this._loop.bind(this));
      } catch (err) {
        console.error('ROVIN MotionEngine loop error:', err);
        this._deployFailSafe();
      }
    }

    /**
     * Mathematical timeline interpolation for manual scrubber control
     */
    _applyInterpolation(time) {
      const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
      const range = (t, start, end) => clamp((t - start) / (end - start), 0, 1);
      const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

      const el = this.elements;

      // 1. Grid (0.0 - 0.6s)
      if (el.grid) {
        const p = range(time, 0.0, 0.6);
        el.grid.style.opacity = (p * 0.6).toFixed(2);
      }

      // Baseline Floor (0.1 - 0.9s)
      if (el.baselineFloor) {
        const p = range(time, 0.1, 0.9);
        el.baselineFloor.style.strokeDashoffset = Math.round(680 * (1 - easeOutCubic(p)));
      }

      // 2. Outer Hex (0.2 - 1.0s)
      if (el.outerHex) {
        const p = range(time, 0.2, 1.0);
        el.outerHex.style.strokeDashoffset = Math.round(1000 * (1 - easeOutCubic(p)));
        el.outerHex.style.opacity = p > 0 ? (0.2 + p * 0.8).toFixed(2) : '0';
      }

      // Tension Rail (0.35 - 1.2s)
      if (el.tensionRail) {
        const p = range(time, 0.35, 1.2);
        el.tensionRail.style.strokeDashoffset = Math.round(1000 * (1 - easeOutCubic(p)));
        el.tensionRail.style.opacity = p.toFixed(2);
      }

      // 3. Rivets (0.7 - 1.1s)
      if (el.rivets) {
        el.rivets.forEach((r, idx) => {
          const start = 0.70 + idx * 0.04;
          const p = range(time, start, start + 0.3);
          if (p === 0) {
            r.style.opacity = '0';
            r.style.transform = 'scale(0.2)';
          } else {
            r.style.opacity = '1';
            const scale = p < 0.6 ? 0.2 + (p / 0.6) * 1.3 : 1.5 - ((p - 0.6) / 0.4) * 0.5;
            r.style.transform = `scale(${scale.toFixed(2)})`;
          }
        });
      }

      // Calibration Ticks (1.1 - 1.4s)
      if (el.ticks) {
        const p = range(time, 1.1, 1.4);
        el.ticks.forEach(t => {
          t.style.opacity = p.toFixed(2);
          t.style.transform = `scaleY(${p.toFixed(2)})`;
        });
      }

      // 4. Stanchion Drop (1.2 - 1.8s)
      if (el.stanchion) {
        const p = range(time, 1.2, 1.8);
        const y = -30 * (1 - easeOutCubic(p));
        el.stanchion.style.opacity = p.toFixed(2);
        el.stanchion.style.transform = `translateY(${y.toFixed(1)}px)`;
      }

      // 5. Upper Loop (1.55 - 2.2s)
      if (el.upperLoop) {
        const p = range(time, 1.55, 2.2);
        const x = 25 * (1 - easeOutCubic(p));
        el.upperLoop.style.opacity = p.toFixed(2);
        el.upperLoop.style.transform = `translateX(${x.toFixed(1)}px)`;
      }

      // 6. Amber Kick Leg (2.0 - 2.7s)
      if (el.kickLeg) {
        const p = range(time, 2.0, 2.7);
        if (p === 0) {
          el.kickLeg.style.opacity = '0';
          el.kickLeg.style.transform = 'translate(25px, 25px)';
        } else {
          el.kickLeg.style.opacity = p.toFixed(2);
          const shift = 25 * (1 - easeOutCubic(p));
          el.kickLeg.style.transform = `translate(${shift.toFixed(1)}px, ${shift.toFixed(1)}px)`;
        }
      }

      // Notches (2.45 - 2.8s)
      if (el.notch) {
        const p = range(time, 2.45, 2.8);
        el.notch.forEach(n => {
          n.style.opacity = p.toFixed(2);
          n.style.transform = `scale(${p.toFixed(2)})`;
        });
      }

      // 7. Wordmark ROVIN (No coordinate shift! Only clean opacity & tracking)
      if (el.wordmark) {
        const p = range(time, 2.45, 3.2);
        const spacing = 4 + 9 * easeOutCubic(p);
        el.wordmark.style.opacity = p.toFixed(2);
        el.wordmark.style.letterSpacing = `${spacing.toFixed(1)}px`;
      }

      // Subtitle (2.75 - 3.3s)
      if (el.subtitle) {
        const p = range(time, 2.75, 3.3);
        el.subtitle.style.opacity = p.toFixed(2);
      }

      // Datum assembly (2.85 - 3.4s)
      if (el.datumGold) {
        const p = range(time, 2.85, 3.25);
        el.datumGold.style.transform = `scaleX(${p.toFixed(2)})`;
      }
      if (el.datumGunmetal) {
        const p = range(time, 3.0, 3.35);
        el.datumGunmetal.style.transform = `scaleX(${p.toFixed(2)})`;
      }
      if (el.datumLine) {
        const p = range(time, 2.95, 3.4);
        el.datumLine.style.strokeDashoffset = Math.round(300 * (1 - p));
      }
    }
  }

  /**
   * 3D Gyro / Mouse Parallax Handler
   * Applies 3D rotation strictly to the wrapper stage, never touching SVG child transforms.
   */
  function enable3DParallax(container, options = {}) {
    const stage = typeof container === 'string' ? document.querySelector(container) : container;
    if (!stage) return { destroy: () => {}, setTracking: () => {} };

    const intensity = options.intensity || 12; // Gentle tactical tilt
    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;
    let isTracking = true;

    function onMouseMove(e) {
      if (!isTracking) return;
      const rect = stage.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      targetX = -(mouseY / (rect.height / 2)) * intensity;
      targetY = (mouseX / (rect.width / 2)) * intensity;
    }

    function onMouseLeave() {
      targetX = 0;
      targetY = 0;
    }

    stage.addEventListener('mousemove', onMouseMove);
    stage.addEventListener('mouseleave', onMouseLeave);

    let raf;
    function render() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      stage.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
      raf = requestAnimationFrame(render);
    }
    raf = requestAnimationFrame(render);

    return {
      destroy() {
        stage.removeEventListener('mousemove', onMouseMove);
        stage.removeEventListener('mouseleave', onMouseLeave);
        cancelAnimationFrame(raf);
        stage.style.transform = 'none';
      },
      setTracking(val) {
        isTracking = val;
        if (!val) { targetX = 0; targetY = 0; }
      }
    };
  }

  return {
    MotionEngine,
    enable3DParallax,
    TOTAL_DURATION_SEC
  };

}));
