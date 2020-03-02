const mongoose = require('mongoose');
const { Schema } = mongoose;

const user = new mongoose.Schema({
    gamertag: {
        type: String
    }, 
    password: {
        type: String
    }
  });

  user.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})
  const User = mongoose.model('User', user)
  
  module.exports = User
