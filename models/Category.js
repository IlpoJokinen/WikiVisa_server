const mongoose = require('mongoose');
const { Schema } = mongoose;

const category = new mongoose.Schema({
    categoryName: {
        type: String
    }
});

category.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})
  const Category = mongoose.model('Category', category)
  
  module.exports = Category
