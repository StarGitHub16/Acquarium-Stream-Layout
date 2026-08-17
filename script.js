const overlay = document.querySelector('.overlay');
const statusText = document.querySelector('#statusText');
const statusDot = document.querySelector('.status-dot');
const motionButton = document.querySelector('#toggleMotion');
const freezeButton = document.querySelector('#toggleFreeze');

// Bubble system for underwater effect
class BubbleSystem {
  constructor(container, maxBubbles = 50) {
    this.container = container;
    this.maxBubbles = maxBubbles;
    this.thawingMaxBubbles = 100;
    this.bubbles = [];
    this.iceCrystals = [];
    this.gameplayFrame = document.querySelector('.gameplay-frame');
    this.isRunning = true;
    this.isFrozen = false;
    this.isThawing = false;
    this.init();
  }

  init() {
    for (let i = 0; i < this.maxBubbles; i += 1) this.createBubble();
    this.animate();
  }

  createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const size = Math.random() * 8 + 3;
    const startX = Math.random() * 100;
    const startY = Math.random() * 100 + 110;
    const opacity = Math.random() * 0.4 + 0.1;
    const speed = Math.random() * 0.8 + 0.2;
    const wobble = Math.random() * Math.PI * 2;
    const wobbleSpeed = Math.random() * 0.03 + 0.01;

    bubble.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(0, 229, 255, 0.3), transparent);
      border-radius: 50%;
      pointer-events: none;
      opacity: ${opacity};
      left: ${startX}%;
      top: ${startY}%;
      box-shadow: 0 0 ${size / 2}px rgba(0, 229, 255, 0.3), inset 0 0 ${size / 3}px rgba(255, 255, 255, 0.5);
      transition: opacity 1s ease-in-out;
    `;

    this.container.appendChild(bubble);
    this.bubbles.push({ element: bubble, x: startX, y: startY, speed, size, wobble, wobbleSpeed, originalOpacity: opacity });
  }

  createIceCrystal() {
    const crystal = document.createElement('div');
    crystal.className = 'ice-crystal';

    const size = Math.random() * 6 + 2;
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const opacity = Math.random() * 0.6 + 0.2;
    const rotation = Math.random() * 360;

    crystal.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: linear-gradient(135deg, rgba(224, 247, 250, 0.9), rgba(129, 212, 250, 0.5));
      clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
      pointer-events: none;
      opacity: 0;
      left: ${startX}%;
      top: ${startY}px;
      transform: rotate(${rotation}deg);
      box-shadow: 0 0 ${size}px rgba(0, 229, 255, 0.5);
      transition: opacity 1s ease-in-out;
    `;

    this.container.appendChild(crystal);
    this.iceCrystals.push({ element: crystal, x: startX, y: startY, size, rotation, targetOpacity: opacity, currentOpacity: 0 });
  }

  freeze() {
    this.isFrozen = true;
    this.bubbles.forEach((bubble) => { bubble.element.style.opacity = '0'; });

    if (this.iceCrystals.length === 0) {
      for (let i = 0; i < this.maxBubbles; i += 1) this.createIceCrystal();
    }

    setTimeout(() => {
      this.iceCrystals.forEach((crystal) => {
        crystal.element.style.opacity = crystal.targetOpacity;
        crystal.currentOpacity = crystal.targetOpacity;
      });
    }, 500);
  }

  unfreeze() {
    this.isFrozen = false;
    this.bubbles.forEach((bubble) => { bubble.element.style.opacity = bubble.originalOpacity; });
    this.iceCrystals.forEach((crystal) => {
      crystal.element.style.opacity = '0';
      crystal.currentOpacity = 0;
    });
  }

  setThawing(thawing) {
    this.isThawing = thawing;

    if (thawing) {
      const additionalBubbles = this.thawingMaxBubbles - this.bubbles.length;
      for (let i = 0; i < additionalBubbles; i += 1) this.createBubble();
      this.bubbles.forEach((bubble) => {
        bubble.speed *= 1.5;
        bubble.wobbleSpeed *= 1.3;
        if (bubble.y > 100) bubble.y = Math.random() * 30 + 110;
      });
    } else {
      while (this.bubbles.length > this.maxBubbles) this.bubbles.pop().element.remove();
      this.bubbles.forEach((bubble) => {
        bubble.speed /= 1.5;
        bubble.wobbleSpeed /= 1.3;
      });
    }
  }

  isInsideGameplayFrame(x, y) {
    if (!this.gameplayFrame) return false;
    const frameRect = this.gameplayFrame.getBoundingClientRect();
    const pixelX = (x / 100) * window.innerWidth;
    const pixelY = (y / 100) * window.innerHeight;
    const padding = 30;
    return pixelX >= frameRect.left - padding && pixelX <= frameRect.right + padding && pixelY >= frameRect.top - padding && pixelY <= frameRect.bottom + padding;
  }

  animate() {
    if (!this.isRunning) return;

    if (!this.isFrozen) {
      this.bubbles.forEach((bubble) => {
        bubble.y -= bubble.speed * 0.1;
        bubble.wobble += bubble.wobbleSpeed;
        bubble.x += Math.sin(bubble.wobble) * 0.03;

        if (this.isInsideGameplayFrame(bubble.x, bubble.y)) {
          bubble.x += bubble.x < 50 ? -0.3 : 0.3;
        }
        if (bubble.x < 0) bubble.x = 100;
        if (bubble.x > 100) bubble.x = 0;
        if (bubble.y < -10) {
          bubble.y = Math.random() * 50 + 110;
          bubble.x = Math.random() * 100;
        }
        bubble.element.style.left = `${bubble.x}%`;
        bubble.element.style.top = `${bubble.y}%`;
      });
    }

    if (this.isFrozen) {
      this.iceCrystals.forEach((crystal, index) => {
        crystal.y += Math.sin(Date.now() * 0.001 + index) * 0.02;
        crystal.rotation += 0.01;
        if (crystal.y < 0) crystal.y = 100;
        if (crystal.y > 100) crystal.y = 0;
        crystal.element.style.left = `${crystal.x}%`;
        crystal.element.style.top = `${crystal.y}%`;
        crystal.element.style.transform = `rotate(${crystal.rotation}deg)`;
      });
    }
    requestAnimationFrame(() => this.animate());
  }

  toggle() {
    this.isRunning = !this.isRunning;
    if (this.isRunning) this.animate();
  }
}

