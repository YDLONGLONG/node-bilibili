const {execSync} = require('child_process')
const basePath = './upload/'

function thumbnails (before, videoName) {
  execSync(`dplayer-thumbnails -o ${basePath + before}.jpg ${basePath + videoName}`)
}

module.exports = thumbnails
