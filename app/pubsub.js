const redis = require('redis');

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
};

class PubSub {
  constructor({blockchain, transactionPool}) {
    this.blockchain = blockchain
    this.transactionPool = transactionPool

    // Specify the host and port for your Redis server
    this.publisher = redis.createClient({
      host: 'redis.staging-projects.iotreeminds.com', // Replace with your actual host
      port: 6379, // Replace with your actual port
    });

    this.subscriber = redis.createClient({
      host: 'redis.staging-projects.iotreeminds.com', // Replace with your actual host
      port: 6379, // Replace with your actual port
    });

    this.subscribeToChannels()

    this.subscriber.on(
      'message',
      (channel, message) => this.handleMessage(channel, message)
    );
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach(channel=>{
      this.subscriber.subscribe(channel)
    })
  }

  publish({channel, message}) {
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    })
  }

  broadcastTransaction(transaction){
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    })
  }

  handleMessage(channel, message) {
    console.log(`Message received. Channel: ${channel}. Message: ${message}`);
    
    const parsedMessage = JSON.parse(message)

    switch(channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage)
        break
      case CHANNELS.TRANSACTION:
        this.transactionPool.setTransaction(parsedMessage)
        break
      default:
        return
    }
  }
}

module.exports = PubSub