const mongoose  = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: {type: Number, require: true, unique: true},
    name: {type: String, require: true},
    email: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    contact_number: {type: String, require: true},
    role: {type: String, enum:['user', 'admin', 'saleperson'], default: 'user'}
    // TODO: these constraint should be froced through js and html also 
});

module.exports = userSchema;