let mongoose = require('mongoose')
let adminSchema = new mongoose.Schema(
  {
    user: {type: String, unique: true},
    pass: String
  }
)
let Admin = mongoose.model('admin', adminSchema)
module.exports = Admin
