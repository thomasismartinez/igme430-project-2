const models = require('../models');
const Account = models.Account;

const loginPage = (req, res) => {
    return res.render('login');
};

const signupPage = (req, res) => {
    return res.render('signup');
};

const logout = (req, res) => {
    return res.render('logout');
};

const login = (req, res) => {
    
};

const signup = (req, res) => {
    
};

module.exports = {
    loginPage,
    signupPage,
    login,
    logout,
    signup,
}