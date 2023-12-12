const helper = require('./helper.js');
const canvas = require('./canvas.js');
const model= require('./gameState.js');
const React = require('react');
const ReactDOM = require('react-dom');
const io = require('socket.io-client');
const { forEach } = require('underscore');
const socket = io();

// gameplay information
let timer;
let playerSpeed = 2;
let userPlayer;
let clientPlayerData;
let premium;

// gets player data for client player
const loadClientData = async () => {
    const response = await fetch('/getClientData');
    const data = await response.json();
    return data;
}

// returns a game canvas and chat message form
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

// returns a div list of all current players in game
const PlayerList = (players) => {
    const playerNodes = model.players.map(player => {
        if (player.id === clientPlayerData.id) {
            return (
                <div key={clientPlayerData.name} className='playerNode' id="account-button">
                    <div class="playerImgContainer">
                        <img id="clientPlayerAvatarImg" src={`/assets/img/avatars/${clientPlayerData.color}Avatar.png`} width='40'></img>
                    </div>
                    <h3 className='playerName'>{clientPlayerData.name}</h3>
                </div>
            );
        }
        return (
            <div key={players.name} className='playerNode'>
                <div class="playerImgContainer">
                    <img id="clientPlayerAvatarImg" src={`/assets/img/avatars/${player.color}Avatar.png`} width='40'></img>
                </div>
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

// shows account of client player
const AccountMenu = () => {
    return (
        <div class="account-menu-background">
            <div class="account-menu-body">
                <h1>{clientPlayerData["name"]}</h1>
                <h2>Account created: {clientPlayerData["age"]}</h2>
                <div class="playerImgContainer">
                    <img id="clientPlayerAvatarImg" src={`/assets/img/avatars/${clientPlayerData.color}Avatar.png`} width='100'></img>
                </div>
                <form id="colorForm"
                name="colorForm"
                onSubmit={handleColorChange}
                //action="/changeColor"
                //method="POST"
                >
                    <label>
                        <input type="radio" id="blackRadio" name="color" value="black"></input>
                        <img id="blackAvatarImg" src="/assets/img/avatars/blackAvatar.png" width='50'></img>
                    </label>
                    <label>
                        <input type="radio" id="blueRadio" name="color" value="blue"></input>
                        <img id="blueAvatarImg" src="/assets/img/avatars/blueAvatar.png" width='50'></img>
                    </label>
                    <label>
                        <input type="radio" id="greenRadio" name="color" value="green"></input>
                        <img id="greenAvatarImg" src="/assets/img/avatars/greenAvatar.png" width='50'></img>
                    </label>
                    <label>
                        <input type="radio" id="redRadio" name="color" value="red"></input>
                        <img id="redAvatarImg" src="/assets/img/avatars/redAvatar.png" width='50'></img>
                    </label>
                    <label>
                        <input type="radio" id="goldRadio" name="color" value="gold" disabled={!premium}></input>
                        <img id="goldAvatarImg" src="/assets/img/avatars/goldAvatar.png" width='50'></img>
                    </label>
                    <input type="submit" value="Change Color" id="colorFomSubmit"></input>
                </form>
                <button id='premium-button' disabled={premium}>Purchase Premium</button>
                <button id="close-button">Close</button>
                <a href="/changePassword">Change Password</a>
                <a href="/logout">Log out</a>
            </div>
        </div>
    );
}

// sets up controls in account menu
const SetupAccountMenu = () => {
    // premium button activates access to premium skins
    document.getElementById('premium-button').onclick = () => {
        premium = true;
        clientPlayerData.premium = true;
        ReactDOM.render(
            <AccountMenu/>,
            document.getElementById('overlayMenu')
        );
    }
    // close button hides menu
    document.getElementById('close-button').onclick = () => {
        ReactDOM.render(
            <div></div>,
            document.getElementById('overlayMenu')
        )
    }
}

// changes color of player
const handleColorChange = (e) => {
    console.log('handling color change');
    e.preventDefault();
    helper.handleError();
    // code from chatGPT
    let radioButtons = document.getElementsByName('color');
    //console.log(JSON.stringify(radioButtons));

    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            // Return the value of the selected radio button
            clientPlayerData.color = radioButtons[i].value;
            console.log(clientPlayerData);
            // re-render elements that show player avatars
            ReactDOM.render(
                <AccountMenu/>,
                document.getElementById('overlayMenu')
            );
            ReactDOM.render(
                <PlayerList/>,
                document.getElementById('playerList')
            );
            socket.emit('send-color-change', clientPlayerData);
            return;
        }
    }
}

const init = async () => {

    console.log(socket.id);

    // get client player data and create client player
    data = await loadClientData();
    clientPlayerData = new model.Player(data["_id"], data["username"], data["color"], data["createdDate"], 300, 250, socket.id);
    //console.log(JSON.stringify(clientPlayerData));
    model.players.push(clientPlayerData);
    userPlayer = model.players[0];

    // setup socket.io
    socketSetup();

    // rander game
    ReactDOM.render(
        <ScribbleGame/>,
        document.getElementById('gameView')
    );

    // render list of players
    ReactDOM.render(
        <PlayerList/>,
        document.getElementById('playerList')
    );

    // set up game canvas
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
    // tell other player client has joined
    socket.emit('send-new-player', clientPlayerData);

    // when new player joins
    const addNewPlayer = (newPlayerData) => {
        // make sure this player isnt already in the game
        let exists = false
        for(let i in model.players) {
            let player = model.players[i];
            if(player.id === newPlayerData.id) {
                exists = true;
                model.textBubbles.push(new model.TextBubble(player, chatData.txt, timer));
            }
        }
        // add player to game
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

    //  when new player socket joins
    socket.on('new-player', newPlayerData => {
        addNewPlayer(newPlayerData);
        // tell new player that this client exists
        socket.emit('send-update-new-player', {targetId: newPlayerData["id"], data: clientPlayerData});
    });

    // response from join emit, adds pre-existing players to game
    socket.on('update-new-player', updateData => {
        if (clientPlayerData["id"] === updateData["targetId"]) {
            addNewPlayer(updateData["data"]);
        }
    });

    // player moves
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
    
    // player sends chat
    socket.on('chat', chatData => {
        for(let i in model.players) {
            let player = model.players[i];
            if(player.name === chatData.name) {
                model.textBubbles.push(new model.TextBubble(player, chatData.txt, timer));
            }
        }
    });

    // player changes avatar
    socket.on('color-change', playerData => {
        for(let i in model.players) {
            let player = model.players[i];
            if(player.name === playerData.name) {
                player.color = playerData.color;
                ReactDOM.render(
                    <PlayerList/>,
                    document.getElementById('playerList')
                );
            }
        }
    });

    // player leaves
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