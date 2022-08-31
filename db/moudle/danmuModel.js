const mongoose = require('mongoose')
let danmuSchema = new mongoose.Schema({
  player: {type: mongoose.Types.ObjectId, required: true, index: true},
  danmuList: [{
    author: {type: mongoose.Types.ObjectId, ref: 'user'},
    time: Number,
    text: String,
    color: String,
    type: {type: Number},
    date: Number
  }]
})
let Danmu = mongoose.model('danmu', danmuSchema)
module.exports = Danmu
