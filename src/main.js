import * as resourceModule from './resources/resourceModule.js'
import { gameState } from './gameState.js'

// HTML related constants
const forageButton = document.querySelector('#forageButton')
forageButton.addEventListener('click', () => { gameState.resources.food.addToCurrent = 1 })

const huntButton = document.querySelector('#huntButton')
huntButton.addEventListener('click', goForHunt)
const huntTimerDisplay = document.querySelector('#huntTimer')

const gameLog = document.querySelector('#gameLog')
const logArray = []


// UI (non-processes) functions
function writeInGameLog(text) {
    // Adds text element at the beginning of an array, remove last element if array is too big, print the whole array with line breaks in between each element
    logArray.unshift(text)
    logArray.splice(10, 1)
    gameLog.innerHTML = logArray.join('<br>')
}


// Timer functions
function addToTimers(delay, functionString) {
    const executionDate = gameState.gameDate.currentTickDate + delay
    if (executionDate in gameState.timers) {
        gameState.timers[executionDate].push(functionString)
    } else {
        gameState.timers[executionDate] = [functionString]
    }
}


const timedFunctions = {
    checkHuntTimer() {
        if (gameState.timerData.huntCountDown > 1) {
            if (!('disabled' in huntButton.attributes)) {
                huntButton.setAttribute('disabled', 'disabled')
            }
            gameState.timerData.huntCountDown -= 1
            addToTimers(10, 'checkHuntTimer')
            huntTimerDisplay.innerHTML = gameState.timerData.huntCountDown
        } else {
            gameState.timerData.huntCountDown -= 1

            const huntYield = 10 + Math.round(Math.random() * 20)
            gameState.resources.food.addToCurrent = huntYield

            writeInGameLog(`The hunt yielded ${huntYield} food.`)
            huntTimerDisplay.innerHTML = ''
            huntButton.removeAttribute('disabled')
        }
    }
}


function goForHunt() {
    writeInGameLog('The tribe is going out for a hunt.')

    gameState.timerData.huntCountDown = 10 // timerFunctions.checkHuntTimer.execute() decrements this value by one every 10 ticks
    huntButton.setAttribute('disabled', 'disabled')
    huntTimerDisplay.innerHTML = gameState.timerData.huntCountDown

    addToTimers(10, 'checkHuntTimer')
}


// Global functions / Meta functions / Game State functions
function startGame() {
    gameState.resources.food = new resourceModule.Food()
    gameState.resources.population = new resourceModule.Population()
}


function loadGame(savedGameState = JSON.parse(window.localStorage.getItem('gameState'))) {
    for (const propertyKey in savedGameState) {
        gameState[propertyKey] = savedGameState[propertyKey]
    }
    for (const resourceKey in savedGameState.resources) {
        const savedResource = savedGameState.resources[resourceKey]
        gameState.resources[resourceKey] = new resourceModule[savedResource.name]()
        gameState.resources[resourceKey].fromSavedState = savedResource
    }

    // how loading resources should work so that it's automatic:
    // each resource's .name is the same as its class key.
    // that means
}


function saveGame() {
    window.localStorage.setItem('gameState', JSON.stringify(gameState))
}


// Game process functions (i.e. all the functions that are used every tick)
function processGrowth() {
    gameState.gameDate.currentTickDate += 1
    for (const resource in gameState.resources) {
        gameState.resources[resource].processGrowth()
    }
}


function checkTimers() {
    try {
        const currentDate = gameState.gameDate.currentTickDate
        if (currentDate in gameState.timers) {
            console.log(currentDate + ': ' + gameState.timers[currentDate])
            gameState.timers[currentDate].forEach(functionString => {
                timedFunctions[functionString]()
            })
            delete gameState.timers[currentDate]
        }
    } catch (error) {
        console.log(error)
    }
}


function renderUI() { // TODO: potentially generalize this shit? right now it only works for what is in gameState.resources, which might be annoying later idk
    for (const resource in gameState.resources) {
        gameState.resources[resource].htmlElement.innerHTML = gameState.resources[resource].displayString
    }
}


function processTick() {
    processGrowth()
    checkTimers()
    renderUI()

    saveGame()
    setTimeout(processTick, 10)
}

// Game start
if (!window.localStorage.getItem('gameState')) {
    console.log('starting game for the first time')
    startGame()
    processTick()
} else {
    console.log('loading game')
    loadGame()
    processTick()
}

// exports
