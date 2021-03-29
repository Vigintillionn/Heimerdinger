const { Client } = require("discord.js");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
//const fetch = require("node-fetch")
const Message = require("./Message.js");
const Discord = require("discord.js");
const levenshtein = require(path.join(process.cwd(), "util", "levenshtein.js"));
const xlsx = require("xlsx")
const championCooldowns = require(path.join(process.cwd(), "util", "GetChampionCooldowns.js"))
const token = require(path.join(process.cwd(), "token.js"));

/**
 * The TopazClient
 * @class
 * @extends Client The Discord.js Client
 * @name TopazClient
 * @property {Object} config The botconfig
 * @property {Object} commands The loaded commands
 * @property {Object} aliases The aliases of commands
 */
class TopazClient extends Client {
  constructor(config, options, ...args) {
    super(...args);
    this.config = config;

    this.login(token);

    this.on("ready", this.readyHandler);
    this.on("message", this.messageHandler);

    this.debugging = true;

    this.commands = {};
    this.aliases = {};
    this.activeChannels = {};

    this.champCooldowns = new championCooldowns(this, "./constants/cooldowns.xlsx");
  }

  /**
   * @method TopazClient.readyHandler
   * @returns {undefined}
   * @description Fire when the bot is ready.
   * @private
   */
  readyHandler() {
    console.log(chalk.green("ONLINE") + ` | ${this.user.username} is ready for use.`);
    this.user.setActivity(`Hardstuck Bronze`, { type: 'WATCHING' })
  }

  /**
   * @method TopazClient.messageHandler
   * @returns {undefined}
   * @description Fire when the bot recieves a message.
   * @private
   */
  async messageHandler(message) {
    if (message.author.bot || !message.guild) return;
    if (this.debugging) console.log(chalk.keyword("pink")("DEBUG") + " | Recieved a message!");

    let prefixes = ["a!"]
    let prefix = false;
    for (const thisPrefix of prefixes) {
      if (message.content.toLowerCase().startsWith(thisPrefix.toLowerCase())) prefix = thisPrefix.toLowerCase();
    }
    if (this.debugging) console.log(chalk.keyword("pink")("DEBUG") + ` | Prefix: ${chalk.blue(prefix)}`);

    if (!prefix && message.channel.id === "788898175750635550") return message.delete();
    if (!prefix) return;

    message.embed = () => {
      let color = "#FFFFF1";
      let embed = new Discord.MessageEmbed().setColor(color);
      return embed;
    }

    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();

    if (this.debugging) console.log(chalk.keyword("pink")("DEBUG") + ` | Command: ${command} - ${this.commands[command] || this.aliases[command] ? chalk.green("Command exits!") : chalk.red("Command not found!")}`);

    let cmd = this.commands[command] || this.commands[this.aliases[command]];
    if (!cmd) return message.channel.send(`This command does not exist.`)
    await cmd.run(message, args);
  }

  debug(msg) {
    if (this.debugging) console.log(chalk.keyword("pink")("DEBUG") + msg)
  }

  /**
   * @method TopazClient.loadCommands
   * @returns {TopazClient}
   * @description Load all the commands in a folder!
   */
  loadCommands(dir, log = true) {
    let files = fs.readdirSync(dir, () => {
      if (error) return console.log(error);
    });

    let i = 0;
    for (let file of files) {

      if (!fs.lstatSync(path.join(dir, file)).isDirectory()) {
        let rawClass;
        try {
          rawClass = require(path.join(process.cwd(), dir, file));
        } catch (e) {
          console.log(`${chalk.red("ERROR")} | While loading ${chalk.blue(path.join(dir, file))}!`, e);
          continue;
        }

        let cmd;
        try {
          cmd = new rawClass(this);
        } catch (e) {
          if (e instanceof TypeError && e.toString().includes("is not a constructor")) console.log(`${chalk.red("ERROR")} | File ${chalk.blue(path.join(dir, file))} isn't a constructor!`);
          else console.log(`${chalk.red("ERROR")} | While constructing ${chalk.blue(path.join(dir, file))}!`, e);
          continue;
        }

        let cmdProps = Object.keys(cmd);
        if (!cmdProps.includes("client") || !cmdProps.includes("name") || !cmdProps.includes("aliases") || !cmdProps.includes("description") || typeof cmd.run !== "function") {
          console.log(chalk.red("ERROR") + ` | Invalid construction of ${chalk.blue(path.join(dir, file))}!`);
          continue;
        }

        this.commands[cmd.name] = cmd;
        for (let alias of cmd.aliases) {
          this.aliases[alias] = cmd.name;
        }
        console.log(chalk.keyword("orange")("INFO") + ` | Command ${cmd.name} has ${cmd.aliases.length} alias(es)!`);

        i++;
      } else i += this.loadCommands(path.join(dir, file), false);
    }
    if (!log) return i;

    console.log(chalk.keyword("orange")("INFO") + ` | ${i} commands loaded!`);
    return this;
  }
  debug(message) {
    if (this.debugging) {
      console.log(`${chalk.keyword("orange")(new Date())} ${message}`)
    }
  }
  mostSimilarModule(item, keys, factor = 0.4) {
    const resp = keys.sort((key1, key2) => {
      return levenshtein.levenshteinRatio(key2, item) - levenshtein.levenshteinRatio(key1, item);
    })[0];
    if (levenshtein.levenshteinRatio(resp.toLowerCase(), item) < factor) return false
    return resp
  }
}


module.exports = TopazClient;