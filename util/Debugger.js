const chalk = require("chalk");
const Discord = require("discord.js")

module.exports = class Debugger {
  constructor(client) {
    this.client = client;
  }

  debug(message) {
    let message = `${chalk.keyword("pink")("DEBUG")} | ${message}`;
    return message;
  }

  error(message, discord = false) {
    let embed = false;
    if(discord) {
      embed = new Discord.MessageEmbed()
      .setTitle("Error")
      .setDescription(`Please report this to ${this.client.members.cache.get("")}`)
    }
    let message = `${chalk.keyword("red")("ERROR")} | ${message}`;
    return embed ? { embed: embed, message: message} : message;
  }
}