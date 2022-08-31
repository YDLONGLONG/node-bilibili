const mongoose = require('mongoose')
let banSchema = new mongoose.Schema({
  trendid: {type: String, unique: true},
  radio: {type: String, required: true},
  textarea: {type: String, required: true},
  submitid:{type: String, unique: true},
})
let Ban = mongoose.model('ban', banSchema)
module.exports = Ban
