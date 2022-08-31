const mongoose = require('mongoose')
let videoSchema = new mongoose.Schema(
  {
    //  user _id
    author: {type: mongoose.Types.ObjectId, ref: 'user', required: true},
    title: {type: String, required: true, maxlength: 30},
    type: {type: Number, required: true},
    //  视频简介
    desc: String,
    //  上传时间
    uploadAt: {type: Number},
    imgUrl: {type: String, require: true},
    videoUrl: {type: String, require: true},
    playCount: {type: Number, default: 0},
    collectList: [{type: mongoose.SchemaTypes.ObjectId}],
    zanList: [{type: mongoose.SchemaTypes.ObjectId}],
    isAdopt:{type:Boolean,default:false}
  }
)
let Video = mongoose.model('video', videoSchema)
module.exports = Video
