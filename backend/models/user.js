const mongoose = require('mongoose');

//1 email unique par user
const uniqueValidator = require('mongoose-unique-validator');

//Schéma de données : user, pr mongoDb
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);