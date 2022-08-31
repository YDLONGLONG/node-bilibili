let mongoose = require('mongoose')
let trendSchema = new mongoose.Schema(
  {
    author: {type: mongoose.Types.ObjectId, ref: 'user'},
    content: {type:String,maxlength:1000},
    date: Number,
    zanList: [{type: mongoose.SchemaTypes.ObjectId}]
  }
)
let Trend = mongoose.model('trend', trendSchema)
module.exports = Trend
