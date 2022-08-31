const crypto = require('crypto')
const {SECRET_KEY} = require('./config')

//hmac加密
function hmac (str) {
  return crypto.createHmac('md5', SECRET_KEY).update(str).digest('hex')
}

module.exports = hmac
