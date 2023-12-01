const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');


const GameWindow = (props) => {
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
            <button id="createPlayerBtn">Create Player</button>
        </div>
        </div>
    );
}

const init = () => {
    console.log('entering maker.jsx > init()')
    ReactDOM.render(
        <GameWindow/>,
        document.getElementById('gameContent')
    );

    window.onload = init;
}

window.onload = init;