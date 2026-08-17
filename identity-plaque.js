// Get URL parameters for game title and frozen state
const urlParams = new URLSearchParams(window.location.search);
const requestedGame = urlParams.get('game');
const isFrozen = urlParams.get('frozen') === 'true';

// Game name management
const gameElement = document.getElementById('current-game');

// Load saved game from localStorage first
const savedGame = localStorage.getItem('identityPlaqueGame');

// Set current game title (priority: URL parameter > localStorage > default)
if (requestedGame) {
  gameElement.textContent = requestedGame;
  localStorage.setItem('identityPlaqueGame', requestedGame);
} else if (savedGame) {
  gameElement.textContent = savedGame;
}

// Set frozen state from URL parameter
if (isFrozen) {
  const plaque = document.querySelector('.identity-plaque');
  if (plaque) {
    plaque.classList.add('frozen');
  }
}

// Edit indicator - shows on hover and auto-hides
const editIndicator = document.getElementById('editIndicator');
let mouseTimer;

// Show edit indicator on mouse movement, hide after inactivity
document.addEventListener('mousemove', () => {
  editIndicator.classList.add('visible');
  clearTimeout(mouseTimer);
  mouseTimer = setTimeout(() => {
    editIndicator.classList.remove('visible');
  }, 3000);
});

// Keyboard shortcut to change game name (press 'G')
document.addEventListener('keydown', (e) => {
  // Check if 'G' key is pressed and not in an input field
  if (e.key === 'g' || e.key === 'G') {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      changeGameName();
    }
  }
  
  // Permanently hide edit indicator with 'H' key
  if (e.key === 'h' || e.key === 'H') {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      editIndicator.style.display = 'none';
    }
  }
});

function changeGameName() {
  const currentGame = gameElement.textContent;
  const newGame = prompt('Enter the game you are currently playing:', currentGame);
  
  if (newGame !== null && newGame.trim() !== '') {
    gameElement.textContent = newGame.trim();
    localStorage.setItem('identityPlaqueGame', newGame.trim());
    
    // Visual feedback - flash the element
    gameElement.style.transition = 'opacity 0.3s ease';
    gameElement.style.opacity = '0.5';
    setTimeout(() => {
      gameElement.style.opacity = '1';
    }, 300);
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
    console.error('Error fetching Twitch game:', error);
  }
}
*/