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
// const ws = new WebSocket.Server({port: 8081}, () => {
//   console.log('ws服务器已开启')
// })
// let clients = []
// ws.on('connection', (client, req) => {
//   let orderId = qs.parse(req.url.split('?')[1]).orderId
//   handJoin(orderId, client)
//   client.on('close', () => {
//     remove(client)
//   })
// })

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

//引入支付宝沙箱配置
const alipaySdk = require('../utils/alipay.js');
const axios = require( 'axios' );

//支付接口
router.post('/payment', function(req, res, next) {
    let { price,name }=req.body
    //生成订单号
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    let orderId = year + '' + month + '' + day + '' + hour + '' + minute + '' + second;
   // 获取支付宝官方支付链接
   const resultUrl = alipaySdk.pageExec('alipay.trade.precreate', {
      method: 'GET',
      bizContent:{
        out_trade_no: orderId, // 商户订单号,64个字符以内、可包含字母、数字、下划线,且不能重复
        total_amount: price, // 订单总金额('0.01')，单位为元，精确到小数点后两位[string]类型
        subject: name, // 订单标题
      }
   })
   // 生成订单
   axios.get(resultUrl).then(resultData => {
      // 给前端发送订单信息
      res.json({ ...resultData.data, msg: '订单创建成功' })
   }).catch(err => {
      res.json({ msg: '订单创建失败', err })
   })
})

// 解析支付订单状态
router.post('/queryOrder', async (req, res) => {
  const { orderId } = req.body
  const resultData = alipaySdk.pageExec('alipay.trade.query', {
     method: 'GET',
     bizContent:{
      out_trade_no : orderId,
      trade_no: orderId,
     }
  })
  const queryRes = await axios.get(resultData)
  const queryData = queryRes.data.alipay_trade_query_response
  res.json(queryData)
})

module.exports = router
