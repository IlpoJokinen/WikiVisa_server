const mongoose = require('mongoose');
const { Schema } = mongoose;

const page= new mongoose.Schema({
    pageStr: {
        type: String
    },
    data: {
        type: JSON
    }
});

page.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})
  const Page = mongoose.model('Page', page)
  
  module.exports = Page
