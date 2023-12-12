const helper = require('./helper.js');
const canvas = require('./canvas.js');
const model= require('./gameState.js');
const React = require('react');
const ReactDOM = require('react-dom');
const io = require('socket.io-client');
const { forEach } = require('underscore');
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

const ScribbleGame = () => {
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

const PlayerList = (players) => {
    const playerNodes = model.players.map(player => {
        if (player.id === clientPlayerData.id) {
            return (
                <div className='domoList'>
                    <div key={clientPlayerData.name} className='domo' id="account-button">
                        <img src='/assets/img/pfp.png' alt='domo face' className='domoFace'/>
                        <h3 className='playerName'>{clientPlayerData.name}</h3>
                    </div>
                </div>
            );
        }
        return (
            <div key={players.name} className='domo'>
                <h3 className='playerName'> Name:  {player.name}</h3>
            </div>
        );
        
    });

    return (
        <div>
            {playerNodes}
        </div>
    );
}

const AccountMenu = () => {
    return (
        <div class="account-menu-background">
            <div class="account-menu-body">
                <h1>{clientPlayerData["name"]}</h1>
                <h2>Account created: {clientPlayerData["age"]}</h2>
                <form id="colorForm">
                    <input type="radio" id="redRadio" name="player-color" value="#F00"></input>
                    <input type="radio" id="blueRadio" name="player-color" value="#0F0"></input>
                    <input type="radio" id="greenRadio" name="player-color" value="#00F"></input>
                    <input type="submit" value="Change Color" id="colorFomSubmit"></input>
                </form>
                <button id='premium-button'>Purchase Premium</button>
                <button id="close-button">Close</button>
                <a href="/changePassword">Change Password</a>
                <a href="/logout">Log out</a>
            </div>
        </div>
    );
}

const SetupAccountMenu = () => {
    document.getElementById('premium-button').onclick = () => {
        premium = true;
        helper.sendPost('/upgradeAccount', clientPlayerData.id);
    }
    document.getElementById('close-button').onclick = () => {
        ReactDOM.render(
            <div></div>,
            document.getElementById('overlayMenu')
        )
    }
}

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

    console.log(socket.id);

    // get client player data and create client player
    data = await loadClientData();
    clientPlayerData = new model.Player(data["_id"], data["username"], data["color"], data["createdDate"], 300, 250, socket.id);
    //console.log(JSON.stringify(clientPlayerData));
    model.players.push(clientPlayerData);
    userPlayer = model.players[0];

    socketSetup();

    ReactDOM.render(
        <ScribbleGame/>,
        document.getElementById('gameView')
    );

    ReactDOM.render(
        <PlayerList/>,
        document.getElementById('playerList')
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
        chatForm.elements['chatText'].value = '';
        socket.emit('send-chat', {
            name: userPlayer.name,
            txt: txt
        });
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
        let dir = [moveVectorX / magnitude, moveVectorY / magnitude];
        userPlayer.moveDirection = dir;
        socket.emit('send-player-movement', {
            name: userPlayer.name,
            targetX: x,
            targetY: y,
            moveDirection: dir
        });
    });
    // account menu botton
    let accountButton = document.getElementById('account-button');
    accountButton.addEventListener('mousedown', e => {
        ReactDOM.render(
            <AccountMenu/>,
            document.getElementById('overlayMenu')
        );
        SetupAccountMenu();
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
            player.x +=  player.moveDirection[0] * playerSpeed;
            player.y +=  player.moveDirection[1] * playerSpeed;
            if (Math.abs(player.x - player.targetX) < 1 && Math.abs(player.y - player.targetY) < 1) {
                player.moving = false;
            }
        }
    }
}

///
/// socket.io control
///
const socketSetup = () => {
    //console.log(clientPlayerData);
    socket.emit('send-new-player', clientPlayerData);

    const addNewPlayer = (newPlayerData) => {
        let exists = false
        for(let i in model.players) {
            let player = model.players[i];
            if(player.id === newPlayerData.id) {
                exists = true;
                model.textBubbles.push(new model.TextBubble(player, chatData.txt, timer));
            }
        }

        if (!exists) {
            model.players.push(new model.Player(
                newPlayerData["id"], newPlayerData["name"], newPlayerData["color"], newPlayerData["age"], newPlayerData["x"], newPlayerData["y"], newPlayerData["socketId"]));
            //console.log('adding player: ' + JSON.stringify(newPlayerData));
            ReactDOM.render(
                <PlayerList player={model.players}/>,
                document.getElementById('playerList')
            );
        }
    }

    socket.on('new-player', newPlayerData => {
        //console.log(newPlayerData["socketId"]);
        addNewPlayer(newPlayerData);
        socket.emit('send-update-new-player', {targetId: newPlayerData["id"], data: clientPlayerData});
    });

    socket.on('update-new-player', updateData => {
        if (clientPlayerData["id"] === updateData["targetId"]) {
            addNewPlayer(updateData["data"]);
        }
    });

    socket.on('player-movement', moveData => {
        for(let i in model.players) {
            let player = model.players[i];
            if(player.name === moveData.name) {
                player.moving = true;
                player.targetX = moveData.targetX;
                player.targetY = moveData.targetY;
                player.moveDirection = moveData.moveDirection;
            }
        }
    });
    
    socket.on('chat', chatData => {
        for(let i in model.players) {
            let player = model.players[i];
            if(player.name === chatData.name) {
                model.textBubbles.push(new model.TextBubble(player, chatData.txt, timer));
            }
        }
    });

    //socket.on('disconnect', socket => {
    //    socket.emit('send-player-disconnect', clientPlayerData["id"]);
    //})

    socket.on('player-disconnecting', disconnectingId => {
        console.log(`socket id ${disconnectingId} has disconnected`);
        for(let i in model.players) {
            let player = model.players[i];
            if(player.socketId === disconnectingId) {
                const x = model.players.splice(i, i);
            }
        }
        ReactDOM.render(
            <PlayerList player={model.players}/>,
            document.getElementById('playerList')
        );
    })
}