const amqp = require('amqplib')

const QueueConfig = {
    exchange: {
      name: 'transfers.exchange',
      durable: true,
      type: 'direct',
      bind: {
        queue: {
          durable: true,
          name: 'transfer.notify.emails',
          routekey: 'route.notify.transfer',          
        }
      }
    }
  } 

async function connect(){
    return amqp.connect('amqp://admin:admin@localhost:5672')   
}

async function getChannel(){
    const connection =  await connect()
    return connection.createChannel()
}

async function createIfNotExists(){
    const channel = await getChannel()
    
    // Cria a Exchange se não existir
    await channel.assertExchange(QueueConfig.exchange.name, QueueConfig.exchange.type, {
        durable: QueueConfig.exchange.durable
    })

    // Cria a Fila se não existir
    await channel.assertQueue(QueueConfig.exchange.bind.queue.name, {
        durable: QueueConfig.exchange.bind.queue.durable
    })

    // Fazendo o Bind entre a Exchange e a fila
    await channel.bindQueue(
        QueueConfig.exchange.bind.queue.name,
        QueueConfig.exchange.name,
        QueueConfig.exchange.bind.queue.routekey,
    )

    return channel
}

const Client = {    
    async sendMessage(message){
        
        const channel = await createIfNotExists()

       return channel.publish(QueueConfig.exchange.name,
                        QueueConfig.exchange.bind.queue.routekey,
                        Buffer.from(JSON.stringify(message))
                    )
    }
}

module.exports = { PublisherQueue : Client}
