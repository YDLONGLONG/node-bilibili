const express = require('express')
const app = express();
const http = require('http');
const server = http.createServer(app);
const session = require('express-session')
const path = require('path')
const cors = require('cors')
const logger = require('./utils/logger')
const io = require('socket.io')(server);
require('./utils/socket')(io);
require('./server/nms')
require('./db/connect')
/*
 //压缩html css js静态文件
 const compression = require('compression')
 //尽量在其他中间件前使用compression
 app.use(compression());
 */
//跨域访问
// app.use(cors({
//   origin: ['http://82.157.48.201/','http://82.157.48.201:8880', 'http://82.157.48.201:8881'],
//   credentials: true
// }))
app.use(cors({
  origin: ['http://localhost','http://localhost:8880', 'http://localhost:8881'],
  credentials: true
}))
//session
app.use(
  session({
    cookie: {maxAge: 7 * 24 * 60 * 60 * 1000},
    secret: 'gdgdgjhr4yhrtghfg',
    resave: true,
    saveUninitialized: false
  })
)
//静态文件路径
app.use('/res', express.static(path.join(__dirname, './upload'), {
  maxAge: '1y',
  etag: false
}))
// 解析json 和表单
app.use(express.json())
app.use(express.urlencoded({extended: true}))
//路由
app.use('/user', require('./router/userRouter'))
app.use('/upload', require('./router/fileRouter'))
app.use('/video', require('./router/videoRouter'))
app.use('/danmu', require('./router/danmuRouter'))
app.use('/comment', require('./router/commentRouter'))
app.use('/live', require('./router/liveRouter'))
app.use('/msg', require('./router/messageRouter'))
app.use('/notice', require('./router/noticeRouter'))
app.use('/trend', require('./router/trendRouter'))
app.use('/chat', require('./router/chatRouter'))
app.use('/ban', require('./router/banRouter'))
app.use('/qrCode', require('./router/qrRouter'))
//管理员路由
app.use('/admin', (req, res, next) => {
  // if (req.url === '/login' || req.session.login) next()
  // else res.sendStatus(403)
  next()
}, require('./router/adminRouter'))

server.listen(3000, args => logger.newInfo('服务器日志已启动'))

