// @ts-check
"use strict";

import { AffineTransform2d } from "./AffineTransform2d.js";
import { Vec2d } from "./Vec2d.js";

export class Collider {

    constructor() {
    }

    /**
     * 
     * @param {Collider} other
     * @returns {boolean}
     */
    collides(other) {
        /** @type {Collider} */
        let left = this;

        /** @type {Collider} */
        let right = other;

        let leftTransform = null;
        let rightTransform = null;

        if (left instanceof TransformedCollider) {
            leftTransform = left.transformation;
            left = left.collider;
        }

        if (right instanceof TransformedCollider) {
            rightTransform = right.transformation;
            right = right.collider;
        }

        /*
        if (leftTransform != null && rightTransform == null) {
            // swap so that right is the transformed collider
            [left, right] = [right, left];
            [leftTransform, rightTransform] = [rightTransform, leftTransform];
        }
        */

        if (leftTransform != null && rightTransform != null) {

        }

        if (left instanceof CircleCollider && right instanceof CircleCollider) {
            return Collider.#collides_circle_circle(left, right, leftTransform, rightTransform);
        }

        throw new Error("Not implemented");
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     */
    drawDebugInfo(ctx) {
    }

    /**
     * 
     * @param {AffineTransform2d} t
     * @returns {Collider}
     */
    transform(t) {
        return new TransformedCollider(this, t);
    }

    /**
     * 
     * @param {number} radius
     * @param {number} x
     * @param {number} y
     * @returns {Collider}
     */
    static circle(radius, x = 0.0, y = 0.0) {
        if (x != 0.0 || y != 0.0) {
            return new TransformedCollider(new CircleCollider(radius), AffineTransform2d.translation(x, y));
        }
        return new CircleCollider(radius);
    }

    static rectangle(width, height, rotation = 0.0, x = 0.0, y = 0.0) {
        throw new Error("Not implemented");
    }

    /**
     * 
     * @param {CircleCollider} left
     * @param {CircleCollider} right
     * @param {AffineTransform2d} rightTransform
     */
    static #collides_circle_circle(left, right, leftTransform = null, rightTransform = null) {
        let leftScale = 1.0;
        let leftCenter = Vec2d.zero;
        if (leftTransform != null) {
            leftScale = (leftTransform.axisX.length + leftTransform.axisY.length) * 0.5;     // TODO: support ellipses?
            leftCenter = leftTransform.translation;
        }

        let rightScale = 1.0;
        let rightCenter = Vec2d.zero;
        if (rightTransform != null) {
            rightScale = (rightTransform.axisX.length + rightTransform.axisY.length) * 0.5;     // TODO: support ellipses?
            rightCenter = rightTransform.translation;
        }

        let radiusSum = left.radius * leftScale + right.radius * rightScale;
        let distance = leftCenter.distanceTo(rightCenter);

        return distance < radiusSum;
    }
}

export class CircleCollider extends Collider {
    #radius;

    get radius() { return this.#radius; }

    /**
     * 
     * @param {number} radius
     */
    constructor(radius) {
        super();
        this.#radius = radius;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     */
    drawDebugInfo(ctx) {
        ctx.drawCircle(0, 0, this.#radius, "red");
    }
}

export class TransformedCollider extends Collider {
    #collider;
    #transformation;

    /**
     * @returns {Collider}
     */
    get collider() {
        return this.#collider;
    }

    /**
     * @returns {AffineTransform2d}
     */
    get transformation() {
        return this.#transformation;
    }

    /**
     * 
     * @param {Collider} collider
     * @param {AffineTransform2d} transformation
     */
    constructor(collider, transformation) {
        super();
        this.#collider = collider;
        this.#transformation = transformation;
    }

    transform(transformation) {
        const t = this.#transformation.append(transformation);
        if (t.equals(AffineTransform2d.identity)) {
            return this.collider;
        }
        return new TransformedCollider(this.collider, t);
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     */
    drawDebugInfo(ctx) {
        ctx.save();
        this.#transformation.applyToContext(ctx);

        this.#collider.drawDebugInfo(ctx);

        ctx.restore();
    }
}

export class PolygonCollider extends Collider {
    #vertices;

    /**
     * 
     * @param {Vec2d[]} vertices
     */
    constructor(vertices) {
        super();
        this.#vertices = vertices.slice();
    }    

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     */
    drawDebugInfo(ctx) {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        for (let i = 0; i <= this.#vertices.length; i++) {
            let v = this.#vertices[i % this.#vertices.length];
            ctx.lineTo(v.x, v.y);
        }
        ctx.stroke();
    }
}