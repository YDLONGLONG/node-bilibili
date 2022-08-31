let mongoose = require('mongoose')
let codeSchema = new mongoose.Schema(
  {
    email: {type: String, unique: true},
    phone: {type: String, unique: true},
    ctime: Number,
    code: String
  }
)
let Code = mongoose.model('code', codeSchema)
module.exports = Code
