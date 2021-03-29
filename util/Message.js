const DiscordMessage = require("discord.js").Message;

class Message extends DiscordMessage {
  constructor(client, data, channel) {
    super(client, data, channel);
  }
}

module.exports = Message;