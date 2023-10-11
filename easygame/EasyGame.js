// @ts-check
"use strict";

import { AffineTransform2d } from './AffineTransform2d.js';
import { SpriteFrame } from './SpriteFrame.js';
import { Vec2d } from './Vec2d.js';
import { SpriteAnimation } from './SpriteAnimation.js';
import { Collider, CircleCollider, TransformedCollider } from './Collider.js';

export { AffineTransform2d }
export { Vec2d }
export { SpriteFrame }
export { SpriteAnimation }
export { Collider }
export { CircleCollider }
export { TransformedCollider }

class MouseInput {
    #mouseX = 0;
    #mouseY = 0;
    #leftDown = false;
    #rightDown = false;
    #middleDown = false;
    #leftClick = false;
    #rightClick = false;
    #middleClick = false;
    #wheel = 0;

    get x() { return this.#mouseX; }
    get y() { return this.#mouseY; }
    get leftDown() { return this.#leftDown; }
    get rightDown() { return this.#rightDown; }
    get middleDown() { return this.#middleDown; }
    get leftClick() { return this.#leftClick; }
    get rightClick() { return this.#rightClick; }
    get middleClick() { return this.#middleClick; }
    get wheel() { return this.#wheel; }

    static reset(mouse) {
        mouse.#leftClick = false;
        mouse.#rightClick = false;
        mouse.#middleClick = false;
        mouse.#wheel = 0;
    }

    static init(mouse, app) {
        app.on("mousemove", (e) => {
            mouse.#mouseX = e.offsetX;
            mouse.#mouseY = e.offsetY;
        });

        app.on("mousedown", (e) => {
            if (e.button == 0) mouse.#leftDown = true;
            if (e.button == 1) mouse.#middleDown = true;
            if (e.button == 2) mouse.#rightDown = true;
        });

        app.on("mouseup", (e) => {
            if (e.button == 0) mouse.#leftDown = false;
            if (e.button == 1) mouse.#middleDown = false;
            if (e.button == 2) mouse.#rightDown = false;
        });

        app.on("click", (e) => {
            if (e.button == 0) mouse.#leftClick = true;
            if (e.button == 1) mouse.#middleClick = true;
            if (e.button == 2) mouse.#rightClick = true;
        });

        app.on("wheel", (e) => {
            mouse.#wheel = e.deltaY;
        });

    }
}

class KeyboardInput {
    #keys = new Set();

    /**
     * 
     * @param {string} code
     * @returns
     */
    isPressed(code) {
        return this.#keys.has(code);
    }

    get pressed() {
        return [...this.#keys];
    }

    static init(keyboard, app) {
        document.addEventListener('keydown', (e) => {
            keyboard.#keys.add(e.code);
        });
        document.addEventListener('keyup', (e) => {
            keyboard.#keys.delete(e.code);
        });
    }
}

export class App {
    #baseUrl;
    #element;

    /**
     * @type {HTMLCanvasElement}
     */
    #canvas;

    /**
     * @type {CanvasRenderingContext2D}
     */
    #canvasCtx;

    #mouse = new MouseInput();
    #keyboard = new KeyboardInput();
    
    #lastTime;

    get mouse() {
        return this.#mouse;
    }

    get keyboard() {
        return this.#keyboard;
    }

    get width() {
        return this.#canvas.clientWidth;
    }

    get height() {
        return this.#canvas.clientHeight;
    }

    loadImage(url) {

        if (this.#baseUrl != null) {
            if (url.startsWith("/")) url = url.substring(1);
            url = this.#baseUrl + url;
        }

        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = (err) => reject(err);
            image.src = url;
        });
    }

    on(eventName, callback) {
        this.#canvas.addEventListener(eventName, callback);
    }

    start(element, baseUrl) {

        if (baseUrl == null) baseUrl = "/";
        if (!baseUrl.endsWith("/")) baseUrl += "/";

        this.#baseUrl = baseUrl;
        this.#element = element;
        this.background = "white";

        const canvas = document.createElement("canvas");
        canvas.width = element.clientWidth;
        canvas.height = element.clientHeight;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        this.#canvas = canvas;

        MouseInput.init(this.#mouse, this);
        KeyboardInput.init(this.#keyboard, this);
                
        this.#element.appendChild(canvas);
        this.#canvasCtx = canvas.getContext("2d");

        this.#decorateContext();

        (async () => {
            try {
                await this.load();
            } catch (err) {
                console.error(err);
            }
            this.#lastTime = Date.now();
            this.#animate();
        })();
    }

    #decorateContext() {

        /**
         * 
         * @this {CanvasRenderingContext2D}
         * @param { (CanvasImageSource & SpriteFrame) } frame
         * @param {number} x
         * @param {number} y
         * @param {number} rotation
         * @param {number} scale
         * @param {number} originX
         * @param {number} originY
         */
        function drawSprite(frame, x, y, rotation = null, scale = null, originX = null, originY = null) {
            this.save();
            this.translate(x, y);
            if (rotation != null) this.rotate(rotation);
            if (scale != null) this.scale(scale, scale);
            
            if (frame instanceof SpriteFrame) {
                originX = originX ?? frame.originX;
                originY = originY ?? frame.originY;
                this.drawImage(frame.image, frame.x, frame.y, frame.width, frame.height, -originX, -originY, frame.width, frame.height);
            } else {
                originX = originX ?? frame.width * 0.5;
                originY = originY ?? frame.height * 0.5;
                this.drawImage(frame, -originX, -originY);
            }
            this.restore();
        }
        this.#canvasCtx.drawSprite = drawSprite.bind(this.#canvasCtx);

        /**
         * 
         * @this {CanvasRenderingContext2D}
         * @param {any} x
         * @param {any} y
         * @param {any} radius
         * @param {any} color
         */
        function fillCircle(x, y, radius, color = null) {
            if (color != null) this.fillStyle = color;
            this.beginPath();
            this.arc(x, y, radius, 0, 2 * Math.PI);
            this.fill();
        }
        this.#canvasCtx.fillCircle = fillCircle.bind(this.#canvasCtx);

        /** 
         * Draws a circle on the canvas.
         * @this {CanvasRenderingContext2D}
         * @param {number} x - The x of the circle center
         * @param {number} y - The y of the circle center
         * @param {number} radius
         * @param {string} color
         */
        function drawCircle(x, y, radius, color = null) {
            if (color != null) this.strokeStyle = color;
            this.beginPath();
            this.arc(x, y, radius, 0, 2 * Math.PI);
            this.stroke();
        }
        this.#canvasCtx.drawCircle = drawCircle.bind(this.#canvasCtx);

        /**
         * @this {CanvasRenderingContext2D}
         * @param {number} x
         * @param {number} y
         * @param {number} width
         * @param {number} height
         * @param {string} color
         */
        function drawRect(x, y, width, height, color = null) {
            if (color != null) this.strokeStyle = color;
            this.strokeRect(x, y, width, height);
        }
        this.#canvasCtx.drawRect = drawRect.bind(this.#canvasCtx);

    }

    #animate() {
        window.requestAnimationFrame(() => {
            // calculate delta time
            const now = Date.now();
            const deltaTime = (now - this.#lastTime) * 0.001;
            this.#lastTime = now;

            this.update(deltaTime);
            MouseInput.reset(this.#mouse);
            if (this.background != null) {
                const ctx = this.#canvasCtx;
                ctx.fillStyle = this.background;
                ctx.fillRect(0, 0, this.width, this.height);
            }
            this.draw(this.#canvasCtx, this.width, this.height);
            this.#animate();
        });
    }

    load() {
    }

    /**
     * 
     * @param {number} deltaSeconds - The number of seconds since last update
     */
    update(deltaSeconds) {
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} width
     * @param {number} height
     */
    draw(ctx, width, height) {        
    }

    dispose() {
        this.#element.removeChild(this.#canvas);

        // stop animation
        this.#animate = () => { };
    }
}