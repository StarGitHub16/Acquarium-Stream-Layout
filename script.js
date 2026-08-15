const overlay = document.querySelector('.overlay');
const statusText = document.querySelector('#statusText');
const motionButton = document.querySelector('#toggleMotion');
const freezeButton = document.querySelector('#toggleFreeze');

// Bubble system for underwater effect
class BubbleSystem {
  constructor(container, maxBubbles = 50) {
    this.container = container;
    this.maxBubbles = maxBubbles;
    this.thawingMaxBubbles = 100; // Reduced for performance
    this.bubbles = [];
    this.iceCrystals = [];
    this.gameplayFrame = document.querySelector('.gameplay-frame');
    this.isRunning = true;
    this.isFrozen = false;
    this.isThawing = false;
    
    this.init();
  }

  init() {
    for (let i = 0; i < this.maxBubbles; i++) {
      this.createBubble();
    }
    this.animate();
  }

  createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    // Random properties
    const size = Math.random() * 8 + 3; // 3-11px
    const startX = Math.random() * 100;
    const startY = Math.random() * 100 + 110; // Start below viewport (110-210%)
    const opacity = Math.random() * 0.4 + 0.1;
    const speed = Math.random() * 0.8 + 0.2; // Rising speed
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
      box-shadow: 0 0 ${size/2}px rgba(0, 229, 255, 0.3), inset 0 0 ${size/3}px rgba(255, 255, 255, 0.5);
      transition: opacity 1s ease-in-out;
    `;
    
    this.container.appendChild(bubble);
    
    this.bubbles.push({
      element: bubble,
      x: startX,
      y: startY,
      speed: speed,
      size: size,
      wobble: wobble,
      wobbleSpeed: wobbleSpeed,
      originalOpacity: opacity
    });
  }

  createIceCrystal() {
    const crystal = document.createElement('div');
    crystal.className = 'ice-crystal';
    
    // Random properties
    const size = Math.random() * 6 + 2; // 2-8px
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
    
    this.iceCrystals.push({
      element: crystal,
      x: startX,
      y: startY,
      size: size,
      rotation: rotation,
      targetOpacity: opacity,
      currentOpacity: 0
    });
  }

  freeze() {
    this.isFrozen = true;
    
    // Hide bubbles
    this.bubbles.forEach(bubble => {
      bubble.element.style.opacity = '0';
    });
    
    // Create and show ice crystals
    if (this.iceCrystals.length === 0) {
      for (let i = 0; i < this.maxBubbles; i++) {
        this.createIceCrystal();
      }
    }
    
    setTimeout(() => {
      this.iceCrystals.forEach(crystal => {
        crystal.element.style.opacity = crystal.targetOpacity;
        crystal.currentOpacity = crystal.targetOpacity;
      });
    }, 500);
  }

  unfreeze() {
    this.isFrozen = false;
    
    // Show bubbles
    this.bubbles.forEach(bubble => {
      bubble.element.style.opacity = bubble.originalOpacity;
    });
    
    // Hide ice crystals
    this.iceCrystals.forEach(crystal => {
      crystal.element.style.opacity = '0';
      crystal.currentOpacity = 0;
    });
  }

  setThawing(thawing) {
    this.isThawing = thawing;
    
    if (thawing) {
      // Add more bubbles for thawing effect
      const additionalBubbles = this.thawingMaxBubbles - this.bubbles.length;
      for (let i = 0; i < additionalBubbles; i++) {
        this.createBubble();
      }
      
      // Increase bubble speed and activity
      this.bubbles.forEach(bubble => {
        bubble.speed *= 1.5;
        bubble.wobbleSpeed *= 1.3;
        // Spawn bubbles more frequently from bottom
        if (bubble.y > 100) {
          bubble.y = Math.random() * 30 + 110; // Closer to bottom
        }
      });
    } else {
      // Remove extra bubbles
      while (this.bubbles.length > this.maxBubbles) {
        const bubble = this.bubbles.pop();
        bubble.element.remove();
      }
      
      // Reset bubble speed
      this.bubbles.forEach(bubble => {
        bubble.speed /= 1.5;
        bubble.wobbleSpeed /= 1.3;
      });
    }
  }

  isInsideGameplayFrame(x, y) {
    if (!this.gameplayFrame) return false;
    
    const frameRect = this.gameplayFrame.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const pixelX = (x / 100) * viewportWidth;
    const pixelY = (y / 100) * viewportHeight;
    
    const padding = 30;
    
    return pixelX >= frameRect.left - padding && 
           pixelX <= frameRect.right + padding &&
           pixelY >= frameRect.top - padding && 
           pixelY <= frameRect.bottom + padding;
  }

  animate() {
    if (!this.isRunning) return;
    
    // Animate bubbles when not frozen
    if (!this.isFrozen) {
      // Batch DOM updates for better performance
      const updates = [];
      
      this.bubbles.forEach(bubble => {
        // Update position (rising up)
        bubble.y -= bubble.speed * 0.1; // Scale speed for percentage
        bubble.wobble += bubble.wobbleSpeed;
        bubble.x += Math.sin(bubble.wobble) * 0.03;
        
        // Check if inside gameplay frame
        if (this.isInsideGameplayFrame(bubble.x, bubble.y)) {
          const frameCenter = 50;
          const direction = bubble.x < frameCenter ? -1 : 1;
          bubble.x += direction * 0.3;
        }
        
        // Wrap around edges
        if (bubble.x < 0) bubble.x = 100;
        if (bubble.x > 100) bubble.x = 0;
        
        // Reset if above viewport
        if (bubble.y < -10) {
          bubble.y = Math.random() * 50 + 110;
          bubble.x = Math.random() * 100;
        }
        
        // Queue DOM updates
        updates.push({ element: bubble.element, x: bubble.x, y: bubble.y });
      });
      
      // Apply all DOM updates at once
      updates.forEach(update => {
        update.element.style.left = `${update.x}%`;
        update.element.style.top = `${update.y}%`;
      });
    }
    
    // Animate ice crystals when frozen (subtle floating)
    if (this.isFrozen) {
      const crystalUpdates = [];
      
      this.iceCrystals.forEach((crystal, index) => {
        crystal.y += Math.sin(Date.now() * 0.001 + index) * 0.02;
        crystal.rotation += 0.01;
        
        // Keep within bounds
        if (crystal.y < 0) crystal.y = 100;
        if (crystal.y > 100) crystal.y = 0;
        
        crystalUpdates.push({ 
          element: crystal.element, 
          x: crystal.x, 
          y: crystal.y, 
          rotation: crystal.rotation 
        });
      });
      
      // Apply crystal updates
      crystalUpdates.forEach(update => {
        update.element.style.left = `${update.x}%`;
        update.element.style.top = `${update.y}%`;
        update.element.style.transform = `rotate(${update.rotation}deg)`;
      });
    }
    
    requestAnimationFrame(() => this.animate());
  }

  toggle() {
    this.isRunning = !this.isRunning;
    if (this.isRunning) {
      this.animate();
    }
  }

  setLive(live) {
    this.isLive = live;
    
    if (live) {
      // Add more fish during live state
      const additionalFish = this.liveMaxFish - this.fish.length;
      for (let i = 0; i < additionalFish; i++) {
        this.createFish();
      }
      
      // Make fish more visible during live
      this.fish.forEach(fish => {
        fish.element.style.opacity = '0.9';
        fish.element.style.filter = 'brightness(1.2)';
      });
    } else {
      // Remove extra fish
      while (this.fish.length > this.maxFish) {
        const fish = this.fish.pop();
        fish.element.remove();
      }
      
      // Reset fish visibility
      this.fish.forEach(fish => {
        fish.element.style.opacity = '0.8';
        fish.element.style.filter = 'brightness(1)';
      });
    }
  }
}

// Initialize bubble system
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
    this.liveMaxFish = 15; // More fish during live state
    this.fish = [];
    this.gameplayFrame = document.querySelector('.gameplay-frame');
    this.isRunning = true;
    this.isLive = false;
    
    this.init();
  }

  init() {
    for (let i = 0; i < this.maxFish; i++) {
      this.createFish();
    }
    this.animate();
  }

  createFish() {
    const fish = document.createElement('div');
    fish.className = 'fish';
    
    // Random properties
    const size = Math.random() * 15 + 8; // 8-23px
    const startY = Math.random() * 80 + 10; // 10-90% vertical position
    const speed = Math.random() * 0.3 + 0.1; // Swimming speed
    const direction = Math.random() > 0.5 ? 1 : -1; // Left or right
    const startX = direction === 1 ? -50 : window.innerWidth + 50;
    const fishType = Math.floor(Math.random() * 3); // Different fish types
    
    const colors = [
      'rgba(255, 255, 255, 0.8)',  // White
      'rgba(255, 167, 38, 0.7)',  // Orange
      'rgba(13, 71, 161, 0.7)'   // Dark blue
    ];
    
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
      box-shadow: 0 0 ${size/2}px rgba(0, 229, 255, 0.3);
      transform: scaleX(${direction});
      transition: opacity 2s ease-in-out;
    `;
    
