const express = require('express')
const multer = require('multer')
const router = express.Router()
const jsonRes = require('../utils/jsonRes')
const Video = require('../db/moudle/videoModel')
let fileName, imgName, videoName, avatarName
const videoStorage = multer.diskStorage({
  //指定路径
  destination: function (req, file, cb) {
    cb(null, './upload')
  },
  //指定名字
  filename: function (req, file, cb) {
    let before = Date.now() + parseInt(Math.random() * 999 + '')
    let after = file.originalname.split('.').pop()
    fileName = before + '.' + after
    if (after === 'mp4' || after === 'flv') {
      videoName = fileName
    }
    if (after === 'jpg' || after === 'png' || after === 'jpeg') {
      imgName = fileName
    }
    cb(null, fileName)
  }
})
const avatarStorage = multer.diskStorage({
  //指定路径
  destination: function (req, file, cb) {
    cb(null, './upload/temp')
  },
  //指定名字
  filename: function (req, file, cb) {
    let random = Date.now() + parseInt(Math.random() * 999 + '')
    let last = file.originalname.split('.').pop()
    avatarName = random + '.' + last
    cb(null, avatarName)
  }
})
//视频
const video = multer({storage: videoStorage})
//头像
const avatar = multer({storage: avatarStorage})
//上传视频
router.post('/video', video.fields([{name: 'img', maxCount: 1}, {name: 'video', maxCount: 1}]),
  async (req, res) => {
    if (!req.session.login) {
      res.json(jsonRes(-1, '先登录'))
    }
    let {author, title, type, desc} = req.body
    if (author && title && type) {
      let data = await Video.insertMany({
        author,
        title,
        type,
        desc,
        uploadAt: Date.now(),
        imgUrl: `/res/${imgName}`,
        videoUrl: `/res/${videoName}`,
      })
      res.json(jsonRes(0, '上传成功', data))
    } else {
      res.json(jsonRes(-2, '缺少必要信息,上传失败'))
    }
  }
)
//头像 封面
router.post('/avatar', avatar.single('img'), async (req, res) => {
  res.json(jsonRes(0, '成功', '/res/temp/' + avatarName))
})
module.exports = router
