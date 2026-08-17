// Get URL parameters for game title and frozen state
const urlParams = new URLSearchParams(window.location.search);
const requestedGame = urlParams.get('game');
const isFrozen = urlParams.get('frozen') === 'true';

// Set current game title from URL parameter
if (requestedGame) {
  const gameElement = document.getElementById('current-game');
  if (gameElement) {
    gameElement.textContent = requestedGame;
  }
}

// Set frozen state from URL parameter
if (isFrozen) {
  const plaque = document.querySelector('.identity-plaque');
  if (plaque) {
    plaque.classList.add('frozen');
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