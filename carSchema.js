const mongoose = require('mongoose');


const carSchema = new mongoose.Schema({
    carID:{type: Number, require: true, unique: true} ,
    model: {type: String, require: true},
    make: {type: String, require: true},
    year: {type: Number, require: true},
    color: {type: String, require: true},
    price: {type: Number, require: true},
    mileage: {type: Number, require: true},
    fuel_efficiency: {type: Number, require: true},
    type: {type: String, require: true},
    status:{type: String, enum: ['available', 'sold', 'hold'], default: 'avialable'},
    description: {type: String, require: true},
    image: {type: String,trim: true}
    // TODO: these constraint should be froced through js and html also 

});

module.exports = carSchema;