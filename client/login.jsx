const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const handleLogin = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if(!username || !pass) {
        helper.handleError('Username or password is empty!');
    }

    helper.sendPost(e.target.action, {username, pass});

    return false;
}

const handleSignup = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if(!username || !pass || !pass2) {
        helper.handleError('All fields are required!');
    }

    if (pass !== pass2) {
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass, pass2});

    return false;
}

const LoginWindow = (props) => {
    return (
        <div>
            <form id="loginForm"
                name="loginForm"
                onSubmit={handleLogin}
                action="/login"
                method="POST"
                className="mainForm"
            >
                <label htmlFor="username">Username: </label>
                <input id="user" type="text" name="username" placeholder="username"/>
                <label htmlFor="pass">Password: </label>
                <input id="pass" type="password" name="pass" placeholder="password"/>
                <input className="formSubmit" type="submit" value="Sign in"/>
            </form>
            <button id="signupButton" href="">Make an Account</button>
        </div>
    ); //<a id="signupButton" href="/signup">Make an Account</a>
}

const SignupWindow = (props) => {
    return (
        <div>
            <form id="signupForm"
                name="signupForm"
                onSubmit={handleSignup}
                action="/signup"
                method="POST"
                className="mainForm"
            >
                <label htmlFor="username">Username: </label>
                <input id="user" type="text" name="username" placeholder="username"/>
                <label htmlFor="pass">Password: </label>
                <input id="pass" type="password" name="pass" placeholder="password"/>
                <label htmlFor="pass">Password: </label>
                <input id="pass2" type="password" name="pass2" placeholder="retype password"/>
                <input className="formSubmit" type="submit" value="Sign in"/>
            </form>
            <button id="loginButton" href="/login">Already have an Account? - Login</button>
        </div>
    ); //<a id="loginButton" href="/login">Login</a>
};

const renderLogin = () => {
    // render form
    ReactDOM.render(<LoginWindow />, document.getElementById('content'));
    // nav button/s
    const signupButton = document.getElementById('signupButton');
    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        renderSignup();
        return false;
    });
}

const renderSignup = () => {
    ReactDOM.render(<SignupWindow />, document.getElementById('content'));
    const loginButton = document.getElementById('loginButton');
    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        renderLogin();
        return false;
    });
}

//const init = () => {
//    renderLogin();
//    ReactDOM.render(<LoginWindow />, document.getElementById('content'));
//    const loginButton = document.getElementById('loginButton');
//    const signupButton = document.getElementById('signupButton');
//
//    loginButton.addEventListener('click', (e) => {
//        e.preventDefault();
//        ReactDOM.render(<LoginWindow />,
//            document.getElementById('content'));
//        return false;
//    });
//
//    signupButton.addEventListener('click', (e) => {
//        e.preventDefault();
//        ReactDOM.render(<SignupWindow />,
//            document.getElementById('content'));
//        return false;
//    });
//};

window.onload = renderLogin;