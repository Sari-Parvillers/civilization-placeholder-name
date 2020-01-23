import { gameState } from '../gameState.js'

export class Resource {
    constructor(isUnlocked = false, current = 0) {
        // Saved properties: these need to be loaded in at the start!
        this.savedProperties = {
            isUnlocked: isUnlocked,
            current: current
        }

        // Static properties: these should be defined by default values for each subclass of Resource
        this.name = 'Resource'
        this.htmlIDString = null
    }

    /// Setters and Getters
    get current() {
        return this.savedProperties.current
    }

    set current(value) {
        this.savedProperties.current = value
    }

    set addToCurrent(value) {
        this.savedProperties.current += value
    }

    /// UI stuff
    get htmlElement() {
        return document.querySelector(`#${this.htmlIDString} > .resourceCount`)
    }

    get displayString() {
        return `${(this.current).toFixed(2)} / ${(this.capacity).toFixed(2)} | +${(10 * this.growth).toFixed(2)}/s`
    }


    /// Formula stuff
    // Capacity
    get capacity() {
        return 666666
    }

    get overCapacityMax () {
        /* This is the number of times the resource can go over its own capacity,
        which in turn influences how quickly its growth decreases as it goes over. See get OverCapacityMult()
        Note: might be useless, since I'm not sure overCapacityMax will be a dynamic property
        that should ever be anything other than 1. But it might let me balance stuff more easily. */
        return 1
    }

    // Growth
    get overCapacityMult() {
        return Math.min(1, 1 - (this.current - this.capacity) / this.capacity * this.overCapacityMax)
    }

    get growth() {
        return 666
    }


    /// Process functions
    processGrowth() {
        this.addToCurrent = this.growth
    }


    /// Load game from saved state
    set fromSavedState(savedResource) {
        this.savedProperties = savedResource.savedProperties
    }
}


// .population should have each of the types of population in it, which are their own resources with their own growth and stuff.
//

export class Food extends Resource {
    constructor() {
        super()
        // Saved
        this.savedProperties.isUnlocked = true

        // Static
        this.name = 'Food'
        this.htmlIDString = 'food'
    }

    get capacity() {
        return 1000
    }

    get growth() {
        const foodWorkForce = Math.floor(gameState.resources.population.current)
        return foodWorkForce * this.overCapacityMult
    }
}
