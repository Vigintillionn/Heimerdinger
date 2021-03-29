const path = require("path");
const Command = require(path.join(process.cwd(), "util", "Command.js"));

module.exports = class PingCmd extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      aliases: ["h"],
      description: "View the help message!",
      category: "main"
    });
  }

  async run(message, args) {
    let helpMessage = "";
    Object.keys(this.client.commands)
    .filter(x => this.client.commands[x].enabled == true)
    .forEach(cmd => helpMessage += `🔸 **${this.client.commands[cmd].usage ? this.client.commands[cmd].usage : this.client.commands[cmd].name}**\n${this.client.commands[cmd].description}\n`);

    let embed = message.embed()
      .setTitle("Help")
      .setDescription("Here are all my commands!\nDon't forget to put a **h!** before the command.\n\n`[]` > Means optional Argument\n`<>` > Means required argument")
      .addField("__Commands__", helpMessage)
      .addField("__Links__", `[GitHub](https://github.com/Vigintillionn/Heimerdinger) | Invite Me!`)
    return message.channel.send(embed)
  }
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}