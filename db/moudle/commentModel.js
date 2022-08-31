const mongoose = require('mongoose')
let commentSchema = new mongoose.Schema({
  video: {type: mongoose.Types.ObjectId, index: true, require},
  author: {type: mongoose.Types.ObjectId, ref: 'user'},
  content: String,
  date: Number,
  reply: [{
    from: {type: mongoose.Types.ObjectId, ref: 'user'},
    to: {type: mongoose.Types.ObjectId, ref: 'user'},
    content: String,
    date: Number
  }]
})
let Comment = mongoose.model('comment', commentSchema)
module.exports = Comment
