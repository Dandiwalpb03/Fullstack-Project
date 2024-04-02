const validator = require('validator');

function validatePasswordLength(req, res) {
  const { password } = req.body;

  // Combine length validation with regular expression for complexity
  const isValidPassword = validator.isLength(password, { min: 8, max: 16 }) &&
                         /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password);

  if (!isValidPassword) {
    return res.status(400).json({
      message: 'Password must be 8-16 characters long, contain a number, a lowercase letter, and an uppercase letter.'
    });
  }

  //next(); // If password is valid, continue to the next middleware
}

module.exports = validatePasswordLength;
