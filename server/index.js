global.logger = require('../log-config')

const http = require('http')

const config = require('config')
const app = require('./web/webApp')
const proxy = require('./web/webProxy')

const port = config.PORT
app.set('port', port)

// 所有登录接口的地址数组（普通登录，第三方登录）
const loginUrlArray = [config.loginAddress];

Object.keys(config.oauth).forEach(function (oauthKey) {
  const oauthValue = config.oauth[oauthKey];
  Object.keys(oauthValue).forEach(function (key) {
      loginUrlArray.push(oauthValue[key]["url"])
  });
});

const server = http.createServer(function(req, res){
  const startTime = new Date().getTime()
  // global.logger.info(`>>--接受到请求：${req.url}, 时间为：${startTime}`)
  req.rsqStartTime = startTime
  if(config.checkUrl === req.url){
    res.end('success')
  }else if(loginUrlArray.indexOf(req.url)!=-1){
    // 登录接口单独处理
    app(req, res)
  }else{
    // 其他接口走反向代理
    proxy(req, res)
  }
  // global.logger.info(`>>--请求结束：${req.url}, 已耗时：${new Date().getTime() - req.rsqStartTime}ms`)
})

function onListening() {
  global.logger.info(`Listening on ${server.address().port}`)
}

server.on('listening', onListening)
server.listen(port)