    // Add tail
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
    
    this.fish.push({
      element: fish,
      x: startX,
      y: startY,
      speed: speed * direction,
      size: size,
      direction: direction,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.05 + 0.02
    });
  }

  isInsideGameplayFrame(x, y) {
    if (!this.gameplayFrame) return false;
    
    const frameRect = this.gameplayFrame.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const pixelX = x;
    const pixelY = (y / 100) * viewportHeight;
    
    const padding = 50;
    
    return pixelX >= frameRect.left - padding && 
           pixelX <= frameRect.right + padding &&
           pixelY >= frameRect.top - padding && 
           pixelY <= frameRect.bottom + padding;
  }

  animate() {
    if (!this.isRunning) return;
    
    const viewportWidth = window.innerWidth;
    
    this.fish.forEach(fish => {
      // Update position
      fish.x += fish.speed;
      fish.wobble += fish.wobbleSpeed;
      fish.y += Math.sin(fish.wobble) * 0.05;
      
      // Check if inside gameplay frame
      if (this.isInsideGameplayFrame(fish.x, fish.y)) {
        // Slight avoidance
        fish.y += (fish.y > 50) ? 0.1 : -0.1;
      }
      
      // Reset if off screen
      if (fish.direction === 1 && fish.x > viewportWidth + 50) {
        fish.x = -50;
        fish.y = Math.random() * 80 + 10;
      } else if (fish.direction === -1 && fish.x < -50) {
        fish.x = viewportWidth + 50;
        fish.y = Math.random() * 80 + 10;
      }
      
      // Keep within vertical bounds
      if (fish.y < 5) fish.y = 5;
      if (fish.y > 95) fish.y = 95;
      
      // Apply position
      fish.element.style.left = `${fish.x}px`;
      fish.element.style.top = `${fish.y}%`;
    });
    
    requestAnimationFrame(() => this.animate());
  }

  toggle() {
    this.isRunning = !this.isRunning;
    if (this.isRunning) {
      this.animate();
    }
  }

  setLive(live) {
    this.isLive = live;
    
    if (live) {
      // Add more fish during live state
      const additionalFish = this.liveMaxFish - this.fish.length;
      for (let i = 0; i < additionalFish; i++) {
        this.createFish();
      }
      
      // Make fish more visible during live
      this.fish.forEach(fish => {
        fish.element.style.opacity = '0.9';
        fish.element.style.filter = 'brightness(1.2)';
      });
    } else {
      // Remove extra fish
      while (this.fish.length > this.maxFish) {
        const fish = this.fish.pop();
        fish.element.remove();
      }
      
      // Reset fish visibility
      this.fish.forEach(fish => {
        fish.element.style.opacity = '0.8';
        fish.element.style.filter = 'brightness(1)';
      });
    }
  }
}

