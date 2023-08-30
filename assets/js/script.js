
/* * define some selectors, and the memo’s state:  */

const selectors = {
    playGroundContainer: document.querySelector('.playGround-container'),
    playGround: document.querySelector('.playGround'),
    clock: document.querySelector('.clock'),
    trials: document.querySelector('.trials'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
};

/** flickedSymbol is used to keep track of the number of flickes of the cards. Only two cards can be flipped at a time. If the symbols tha are flicked are a match, they will bekept symbols up. If it’s a mismatch, they will be flicked back.
totalFlicks and totalClock will keep track of the total number of tries and the elapsed time since the game started, respectively. */

const state = {
    memoStarted: false,
    flickedSymbols: 0,
    totalFlicks: 0,
    totalClock: 0,
    loop: null
};


/** Creating the Memo PlayGround based on the data-dimension attribute. using DOMParser and PickRandom  and shuffel functions  */

/** using Fisher-Yates shuffling algorithm  */

const shuffle = array => {
    const clonedArray = [...array];

    for (let index = clonedArray.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        const original = clonedArray[index];

        clonedArray[index] = clonedArray[randomIndex];
        clonedArray[randomIndex] = original;
    }

    return clonedArray;
};

const pickRandom = (array, items) => {
    const clonedArray = [...array];
    const randomPicks = [];

    for (let index = 0; index < items; index++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length);

        randomPicks.push(clonedArray[randomIndex]);
        clonedArray.splice(randomIndex, 1);
    }

    return randomPicks;
};



const generateMemo = () => {
    const dimensions = selectors.playGround.getAttribute('data-dimension');

    if (dimensions % 2 !== 0) {
        throw new Error("The dimension of the pley ground must be an even number.");
    }

    const animals = ['🐹', '🐩', '🐥', '🐠', '🐌', '🐋', '🐷', '🐢', '🐍', '🐨', '🐓', '🐧', '🐼', '🐑', '🐦', '🐻', '🦎', '🐐', '🦍', '🦁', '🐭', '🐗', '🐜', '🦅', '🦜', '🦝', '🦢', '🦫', '🦉', '🐴', '🐮'];
    const picks = pickRandom(animals, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);
    const symbols = `
        <div class="playGround" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="symbol">
                    <div class="symbol-front"></div>
                    <div class="symbol-back">${item}</div>
                </div>
            `).join('')}
       </div>
    `;

    const parser = new DOMParser().parseFromString(symbols, 'text/html');

    selectors.playGround.replaceWith(parser.querySelector('.playGround'));
};

/** function to start the Memo game  */

const startMemo = () => {
    state.memoStarted = true;
    selectors.start.classList.add('disabled');

    state.loop = setInterval(() => {
        state.totalClock++;

        selectors.trials.innerText = `${state.totalFlicks} moves`;
        selectors.clock.innerText = `time: ${state.totalClock} sec`;
    }, 1000);
};

/**function to flick the symbols */
const flickBackSymbol = () => {
    document.querySelectorAll('.symbol:not(.matched)').forEach(symbol => {
        symbol.classList.remove('flicked');
    });

    state.flickedSymbols = 0;
};

const flickSymbol = symbol => {
    state.flickedSymbols++;
    state.totalFlicks++;

    if (!state.memoStarted) {
        startMemo();
    }

    if (state.flickedSymbols <= 2) {
        symbol.classList.add('flicked');
    }

    if (state.flickedSymbols === 2) {
        const flickedSymbols = document.querySelectorAll('.flicked:not(.matched)');

        if (flickedSymbols[0].innerText === flickedSymbols[1].innerText) {
            flickedSymbols[0].classList.add('matched');
            flickedSymbols[1].classList.add('matched');
        }

        setTimeout(() => {
            flickBackSymbol();
        }, 1000);
    }

    /**  If there are no more symbols that we can flicked, we won the Memory Game */
    
    if (!document.querySelectorAll('.symbol:not(.flicked)').length) {
        setTimeout(() => {
            selectors.playGroundContainer.classList.add('flicked');
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    with <span class="highlight">${state.totalFlicks}</span> moves<br />
                    under <span class="highlight">${state.totalClock}</span> seconds
                </span>
            `;

            clearInterval(state.loop);
        }, 1000);
    }
};


/** Event Listeners for the cards holding symbols and the start button  */
const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target;
        const eventParent = eventTarget.parentElement;

        if (eventTarget.className.includes('symbol') && !eventParent.className.includes('flicked')) {
            flickSymbol(eventParent);
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startMemo();
        }
    });
};
;

generateMemo();
attachEventListeners();