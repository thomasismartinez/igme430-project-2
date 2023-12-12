const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getClientData', mid.requiresLogin, controllers.Account.clientPlayerData);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/changePassword', mid.requiresLogin, controllers.Account.passwordPage);
  app.post('/changePassword', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePassword);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/game', mid.requiresLogin, controllers.Game.gamePage);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
