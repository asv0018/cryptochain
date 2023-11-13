const redis = require('redis');

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN'
};

class PubSub {
  constructor({blockchain}) {
    this.blockchain = blockchain

    // Specify the host and port for your Redis server
    this.publisher = redis.createClient({
      host: 'www.projects.iotreeminds.com', // Replace with your actual host
      port: 6379, // Replace with your actual port
    });

    this.subscriber = redis.createClient({
      host: 'www.projects.iotreeminds.com', // Replace with your actual host
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

  handleMessage(channel, message) {
    console.log(`Message received. Channel: ${channel}. Message: ${message}`);
    
    const parsedMessage = JSON.parse(message)
    if(channel===CHANNELS.BLOCKCHAIN) {
      this.blockchain.replaceChain(parsedMessage)
    }
  }
}

module.exports = PubSub