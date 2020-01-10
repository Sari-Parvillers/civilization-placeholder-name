import {Resource} from "./resources.js"

const gameState = {
    gameDate: {
        tickDate: 0
    },

    resources: {},

    tickAdd() {
        this.gameDate.tickDate += 1
        for (const resource in this.resources) {
            this.resources[resource].tickAdd()
        }
    }
}


const tickButtonPress = document.querySelector('#tickButton')


function startGame() {
    gameState.resources.food = new Resource('Food', 100, 1, "food")
    gameState.resources.population = new Resource('Population', 15, 0.1, "population")
}


function renderUI() {
    for (const resource in gameState.resources) {
        gameState.resources[resource].displayID.innerHTML = gameState.resources[resource].displayCurrent     
    }
}


function gameTick() {
    gameState.tickAdd()
    renderUI()
}


/* let pause = false
while (!pause) {
    setTimeout(
        gameTick(), 100
    )
} */

// Game start

// First start
if (true) {  // TODO: true only if local storage exists
    startGame()
}

// Subsequent starts


tickButtonPress.addEventListener('click', gameTick)


export {gameState}