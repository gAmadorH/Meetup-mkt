const fp = require('fastify-plugin')
const Sequelize = require('sequelize')

function fastifySequelize(fastify, options, done) {
  const { database: { url, config } } = options
  let sequelize = null

  try {
    sequelize = new Sequelize(url, config)
  } catch (err) {
    fastify.log.error('DATABASE\t\t[%s]', fastify.chalk.red('CONFIG ERROR'))
    done(err)
  }

  fastify.decorate('sequelize', sequelize)
  fastify.decorate('Sequelize', Sequelize)

  // if the app is closed, the db will also be closed
  fastify.addHook('onClose', (app, next) => {
    app.sequelize.close().then(() => {
      app.log.info('DATABASE\t[%s]', app.chalk.white('DISCONNECTED'))
      next()
    }).catch((err) => {
      app.log.error('DATABASE\t[%s]', app.chalk.red('ERROR'))
      next(err)
    })
  })

  fastify.log.info('DB\t\t\t[%s]', fastify.chalk.magenta('ok'))
  done()
}

module.exports = fp(fastifySequelize, {
  fastify: '>=0.13.1',
  decorators: {
    fastify: ['chalk']
  }
})
