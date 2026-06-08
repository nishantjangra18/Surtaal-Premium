# Mobile UI Quick Reference Guide

## 🎨 Color Palette (Premium Gold Theme)

```css
--amber: #D4A15D        /* Primary gold */
--amber-light: #E0B06D  /* Light gold highlights */
--copper: #8C5A2B       /* Darker copper accent */
--sandalwood: #C9A96E   /* Warm secondary */
--bg-deep: #0C0805      /* Deep black background */
--text-warm-white: #F5F3F0  /* Primary text */
--text-cream: #E8E2D5   /* Secondary text */
--text-dim: #7A6F5F     /* Tertiary text */
```

## 📐 Spacing System

```css
/* Mobile Premium Spacing */
Section padding: 24px (horizontal), 32px (vertical)
Card gaps: 12px (standard), 16px (large)
Bottom clearance: 120px (for mobile taskbar)
Border radius: 12px (cards), 16px (sections), 999px (pills)
```

## 🎭 Shadow System

```css
/* Premium Multi-Layer Shadows */
.premium-card {
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.15);
}

.premium-card-hover {
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 4px 8px rgba(0, 0, 0, 0.2),
    0 0 18px rgba(212, 161, 93, 0.15);
}
```

## ✨ Animation Timing

```css
/* Premium Easing Functions */
--ease-silk: cubic-bezier(0.4, 0, 0.2, 1)  /* Standard */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)  /* Playful */
--speed-fast: 0.2s
--speed-medium: 0.3s
--speed-slow: 0.4s
```

## 🎯 Touch Targets

```css
/* Minimum Sizes for Touch */
Buttons: 44px × 44px (minimum)
Cards: 140px × 140px (Continue Listening)
Grid items: Full width with 12px gap
```

## 📱 Breakpoints

```css
/* Mobile-First Responsive */
@media (max-width: 768px) {
  /* Mobile premium styles */
}

@media (min-width: 769px) {
  /* Desktop layout */
}
```

## 🌈 Gradient Recipes

### Gold Premium Gradient
```css
background: linear-gradient(135deg, var(--amber), var(--copper));
```

### Ambient Glow
```css
background: radial-gradient(
  ellipse at 50% 30%, 
  rgba(212, 161, 93, 0.18) 0%, 
  transparent 60%
);
```

### Card Background
```css
background: linear-gradient(135deg, 
  rgba(212, 161, 93, 0.08) 0%, 
  rgba(140, 90, 43, 0.05) 100%
);
```

## 🎨 Glassmorphism

```css
.premium-glass {
  background: rgba(20, 16, 14, 0.85);
  backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid rgba(212, 161, 93, 0.1);
}
```

## 🎭 Component Patterns

### Hero Section
```jsx
<div className="hero-section">
  <div className="hero-ambient-glow" />
  <div className="hero-content">
    <h1>Namaste, User ♫</h1>
  </div>
</div>
```

### Continue Listening Card
```jsx
<div className="home-continue-card">
  <img src={cover} alt="" />
</div>
```

### Premium CTA Button
```jsx
<button className="premium-mobile-cta-button">
  <span className="premium-cta-icon">🚀</span>
  Join Waitlist
</button>
```

### Queue Preview Track
```jsx
<div className="np-up-next-track">
  <img className="np-up-next-track-cover" src={cover} />
  <div className="np-up-next-track-info">
    <span className="np-up-next-track-title">{title}</span>
    <span className="np-up-next-track-artist">{artist}</span>
  </div>
  <button className="np-up-next-track-remove">✕</button>
</div>
```

## 🎯 Key Design Principles

### 1. Depth over Flat
Always use multi-layer shadows, not single-layer

### 2. Breathable Spacing
Never cramped—give content room to breathe

### 3. Touch-First
Large tap targets, immediate visual feedback

### 4. Immersive Backgrounds
Use blurred art, radial glows, ambient lighting

### 5. Premium Typography
Text shadows, proper hierarchy, careful spacing

### 6. Consistent Motion
All animations use same easing curves

### 7. Gold Accent System
Gold for primary actions, copper for secondary

## 🚀 Performance Tips

### Images
- Use proper aspect ratios
- Lazy load off-screen images
- Use WebP format where possible

### Animations
- Use `transform` and `opacity` only
- Avoid animating `width`, `height`, `left`, `right`
- Use `will-change` sparingly

### Scrolling
- Use `-webkit-overflow-scrolling: touch`
- Hide scrollbars with `scrollbar-width: none`
- Optimize scroll event handlers

## 📐 Layout Patterns

### 3-Column Grid (Recently Played)
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 12px;
```

### 2-Column Grid (Browse Albums)
```css
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 12px;
```

### 2×2 Grid (Premium Benefits)
```css
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 12px;
```

### Horizontal Scroll (Continue Listening)
```css
display: flex;
gap: 12px;
overflow-x: auto;
scrollbar-width: none;
```

## 🎨 Icon System

### Emoji Icons (Premium Feel)
- 👑 Premium crown
- 🚀 Rocket (CTA)
- ✨ Sparkles (success)
- 🎵 Music note
- ♫ Musical accent
- ✓ Checkmark (benefits)
- 💎 Gem (luxury)

## 🔮 Special Effects

### Floating Animation
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
```

### Glow Pulse
```css
@keyframes glowPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.1); }
}
```

### Touch Feedback
```css
button:active {
  transform: scale(0.96);
  transition: transform 0.1s ease;
}
```

## 📝 Best Practices

### DO ✅
- Use gold gradients for primary CTAs
- Add multi-layer shadows to cards
- Provide immediate touch feedback
- Use radial glows for ambient lighting
- Keep text hierarchy clear
- Maintain consistent spacing

### DON'T ❌
- Don't use flat colors without gradients
- Don't ignore touch target sizes
- Don't animate expensive properties
- Don't use harsh pure black (#000)
- Don't forget hover states
- Don't skip accessibility

## 🎯 Accessibility

### Focus States
```css
button:focus-visible {
  outline: 2px solid var(--amber);
  outline-offset: 2px;
}
```

### Touch Targets
Minimum 44×44px for all interactive elements

### Color Contrast
Ensure 4.5:1 ratio for text (WCAG AA)

### Labels
Always provide aria-labels for icon-only buttons

---

**Quick Tip:** When in doubt, add more depth (shadows, glows, gradients) rather than keeping it flat. Premium feels rich, layered, and immersive.
