const express = require('express')
const router = express.Router()
const jsonRes = require('../utils/jsonRes')
const Comment = require('../db/moudle/commentModel')
const Message = require('../db/moudle/messageModel')
//发表
router.post('/send', async (req, res) => {
  let {video, author, content} = req.body
  await Comment.insertMany({video, author, content, date: Date.now()})
  return res.json(jsonRes(0, '发表成功'))
})
async function findPage (_id, page) {
  let commentCount = await Comment.countDocuments({video: _id})
  let comment = await Comment.find({video: _id}).sort('-date').limit(5).skip((page - 1) * 5)
    .populate('author', ['nick', 'headUrl'])
    .populate('reply.from', ['nick', 'headUrl'])
    .populate('reply.to', ['nick', 'headUrl'])
  return {comment, commentCount}
}
// 获取
router.get('/page', async (req, res) => {
  let {_id, page} = req.query
  let data = await findPage(_id, page)
  return res.json(jsonRes(0, '获取成功', data))
})
//回复
router.post('/reply', async (req, res) => {
  let {_id, from, to, content, video, page, heSay} = req.body
  let comment = await Comment.findById(_id, 'reply')
  let date = Date.now()
  comment.reply.push({from, to, content, date})
  comment.save()
  await Message.insertMany({comment: _id, you: to, youSay: heSay, user: from, content, date})
  let data = null
  //有则返回分页
  if (video) data = await findPage(video, page)
  return res.json(jsonRes(0, '回复成功', data))
})
//删除
router.post('/delete', async (req, res) => {
  let {_id, reply, video, page} = req.body
  let comment
  //回复
  if (reply) {
    comment = await Comment.findById(_id)
    comment.reply = comment.reply.filter(value => {
      return value._id + '' !== reply
    })
    comment.save()
  }
  //评论
  else {
    await Comment.findByIdAndDelete(_id)
  }
  let data = await findPage(video, page)
  return res.json(jsonRes(0, '删除成功', data))
})
module.exports = router
