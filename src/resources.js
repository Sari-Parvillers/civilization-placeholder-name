export class Resource {
    constructor(name, maxFormula, tickFormula, htmlIDString) {
        this.name = name;
        this.current = 0
        this.max = maxFormula
        this.tick = tickFormula
        
        this.display = {
            current: Math.floor(this.current),
            max: Math.floor(this.max),
            id: document.querySelector(`#${htmlIDString} > .resourceCount`)
        }
    }

    updateDisplay() {
        this.display.current = Math.floor(this.current)
        this.display.max = Math.floor(this.display.max)
        this.display.string = `${this.display.current} / ${this.display.max} | +${this.tick}`
    }

    addTick() {
        if (this.current + this.tick < this.max) {
            this.current += this.tick
        } else {
            this.current = this.max
        }
        this.updateDisplay()
    }
}