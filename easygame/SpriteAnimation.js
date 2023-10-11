// @ts-check
"use strict";

import { AffineTransform2d } from "./AffineTransform2d.js";
import { SpriteFrame } from "./SpriteFrame.js";

export class SpriteAnimation {
    #frames = [];

    get(frame) {
        frame = Math.floor(frame) % this.#frames.length;
        return this.#frames[frame];
    }

    get length() {
        return this.#frames.length;
    }

    add(image, x = 0.0, y = 0.0, width = null, height = null, originX = null, originY = null) {
        if (width == null) width = image.width;
        if (height == null) height = image.height;
        this.#frames.push(new SpriteFrame(image, x, y, width, height, originX, originY));
    }

    addGrid(image, x, y, frameWidth, frameHeight, countX = null, countY = null, originX = null, originY = null, count = null) {
        if (countX == null) countX = Math.floor((image.width - x) / frameWidth);
        if (countY == null) countY = Math.floor((image.height - y) / frameHeight);
        let i = 0;
        for (let fy = 0; fy < countY; fy++) {
            for (let fx = 0; fx < countX; fx++) {
                if (count != null && i >= count) break;
                this.add(image, x + fx * frameWidth, y + fy * frameHeight, frameWidth, frameHeight, originX, originY);
                i++;
            }
        }
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     */
    drawDebugInfo(ctx) {
        ctx.resetTransform();

        /*
        ctx.fillStyle = "pink";
        ctx.fillRect(0, 0, this.#image.width, this.#image.height);
        ctx.drawImage(this.#image, 0, 0);

        for (let i = 0; i < this.#frames.length; i++) {
            let frame = this.#frames[i];
            ctx.strokeStyle = "red";
            ctx.drawRect(frame.x, frame.y, frame.width, frame.height);

            ctx.fillStyle = "white";
            ctx.font = "12px Arial";

            // info about frame
            let txt = "[" + i + "]";
            ctx.fillText(txt, frame.x + 4, frame.y + 14);
        }
        */
    }

    draw(ctx, frame, x, y, rotation = 0.0, scale = 1.0, originX = null, originY = null) {
        this.get(frame).draw(ctx, x, y, rotation, scale, originX, originY);
    }

    drawTiles(ctx, map, tileX, tileY, tileCountX, tileCountY, x, y, scale = 1.0) {
        let tileWidth = this.get(0).width;
        let tileHeight = this.get(0).height;

        let t = AffineTransform2d
            .scaling(scale, scale)
            .appendTranslationXY(x, y);

        ctx.save();
        t.applyToContext(ctx);

        for (let fy = 0; fy < tileCountY; fy++) {
            for (let fx = 0; fx < tileCountX; fx++) {
                let tile = map[tileY + fy][tileX + fx];
                this.get(tile).draw(ctx, fx * tileWidth, fy * tileHeight, null, null, 0, 0);
            }
        }

        ctx.restore();
    }
}