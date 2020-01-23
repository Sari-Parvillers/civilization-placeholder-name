import * as resourceClasses from './resourceClasses.js'
// import { gameState } from '../gameState.js'

export class Population extends resourceClasses.Resource {
    constructor() {
        super()
        // Saved
        this.savedProperties = {
            isUnlocked: true,
            pops: {
                // When it reaches 0, age the entire pop
                ageCountDown: 300,
                infants: {
                    // When it's full, add exactly 1 child to the current amount.
                    progressBar: 0,
                    current: 2,
                    // Temp value: the amount that should go into inGrowingStage[0], used for functions
                    growing: 0, // ALWAYS 0 for infants
                    // The amount of stages a part of the population has to go through
                    numberOfStages: 2,
                    // The amount of this part population that are at different stages, e.g. inGrowingStage[0] is the amount newborns here
                    inGrowingStage: [1, 1],
                    // The amount of this part of the population that survives to the next major stage (infant -> child)
                    survivalRate: 0.75,
                    nextStage: 'children'
                },
                children: {
                    current: 2,
                    growing: 0,
                    numberOfStages: 3,
                    inGrowingStage: [1, 0, 1],
                    survivalRate: 0.75,
                    nextStage: 'adolescents'
                },
                adolescents: {
                    current: 2,
                    growing: 0,
                    numberOfStages: 2,
                    inGrowingStage: [1, 1],
                    survivalRate: 0.9,
                    nextStage: 'adults'
                },
                adults: {
                    current: 6,
                    growing: 0,
                    numberOfStages: 15,
                    inGrowingStage: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    survivalRate: 0.4,
                    nextStage: 'elders'
                },
                elders: {
                    current: 2,
                    growing: 0,
                    numberOfStages: 15,
                    inGrowingStage: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    survivalRate: 0.001,
                    nextStage: 'dead'
                },
                dead: {
                    growing: 0
                }
            }
        }

        // Static
        this.name = 'Population'
        this.htmlIDString = 'population'
        this.infantsHtmlElement = document.querySelector('#infants > .resourceCount')
        this.childrenHtmlElement = document.querySelector('#children > .resourceCount')
        this.adolescentsHtmlElement = document.querySelector('#adolescents > .resourceCount')
        this.adultsHtmlElement = document.querySelector('#adults > .resourceCount')
        this.eldersHtmlElement = document.querySelector('#elders > .resourceCount')
    }

    // UI
    get displayString() {
        // Temporary?
        return `${this.current} / ${(this.capacity).toFixed(2)} | ${(10 * this.growth).toFixed(2)}/s
        <br> Infants: ${this.savedProperties.pops.infants.current} |
        <br> Children: ${this.savedProperties.pops.children.current} |
        <br> Adolescents: ${this.savedProperties.pops.adolescents.current} |
        <br> Adults: ${this.savedProperties.pops.adults.current} |
        <br> Elders: ${this.savedProperties.pops.elders.current} |`
    }

    /// Getters and setters
    get current() {
        return this.savedProperties.pops.infants.current +
        this.savedProperties.pops.children.current +
        this.savedProperties.pops.adolescents.current +
        this.savedProperties.pops.adults.current +
        this.savedProperties.pops.elders.current
    }

    /// Capacity
    get capacity() {
        return 20
    }

    /// Growth
    infantsGrowth() {
        // overCapacity is how much over the current capacity population is, returning 0 if it isn't
        // overHalfCapacity is how much over half of the current capacity the population is, returning 0 if it isn't
        // growthFactor grows the infant population by 0.2% of the adult population. When over half of the capacity,
        // this rate reduces progressively, to a minimum of 1% (1% of 0.2% is 0.002%)
        const overCapacity = Math.max(0, this.current - this.capacity)
        const isOverCapacity = this.current > this.capacity

        const overHalfCapacity = Math.max(0, (this.current - this.capacity / 2) / (this.capacity / 2))
        const nearFullCapacityFactor = Math.max(1 - overHalfCapacity)
        const fertility = 1
        const growthFactor = 0.00400 * nearFullCapacityFactor * fertility
        this.savedProperties.pops.infants.progressBar += this.savedProperties.pops.adults.current * growthFactor

        if (this.savedProperties.pops.infants.progressBar > 1) {
            const newBorns = Math.floor(this.savedProperties.pops.infants.progressBar)
            this.savedProperties.pops.infants.inGrowingStage[0] += newBorns
            this.savedProperties.pops.infants.current += newBorns
            this.savedProperties.pops.infants.progressBar -= newBorns
        }
    }


    processSurvivors(potentialSurvivors, survivalRate, optimizationThreshold = 100) {
        let survivors = 0
        if (potentialSurvivors < optimizationThreshold) {
            // Manually check for each single pop to see if it survives if below the threshold
            // Above it, multiply all the pops by the survival rate at once, since it will average at at that point
            for (let popCount = 0; popCount < potentialSurvivors; popCount++) {
                if (Math.random() < survivalRate) {
                    survivors++
                }
            }
        } else {
            survivors = Math.round(potentialSurvivors * survivalRate)
        }
        return survivors
    }


    agePop(popType) {
        // This advances the stage of all population in pops.popType.inGrowingStage to the next stage.

        const nextPopType = this.savedProperties.pops[popType].nextStage // E.g. infants -> children
        const popInStage = this.savedProperties.pops[popType].inGrowingStage // Shortcut
        const numberOfStages = this.savedProperties.pops[popType].numberOfStages // I.e. the determined length of the array
        const survivalRatePerStage = Math.pow(this.savedProperties.pops[popType].survivalRate, 1 / numberOfStages)

        // Must be done from last to first.
        // Last number in popInStage becomes the 'growing' value of the next pop Type
        this.savedProperties.pops[nextPopType].growing = this.processSurvivors(popInStage[numberOfStages - 1], survivalRatePerStage)

        // Every stage advances by one, popInStage[1] <- popInStage[0], with survival rate taken into account.
        // popInStage[0] is excluded (stageNumber > 0), as its value becomes popType.growing
        for (let stageNumber = numberOfStages - 1; stageNumber > 0; stageNumber--) {
            popInStage[stageNumber] = this.processSurvivors(popInStage[stageNumber - 1], survivalRatePerStage)
        }
        popInStage[0] = this.savedProperties.pops[popType].growing
        this.savedProperties.pops[popType].growing = 0

        let current = 0
        popInStage.forEach(popNum => { current += popNum })
        this.savedProperties.pops[popType].current = current
        this.savedProperties.pops[popType].inGrowingStage = popInStage // Reassign shortcut
    }


    ageAllPop() {
        this.agePop('infants')
        this.agePop('children')
        this.agePop('adolescents')
        this.agePop('adults')
        this.agePop('elders')
        this.savedProperties.pops.dead.growing = 0
    }

    get growth() {
        // This is exclusively for display
        return (
            this.infantsGrowth + this.childrenGrowth + this.adolescentsGrowth + this.adultsGrowth + this.eldersGrowth -
            this.infantsDecline - this.childrenDecline - this.adolescentsDecline - this.adultsDecline - this.eldersDecline
        )
    }

    // Process functions
    processGrowth() {
        this.infantsGrowth()
        this.savedProperties.pops.ageCountDown--
        if (this.savedProperties.pops.ageCountDown === 0) {
            this.ageAllPop()
            this.savedProperties.pops.ageCountDown = 300 + (3 - Math.round(Math.random() * 6))
            // The timer is reset to 300 with a 1% variation to avoid eventually
            // having a bunch of periodic events all firing at once at key dates
        }
    }
}
