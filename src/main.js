import {Resource} from "./resources.js"

const gameState = {
    gameDate: {
        tickDate: 0
    },

    resources: {},

    addTick() {
        this.gameDate.tickDate += 1
        for (const resource in this.resources) {
            this.resources[resource].addTick()
        }
    }
}

// HTML related constants
const tickButton = document.querySelector('#tickButton')
tickButton.addEventListener('click', gameTick)

const forageButton = document.querySelector('#forageButton')
forageButton.addEventListener('click', () => {gameState.resources.food.current += 1})

const huntButton = document.querySelector('#huntButton')
huntButton.addEventListener('click', goForHunt)


// Functions
function startGame() {
    gameState.resources.food = new Resource('Food', 1000, 0.25, "food")
    gameState.resources.population = new Resource('Population', 150, 0.01, "population")
    gameState.resources.population.current = 10
}


function renderUI() {
    for (const resource in gameState.resources) {
        gameState.resources[resource].display.id.innerHTML = gameState.resources[resource].display.string
    }
}


function gameTick() {
    gameState.addTick()
    renderUI()
}


let isHuntTimerOver = true  // TODO: less ugly
function goForHunt() {
    if (!isHuntTimerOver) { 
        return
    }

    //Disable the hunt button, show the timer
    huntButton.setAttribute('disabled', 'disabled')
    isHuntTimerOver = false
    let huntTimerDisplay = {
        value: 10, 
        id: document.querySelector('#huntTimer')
    }
    huntTimerDisplay.id.innerHTML = huntTimerDisplay.value

    let huntTimerCountDown = setInterval(() => {
        huntTimerDisplay.value -= 1
        huntTimerDisplay.id.innerHTML = huntTimerDisplay.value
    }, 1000)
    
    console.log('The tribe is going out for a hunt.')

    let huntTimer = setTimeout(() => {  // Set a 10 sec timer
        // Re-enable the button, clear the timer
        isHuntTimerOver = true
        huntTimerDisplay.id.innerHTML = ""
        clearInterval(huntTimerCountDown)
        huntButton.removeAttribute('disabled')

        // Hunt yields
        let huntYield = 10 + Math.round((Math.random() * 20))
        gameState.resources.food.current += huntYield
        console.log(`The hunt yielded ${huntYield} food.`)  // TODO: Make this visible to the user.  
    }, 10000)
}


// Game start
let gameInterval = setInterval(gameTick, 100)

// First start
if (true) {  // TODO: true only if local storage exists
    startGame()
}

// Subsequent starts



export {gameState}