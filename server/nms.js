const NodeMediaServer = require('node-media-server');
require('../db/connect')
const mongoose = require('mongoose')
let Live = require('../db/moudle/liveModel')
require('./ws')
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  },
  auth: {
    api: true,
    api_user: 'smile233',
    api_pass: 'Smile233'
  }
};
const nms = new NodeMediaServer(config)
nms.run();
nms.on('prePublish', async (id, StreamPath) => {
  let session = nms.getSession(id);
  let user = StreamPath.split('/').pop()
  if (!mongoose.Types.ObjectId.isValid(user)) return session.reject();
  let live = await Live.findOne({user})
  if (!live) return session.reject();
  live.onLive = true
  await live.save()
})
//断开连接
nms.on('donePublish', async (id, StreamPath) => {
  let user = StreamPath.split('/').pop()
  if (!mongoose.Types.ObjectId.isValid(user)) return
  await Live.findOneAndUpdate({user}, {onLive: false})
});

