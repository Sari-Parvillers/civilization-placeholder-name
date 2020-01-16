import {Resource, Population} from "./resources.js"


// All saved data goes into this object.
const gameState = {
    gameDate: {
        currentTickDate: 0
    },

    resources: {},

    // This keeps track of certain values, such as countdowns
    timerData: {
        huntCountDown: 0
    }, 

    // This keeps track of certain "tick dates" and the functions to run at these dates
    timers: {},

    addTick() {
        this.gameDate.currentTickDate += 1
        for (const resource in this.resources) {
            this.resources[resource].addTick()
        }
    },

    checkTimers() {
        try {
            const currentDate = this.gameDate.currentTickDate
            if (currentDate in this.timers) { 
                this.timers[currentDate].forEach(functionString => {
                    console.log(this.timers)
                    timedFunctions[functionString].execute()
                })
                delete this.timers[currentDate]
            }
        } 
        catch (error) {
            console.log(error)
        }
    },

    load(savedGameState=JSON.parse(window.localStorage.getItem('gameState'))) {
        for (const propertyKey in savedGameState) {
            gameState[propertyKey] = savedGameState[propertyKey]
        }
        for (const resourceKey in savedGameState.resources) {
            gameState.resources[resourceKey] = Resource.fromSavedState(savedGameState.resources[resourceKey])
        }
    }
}

// HTML related constants
const forageButton = document.querySelector('#forageButton')
forageButton.addEventListener('click', () => {gameState.resources.food.current += 1})

const huntButton = document.querySelector('#huntButton')
huntButton.addEventListener('click', goForHunt)
const huntTimerDisplay = document.querySelector('#huntTimer')

const gameLog = document.querySelector('#gameLog')
let logArray = []



// UI functions
function renderUI() { // TODO: potentially generalize this shit? right now it only works for what is in gameState.resources, which might be annoying later idk
    for (const resource in gameState.resources) {
        gameState.resources[resource].htmlElement.innerHTML = gameState.resources[resource].displayString
    }
}


function writeInGameLog(text) {
    // Adds text element at the beginning of an array, remove last element if array is too big, print the whole array with line breaks in between each element
    logArray.unshift(text)
    logArray.splice(10, 1)
    gameLog.innerHTML = logArray.join('<br>')
}


// Timer functions
function addToTimers(delay, functionString) {
    let executionDate = gameState.gameDate.currentTickDate + delay
    if (executionDate in gameState.timers) {
        gameState.timers[executionDate].push(functionString)
    } else {
        gameState.timers[executionDate] = [functionString]
    }
}


let timedFunctions = {
    checkHuntTimer: {
        execute() {
            if (gameState.timerData.huntCountDown > 1) {
                if (!('disabled' in huntButton.attributes)) {
                    huntButton.setAttribute('disabled', 'disabled')
                }
                gameState.timerData.huntCountDown -= 1
                addToTimers(10, 'checkHuntTimer')
                huntTimerDisplay.innerHTML = gameState.timerData.huntCountDown
            } else {
                gameState.timerData.huntCountDown -= 1

                let huntYield = 10 + Math.round(Math.random()*20)
                gameState.resources.food.current += huntYield

                writeInGameLog(`The hunt yielded ${huntYield} food.`)  // TODO: Make this visible to the user.  
                huntTimerDisplay.innerHTML = ""
                huntButton.removeAttribute('disabled')
            }
        }
    }
}


function goForHunt() {
    writeInGameLog('The tribe is going out for a hunt.')

    gameState.timerData.huntCountDown = 10  // timerFunctions.checkHuntTimer.execute() decrements this value by one every 10 ticks
    huntButton.setAttribute('disabled', 'disabled')
    huntTimerDisplay.innerHTML = gameState.timerData.huntCountDown

    addToTimers(10, 'checkHuntTimer')
}


// Global game functions
function startGame() {
    gameState.resources.food = new Resource('Food', 1000, 0.25, "food")
    gameState.resources.population = new Population()
}


function saveGame() {
    window.localStorage.setItem('gameState', JSON.stringify(gameState))
}


function processTick() {
    gameState.addTick()
    gameState.checkTimers()
    renderUI()

    saveGame()
    setTimeout(processTick, 100)
}


// Game start

// First start
if (!window.localStorage.getItem('gameState') || true) {  // TODO: true only if local storage exists
    console.log('starting game for the first time')
    startGame()
    processTick()
} else {
    console.log('loading game')
    gameState.load()
    processTick()
    console.log(gameState.resources)
}

// Subsequent starts


// exports
export {gameState}