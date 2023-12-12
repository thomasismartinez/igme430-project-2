const gamePage = async (req, res) => {
  console.log('rendering maker page');
  return res.render('app');
};

module.exports = {
  gamePage,
};
