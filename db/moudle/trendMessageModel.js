let mongoose = require('mongoose')
let trendMessageSchema = new mongoose.Schema(
  {
    trend: {type: mongoose.Types.ObjectId, ref: 'trend'},
    you: {type: mongoose.Types.ObjectId, ref: 'user'},
    youSay: String,
    user: {type: mongoose.Types.ObjectId, ref: 'user'},
    content: String,
    date: Number
  }
)
let TrendMessage = mongoose.model('trendmessage', trendMessageSchema)
module.exports = TrendMessage