const bubbleContainer = document.createElement('div');
bubbleContainer.className = 'bubble-container';
bubbleContainer.setAttribute('aria-hidden', 'true');
overlay.appendChild(bubbleContainer);
const bubbleSystem = new BubbleSystem(bubbleContainer, 60);

// Fish system for underwater life
class FishSystem {
  constructor(container, maxFish = 8) {
    this.container = container;
    this.maxFish = maxFish;
    this.liveMaxFish = 15;
    this.fish = [];
    this.gameplayFrame = document.querySelector('.gameplay-frame');
    this.isRunning = true;
    this.isLive = false;
    this.init();
  }

  init() {
    for (let i = 0; i < this.maxFish; i += 1) this.createFish();
    this.animate();
  }

  createFish() {
    const fish = document.createElement('div');
    fish.className = 'fish';
    const size = Math.random() * 15 + 8;
    const startY = Math.random() * 80 + 10;
    const speed = Math.random() * 0.3 + 0.1;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const startX = direction === 1 ? -50 : window.innerWidth + 50;
    const fishType = Math.floor(Math.random() * 3);
    const colors = ['rgba(255, 255, 255, 0.8)', 'rgba(255, 167, 38, 0.7)', 'rgba(13, 71, 161, 0.7)'];

    fish.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size * 0.6}px;
      background: ${colors[fishType]};
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      pointer-events: none;
      left: ${startX}px;
      top: ${startY}%;
      opacity: 0.8;
      box-shadow: 0 0 ${size / 2}px rgba(0, 229, 255, 0.3);
      transform: scaleX(${direction});
      transition: opacity 2s ease-in-out;
    `;

    const tail = document.createElement('div');
    tail.style.cssText = `
      position: absolute;
      width: ${size * 0.4}px;
      height: ${size * 0.3}px;
      background: ${colors[fishType]};
      border-radius: 50%;
      ${direction === 1 ? 'left: -3px;' : 'right: -3px;'}
      top: 50%;
      transform: translateY(-50%);
    `;
    fish.appendChild(tail);
    this.container.appendChild(fish);
    this.fish.push({ element: fish, x: startX, y: startY, speed: speed * direction, direction, wobble: Math.random() * Math.PI * 2, wobbleSpeed: Math.random() * 0.05 + 0.02 });
  }

  isInsideGameplayFrame(x, y) {
    if (!this.gameplayFrame) return false;
    const frameRect = this.gameplayFrame.getBoundingClientRect();
    const pixelY = (y / 100) * window.innerHeight;
    const padding = 50;
    return x >= frameRect.left - padding && x <= frameRect.right + padding && pixelY >= frameRect.top - padding && pixelY <= frameRect.bottom + padding;
  }

  animate() {
    if (!this.isRunning) return;
    const viewportWidth = window.innerWidth;
    this.fish.forEach((fish) => {
      fish.x += fish.speed;
      fish.wobble += fish.wobbleSpeed;
      fish.y += Math.sin(fish.wobble) * 0.05;
      if (this.isInsideGameplayFrame(fish.x, fish.y)) fish.y += fish.y > 50 ? 0.1 : -0.1;
      if (fish.direction === 1 && fish.x > viewportWidth + 50) {
        fish.x = -50;
        fish.y = Math.random() * 80 + 10;
      } else if (fish.direction === -1 && fish.x < -50) {
        fish.x = viewportWidth + 50;
        fish.y = Math.random() * 80 + 10;
      }
      if (fish.y < 5) fish.y = 5;
      if (fish.y > 95) fish.y = 95;
      fish.element.style.left = `${fish.x}px`;
      fish.element.style.top = `${fish.y}%`;
    });
    requestAnimationFrame(() => this.animate());
  }

  toggle() {
    this.isRunning = !this.isRunning;
    if (this.isRunning) this.animate();
  }

  setLive(live) {
    this.isLive = live;
    if (live) {
      const additionalFish = this.liveMaxFish - this.fish.length;
      for (let i = 0; i < additionalFish; i += 1) this.createFish();
      this.fish.forEach((fish) => {
        fish.element.style.opacity = '0.9';
        fish.element.style.filter = 'brightness(1.2)';
      });
    } else {
      while (this.fish.length > this.maxFish) this.fish.pop().element.remove();
      this.fish.forEach((fish) => {
        fish.element.style.opacity = '0.8';
        fish.element.style.filter = 'brightness(1)';
      });
    }
  }
}

const fishContainer = document.querySelector('.fish-container');
const fishSystem = new FishSystem(fishContainer, 6);

// Bottom border bubble system for thawing effect
class BottomBubbleSystem {
  constructor(container, maxBubbles = 40) {
    this.container = container;
    this.maxBubbles = maxBubbles;
    this.bubbles = [];
    this.isRunning = false;
    this.init();
  }

  init() {
    this.bubbleContainer = document.createElement('div');
    this.bubbleContainer.className = 'bottom-bubble-container';
    this.bubbleContainer.setAttribute('aria-hidden', 'true');
    this.container.appendChild(this.bubbleContainer);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    while (this.bubbles.length < this.maxBubbles) this.createBottomBubble();
    this.bubbles.forEach((bubble) => { bubble.element.style.opacity = bubble.originalOpacity; });
    this.animate();
  }

  stop() {
    this.isRunning = false;
    this.bubbles.forEach((bubble) => { bubble.element.style.opacity = '0'; });
  }

  createBottomBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bottom-bubble';
    const size = Math.random() * 15 + 8;
    const startX = Math.random() * 100;
    const speed = Math.random() * 3 + 1.5;
    const wobble = Math.random() * Math.PI * 2;
    const wobbleSpeed = Math.random() * 0.08 + 0.04;
    const opacity = Math.random() * 0.6 + 0.4;
    const startY = window.innerHeight + Math.random() * 50 + 20;

    bubble.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(0, 229, 255, 0.6), transparent);
      border-radius: 50%;
      pointer-events: none;
      opacity: ${opacity};
      left: ${startX}%;
      top: ${startY}px;
      box-shadow: 0 0 ${size * 1.5}px rgba(0, 229, 255, 0.6), inset 0 0 ${size * 0.7}px rgba(255, 255, 255, 0.7);
      transition: opacity 0.5s ease-in-out;
    `;
    this.bubbleContainer.appendChild(bubble);
    this.bubbles.push({ element: bubble, x: startX, y: startY, speed, wobble, wobbleSpeed, originalOpacity: opacity });
  }

  animate() {
    if (!this.isRunning) return;
    const viewportHeight = window.innerHeight;
    this.bubbles.forEach((bubble) => {
      bubble.y -= bubble.speed * 2;
      bubble.wobble += bubble.wobbleSpeed;
      bubble.x += Math.sin(bubble.wobble) * 0.08;
      if (bubble.x < 0) bubble.x = 100;
      if (bubble.x > 100) bubble.x = 0;
      if (bubble.y < -50) {
        bubble.y = viewportHeight + Math.random() * 50 + 20;
        bubble.x = Math.random() * 100;
      }
      bubble.element.style.left = `${bubble.x}%`;
      bubble.element.style.top = `${bubble.y}px`;
    });
    requestAnimationFrame(() => this.animate());
  }
}

