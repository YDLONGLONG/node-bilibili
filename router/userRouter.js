const express = require('express')
const mail = require('../utils/mail')
const jsonRes = require('../utils/jsonRes')
const router = express.Router()
const User = require('../db/moudle/userModel')
const UserInfo = require('../db/moudle/userinfoModel')
const Video = require('../db/moudle/videoModel')
const Code = require('../db/moudle/codeModel')
const fs = require('fs')
const hmac = require('../utils/hmac')
//获取邮箱验证码
router.post('/sendEmail', async (req, res) => {
  let {email} = req.body
  if (!email) return res.json(jsonRes(-2, 'email为空'))
  let user = await User.findOne({email})
  //if (!user) return res.json(jsonRes(-3, '邮箱未注册'))
  let code = await Code.findOne({email})
  //随机数
  let randNum
  if (!code) {
    randNum = parseInt(Math.random() * 899999 + '') + 100000
    await mail.sendMail(email, randNum)
    await Code.insertMany({
      email,
      ctime: Date.now(),
      code: randNum
    })
    return res.json(jsonRes(0, '发送成功'))
  } else if (code.ctime + 5 * 60 * 1000 < Date.now()) {
    randNum = parseInt(Math.random() * 899999 + '') + 100000
    await Code.findOneAndUpdate(
      {email},
      {
        ctime: Date.now(),
        code: randNum
      }
    )
    await mail.sendMail(email, randNum)
    res.json(jsonRes(0, '发送成功'))
  } else {
    res.json(jsonRes(-1, '验证码未过期,请勿重复获取'))
  }
})
//设置密码
router.post('/password', async (req, res) => {
  let {code, email, password} = req.body
  if (!email) return res.json(jsonRes(-4, 'email为空'))
  let user = await User.findOne({email})
  if (user) {
    let myCode = await Code.findOne({email})
    code = code + ''
    if (code !== myCode.code) return res.json(jsonRes(-3, '验证码错误'))
    if (myCode.ctime + 5 * 60 * 1000 > Date.now()) {
      password = hmac(password)
      await User.findOneAndUpdate({email}, {password})
      res.json(jsonRes(0, '修改成功'))
      req.session.destroy()
    } else {
      res.json(jsonRes(-1, '验证码过期,请重新获取'))
    }
  } else res.json(jsonRes(-2, '邮箱未注册'))
})
//注册
router.post('/reg', async (req, res) => {
  let {email, password} = req.body
  try {
    password = hmac(password)
    await User.insertMany({email, password})
    res.json(jsonRes(0, '注册成功'))
  } catch (e) {
    res.json(jsonRes(-1, '邮箱已注册'))
  }
})
//登录
router.post('/login', async (req, res) => {
  let {account, password} = req.body
  let phone = /^1\d{10}$/;
  let email =  /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
  password = await hmac(password)
  if(email.test(account)){
    let user = await User.findOne({email:account})
    if (!user) {
      res.json(jsonRes(-1, '邮箱未注册'))
    } else if (password !== user.password) {
      res.json(jsonRes(-2, '密码错误'))
    } else {
      //登陆成功后将相关信息存入session中
      req.session.login = true
      res.json(jsonRes(0, '登录成功', user))
    }
  }else if(phone.test(account)){
    let user = await User.findOne({phone:account})
    if (!user) {
      res.json(jsonRes(-1, '手机号未注册'))
    } else if (password !== user.password) {
      res.json(jsonRes(-2, '密码错误'))
    } else {
      req.session.login = true
      res.json(jsonRes(0, '登录成功', user))
    }
  }
})
//邮箱验证码登录
router.post('/codelogin', async (req, res) => {
  let {code, email} = req.body
  let user = await User.findOne({email})
  if (user) {
    let myCode = await Code.findOne({email})
    code = code + ''
    if (code !== myCode.code) return res.json(jsonRes(-3, '验证码错误'))
    if (myCode.ctime + 5 * 60 * 1000 > Date.now()) {
      req.session.login = true
      res.json(jsonRes(0, '登录成功', user))
    } else {
      res.json(jsonRes(-1, '验证码过期,请重新获取'))
    }
  } else {
    try{
      let myCode = await Code.findOne({email})
      code = code + ''
      if (code !== myCode.code) return res.json(jsonRes(-3, '验证码错误'))
      if (myCode.ctime + 5 * 60 * 1000 > Date.now()) {
        await User.insertMany({email, password: hmac('123456')})
        req.session.login = true
        res.json(jsonRes(0, '注册成功', user))
      } else {
        res.json(jsonRes(-1, '验证码过期,请重新获取'))
      }
    }catch(e){
      res.json(jsonRes(-4, '注册/登录失败'))
    }
  }
})
//手机号验证码登录
router.post('/phonelogin', async (req, res) => {
  let {phone} = req.body
  let user = await User.findOne({phone})
  if (user) {
    req.session.login = true
    res.json(jsonRes(0, '登录成功', user))
  } else {
    try{
      await User.insertMany({phone, password: hmac('123456')})
      req.session.login = true
      res.json(jsonRes(0, '注册成功'))
    }catch(e){
      res.json(jsonRes(-4, '注册/登录失败'))
    }
  }
})
//退出
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.json(jsonRes(0, '退出成功'))
})
//是否登录
router.get('/isLogin', (req, res) => {
  if (req.session.login) {
    res.json(jsonRes(0, '已登录'))
  } else res.json(jsonRes(-1, '未登录'))
})
//忘记密码
router.post('/forget', async (req, res) => {
  let {email, password, code} = req.body
  let user = await User.findOne({email})
  if (!user) {
    return res.json(jsonRes(-1, '邮箱未注册'))
  }
  let myCode = await Code.findOne({email})
  if (!myCode) {
    res.json(jsonRes(-2, '请获取验证码'))
  } else if (myCode.ctime + 5 * 60 * 1000 < Date.now()) {
    res.json(jsonRes(-3, '验证码过期,请重新获取'))
  } else if (myCode.code === code) {
    await User.save({email, password})
    res.json(jsonRes(0, '修改成功'))
  } else {
    res.json(jsonRes(-4, '验证码错误'))
  }
})
//获取用户头像
router.get('/headUrl', async (req, res) => {
  let {_id} = req.query
  if (!_id) return res.json(jsonRes(-1, '无id'))
  let user = await User.findById(_id, ['nick', 'headUrl', 'attentionList'])
  res.json(jsonRes(0, '', user))
})
//获取用户信息
router.get('/id', async (req, res) => {
  let {_id} = req.query
  if (!_id) return res.json(jsonRes(-1, '无id'))
  if (_id) {
    let user = await User.findById(_id, ['nick', 'headUrl', 'sex', 'sign', 'sex', 'fansCount'])
    res.json(jsonRes(0, '', user))
  } else res.json(jsonRes(-1, '缺少关键字段'))
})
//修改用户信息
router.post('/update', async (req, res) => {
  let {_id, sign, nick, sex, headUrl} = req.body
  if (!_id) return res.json(jsonRes(-1, '无id'))
  //签名
  if (_id && sign) {
    await User.findByIdAndUpdate(_id, {sign})
    let user = await User.findById(_id, ['nick', 'headUrl', 'sex', 'sign', 'sex', 'fansCount'])
    res.json(jsonRes(0, '', user))
  } else {
    res.json(jsonRes(-1, '缺少关键字段'))
  }
  //昵称
  if (_id && nick) {
    if (headUrl) {
      let avatarName = headUrl.split('/').pop()
      //从临时文件移到avatar
      const readable = fs.createReadStream('upload/temp/' + avatarName);
      const writable = fs.createWriteStream('upload/avatar/' + avatarName);
      readable.pipe(writable);
      fs.unlinkSync('upload/temp/' + avatarName)
      let user = await User.findById(_id)
      let index = user.headUrl.indexOf('icon.png')
      if (index === -1) {
        let oldName = user.headUrl.split('/').pop()
        fs.unlinkSync('upload/avatar/' + oldName)
      }
      user.headUrl = '/res/avatar/' + avatarName
      user.nick = nick
      user.sex = sex
      await user.save()
    } else {
      await User.findByIdAndUpdate(_id, {nick, sex})
    }
  }
})
//获取收藏列表
router.get('/collection', async (req, res) => {
  let {_id, page} = req.query
  if (!_id) return res.json(jsonRes(-1, '无id'))
  let count = (await User.findById(_id, 'collectList')).collectList.length
  let result = await User.findById(_id, 'collectList')
  let collection = await Video.find({_id: result.collectList}, ['title', 'imgUrl', 'playCount', 'uploadAt', 'collectList', 'isAdopt'])
    .populate('author', 'nick').sort('-uploadAt').limit(9).skip((page - 1) * 9)
  res.json(jsonRes(0, '', {collection, count}))
})
//获取关注用户信息
router.get('/attention', async (req, res) => {
  let {_id} = req.query
  if (!_id) return res.json(jsonRes(-1, '无id'))
  let result = await User.findById(_id, 'attentionList').populate('attentionList', ['nick', 'sign', 'headUrl'])
  res.json(jsonRes(0, '', result.attentionList))
})
//获取关注列表
router.get('/attentionList', async (req, res) => {
  let {_id} = req.query
  if (!_id) return res.json(jsonRes(-1, '无id'))
  let attentionList = await User.findById(_id, 'attentionList')
  res.json(jsonRes(0, '', attentionList))
})
// 切换关注
router.post('/togAtt', async (req, res) => {
  let {_id, user} = req.body
  if (!_id) return res.json(jsonRes(-1, '无id'))
  let myUser = await User.findById(_id, 'attentionList')
  let targetUser = await User.findById(user, 'fansCount')
  let index = myUser.attentionList.indexOf(user)
  //没关注
  if (index === -1) {
    myUser.attentionList.push(user)
    targetUser.fansCount++
    res.json(jsonRes(0, '关注成功', {myUser, targetUser}))
  } else {
    myUser.attentionList.splice(index, 1)
    targetUser.fansCount--
    res.json(jsonRes(0, '取消关注', {myUser, targetUser}))
  }
  await myUser.save()
  await targetUser.save()
})
//获取邮箱
router.get('/email', async (req, res) => {
  let {_id} = req.query
  if (!_id) return res.json(jsonRes(-1, '无id'))
  let result = await User.findById(_id, 'email')
  res.json(jsonRes(0, '', result))
})
//获取手机号
router.get('/phone', async (req, res) => {
  let {_id} = req.query
  if (!_id) return res.json(jsonRes(-1, '无id'))
  let result = await User.findById(_id, 'phone')
  res.json(jsonRes(0, '', result))
})


