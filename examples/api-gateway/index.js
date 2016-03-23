'use strict'
const baseDeps = require('node-seneca-base/deps')

const Chairo = baseDeps.chairo
const Hapi = baseDeps.hapi
const log = console

const server = new Hapi.Server({debug: {request: ['error']}})
const port = process.env.PORT || 3000
server.connection({ port })

server.register({
  register: Chairo
}, err => {
  if (err) {
    return log.error({err}, 'Failed to register Chairo')
  }
  const seneca = server.seneca

  seneca.use(baseDeps['seneca-amqp-transport'])
  seneca.client({
    type: 'amqp',
    pins: [
      { role: 'user', cmd: '*' },
      { role: 'message', cmd: '*' }
    ],
    url: process.env.AMQP_URL || 'amqp://localhost:5672/seneca'})

  seneca.ready(() => {
    server.route({ method: 'GET', path: '/api/user/list', handler: { act: 'role:user,cmd:list' } })

    server.route({ method: 'POST', path: '/api/user/add', handler: (request, reply) =>
      reply.act({
        role: 'user',
        cmd: 'add',
        name: request.payload.name,
        email: request.payload.email
     })
    })

    server.route({ method: 'GET', path: '/api/message/list', handler: { act: 'role:message,cmd:list' } })

    server.route({ method: 'POST', path: '/api/message/post', handler: (request, reply) =>
      reply.act({
        role: 'message',
        cmd: 'post',
        user: request.payload.user.email,
        text: request.payload.text
     })
    })


    server.start(err => {
      if (err) {
        return log.error({err}, 'Server failed to start')
      }
      log.info(`API Gateway listening on ${port}`)
    })
  })
})
