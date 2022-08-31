const express = require('express')
const router = express.Router()
const jsonRes = require('../utils/jsonRes')
const Message = require('../db/moudle/messageModel')
//获取消息
router.get('/getMsg', async (req, res) => {
  let {_id} = req.query
  if (!_id) return res.json(jsonRes(-1, '无ID'))
  let result = await Message.find({you: _id}).sort('-date').populate('comment', ['content', 'video'])
    .populate('you', ['nick', 'headUrl']).populate('user', ['nick', 'headUrl'])
  res.json(jsonRes(0, '', result))
})
//删除消息
router.get('/deleteMsg', async (req, res) => {
  let {_id, userId} = req.query
  if (!_id) return res.json(jsonRes(-1, '无ID'))
  await Message.findByIdAndDelete(_id)
  let result = await Message.find({you: userId}).sort('-date').populate('comment', ['content', 'video'])
    .populate('you', ['nick', 'headUrl']).populate('user', ['nick', 'headUrl'])
  res.json(jsonRes(0, '删除成功', result))
})
module.exports = router
