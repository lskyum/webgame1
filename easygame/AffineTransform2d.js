// @ts-check
"use strict";

import { Vec2d } from "./Vec2d.js";

export class AffineTransform2d {
    static #identity;

    /**
     * Returns the identity transform
     * @returns {AffineTransform2d} - The identity transform
     */ 
    static get identity() {
        if (AffineTransform2d.#identity == null) {
            AffineTransform2d.#identity = new AffineTransform2d(
                Vec2d.unitX,
                Vec2d.unitY,
                Vec2d.zero);
        }
        return AffineTransform2d.#identity;
    }

    /**
     * Creates a rotation transform
     * @param {number} angle
     * @returns {AffineTransform2d}
     */
    static rotation(angle) {
        return new AffineTransform2d(
            new Vec2d(Math.cos(angle), Math.sin(angle)),
            new Vec2d(-Math.sin(angle), Math.cos(angle)),
            Vec2d.zero);
    }

    static translation(x, y) {
        return new AffineTransform2d(
            Vec2d.unitX,
            Vec2d.unitY,
            new Vec2d(x, y));
    }

    static scaling(x, y) {
        return new AffineTransform2d(
            new Vec2d(x, 0),
            new Vec2d(0, y),
            Vec2d.zero);
    }

    static create(position, rotation = 0.0, scale = 1.0) {
        /* denne gør det samme som nedenfor, men optimeret
        return new Transform2d(
            new Vec2d(Math.cos(rotation) * scale, Math.sin(rotation) * scale),
            new Vec2d(-Math.sin(rotation) * scale, Math.cos(rotation) * scale),
            new Vec2d(x, y));
         */
        let t = AffineTransform2d.rotation(rotation);
        t = t.append(AffineTransform2d.scaling(scale, scale));
        t = t.append(AffineTransform2d.translation(position.x, position.y));
        return t;
    }

    #x;
    #y;
    #t;

    constructor(axisX, axisY, translation) {
        this.#x = axisX;
        this.#y = axisY;
        this.#t = translation;
    }

    /**
     * @returns {Vec2d}
     */
    get axisX() {
        return this.#x;
    }

    /**
     * @returns {Vec2d}
     */
    get axisY() {
        return this.#y;
    }

    /**
     * @returns {Vec2d}
     */
    get translation() {
        return this.#t;
    }

    append(b) {
        return new AffineTransform2d(
            new Vec2d(
                this.#x.x * b.#x.x + this.#x.y * b.#y.x,
                this.#x.x * b.#x.y + this.#x.y * b.#y.y),
            new Vec2d(
                this.#y.x * b.#x.x + this.#y.y * b.#y.x,
                this.#y.x * b.#x.y + this.#y.y * b.#y.y),
            new Vec2d(
                this.#t.x * b.#x.x + this.#t.y * b.#y.x + b.#t.x,
                this.#t.x * b.#x.y + this.#t.y * b.#y.y + b.#t.y)
        );
    }

    equals(other) {
        return this.#x.equals(other.#x) &&
            this.#y.equals(other.#y) &&
            this.#t.equals(other.#t);
    }

    /**
     * Pre-multiplies a transform to this transform.
     * @param {AffineTransform2d} b
     * @returns {AffineTransform2d}
     */
    prepend(b) {  // ikke testet
        return new AffineTransform2d(
            new Vec2d(
                b.#x.x * this.#x.x + b.#x.y * this.#y.x,
                b.#x.x * this.#x.y + b.#x.y * this.#y.y),
            new Vec2d(
                b.#y.x * this.#x.x + b.#y.y * this.#y.x,
                b.#y.x * this.#x.y + b.#y.y * this.#y.y),
            new Vec2d(
                b.#t.x * this.#x.x + b.#t.y * this.#y.x + this.#t.x,
                b.#t.x * this.#x.y + b.#t.y * this.#y.y + this.#t.y)
        );
    }

    appendRotation(angle, origin = null) {
        if (origin == null) {
            return this.append(AffineTransform2d.rotation(angle));
        } else {
            return this.appendTranslation(origin.negate()).append(AffineTransform2d.rotation(angle)).appendTranslation(origin);
        }
    }

    appendTranslation(t) {
        return this.append(AffineTransform2d.translation(t.x, t.y));
    }

    appendTranslationXY(x, y) {
        return this.append(AffineTransform2d.translation(x, y));
    }

    appendScaling(sx, sy, origin = null) {
        if (origin == null) {
            return this.append(AffineTransform2d.scaling(sx, sy));            
        } else {
            return this.appendTranslation(origin.negate()).append(AffineTransform2d.scaling(sx, sy)).appendTranslation(origin);
        }
    }

    /**
    * Transforms a point by this transform
    * @param {Vec2d} p - The point to transform
    * @returns {Vec2d} - The transformed point
    */
    transformPoint(p) {
        return new Vec2d(
            this.#x.x * p.x + this.#y.x * p.y + this.#t.x,
            this.#x.y * p.x + this.#y.y * p.y + this.#t.y);
    }

    /**
     * Transforms a vector by this transform
     * @param {Vec2d} v - The vector to transform
     * @returns {Vec2d} - The transformed vector
     */ 
    transformDirection(v) {
        return new Vec2d(
            this.#x.x * v.x + this.#y.x * v.y,
            this.#x.y * v.x + this.#y.y * v.y);
    }

    inverse() {
        const det = this.#x.x * this.#y.y - this.#x.y * this.#y.x;
        if (det == 0.0) throw new Error("AffineTransform2d is not invertible");
        return new AffineTransform2d(
            new Vec2d(this.#y.y / det, -this.#x.y / det),
            new Vec2d(-this.#y.x / det, this.#x.x / det),
            new Vec2d(
                -(this.#y.y * this.#t.x - this.#y.x * this.#t.y) / det,
                (this.#x.y * this.#t.x - this.#x.x * this.#t.y) / det));
    }

    applyToContext(ctx) {
        ctx.transform(this.#x.x, this.#x.y, this.#y.x, this.#y.y, this.#t.x, this.#t.y);
    }
}