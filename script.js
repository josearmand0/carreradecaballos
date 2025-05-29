const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const horses = [];
const trackLength = 8;
let deckCards = [];
let raceInterval;
let players = [];
const MAX_PLAYERS = 4; // Corresponds to the number of suits
const spanishSuits = ['Corazones', 'Diamantes', 'Tréboles', 'Picas'];
const MAX_DRAWN_CARDS_TO_SHOW = 7; // Máximo de cartas a mantener en el DOM

function showInitialModal() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalAction = document.getElementById('modalAction');
    const modalContent = modal.querySelector('.modal-content');

    document.getElementById('game-container').classList.add('modal-active-background');
    // Clear previous dynamic content like player inputs
    const existingPlayerInputsContainer = document.getElementById('player-inputs-container');
    if (existingPlayerInputsContainer) {
        existingPlayerInputsContainer.remove();
    }

    modalTitle.textContent = 'Registro de Jugadores';
    modalMessage.textContent = `Introduce los nombres de los jugadores (hasta ${MAX_PLAYERS}).`;

    const playerInputsContainer = document.createElement('div');
    playerInputsContainer.id = 'player-inputs-container';
    playerInputsContainer.style.marginTop = '15px';
    playerInputsContainer.style.marginBottom = '15px';

    for (let i = 0; i < MAX_PLAYERS; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Nombre Jugador ${i + 1} (${spanishSuits[i]})`;
        input.id = `player-name-${i}`;
        input.style.display = 'block';
        input.style.margin = '5px auto';
        input.style.padding = '8px';
        input.style.width = '80%';
        input.style.boxSizing = 'border-box';
        playerInputsContainer.appendChild(input);
    }

    const modalButtons = modalContent.querySelector('.modal-buttons');
    modalContent.insertBefore(playerInputsContainer, modalButtons);

    modalAction.textContent = 'Continuar';
    modalAction.onclick = processPlayerInputsAndStart;

    modal.style.display = 'block';
}

function processPlayerInputsAndStart() {
    players = [];
    for (let i = 0; i < MAX_PLAYERS; i++) {
        const inputElement = document.getElementById(`player-name-${i}`);
        if (inputElement && inputElement.value.trim() !== '') {
            players.push(inputElement.value.trim());
        } else {
            players.push(null); // Keep placeholder for unassigned players
        }
    }
    closeModal();
    initializeGame();
}

function initializeGame() {
    const horsesContainer = document.getElementById('horses');
    horsesContainer.innerHTML = '';

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
    // Ajustar tamaños dinámicos después de que todo esté en el DOM
    adjustDynamicElementSizes();
    window.addEventListener('resize', () => {
        adjustDynamicElementSizes();
        updateHorsePositions(); // Asegurar que los caballos se reposicionen con nuevos tamaños
    });
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
        horseElement.style.left = '0px'; // Aunque left no se usa para el movimiento vertical, es bueno inicializarlo.
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
    drawnCardsContainer.innerHTML = ''; // Limpiar cartas sacadas anteriormente
    horses.forEach(horse => horse.position = 0);
    updateHorsePositions();
    
    raceInterval = setInterval(() => {
        if (deckCards.length === 0) {
            clearInterval(raceInterval);
            endRace(); // No winner if deck runs out
            return;
        }

        const card = deckCards.pop();
        const horse = horses.find(h => h.suit === card.suit);

        const drawnCard = document.createElement('div');
        drawnCard.className = 'drawn-card';
        // Ajuste para la carta 10 que usa '0' en la API
        if (card.value === 10) {
            drawnCard.style.backgroundImage = `url(https://deckofcardsapi.com/static/img/0${card.suit.charAt(0).toUpperCase()}.png)`;
        } else {
            drawnCard.style.backgroundImage = `url(https://deckofcardsapi.com/static/img/${card.value}${card.suit.charAt(0).toUpperCase()}.png)`;
        }
        drawnCardsContainer.prepend(drawnCard); // Añadir al principio para que las nuevas aparezcan arriba

        if (['J', 'Q', 'K'].includes(card.value)) {
            if (horse.position > 0) horse.position--; // Retrocede una casilla
        } else {
            horse.position++; // Avanza una casilla
        }

        updateHorsePositions();
        removePassedCards();

        if (horse.position >= trackLength -1) { // -1 porque la posición es 0-indexed
            clearInterval(raceInterval);
            endRace(horse);
        }
    }, 1500); // Reduced speed from 1000ms to 1500ms
}

