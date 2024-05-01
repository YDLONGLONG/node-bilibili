const mongoose = require('mongoose')
let trendCommentSchema = new mongoose.Schema({
  trend: {type: mongoose.Types.ObjectId, index: true, ref: 'trend'},
  commentator: {type: mongoose.Types.ObjectId, ref: 'user'},
  content: String,
  date: Number,
  reply: [{
    from: {type: mongoose.Types.ObjectId, ref: 'user'},
    to: {type: mongoose.Types.ObjectId, ref: 'user'},
    content: String,
    date: Number
  }]
})
let TrendComment = mongoose.model('trendcomment', trendCommentSchema)
module.exports = TrendComment
