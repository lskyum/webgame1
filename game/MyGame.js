// @ts-check
"use strict";

import * as EasyGame from '../easygame/EasyGame.js';

export class MyGame extends EasyGame.App {

    async load() {
        this.zombieImage = await this.loadImage("zombie_80x80.png");
        this.zombieX = 100;
        this.zombieY = 100;
        this.zombieRotation = 0;
        this.background = "black";
    }

    update(deltaSeconds) {
        let fullCircle = Math.PI * 2;
        if (this.keyboard.isPressed("ArrowLeft")) {
            this.zombieX -= 1;
            this.zombieRotation = fullCircle * 3 / 4;
        }
        if (this.keyboard.isPressed("ArrowRight")) {
            this.zombieX += 1;
            this.zombieRotation = fullCircle * 1 / 4;
        }
        if (this.keyboard.isPressed("ArrowUp")) {
            this.zombieY -= 1;
            this.zombieRotation = fullCircle * 0 / 4;
        }
        if (this.keyboard.isPressed("ArrowDown")) {
            this.zombieY += 1;
            this.zombieRotation = fullCircle * 2 / 4;
        }
    }

    draw(ctx, width, height) {
        ctx.drawSprite(this.zombieImage, this.zombieX, this.zombieY, this.zombieRotation);
    }
}