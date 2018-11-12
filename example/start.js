var talkback = require("../dist/index")

var host = "http://localhost:4000"

function bodyMatcher(tape, req) {
  if (tape.meta.tag === "fake-post") {
    var tapeBody = JSON.parse(tape.req.body.toString())
    var reqBody = JSON.parse(req.body.toString())

    return tapeBody.username === reqBody.username
  }
  return false
}

function urlMatcher(tape, req) {
  if (tape.meta.tag === "orgs-wildcard") {
    return !!req.url.match(/\/orgs\/[a-zA-Z0-9]/)
  }
  return false
}

function responseDecorator(tape, req) {
  if (tape.meta.tag === "auth") {
    var tapeBody = JSON.parse(tape.res.body.toString())
    var expiration = new Date()
    expiration.setDate(expiration.getDate() + 1)
    var expirationEpoch = Math.floor(expiration.getTime() / 1000)
    tapeBody.expiration = expirationEpoch

    var newBody = JSON.stringify(tapeBody)
    tape.res.body = Buffer.from(newBody)
  }
  return tape
}

var server = talkback({
  host: host,
  path: __dirname + "/tapes",
  record: true,
  debug: false,
  ignoreQueryParams: ["t"],
  bodyMatcher: bodyMatcher,
  urlMatcher: urlMatcher,
  responseDecorator: responseDecorator,
  https: {
    enabled: false,
    keyPath: __dirname + "/httpsCert/localhost.key",
    certPath: __dirname + "/httpsCert/localhost.crt"
  }
})

server.start()