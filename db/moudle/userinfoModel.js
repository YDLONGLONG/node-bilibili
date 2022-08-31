const mongoose = require('mongoose')
let userinfoSchema = new mongoose.Schema({
  userid:{type: mongoose.Types.ObjectId, ref: 'user', required: true},
  age: {type: Number,maxlength: 2},
  phone: {type: Number,maxlength: 11},
  birth: {type: Date},
  address: {type: String},
  introduction: {type: String,maxlength: 100},
  history:[{
    videoId:{type: mongoose.Types.ObjectId, ref: 'video'},
    videoAuthor:{type:String},
    videoTitle:{type:String},
    videoImg:{type:String},
    date:Number
  }]
})
let UserInfo = mongoose.model('userinfo', userinfoSchema)

// const userinfo = new UserInfo({
//   userid:"60f978f323ce2361454dc96c",
// 	history:[{
//     videoId:"6201c9895cdf906d98e1a70a",
//     videoAuthor:"李逸宸",
//     videoTitle:"三星泽丽",
//     videoImg:"/res/1644284296089.png",
//   }]
// });

// userinfo.save();

module.exports = UserInfo