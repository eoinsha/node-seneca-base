'use strict'
const baseDeps = require('node-seneca-base/deps')

const _ = baseDeps.lodash
const seneca = baseDeps.seneca()

const plugin = 'message'
const messages = []

seneca.use(baseDeps['seneca-amqp-transport'])

seneca.add( { role: plugin, cmd: 'list' }, (args, done) => {
  done(null, messages)
})

seneca.add( { role: plugin, cmd: 'post' }, (args, done) => {
  const message = createMessage(args.user, args.text)
  messages.push(message)
  done(null, message)
})

function createMessage(user, text) {
  return {
    from: user,
    timestamp: new Date(),
    text
  }
}

seneca.ready(() =>
  seneca.listen({
    type: 'amqp',
    pins: `role: ${plugin}, cmd: *`,
    url: process.env.AMQP_URL || 'amqp://localhost:5672/seneca'
  }))