//获取用户详情信息
router.get('/info', async (req, res) => {
  let {userid} = req.query
  if (!userid) return res.json(jsonRes(-1, '无id'))
  if (userid) {
    let userinfo = await UserInfo.find({userid}, ['userid','age', 'phone', 'birth', 'address', 'introduction','history','date'])
    res.json(jsonRes(0, '', userinfo))
  } else res.json(jsonRes(-1, '缺少关键字段'))
})
//修改用户详情信息
router.post('/info', async (req, res) => {
  let {userid, age, phone, birth, address, introduction} = req.body
  if (!userid) return res.json(jsonRes(-1, '无id'))
  if (userid) {
    await UserInfo.updateMany({userid}, {age, phone, birth, address, introduction})
    let userinfo = await UserInfo.find({userid}, ['age', 'phone', 'birth', 'address', 'introduction'])
    res.json(jsonRes(0, '', userinfo))
  } else {
    res.json(jsonRes(-1, '缺少关键字段'))
  }
})
//观看历史记录
router.post('/history', async (req, res) => {
  let {videoId, videoAuthor, videoTitle, videoImg, userid} = req.body
  let userinfo = await UserInfo.findOne({userid})
  let date = Date.now()
  if(userinfo.history.length>=50){
    userinfo.history.pop()
  }
  let item = userinfo.history.find(item => {
    return item.videoId == videoId;
  });
  userinfo.history.remove(item)
  userinfo.history.unshift({videoId, videoAuthor, videoTitle, videoImg, date})
  userinfo.save()
  res.json(jsonRes(0, '', userinfo))
})
//绑定邮箱
router.post('/bindEmail', async (req, res) => {
  let {_id, email, code} = req.body
  if (!_id) return res.json(jsonRes(-1, '无id'))
  let user = await User.findOne({email})
  if(user){
    res.json(jsonRes(-1, '邮箱已被绑定'))
  }else{
    let myCode = await Code.findOne({email})
    code = code + ''
    if (code !== myCode.code) return res.json(jsonRes(-3, '验证码错误'))
    if (myCode.ctime + 5 * 60 * 1000 > Date.now()) {
      await User.findByIdAndUpdate({_id}, {email})
      res.json(jsonRes(0, '绑定邮箱成功'))
    } else {
      res.json(jsonRes(-1, '验证码过期,请重新获取'))
    }
  }
})
//绑定手机号
router.post('/bindPhone', async (req, res) => {
  let {_id, phone} = req.body
  if (!_id) return res.json(jsonRes(-1, '无id'))
  let user = await User.findOne({phone})
  if(user){
    res.json(jsonRes(-1, '手机号已被绑定'))
  }else{
    await User.findByIdAndUpdate({_id}, {phone})
    res.json(jsonRes(0, '绑定手机号成功'))
  }
})

module.exports = router
