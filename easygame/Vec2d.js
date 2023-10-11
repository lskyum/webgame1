// @ts-check
"use strict";

export class Vec2d {

    static #zero;
    static #unitX;
    static #unitY;

    static get zero() {
        if (Vec2d.#zero == null) {
            Vec2d.#zero = new Vec2d(0, 0);
        }
        return Vec2d.#zero;
    }

    static get unitX() {
        if (Vec2d.#unitX == null) {
            Vec2d.#unitX = new Vec2d(1, 0);
        }
        return Vec2d.#unitX;
    }

    static get unitY() {
        if (Vec2d.#unitY == null) {
            Vec2d.#unitY = new Vec2d(0, 1);
        }
        return Vec2d.#unitY;
    }

    static direction(angle) {
        return new Vec2d(Math.cos(angle), Math.sin(angle));
    }

    #x;
    #y;

    get x() { return this.#x; }
    get y() { return this.#y; }

    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    /**
    * Adds a vector to this vector and returns the result as a new vector.
    * @param {Vec2d} v - The vector to add
    * @returns {Vec2d} - The sum of the two vectors
    */
    add(v) {
        return new Vec2d(this.#x + v.#x, this.#y + v.#y);
    }

    sub(other) {
        return new Vec2d(this.#x - other.#x, this.#y - other.#y);
    }

    mul(scalar) {
        return new Vec2d(this.#x * scalar, this.#y * scalar);
    }

    negate() {
        return new Vec2d(-this.#x, -this.#y);
    }

    /**
     * Calculates the distance to another point.
     * @param {Vec2d} p - The other point
     * @returns {number} - The distance to 'p'
     */
    distanceTo(p) {
        return Math.sqrt(this.distanceToSqr(p));
    }

    /**
     * Calculates the squared distance to another point.
     * @param {Vec2d} p - The other point
     * @returns {number} - The squared distance to 'p'
     */
    distanceToSqr(p) {
        const dx = this.#x - p.#x;
        const dy = this.#y - p.#y;
        return dx * dx + dy * dy;
    }

    /**
     * Calculates the length of this vector.
     * @returns {number} - The length of this vector
     */
    get length() {
        const lengthSqr = this.lengthSqr;
        if (lengthSqr == 0.0) return 0.0;
        if (lengthSqr == 1.0) return 1.0;
        return Math.sqrt(lengthSqr);
    }

    get lengthSqr() {
        return this.#x * this.#x + this.#y * this.#y;
    }

    /**
     * 
     * @param {Vec2d} other
     * @returns {boolean}
     */
    equals(other) {
        return this.x === other.x && this.y === other.y && this.z === other.z;
    }

    toString() {
        return `(${this.#x}, ${this.#y})`;
    }
}