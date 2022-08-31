const mongoose = require('mongoose')
let liveSchema = new mongoose.Schema({
  user: {type: mongoose.Types.ObjectId, ref: 'user', required: true, unique: true},
  title: String,
  imgUrl: {type: String, default: '/res/img/default.jpg'},
  publishUrl: String,
  playUrl: String,
  onLive: {type: Boolean, default: false}
})
let Live = mongoose.model('live', liveSchema)
module.exports = Live
