let mongoose = require('mongoose')
let noticeSchema = new mongoose.Schema(
  {
    title: String,
    date: Number,
    content: String,
    url: String
  }
)
let Notice = mongoose.model('notice', noticeSchema)
module.exports = Notice
