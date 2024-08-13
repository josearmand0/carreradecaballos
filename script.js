const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const horses = [];
const trackLength = 8;
let deckCards = [];
let raceInterval;

function showInitialModal() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalAction = document.getElementById('modalAction');

    modalTitle.textContent = 'Bienvenido a la Carrera de Caballos';
    modalMessage.textContent = 'Presiona "Iniciar Carrera" para comenzar.';
    modalAction.textContent = 'Iniciar Carrera';
    modalAction.onclick = initializeGame;

    modal.style.display = 'block';
}

function initializeGame() {
    closeModal();
    const horsesContainer = document.getElementById('horses');
    const tracksContainer = document.getElementById('tracks');
    horsesContainer.innerHTML = '';
    tracksContainer.innerHTML = '';

    horses.length = 0; // Limpiar el array de caballos

    suits.forEach(suit => {
        const horseTrack = document.createElement('div');
        horseTrack.className = 'horse-track';

        const horseCard = document.createElement('div');
        horseCard.className = 'horse';
        horseCard.style.backgroundImage = `url(https://deckofcardsapi.com/static/img/A${suit.charAt(0).toUpperCase()}.png)`;
        horseTrack.appendChild(horseCard);

        const track = document.createElement('div');
        track.className = 'track';
        for (let i = 0; i < trackLength; i++) {
            const trackCard = document.createElement('div');
            trackCard.className = 'track-card';
            track.appendChild(trackCard);
        }
        horseTrack.appendChild(track);

        horsesContainer.appendChild(horseTrack);
        horses.push({ suit: suit, position: 0 });
    });

    initializeDeck();
    initializeHorsePositions();
    document.getElementById('game-container').style.display = 'flex';

    startRace();
}

function initializeDeck() {
    deckCards = [];
    for (let i = 2; i <= 10; i++) {
        suits.forEach(suit => deckCards.push({ value: i, suit: suit }));
    }
    ['J', 'Q', 'K'].forEach(face => {
        suits.forEach(suit => deckCards.push({ value: face, suit: suit }));
    });
}

function initializeHorsePositions() {
    horses.forEach((horse, index) => {
        const horseElement = document.querySelectorAll('.horse')[index];
        horseElement.style.top = '0px';
        horseElement.style.left = '0px';
    });
}

function shuffleDeck() {
    for (let i = deckCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckCards[i], deckCards[j]] = [deckCards[j], deckCards[i]];
    }
    // Aplicar un segundo barajado para mayor aleatoriedad
    for (let i = deckCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckCards[i], deckCards[j]] = [deckCards[j], deckCards[i]];
    }
    // Cortar el mazo en una posición aleatoria
    const cutPoint = Math.floor(Math.random() * deckCards.length);
    deckCards = [...deckCards.slice(cutPoint), ...deckCards.slice(0, cutPoint)];
}

function startRace() {
    if (raceInterval) {
        clearInterval(raceInterval);
    }

    shuffleDeck();
    const drawnCardsContainer = document.getElementById('drawn-cards');
    drawnCardsContainer.innerHTML = '';
    horses.forEach(horse => horse.position = 0);
    updateHorsePositions();
    
    raceInterval = setInterval(() => {
        if (deckCards.length === 0) {
            clearInterval(raceInterval);
            endRace();
            return;
        }

        const card = deckCards.pop();
        const horse = horses.find(h => h.suit === card.suit);

        const drawnCard = document.createElement('div');
        drawnCard.className = 'drawn-card';
        if (card.value === 10) {
            drawnCard.style.backgroundImage = `url(https://deckofcardsapi.com/static/img/0${card.suit.charAt(0).toUpperCase()}.png)`;
        } else {
            drawnCard.style.backgroundImage = `url(https://deckofcardsapi.com/static/img/${card.value}${card.suit.charAt(0).toUpperCase()}.png)`;
        }
        drawnCardsContainer.prepend(drawnCard);

        if (['J', 'Q', 'K'].includes(card.value)) {
            if (horse.position > 0) horse.position--;
        } else {
            horse.position++;
        }

        updateHorsePositions();
        removePassedCards();

        if (horse.position >= trackLength - 1) {
            clearInterval(raceInterval);
            endRace(horse);
        }
    }, 1000);
}

function updateHorsePositions() {
    horses.forEach((horse, index) => {
        const horseElement = document.querySelectorAll('.horse')[index];
        horseElement.style.top = `${horse.position * 100}px`;
    });
}

function removePassedCards() {
    const drawnCards = document.querySelectorAll('.drawn-card');
    const lowestPosition = Math.min(...horses.map(h => h.position));
    
    if (drawnCards.length > trackLength - lowestPosition) {
        for (let i = drawnCards.length - 1; i >= trackLength - lowestPosition; i--) {
            drawnCards[i].remove();
        }
    }
}

function endRace(winner) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalAction = document.getElementById('modalAction');

    modalTitle.textContent = '¡Fin de la carrera!';
    if (winner) {
        modalMessage.textContent = `¡El caballo de ${winner.suit} ha ganado la carrera!`;
    } else {
        modalMessage.textContent = '¡La carrera ha terminado sin un ganador!';
    }

    modalAction.textContent = 'Reiniciar Carrera';
    modalAction.onclick = restartGame;

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function restartGame() {
    closeModal();
    initializeGame();
}

document.addEventListener('DOMContentLoaded', showInitialModal);