function getStepHeight() {
    const firstTrackCard = document.querySelector('.track-card');
    if (!firstTrackCard) return 115; // Fallback al valor anterior si no se encuentra la carta

    const style = window.getComputedStyle(firstTrackCard);
    const marginTop = parseFloat(style.marginTop);
    const marginBottom = parseFloat(style.marginBottom);
    // offsetHeight incluye altura, padding, borde.
    // Si .track-card tiene box-sizing: border-box, su height CSS ya incluye padding y borde.
    // Por lo tanto, offsetHeight es una buena medida de la altura visible.
    const height = firstTrackCard.offsetHeight;
    return height + marginTop + marginBottom; // Altura total del slot de la carta
}

function updateHorsePositions() {
    const stepHeight = getStepHeight(); // Obtener la altura del paso dinámicamente
    horses.forEach((horse, index) => {
        const horseElement = document.querySelectorAll('.horse')[index];
        horseElement.style.top = `${(horse.position * stepHeight) + 1}px`; // Baja 1 pixel
    });
}

function removePassedCards() {
    const drawnCardsContainer = document.getElementById('drawn-cards');
    const drawnCardElements = drawnCardsContainer.children; // HTMLCollection, live

    // Mantener solo las últimas MAX_DRAWN_CARDS_TO_SHOW cartas
    while (drawnCardElements.length > MAX_DRAWN_CARDS_TO_SHOW) {
        // El último hijo es el más viejo porque usamos prepend para añadir nuevas cartas
        drawnCardsContainer.removeChild(drawnCardsContainer.lastChild);
    }
}

function endRace(winner) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalAction = document.getElementById('modalAction');

    document.getElementById('game-container').classList.add('modal-active-background');
    modalTitle.textContent = '¡Fin de la carrera!';
    if (winner) {
        const winnerSuitIndex = suits.indexOf(winner.suit);
        let winnerNameDisplay = `El caballo de ${getSpanishSuitName(winner.suit)}`; // Default message con palo en español
        if (players[winnerSuitIndex] && players[winnerSuitIndex].trim() !== '') { // Check if a player name exists and is not just whitespace
            winnerNameDisplay = `¡El jugador ${players[winnerSuitIndex]} (Caballo de ${getSpanishSuitName(winner.suit)})`;
        }
        modalMessage.textContent = `${winnerNameDisplay} ha ganado la carrera!`;
    } else {
        modalMessage.textContent = '¡La carrera ha terminado sin un ganador claro o se acabaron las cartas!';
    }

    modalAction.textContent = 'Reiniciar Carrera';
    modalAction.onclick = restartGame;

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('modal');
    document.getElementById('game-container').classList.remove('modal-active-background');
    // Clean up player inputs from modal DOM to prevent duplication if modal is reshown
    // Limpiar los inputs de jugador del DOM del modal
    const playerInputsContainer = document.getElementById('player-inputs-container');
    if (playerInputsContainer) {
        playerInputsContainer.remove();
    }
    modal.style.display = 'none';
}

function restartGame() {
    // Vuelve a mostrar el modal inicial para ingresar nombres o iniciar.
    showInitialModal();
 }
 
 function adjustDynamicElementSizes() {
    const firstTrackCard = document.querySelector('.track-card');
    if (!firstTrackCard) return;

    const cardHeight = firstTrackCard.offsetHeight; // Altura real de la track-card
    // const cardWidth = firstTrackCard.offsetWidth; // Ancho real si también fuera dinámico

    const horseElements = document.querySelectorAll('.horse');
    horseElements.forEach(horseEl => {
        horseEl.style.height = `${cardHeight}px`;
        // Mantener el ancho fijo del caballo o ajustarlo si el de track-card también es dinámico
        // horseEl.style.width = `${cardWidth}px`; // Si el ancho de .horse debe coincidir con .track-card
    });
}

function getSpanishSuitName(englishSuit) {
    const suitMap = {
        'hearts': 'Corazones',
        'diamonds': 'Diamantes',
        'clubs': 'Tréboles',
        'spades': 'Picas'
    };
    return suitMap[englishSuit] || englishSuit;
}

 document.addEventListener('DOMContentLoaded', showInitialModal);