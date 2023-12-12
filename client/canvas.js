let ctx;
let canvas;

// setup canvas
export const initCanvas = () => {
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");
    // white backdrop
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, 600, 500);
}

// animate canvas
export const updateCanvas = (model) => {
    ctx.save();
    // white backdrop
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, 600, 500);

    // draw players
    for (let i in model.players) {
        drawPlayer(model.players[i]);
    }
    // draw text bubbles
    for (let i in model.textBubbles) {
        drawTextBubble(model.textBubbles[i], i);
    }
    ctx.restore();
}

// return mouse position for player movement
export const getMousePosition = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return [x,y];
}

const drawPlayer = (player) => {
    ctx.save();
    //https://stackoverflow.com/questions/35397728/storing-images-in-javascript-variables
    let avatar = document.createElement("img");
    console.log(player.color);
    avatar.src = `/assets/img/avatars/${player.color}Avatar.png`;
    ctx.drawImage(avatar, player.x-20, player.y-35.5, 40, 71.1)
    ctx.font = "15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(player.name, player.x, player.y+50);
    ctx.strokeText(player.name, player.x, player.y+50);
    ctx.restore();
}

export const drawTextBubble = (bubble, i) => {
    ctx.save();
    ctx.translate(0,-(60 * i));
    // get text measurements
    ctx.font = "20px sans-serif";
    let txtWidth = ctx.measureText(bubble.text).width;
    let txtHeight = ctx.measureText(bubble.text).height;
    // draw speech bubble
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(bubble.player.x+10, bubble.player.y);
    ctx.lineTo(bubble.player.x+30, bubble.player.y-20);
    ctx.lineTo(bubble.player.x+40+txtWidth,  bubble.player.y-20);
    ctx.lineTo(bubble.player.x+40+txtWidth,  bubble.player.y-20-40);
    ctx.lineTo(bubble.player.x+20,  bubble.player.y-20-40);
    ctx.lineTo(bubble.player.x+20,  bubble.player.y-20);
    ctx.lineTo(bubble.player.x+20, bubble.player.y-20);
    ctx.lineTo(bubble.player.x+10, bubble.player.y);
    ctx.stroke();
    ctx.fill();
    // draw text
    ctx.fillStyle = 'black';
    ctx.moveTo(bubble.player.x, bubble.player.y);
    ctx.fillText(bubble.text, bubble.player.x+30, bubble.player.y-30);
    ctx.restore();
}

///Ruse evolution claim
///morality is no more than a collective delusion caused by our genes for the purposes of reproduction