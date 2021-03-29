const Discord = require("discord.js");

/**
 * The default command extender
 * @class
 * @name Command
 * @property {Discord.Client} client The discord.js client
 * @property {String} name The name of the command
 * @property {String} description The description of the command
 * @property {Array} aliases The aliases of the command
 */
class Command {
  constructor(client, {name, description = "_No description_", aliases = [], usage, category, } = {}) {
    this.client = client;

    this.name = name;
    this.description = description;
    this.aliases = aliases || false;
    this.usage = usage || false;
    this.category = category || false;
  }
}

module.exports = Command;