# ROVIN — Brand Identity & Vector Asset Guidelines

> **Brand Aesthetic:** "The Boys" Vibe &bull; Minimalist &bull; Classic &bull; High-Torque Engineering  
> **Market Scope:** RC Drift & Crawler Cars, Hobby Electronics, Novelty Tech & Room Decor (China &rarr; Bangladesh)

---

## 1. Brand Concept & Story

**ROVIN** is built for boys, young men, and hobbyists who appreciate mechanics, speed, and sleek dark-aesthetic room gear. The brand identity avoids childish toys or loud gradient clutter, instead delivering a **chiseled, tactical, and timeless** industrial mark.

### The Hex-Mach Chassis & Stencil 'R'
- **The Outer Hex-Chassis:** An engineered roll-cage silhouette inspired by off-road RC buggies and CNC-machined aluminum bulkheads, anchored with corner hardware fasteners and top/bottom telemetry calibration marks.
- **The Stencil 'R':** A monolithic vertical stanchion with a bottom-chamfered anchor and a forward-raked **Nitro Amber Gold suspension kick-leg**.
- **No Glow / Zero Blur:** Pure solid vector geometry for razor-sharp reproduction on digital screens, laser-engraved metal parts, and printed packaging.

---

## 2. Master Asset Directory (`brand/`)

