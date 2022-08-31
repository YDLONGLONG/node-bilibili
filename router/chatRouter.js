const express = require('express')
const router = express.Router()
const jsonRes = require('../utils/jsonRes')
const Chat = require('../db/moudle/chatModel')

async function findPage (userid,friendid,page) {
    let chatCount = await Chat.countDocuments({userid: userid,friendid:friendid})
    let chat = await Chat.find({userid: userid,friendid:friendid}).sort('-date')
    // .limit(10).skip((page - 1) * 10)
    return {chat, chatCount}
}

//获取一对一消息
router.get('/getChat', async (req, res) => {
    let {userid,friendid,page} = req.query
    if (!userid && !friendid) return res.json(jsonRes(-1, '无ID'))
    let result = await findPage(userid, friendid, page)
    res.json(jsonRes(0, '', result))
})
//保存一对一消息
router.post('/addChat', async (req, res) => {
    let {userid, friendid, msg, type} = req.body
    if (userid && friendid) {
      await Chat.insertMany({userid:userid, friendid:friendid, msg:msg, type:type, time:Date.now()})
      res.json(jsonRes(0, '成功'))
    } else {
      res.json(jsonRes(-1, '缺少'))
    }
})
//汇总一对一消息未读数
router.get('/getunread', async (req, res) => {
    let {userid} = req.query
    if (!userid) return res.json(jsonRes(-1, '无ID'))
    let count = await Chat.countDocuments({friendid: userid,state:1})
    res.json(jsonRes(0, '', count))
})
//一对一消息状态修改
router.post('/setunread', async (req, res) => {
    let {userid, friendid} = req.body
    if (!userid && !friendid) return res.json(jsonRes(-1, '无ID'))
    let count = await Chat.updateMany({friendid: userid,userid:friendid,state:1},{state:0})
    res.json(jsonRes(0, '', count))
})
//删除指定消息
router.post('/deleteOneChat', async (req, res) => {
    let {_id} = req.body
    if (!_id) return res.json(jsonRes(-1, '无ID'))
    let result = await Chat.findByIdAndDelete(_id)
    res.json(jsonRes(0, '', result))
})
module.exports = router