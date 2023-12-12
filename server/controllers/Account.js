const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');
const passwordPage = (req, res) => res.render('password');

const logout = (req, res) => {
  // end session
  req.session.destroy();
  // go to login page
  res.redirect('/');
};

const login = (req, res) => {
  console.log('doing login');
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
    return res.json({ redirect: '/game' });
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
    return res.json({ redirect: '/game' });
  } catch (err) {
    console.log(err);
    // server side error
    return res.status(500).json({ error: 'An error occured!' });
  }
};

const changePassword = async (req, res) => {
  const username = `${req.body.username}`;
  const oldPass = `${req.body.oldPass}`;
  const newPass = `${req.body.newPass}`;
  const newPass2 = `${req.body.newPass2}`;

  console.log('entering Account controller > changePassword');
  console.log(JSON.stringify(req.body));

  if (!username || !oldPass || !newPass || !newPass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (newPass !== newPass2) {
    return res.status(400).json({ error: 'New passwords do not match!' });
  }

  // try to change password
  return Account.authenticate(username, oldPass, async (err, account) => {
    // if error or account doesnt exist or not logged in as correct account
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username and password!' });
    }
    console.log('account authenticated, continuing password change process');

    // try to change password
    try {
      const hash = await Account.generateHash(oldPass);
      // await Account.updateOne({ _id: req.session.account._id }, { $set: { password: hash } });

      // Update the password for the logged-in user
      return await Account.updateOne(
        { _id: req.session.account._id },
        { $set: { password: hash } },
      );
    } catch (er) {
      console.log(er.code);
      // if username taken
      // if (err.code === 11000) {
      //  return res.status(400).json({ error: 'Username already in use!' });
      // }
      // server side error
      return res.status(500).json({ error: 'An error occured!' });
    }
  });
};

const clientPlayerData = async (req, res) => {
  console.log('entering Account controller > clientData()');
  try {
    const query = { _id: req.session.account._id };
    // const docs = await Account.find(query).select('name color premium').lean().exec();
    const docs = await Account.findOne(query).select('_id username color premium createdDate').lean().exec();

    return res.json(docs);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving client player data!' });
  }
};

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  changePassword,
  clientPlayerData,
  passwordPage,
};
