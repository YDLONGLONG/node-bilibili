const express = require('express')
const router = express.Router()
const jsonRes = require('../utils/jsonRes')
const Trend = require('../db/moudle/trendModel')
const TrendComment = require('../db/moudle/trendCommentModel')
const TrendMessage = require('../db/moudle/trendMessageModel')

async function findPage (_id, page) {
    let trendCount = await Trend.countDocuments({author: _id})
    let trend = await Trend.find({author: _id}).sort('-date').limit(5).skip((page - 1) * 5)
      .populate('author', ['nick', 'headUrl'])
      .populate('reply.from', ['nick', 'headUrl'])
      .populate('reply.to', ['nick', 'headUrl'])
    return {trend, trendCount}
  }
// 发表动态
router.post('/sendtrend', async (req, res) => {
  let { author, content} = req.body
  await Trend.insertMany({ author, content, date: Date.now()})
  return res.json(jsonRes(0, '发表成功'))
})
// 删除动态
router.post('/deletetrend', async (req, res) => {
  let {_id, author, page} = req.body
  await Trend.findByIdAndDelete(_id)
  let data = await findPage(author, page)
  return res.json(jsonRes(0, '删除成功', data))
})
// 获取全部动态
router.get('/trendpage', async (req, res) => {
  let {author, page} = req.query
  let data = await findPage(author, page)
  return res.json(jsonRes(0, '获取成功', data))
})
// 获取单个动态详情
router.get('/trendinfo', async (req, res) => {
    let {_id} = req.query
    let data = await Trend.find({ _id})
    return res.json(jsonRes(0, '获取成功', data))
})

async function findPage2 (_id, page) {
    let commentCount = await TrendComment.countDocuments({trend: _id})
    let comment = await TrendComment.find({trend: _id}).sort('-date').limit(10).skip((page - 1) * 10)
      .populate('commentator', ['nick', 'headUrl'])
      .populate('reply.from', ['nick', 'headUrl'])
      .populate('reply.to', ['nick', 'headUrl'])
    return {comment, commentCount}
  }
// 发表评论
router.post('/sendcomment', async (req, res) => {
    let {trend, commentator, content} = req.body
    await TrendComment.insertMany({trend, commentator, content, date: Date.now()})
    return res.json(jsonRes(0, '发表成功'))
})
// 获取评论
router.get('/commentpage', async (req, res) => {
    let {_id, page} = req.query
    let data = await findPage2(_id, page)
    return res.json(jsonRes(0, '获取成功', data))
})
// 回复评论
router.post('/replycomment', async (req, res) => {
  let {_id, from, to, content, page, heSay, trend} = req.body
  let comment = await TrendComment.findById(_id, 'reply')
  let date = Date.now()
  comment.reply.push({from, to, content, date})
  comment.save()
  await TrendMessage.insertMany({trend: _id, you: to, youSay: heSay, user: from, content, date})
  let data = null
  //有则返回分页
  if (trend) data = await findPage2(trend, page)
  return res.json(jsonRes(0, '回复成功', data))
})
// 删除
router.post('/delete', async (req, res) => {
  let {_id, reply, trend, page} = req.body
  let comment
  //回复
  if (reply) {
    comment = await TrendComment.findById(_id)
    comment.reply = comment.reply.filter(value => {
      return value._id + '' !== reply
    })
    comment.save()
  }
  //评论
  else {
    await TrendComment.findByIdAndDelete(_id)
  }
  let data = await findPage2(trend, page)
  return res.json(jsonRes(0, '删除成功', data))
})

// 点赞动态
router.post('/zan', async (req, res) => {
  let {_id, author} = req.body
  let trend = await Trend.findById(_id)
  let index = trend.zanList.indexOf(author)
  if (index === -1) {
    trend.zanList.push(author)
    res.json(jsonRes(0, '点赞成功', trend.zanList))
  } else {
    trend.zanList.splice(index, 1)
    res.json(jsonRes(0, '取消点赞', trend.zanList))
  }
  await trend.save()
})
module.exports = router
