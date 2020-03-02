const mongoose = require('mongoose');
const { Schema } = mongoose;
const uniqueValidator = require('mongoose-unique-validator')

const account = new mongoose.Schema({
    gamertag: {
        type: String,
        required: true,
        minlength: 3,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    }
});

account.plugin(uniqueValidator)

account.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})
  const Account = mongoose.model('Account', account)
  
  module.exports = Account
