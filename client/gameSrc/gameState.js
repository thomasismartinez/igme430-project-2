export const players = [];

export class Player {
    constructor(name, color, x, y) {
        this.name = name;
        this.color = color;
        this.x = x;
        this.y = y;
        this.moving = false;
        this.targetX = x;
        this.targetY = x;
        this.moveDirection = [0, 0];
    }
}

export class TextBubble {
    constructor(player, text, startTime) {
        this.player = player;
        this.text = text;
        this.startTime = startTime;
        this.age = 0;
    }
}

export const textBubbles = [];