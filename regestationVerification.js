const passport = require('passport');
const bcrypt = require('bcrypt');

function verifyingUserWhileRegistration(passport){
    passport.use(new LocalStrategy((username, password, done) => {
        // checking if user is already exiting or not. 
        User.findOne({ email: username }, (err, user) => {
        if (err) {
            return done(err);
        }
    
        if (!user) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }
    
        // Compare hashed password (use bcrypt.compare)
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
            return done(err);
            }
    
            if (!isMatch) {
            return done(null, false, { message: 'Incorrect username or password.' });
            }
    
            return done(null, user); // Successful login
        });
        });
    }));
}

module.exports = verifyingUserWhileRegistration;
  