const bottomBubbleSystem = new BottomBubbleSystem(overlay, 40);

// Chat-tank bubbles are optional because the entire chat tank is commented out in your HTML.
class ChatTankBubbleSystem {
  constructor(container) {
    this.container = container.querySelector('.tank-bubbles');
    this.bubbles = [];
    this.isRunning = true;
    this.init();
  }

  init() {
    for (let i = 0; i < 8; i += 1) this.createTankBubble();
    this.animate();
  }

  createTankBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'tank-bubble';
    const size = Math.random() * 6 + 3;
    const startX = Math.random() * 100;
    const speed = Math.random() * 0.3 + 0.1;
    const wobble = Math.random() * Math.PI * 2;
    const wobbleSpeed = Math.random() * 0.02 + 0.01;
    bubble.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(0, 229, 255, 0.4), transparent);
      border-radius: 50%;
      pointer-events: none;
      opacity: 0.6;
      left: ${startX}%;
      bottom: -10px;
      box-shadow: 0 0 ${size}px rgba(0, 229, 255, 0.3);
    `;
    this.container.appendChild(bubble);
    this.bubbles.push({ element: bubble, x: startX, y: -10, speed, wobble, wobbleSpeed });
  }

  animate() {
    if (!this.isRunning) return;
    this.bubbles.forEach((bubble) => {
      bubble.y -= bubble.speed;
      bubble.wobble += bubble.wobbleSpeed;
      bubble.x += Math.sin(bubble.wobble) * 0.02;
      if (bubble.x < 0) bubble.x = 100;
      if (bubble.x > 100) bubble.x = 0;
      if (bubble.y < -120) {
        bubble.y = -10;
        bubble.x = Math.random() * 100;
      }
      bubble.element.style.left = `${bubble.x}%`;
      bubble.element.style.bottom = `${-bubble.y}px`;
    });
    requestAnimationFrame(() => this.animate());
  }
}

const chatTank = document.querySelector('.chat-tank');
const chatTankBubbleSystem = chatTank ? new ChatTankBubbleSystem(chatTank) : null;

// Preview controls
for (const button of document.querySelectorAll('[data-status]')) {
  button.addEventListener('click', () => {
    const status = button.dataset.status || '';
    if (statusText) statusText.textContent = status;

    overlay.classList.remove('thawing', 'frozen', 'frigid');
    document.querySelectorAll('.center-message').forEach((message) => message.classList.remove('active'));

    if (status.includes('OPENS SOON')) {
      if (statusDot) statusDot.style.background = '#4fc3f7';
      overlay.classList.add('thawing');
      bubbleSystem.unfreeze();
      bubbleSystem.setThawing(true);
      bottomBubbleSystem.start();
      fishSystem.setLive(false);
      if (!fishSystem.isRunning) fishSystem.toggle();
      if (freezeButton) freezeButton.textContent = 'Freeze';
      document.querySelector('.starting-message')?.classList.add('active');
    } else if (status.includes('COMPLETELY')) {
      if (statusDot) statusDot.style.background = '#9c27b0';
      overlay.classList.add('frigid');
      bubbleSystem.freeze();
      bubbleSystem.setThawing(false);
      bottomBubbleSystem.stop();
      fishSystem.setLive(false);
      if (fishSystem.isRunning) fishSystem.toggle();
      if (freezeButton) freezeButton.textContent = 'Thaw';
      document.querySelector('.offline-message')?.classList.add('active');
    } else if (status.includes('RETURNING') || button.textContent.trim() === 'BRB') {
      if (statusDot) statusDot.style.background = '#1976d2';
      overlay.classList.add('frozen');
      bubbleSystem.freeze();
      bubbleSystem.setThawing(false);
      bottomBubbleSystem.stop();
      fishSystem.setLive(false);
      if (fishSystem.isRunning) fishSystem.toggle();
      if (freezeButton) freezeButton.textContent = 'Thaw';
      document.querySelector('.brb-message')?.classList.add('active');
    } else {
      if (statusDot) statusDot.style.background = '#00e5ff';
      bubbleSystem.unfreeze();
      bubbleSystem.setThawing(false);
      bottomBubbleSystem.stop();
      fishSystem.setLive(true);
      if (!fishSystem.isRunning) fishSystem.toggle();
      if (freezeButton) freezeButton.textContent = 'Freeze';
    }
  });
}

motionButton?.addEventListener('click', () => {
  overlay.classList.toggle('reduced-motion');
  motionButton.textContent = overlay.classList.contains('reduced-motion') ? 'Motion Off' : 'Motion';
  bubbleSystem.toggle();
  fishSystem.toggle();
});

freezeButton?.addEventListener('click', () => {
  overlay.classList.toggle('frozen');
  if (overlay.classList.contains('frozen')) {
    bubbleSystem.freeze();
    if (fishSystem.isRunning) fishSystem.toggle();
    freezeButton.textContent = 'Thaw';
  } else {
    bubbleSystem.unfreeze();
    if (!fishSystem.isRunning) fishSystem.toggle();
    freezeButton.textContent = 'Freeze';
  }
});

const params = new URLSearchParams(window.location.search);
const requestedStatus = params.get('status');
const requestedGame = params.get('game');

if (requestedGame) {
  const gameElement = document.getElementById('current-game');
  if (gameElement) gameElement.textContent = requestedGame;
}
 
if (requestedStatus) {
  if (statusText) statusText.textContent = requestedStatus.replace(/[-_]/g, ' ').toUpperCase();
  if (requestedStatus.includes('frozen') || requestedStatus.includes('offline')) {
    overlay.classList.add('frozen');
    bubbleSystem.freeze();
  }
}

if (params.get('motion') === 'off') {
  overlay.classList.add('reduced-motion');
  if (motionButton) motionButton.textContent = 'Motion Off';
  bubbleSystem.toggle();
}

if (params.get('freeze') === 'on') {
  overlay.classList.add('frozen');
  bubbleSystem.freeze();
  if (freezeButton) freezeButton.textContent = 'Thaw';
}
