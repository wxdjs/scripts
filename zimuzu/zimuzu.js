const cookieName = '字幕组'
const cookieKey = 'chavy_cookie_zimuzu'
const cookieAppKey = 'chavy_cookie_zimuzu_app'
const chavy = init()
const cookieVal = chavy.getdata(cookieKey)
const cookieAppVal = chavy.getdata(cookieAppKey)
const signinfo = {}

sign()

function sign() {
  signweb()
  signapp()
  check()
}

function signweb() {
  let url = { url: `http://www.rrys2019.com/user/login/getCurUserTopInfo`, headers: { Cookie: cookieVal } }
  url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'

  chavy.get(url, (error, response, data) => {
    chavy.log(`${cookieName}, signweb - data: ${data}`)
    signinfo.web = JSON.parse(data)
  })
}

function signapp() {
  let url = { url: `http://h5.rrhuodong.com/index.php?g=api/mission&m=clock&a=store&id=2`, headers: { Cookie: cookieAppVal } }
  url.headers['Accept'] = `application/json, text/plain, */*`
  url.headers['Accept-Encoding'] = `gzip, deflate`
  url.headers['Accept-Language'] = `zh-cn`
  url.headers['Connection'] = `close`
  url.headers['Host'] = `h5.rrhuodong.com`
  url.headers['Referer'] = `http://h5.rrhuodong.com/mobile/mission/pages/task.html`
  url.headers['User-Agent'] = `Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`

  chavy.get(url, (error, response, data) => {
    chavy.log(`${cookieName}, signapp - data: ${data}`)
    signinfo.app = JSON.parse(data)
  })
}

function getinfo() {
  const title = `${cookieName}`
  let subTitle = `网页: `
  let detail = ''

  // web
  if (signinfo.web.status == 1) {
    if (signinfo.web.data.new_login) subTitle += '成功'
    else subTitle += '成功 (重复)'
    detail = `人人钻: ${signinfo.web.data.userinfo.point}, 登录天数: ${signinfo.web.data.usercount.cont_login}`
  } else if (signinfo.web.status == 4001) {
    subTitle += '未登录'
  } else {
    subTitle += '失败'
  }

  // app
  subTitle += `; APP: `
  if (signinfo.app.status == 1) subTitle += '成功'
  else if (signinfo.app.status == 4005) subTitle += '成功 (重复)'
  else if (signinfo.app.status == 1021) subTitle += '未登录'
  else subTitle += '失败'

  chavy.msg(title, subTitle, detail)
  chavy.done()
}

function check(checkms = 0) {
  if (signinfo.web && signinfo.app) {
    getinfo()
  } else {
    if (checkms > 5000) {
      chavy.msg(`${cookieName}`, `签到失败: 超时退出`, ``)
      chavy.done()
    } else {
      setTimeout(() => check(checkms + 100), 100)
    }
  }
}

function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