// Initialize fish system
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
    // Create bubble container
    this.bubbleContainer = document.createElement('div');
    this.bubbleContainer.className = 'bottom-bubble-container';
    this.bubbleContainer.setAttribute('aria-hidden', 'true');
    this.container.appendChild(this.bubbleContainer);
  }

  start() {
    this.isRunning = true;
    
    // Create all bubbles at once for dramatic effect
    while (this.bubbles.length < this.maxBubbles) {
      this.createBottomBubble();
    }
    
    // Make all bubbles visible
    this.bubbles.forEach(bubble => {
      bubble.element.style.opacity = bubble.originalOpacity;
    });
    
    this.animate();
  }

  stop() {
    this.isRunning = false;
    
    // Hide all bubbles
    this.bubbles.forEach(bubble => {
      bubble.element.style.opacity = '0';
    });
  }

  createBottomBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bottom-bubble';
    
    // Random properties for bottom border bubbles
    const size = Math.random() * 15 + 8; // 8-23px (much larger)
    const startX = Math.random() * 100;
    const speed = Math.random() * 3 + 1.5; // MUCH faster rising for crazy effect
    const wobble = Math.random() * Math.PI * 2;
    const wobbleSpeed = Math.random() * 0.08 + 0.04; // More wobble
    const opacity = Math.random() * 0.6 + 0.4; // More visible
    const startY = window.innerHeight + Math.random() * 50 + 20; // Start below viewport
    
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
    
    this.bubbles.push({
      element: bubble,
      x: startX,
      y: startY, // Start from below viewport in pixels
      speed: speed,
      size: size,
      wobble: wobble,
      wobbleSpeed: wobbleSpeed,
      originalOpacity: opacity
    });
  }

  animate() {
    if (!this.isRunning) return;
    
    const viewportHeight = window.innerHeight;
    
    // Batch DOM updates for better performance
    const updates = [];
    
    this.bubbles.forEach(bubble => {
      // Update position (rising up CRAZY fast)
      bubble.y -= bubble.speed * 2; // Much faster pixel movement
      bubble.wobble += bubble.wobbleSpeed;
      bubble.x += Math.sin(bubble.wobble) * 0.08;
      
      // Wrap around edges
      if (bubble.x < 0) bubble.x = 100;
      if (bubble.x > 100) bubble.x = 0;
      
      // Reset if above viewport (more frequent for crazy effect)
      if (bubble.y < -50) {
        bubble.y = viewportHeight + Math.random() * 50 + 20;
        bubble.x = Math.random() * 100;
      }
      
      // Queue DOM updates
      updates.push({ element: bubble.element, x: bubble.x, y: bubble.y });
    });
    
    // Apply all DOM updates at once
    updates.forEach(update => {
      update.element.style.left = `${update.x}%`;
      update.element.style.top = `${update.y}px`;
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize bottom bubble system
const bottomBubbleSystem = new BottomBubbleSystem(overlay, 40);

// Chat tank bubble system
class ChatTankBubbleSystem {
  constructor(container) {
    this.container = container.querySelector('.tank-bubbles');
    this.bubbles = [];
    this.isRunning = true;
    
    this.init();
  }

  init() {
    for (let i = 0; i < 8; i++) {
      this.createTankBubble();
    }
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
    
    this.bubbles.push({
      element: bubble,
      x: startX,
      y: -10,
      speed: speed,
      wobble: wobble,
      wobbleSpeed: wobbleSpeed
    });
  }

  animate() {
    if (!this.isRunning) return;
    
    this.bubbles.forEach(bubble => {
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

// Initialize chat tank bubble system
const chatTank = document.querySelector('.chat-tank');
const chatTankBubbleSystem = new ChatTankBubbleSystem(chatTank);

// Existing controls
for (const button of document.querySelectorAll('[data-status]')) {
  button.addEventListener('click', () => {
    statusText.textContent = button.dataset.status;
    
    // Reset all state classes and center messages
    overlay.classList.remove('thawing', 'frozen', 'frigid');
    document.querySelectorAll('.center-message').forEach(msg => msg.classList.remove('active'));
    
    // Handle different status colors and states
    if (button.dataset.status.includes('OPENS SOON')) {
      document.querySelector('.status-dot').style.background = '#4fc3f7';
      overlay.classList.add('thawing');
      bubbleSystem.unfreeze();
      bubbleSystem.setThawing(true);
      bottomBubbleSystem.start();
      fishSystem.setLive(false);
      if (!fishSystem.isRunning) fishSystem.toggle();
      freezeButton.textContent = 'Freeze';
      document.querySelector('.starting-message').classList.add('active');
    } else if (button.dataset.status.includes('COMPLETELY')) {
      document.querySelector('.status-dot').style.background = '#9c27b0';
      overlay.classList.add('frigid');
      bubbleSystem.freeze();
      bubbleSystem.setThawing(false);
      bottomBubbleSystem.stop();
      fishSystem.setLive(false);
      if (fishSystem.isRunning) fishSystem.toggle();
      freezeButton.textContent = 'Thaw';
      document.querySelector('.offline-message').classList.add('active');
    } else if (button.dataset.status.includes('RETURNING') || button.textContent.trim() === 'BRB') {
      document.querySelector('.status-dot').style.background = '#1976d2';
      overlay.classList.add('frozen');
      bubbleSystem.freeze();
      bubbleSystem.setThawing(false);
      bottomBubbleSystem.stop();
      fishSystem.setLive(false);
      if (fishSystem.isRunning) fishSystem.toggle();
      freezeButton.textContent = 'Thaw';
      document.querySelector('.brb-message').classList.add('active');
    } else {
      document.querySelector('.status-dot').style.background = '#00e5ff';
      bubbleSystem.unfreeze();
      bubbleSystem.setThawing(false);
      bottomBubbleSystem.stop();
      fishSystem.setLive(true);
      if (!fishSystem.isRunning) fishSystem.toggle();
      freezeButton.textContent = 'Freeze';
    }
  });
}

motionButton.addEventListener('click', () => {
  overlay.classList.toggle('reduced-motion');
  motionButton.textContent = overlay.classList.contains('reduced-motion') ? 'Motion Off' : 'Motion';
  bubbleSystem.toggle();
  fishSystem.toggle();
});

freezeButton.addEventListener('click', () => {
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

// Set current game title from URL parameter
if (requestedGame) {
  const gameElement = document.getElementById('current-game');
  if (gameElement) {
    gameElement.textContent = requestedGame;
  }
}

// Optional: For real-time Twitch game integration, you can use the Twitch API
// This requires a Twitch Developer account, Client ID, and OAuth token
// Uncomment and configure the function below to fetch real game data:
/*
async function fetchTwitchGame(channelName, clientId, token) {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${channelName}`,
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${token}`
        }
      }
    );
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const gameElement = document.getElementById('current-game');
      if (gameElement) {
        gameElement.textContent = data.data[0].game_name;
      }
    }
  } catch (error) {
    console.error('Failed to fetch Twitch game:', error);
  }
}

// Example usage:
// fetchTwitchGame('your_channel_name', 'your_client_id', 'your_oauth_token');
*/

if (requestedStatus) {
  statusText.textContent = requestedStatus.replace(/[-_]/g, ' ').toUpperCase();
  if (requestedStatus.includes('frozen') || requestedStatus.includes('offline')) {
    overlay.classList.add('frozen');
    bubbleSystem.freeze();
  }
}
if (params.get('motion') === 'off') {
  overlay.classList.add('reduced-motion');
  motionButton.textContent = 'Motion Off';
  bubbleSystem.toggle();
}
if (params.get('freeze') === 'on') {
  overlay.classList.add('frozen');
  bubbleSystem.freeze();
  freezeButton.textContent = 'Thaw';
}
