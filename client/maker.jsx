const helper = require('./helper.js');
const canvas = require('./canvas.js');
const model= require('./gameState.js');
const React = require('react');
const ReactDOM = require('react-dom');
const io = require('socket.io-client');
const socket = io();

let timer;

let playerSpeed = 2;

let userPlayer;

let clientPlayerData;

let premium;

const loadClientData = async () => {
    const response = await fetch('/getClientData');
    const data = await response.json();
    return data;
}

const handleDomo = (e) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#domoName').value;
    const age = e.target.querySelector('#domoAge').value;

    if(!name || !age) {
        helper.handleError('All fields are required!');
        return false;
    }

    helper.sendPost(e.target.action, {name, age}, loadDomosFromServer);

    return false;
};

const handleRoomCode = (e) => {
    e.preventDefault();
    helper.hideError();
    const code = e.target.querySelector('#rCode').value;
    if(!code) {
        helper.handleError('Please enter a room code!');
    }
    // if room exists join room
    // if room does not exist create room
}

const RoomCodeForm = () => {
    <form id="roomForm"
        name="roomForm"
        onSubmit={handleRoomCode}
        action="/joinRoom"
        method="POST"
        className="mainForm"
    >
        <label htmlFor="roomcode">Room Code: </label>
        <input id="rCode" type="text" name="roomcode"/>
        <input className="formSubmit" type="submit" value="Sign in"/>
    </form>
}

const ScribbleGame = (props) => {
    return (
        <div id="main">
        <div id="canvasContainer">
            <canvas width="600" height="500"></canvas>
        </div>
        <div id="controls">
            <form id="chatForm">
                <input type="text" name="chatText" id="textChatField" placeholder="Say Something!"></input>
                <input type="submit" value="➔" id="textChatSubmit"></input>
            </form>
        </div>
        </div>
    );
};

const DomoList = (props) => {
    console.log(props);
    if(props.domos.length === 0) {
        return (
            <div className='domoList'>
                <h3 className='emptyDomo'>No Domos Yet!</h3>
            </div>
        );
    }

    const domoNodes = props.domos.map(domo => {
        return (
            <div key={domo._id} className='domo'>
                <img src='/assets/img/domoface.jpeg' alt='domo face' className='domoFace'/>
                <h3 className='domoName'> Name:  {domo.name}</h3>
                <h3 className='domoAge'> Age:  {domo.age}</h3>
            </div>
        );
    });

    return (
        <div className='domoList'>
            {domoNodes}
        </div>
    )
};

const loadDomosFromServer = async () => {
    console.log('loading domos from server');
    const response = await fetch('/getDomos');
    const data = await response.json();
    ReactDOM.render(
        <DomoList domos={data.domos}/>,
        document.getElementById('domos')
    );
};

const init = async () => {

    // get client player data and create client player
    clientPlayerData = await loadClientData();
    clientPlayerData = new model.Player(clientPlayerData["username"], clientPlayerData["color"], 300, 250);
    console.log('my clients player data: ' + clientPlayerData);
    model.players.push(clientPlayerData);
    userPlayer = model.players[0];
    listPlayer(userPlayer["name"]);

    socketSetup();

    console.log('entering maker.jsx > init()'); 
    ReactDOM.render(
        <ScribbleGame/>,
        document.getElementById('gameView')
    );

    canvas.initCanvas();
    setupControls();
    timer = 0;
    window.requestAnimationFrame(step);
    //window.onload = init;
}

window.onload = init;

///
/// GAME CONTROLS
///
const setupControls = () => {
    // setup chatForm
    let chatForm = document.getElementById('chatForm');
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let txt = chatForm.elements['chatText'].value;
        let newTextBubble = new model.TextBubble(userPlayer, txt, timer);
        model.textBubbles.push(newTextBubble);
        chatForm.innerHTML = '';
    });
    // movement control
    let canvas = document.querySelector("canvas");
    canvas.addEventListener('mousedown', e => {
        //get target coordinates
        const rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        userPlayer.targetX = x;
        userPlayer.targetY = y;
        //set state
        userPlayer.moving = true;
        //get movement vector
        let moveVectorX = x - userPlayer.x;
        let moveVectorY = y - userPlayer.y;
        let magnitude = Math.sqrt(Math.pow(moveVectorX, 2) + Math.pow(moveVectorY, 2));
        userPlayer.moveDirection = [moveVectorX / magnitude, moveVectorY / magnitude];
    });
}

///
/// GAME ANIMATION
///
const step = () => {
    canvas.updateCanvas(model);
    window.requestAnimationFrame(step);

    timer += 0;

    // handle text bubbles
    for (let i in model.textBubbles) {
        let bubble = model.textBubbles[i];
        bubble.age += 1;
        if (bubble.age > 60*5) { //5 seconds 
            model.textBubbles.shift();
        } 
    }
    // handle players
    for (let p in model.players) {
        let player = model.players[p];
        // player movement
        if (player.moving) {
            userPlayer.x +=  userPlayer.moveDirection[0] * playerSpeed;
            userPlayer.y +=  userPlayer.moveDirection[1] * playerSpeed;
            if (Math.abs(userPlayer.x - userPlayer.targetX) < 10 && Math.abs(userPlayer.y - userPlayer.targetY) < 10) {
                userPlayer.moving = false;
            }
        }
    }
}

const socketSetup = () => {
    socket.emit('send-new-player', clientPlayerData);
    socket.on('new-player', newPlayerData => {
        listPlayer(newPlayerData["name"]);
    });
}

const listPlayer = (playerName) => {
    let playerCard = document.createElement('div');
    playerCard.innerHTML = playerName;
    document.getElementById("players").appendChild(playerCard);
}