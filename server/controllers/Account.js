const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');

const signupPage = (req, res) => res.render('signup');

const logout = (req, res) => {
  // end session
  req.session.destroy();
  // go to login page
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  // ensure all fields are filled
  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    // if error or account doesnt exist
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username and password!' });
    }

    //
    req.session.account = Account.toAPI(account);

    // otherwise take user to website
    return res.json({ redirect: '/maker' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  // ensure all fields are filled
  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  // esnure passwords match
  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  // try to create account
  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/maker' });
  } catch (err) {
    console.log(err);
    // if username taken
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    // server side error
    return res.status(500).json({ error: 'An error occured!' });
  }
};

module.exports = {
  loginPage,
  signupPage,
  login,
  logout,
  signup,
};
