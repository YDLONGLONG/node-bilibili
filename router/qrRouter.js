//手机扫码并支付 前端显示支付成功并跳转页面
const express = require('express')
const router = express.Router()
const qrImg = require('qr-image')
const WebSocket = require('ws')
const qs = require('qs')
//生成订单二维码
router.get('/', async (req, res) => {
  let {orderId} = req.query
  let qrCode = qrImg.image(`http://192.168.43.172:3000/res/submit.html?orderId=${orderId}`)
  res.type('png')
  qrCode.pipe(res)
})
router.post('/submit', async (req, res) => {
  let {orderId} = req.body
  sendMessage(JSON.stringify({err: 0, msg: '支付成功'}), orderId)
  res.send('支付成功')
})
const ws = new WebSocket.Server({port: 8081}, () => {
  console.log('ws服务器已开启')
})
let clients = []
ws.on('connection', (client, req) => {
  let orderId = qs.parse(req.url.split('?')[1]).orderId
  handJoin(orderId, client)
  client.on('close', () => {
    remove(client)
  })
})

//处理加入的客户端为其添加订单号
function handJoin (orderId, client) {
  client.orderId = orderId
  clients.push(client)
}

//向相应的客户端发送消息
function sendMessage (msg, orderId) {
  clients.forEach(client => {
    if (client.orderId === orderId) client.send(msg)
  })
}

//移除退出的客户端
function remove (client) {
  let index = clients.indexOf(client)
  clients.splice(index, 1)
}

module.exports = router
