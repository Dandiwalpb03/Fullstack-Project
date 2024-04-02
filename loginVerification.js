const passport = require('passport');
const bcrypt = require('bcrypt');

function verifyLogin(passport) {
  return (req, res) => {
    passport.authenticate('local', (err, user) => {
      if (err) {
        console.error('Error authenticating user:', err);
        return false;
      }

      if (!user) {
        return false;
      }
      else{
      console.log('User logged in successfully!');
      return true;}
    })(req, res); // Call authenticate with req and res
  };
}

module.exports = verifyLogin;