const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/danmu', {
  //4个警告处理
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
let db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
})
