export class SpriteFrame {
    #image;
    #x;
    #y;
    #width;
    #height;
    #originX;
    #originY;

    get image() {
        return this.#image;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get originX() {
        return this.#originX;
    }

    get originY() {
        return this.#originY;
    }

    constructor(image, x, y, width, height, originX = null, originY = null) {
        this.#image = image;
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
        this.#originX = originX ?? width / 2;
        this.#originY = originY ?? height / 2;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     * @param {number} rotation
     * @param {number} scale
     * @param {number} originX
     * @param {number} originY
     */
    draw(ctx, x, y, rotation = null, scale = null, originX = null, originY = null) {
        ctx.drawSprite(this, x, y, rotation, scale, originX, originY);
    }
}