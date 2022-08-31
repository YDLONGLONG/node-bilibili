let mongoose = require('mongoose')
let chatSchema = new mongoose.Schema(
  {
    userid: {type: mongoose.Types.ObjectId, ref: 'user'},
    friendid: {type: mongoose.Types.ObjectId, ref: 'user'},
    msg: String,
    type: Number, //0文字1图片2文件
    time: Number,
    state: {type:Number, default:1} //0已读1未读
  }
)
let Chat = mongoose.model('chat', chatSchema)
module.exports = Chat
