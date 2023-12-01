let ctx;
let canvas;

export const initCanvas = () => {
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");
    // white backdrop
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, 600, 500);
}

export const updateCanvas = (model) => {
    // white backdrop
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, 600, 500);

    for (let i in model.players) {
        drawPlayer(model.players[i]);
    }
    for (let i in model.textBubbles) {
        drawTextBubble(model.textBubbles[i]);
    }
}

export const getMousePosition = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return [x,y];
}

const drawPlayer = (player) => {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "#ff0000";
    ctx.arc(player.x, player.y, 10, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.fill();
    //ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'black';
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(player.name, player.x, player.y+20);
    ctx.restore();
}

export const drawTextBubble = (bubble) => {
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.moveTo(bubble.player.x, bubble.player.y);
    ctx.font = "20px sans-serif";
    ctx.fillText(bubble.text, bubble.player.x+30, bubble.player.y-30);
    ctx.restore();
}

///Ruse evolution claim
///morality is no more than a collective delusion caused by our genes for the purposes of reproduction