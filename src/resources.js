export class Resource {
    constructor(name, maxFormula, tickFormula, htmlIDString) {
        this.name = name;
        this.current = 0
        this.max = maxFormula
        this.tick = tickFormula

        this.displayCurrent = Math.floor(this.current)
        this.displayMax = Math.floor(this.max)
        this.displayID = document.querySelector(`#${htmlIDString} > .resourceCount`)
    }

    tickAdd() {
        if (this.current + this.tick < this.max) {
            this.current += this.tick
        } else {
            this.current = this.max
        }
        this.displayCurrent = Math.floor(this.current)
    }
}