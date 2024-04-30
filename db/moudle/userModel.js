const mongoose = require('mongoose')
const {DEFAULT_NICK, DEFAULT_SIGN, DEFAULT_HEAD} = require('../../utils/config')
let userSchema = new mongoose.Schema({
  email: {type: String, unique: true},
  password: {type: String, required: true},
  phone: {type: String},
  nick: {type: String, default: DEFAULT_NICK, maxlength: 14},
  sex: {type: Number, default: 0},
  headUrl: {type: String, default: DEFAULT_HEAD},
  sign: {type: String, default: DEFAULT_SIGN, maxlength: 40},
  fansCount: {type: Number, default: 0},
  // video _id
  collectList: [{type: mongoose.Types.ObjectId, ref: 'video'}],
  // user _id
  attentionList: [{type: mongoose.Types.ObjectId, ref: 'user'}],
})
let User = mongoose.model('user', userSchema)
module.exports = User
