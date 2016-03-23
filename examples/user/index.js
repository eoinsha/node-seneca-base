'use strict'
const baseDeps = require('node-seneca-base/deps')

const _ = baseDeps.lodash
const seneca = baseDeps.seneca()

const plugin = 'user'
const users = []

seneca.use(baseDeps['seneca-amqp-transport'])

seneca.add( { role: plugin, cmd: 'list' }, (args, done) => {
  done(null, users)
})

seneca.add( { role: plugin, cmd: 'add' }, (args, done) => {
  const user = _.pick(args, ['name', 'email'])
  users.push(user)
  done(null, user)
})

seneca.ready(() =>
  seneca.listen({
    type: 'amqp',
    pins: `role: ${plugin}, cmd: *`,
    url: process.env.AMQP_URL || 'amqp://localhost:5672/seneca'
  }))