| File Name | Format | Usage / Recommended Context |
| :--- | :--- | :--- |
| **[`rovin-logo-dark.svg`](file:///home/sakil/Desktop/ROVIN/brand/rovin-logo-dark.svg)** | Scalable Vector | **Primary Brand Mark** for Dark Mode websites, app headers, digital marketing, and matte black packaging. |
| **[`rovin-logo-light.svg`](file:///home/sakil/Desktop/ROVIN/brand/rovin-logo-light.svg)** | Scalable Vector | **Invoices & Paperwork:** High-contrast mark for China import paperwork, Bangladesh customs clearance, and POS receipts. |
| **[`rovin-logo-monochrome.svg`](file:///home/sakil/Desktop/ROVIN/brand/rovin-logo-monochrome.svg)** | Scalable Vector | **Single-Color Manufacturing:** Apparel (hoodies/caps), courier poly-mailers, and laser etching onto RC metal diffs/chassis. |
| **[`rovin-icon.svg`](file:///home/sakil/Desktop/ROVIN/brand/rovin-icon.svg)** | 512×512 Vector | **App Icon & Social:** Android/iOS app icon, Instagram & Facebook page avatar, product sticker seal. |
| **[`favicon.svg`](file:///home/sakil/Desktop/ROVIN/brand/favicon.svg)** | 64×64 Vector | **Browser Tab Favicon:** Optimized with thickened stroke weights for crystal-clear readability at 16px and 32px. |
| **[`index.html`](file:///home/sakil/Desktop/ROVIN/brand/index.html)** | Interactive HTML | Self-contained visual brand showcase with embedded favicon and store mockups. |

---

## 3. Official Color Palette

| Swatch Name | Hex Code | RGB | Role & Meaning |
| :--- | :--- | :--- | :--- |
| **Nitro Amber Gold** | `#FFC837` &rarr; `#ED6A00` | `rgb(255, 200, 55)` &rarr; `rgb(237, 106, 0)` | **Primary Accent:** High-torque brushless RC motors, nitro headers, and masculine energy. |
| **Machined Titanium** | `#FFFFFF` &rarr; `#E2E8F0` | `rgb(255, 255, 255)` | **Primary Typography & Emblem Pillar:** Crisp contrast and high-speed readability. |
| **Fastener Gunmetal** | `#3A4054` | `rgb(58, 64, 84)` | **Hardware Details:** Corner rivets, index notches, and technical telemetry ticks. |
| **Deep Carbon Slate** | `#0E0F14` | `rgb(14, 15, 20)` | **Primary Surface / Dark Mode Background:** Matte carbon fiber aesthetic. |
| **Pitch Obsidian** | `#07070A` | `rgb(7, 7, 10)` | **Deep Background:** High-contrast chassis backplates. |

---

## 4. Typography & Wordmark

- **Primary Brand Font:** `Orbitron` / Modern High-Tracking Geometric Sans
  - **Weight:** 900 (Black / Ultra Bold)
  - **Tracking (Letter Spacing):** `+13px` (`0.2em` to `0.25em`)
  - **Case:** Strict All-Caps (`ROVIN`)
- **Subtitle / Category Font:** `Inter` / Clean Technical Sans
  - **Weight:** 700 (Bold)
  - **Tracking:** `+8px`
  - **Content:** `PRECISION RC • TECH NOVELTIES • DECOR`

---

## 5. Usage Rules & Best Practices

### Clear Space
- Always maintain clear space around the logo equal to at least half the height of the inner 'R' symbol (`0.5H`).
- Do not crowd the logo against screen borders or adjacent navigation items.

### Minimum Sizes
- **Horizontal Logo:** Minimum height `28px` on web and mobile screens.
- **Emblem Icon:** Minimum `24px × 24px` for app UI, `16px × 16px` for browser favicons.

### Don'ts
- **DO NOT** add drop shadows, outer glow, or blur halos (keep it flat, solid, and surgical).
- **DO NOT** stretch, squeeze, or alter the 45-degree bevel angles of the hex chassis.
- **DO NOT** change the amber gold accent to neon pink, pastel, or rainbow gradients.
- **DO NOT** use low-contrast backgrounds that obscure the gunmetal hardware rivets.

---

## 6. Motion Track & Animation System (`brand/motion/`)

The motion track decomposes the SVG vector paths into a multi-act mechanical assembly sequence:

| Act / Stage | Timestamp | Motion Choreography |
| :--- | :--- | :--- |
| **Stage 1: Blueprint Grid** | `0.0s - 0.6s` | Telemetry grid reveals with laser radar sweep lines. |
| **Stage 2: Hex Chassis Trace** | `0.2s - 1.0s` | Outer hex frame traces via SVG `stroke-dashoffset` path-drawing. |
| **Stage 3: Rivet Hardware Snap** | `0.8s - 1.2s` | 8 corner gunmetal rivets ping and snap with scale spring damping. |
| **Stage 4: Stanchion Drop** | `1.2s - 1.8s` | Machined titanium vertical stanchion drops into the core socket with hydraulic deceleration. |
| **Stage 5: Nitro Kick Drift** | `2.0s - 2.7s` | Solid amber gold kick leg sweeps in at a 45° drift trajectory, locking into the chassis. |
| **Stage 6: Wordmark Lock** | `2.5s - 3.2s` | "ROVIN" letters expand from optical kerning while the datum ruler sweeps across. |
| **Stage 7: Idle HUD Pulse** | `3.4s+` | Subtle telemetry breathing and interactive 3D mouse parallax tracking. |

### Motion Files
- **[`brand/motion/motion_track.html`](file:///home/sakil/Desktop/ROVIN/brand/motion/motion_track.html)**: Interactive player with scrub timeline, 3D gyro tilt, and scroll simulation.
- **[`brand/motion/rovin-motion.css`](file:///home/sakil/Desktop/ROVIN/brand/motion/rovin-motion.css)**: Hardware-accelerated CSS keyframes & mechanical easing curves.
- **[`brand/motion/rovin-motion.js`](file:///home/sakil/Desktop/ROVIN/brand/motion/rovin-motion.js)**: Controller class supporting `.play()`, `.pause()`, `.seek()`, and 3D gyro tilt.

---

## 7. Developer Integration Guide (How to Use the Motion)

### Option A: Quick CSS-Only Auto-Play (Landing Page Hero)
For standard landing page headers where you want the logo to self-assemble automatically on page load:

1. **Include the Stylesheet**:
   ```html
   <link rel="stylesheet" href="/brand/motion/rovin-motion.css">
   ```

2. **Wrap the SVG in the Motion Stage**:
   ```html
   <div class="rovin-motion-stage is-animating">
     <!-- Decomposed SVG markup with motion class hooks -->
     <svg viewBox="0 0 800 240" class="rovin-svg-canvas">
       <!-- See brand/motion/motion_track.html for full semantic SVG markup -->
     </svg>
   </div>
   ```

---

### Option B: Interactive JavaScript Controller (Next.js / React / Vue / Vanilla)
For full programmatic control (play on viewport enter, replay buttons, timeline scrubbing):

1. **Include the Motion Controller**:
   ```html
   <script src="/brand/motion/rovin-motion.js"></script>
   ```

2. **Initialize the Motion Engine**:
   ```javascript
   const stage = document.querySelector('.rovin-motion-stage');

   const motion = new RovinMotion.MotionEngine({
     stage: stage,
     playbackRate: 1.0, // 0.5x, 1.0x, 2.0x
     onUpdate: (progress, currentTime) => {
       // progress: 0.0 to 1.0
       // currentTime: 0.00s to 3.40s
     },
     onComplete: () => {
       console.log("ROVIN brand assembly fully calibrated!");
     }
   });

   // Control Methods:
   motion.play();              // Starts or resumes the assembly sequence
   motion.pause();             // Pauses the animation at current frame
   motion.restart();           // Rewinds and plays from 0.0s
   motion.seek(0.75);          // Scrub directly to 75% completion
   motion.setSpeed(1.5);       // Adjust playback speed
   ```

---

### Option C: 3D Mouse Gyro Parallax (Tactile Cockpit Tilt)
Adds subtle, high-end 3D hardware-accelerated tilt when the user hovers over the logo:

```javascript
// Applies gentle 3D perspective tilt (intensity defaults to 10 degrees)
const gyro = RovinMotion.enable3DParallax('.rovin-motion-stage', {
  intensity: 10
});

// To toggle or clean up:
gyro.setTracking(false); // Pause gyro tracking
gyro.destroy();          // Remove event listeners
```

---

### Option D: Scroll-Driven Collapse (Hero to Sticky Navbar)
To collapse the hero logo into the compact sticky header as visitors scroll down your store:

```javascript
window.addEventListener('scroll', () => {
  const heroHeight = document.querySelector('.hero-section').offsetHeight;
  const scrollY = window.scrollY;
  const progress = Math.min(1, Math.max(0, scrollY / heroHeight));

  const stickyLogo = document.querySelector('.sticky-navbar-logo');
  if (stickyLogo) {
    // Smoothly fade in compact navbar logo as hero leaves screen
    stickyLogo.style.opacity = progress.toFixed(2);
  }
});
```

---

## 8. Critical Engineering Rules for Motion

1. **Keep `pathLength="1000"` on Hex Chassis Paths**:  
   Always ensure the outer hex path and tension rail `<path>` tags include `pathLength="1000"`. This normalizes the 8-sided perimeter so segment 8 seamlessly connects back to the starting point without leaving an 18px gap.
2. **Never Apply CSS Transforms to Root Layout Groups**:  
   Do **NOT** apply CSS `transform` declarations to the structural groups `<g transform="translate(68, 32)">` or `<g transform="translate(268, 130)">`. CSS transforms overwrite SVG XML translate attributes, which would cause the wordmark and emblem to jump to the top-left corner.
3. **Fail-Safe Default Visibility**:  
   All SVG paths and text must default to `opacity: 1` in base CSS. Animations should only override opacity while active, ensuring the logo remains 100% visible if scripts are delayed or disabled.
4. **Respect Reduced Motion**:  
   Always support users with motion sensitivity:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .is-animating * {
       animation: none !important;
       opacity: 1 !important;
       stroke-dashoffset: 0 !important;
     }
   }
   ```


