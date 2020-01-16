export class Resource {
    constructor(name, capacity, growth, htmlIDString, current=0) {
        this.name = name;
        this.current = current
        this.capacity = capacity
        this.growthPerTick = growth
        this.htmlIDString = htmlIDString
        this.htmlElement = document.querySelector(`#${htmlIDString} > .resourceCount`)  
    }

    get displayString() {
        return `${Math.floor(this.current)} / ${Math.floor(this.capacity)} | +${(10*this.growthFormula).toFixed(2)}/s`
    }

    get growthFormula() {
        return this.growthPerTick
    }

    addTick() {
            this.current += this.growthFormula
    }

    static fromSavedState(savedResource) {
        return new Resource(
            savedResource.name,
            savedResource.capacity,
            savedResource.perTick,
            savedResource.htmlIDString,
            savedResource.current
        )
    }
}


export class Population extends Resource {
    constructor(
        name='Population',
        capacity=20,
        growth=null,
        htmlIDString="population",
        current=8
    ) {
        super(name, capacity, growth, htmlIDString, current)
    }

    // The perTickFormula for population should always try to stablize at its capacity, unlike most other resources. If above its capacity, population will lower, if below, it will
    // increase. The formula should be so that population growth increases the more people there are, but it decreases at it gets closer to its capacity. Same the other way around,
    // the population should decrease faster the more it is over its capacity. (Maybe exponentially faster, to simulate the idea that losing a lot of capacity means a lot of people
    // are dying of exposure or starvation, whilst being slightly over just means that the population stablizes to a lower amount.)
    get growthFormula() {
        let underCapacity = Math.max(0, this.capacity - this.current)
        let overCapacity = Math.max(0, this.current - this.capacity)
        let isOverCapacity = this.current > this.capacity
        if (!isOverCapacity) {
            return Math.min(
                this.current * 0.001, 
                this.capacity - this.current
            )
        } else {
            return Math.min(-(overCapacity * 0.01), -0.01)
        }
    }

    // TODO: fromSavedState() changed so that it takes the new changes into account. It should be totally programmed, fromSavedState() should still only be in the parent class

}