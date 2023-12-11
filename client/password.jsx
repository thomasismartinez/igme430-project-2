const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const handleChangePassword = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const oldPass = e.target.querySelector('#oldPass').value;
    const newPass = e.target.querySelector('#newPass').value;
    const newPass2 = e.target.querySelector('#newPass2').value;

    if(!username || !oldPass || !newPass || !newPass2) {
        helper.handleError('All fields are required!');
    }

    if (newPass !== newPass2) {
        helper.handleError('New passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, {username, oldPass, newPass, newPass2});

    return false;
}

const PasswordChangeWindow = (props) => {
    return (
        <div>
            <form id="changePassForm"
                name="changePassForm"
                onSubmit={handleChangePassword}
                action="/changePassword"
                method="POST"
                className="mainForm"
            >
                <label htmlFor="username">Username: </label>
                <input id="user" type="text" name="username" placeholder="username"/>
                <label htmlFor="pass">Password: </label>
                <input id="oldPass" type="password" name="oldPass" placeholder="password"/>
                <label htmlFor="pass">New Password: </label>
                <input id="newPass" type="password" name="newPass" placeholder="new password"/>
                <label htmlFor="pass">New Password: </label>
                <input id="newPass2" type="password" name="newPass2" placeholder="retype new password"/>
                <input className="formSubmit" type="submit" value="Change Password"/>
            </form>
            <a id="exitPassChange" href="/maker">Cancel</a>
        </div>
    ); //<a id="loginButton" href="/login">Login</a>
};

const init = () => {
    ReactDOM.render(<PasswordChangeWindow />, document.getElementById('content'));
}

window.onload = init;