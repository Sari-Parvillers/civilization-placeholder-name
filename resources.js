export class Resource {
    constructor(name, maxFormula, tickFormula, htmlIDString, current=0) {
        this.name = name;
        this.current = current
        this.max = maxFormula
        this.perTick = tickFormula
        this.htmlIDString = htmlIDString
        this.htmlElement = document.querySelector(`#${htmlIDString} > .resourceCount`)
        
    }

    getDisplayString() {
        return `${Math.floor(this.current)} / ${Math.floor(this.max)} | +${this.perTick}`
    }

    addTick() {
        if (this.current + this.perTick < this.max) {
            this.current += this.perTick
        } else {
            this.current = this.max
        }
    }

    static fromSavedState(savedResource) {
        return new Resource(
            savedResource.name,
            savedResource.max,
            savedResource.perTick,
            savedResource.htmlIDString,
            savedResource.current
        )
    }
}
