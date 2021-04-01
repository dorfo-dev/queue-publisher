// Require the framework and instantiate it
const fastify = require('fastify')({
    logger: true
  })
const { PublisherQueue } = require('./publisher')  
  // Declare a route
  fastify.get('/', function (request, reply) {
    reply.send({ hello: 'world' })
  })

  // Post message to queue a route
  fastify.post('/make-transfers', async function (request, reply) {
    
    const postResult = await PublisherQueue.sendMessage(request.body)
    
    const response = {
        'transfer': {
            received: postResult,
            status:'pending'
        }
    }
    
    reply.send(response)
  })
  
  // Run the server!
  fastify.listen(3000, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    fastify.log.info(`server listening on ${address}`)
  })