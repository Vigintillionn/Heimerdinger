const path = require("path");
const Command = require(path.join(process.cwd(), "util", "Command.js"));

module.exports = class PingCmd extends Command {
  constructor(client) {
    super(client, {
      name: "cooldowns",
      aliases: ["cd"],
      description: "View a champ's cooldowns!",
      category: "main"
    });
  }

  async run(message, args) {
    let cooldowns = this.client.champCooldowns.champions;
    let champion = false;

    if (!args[0]) champion = Object.keys(cooldowns)[Math.floor(Math.random() * Object.keys(cooldowns).length)];
    else champion = this.client.mostSimilarModule(args[0], Object.keys(cooldowns));

    if (!champion) return message.channel.send("Please give up a valid champion.");

    let embed = message.embed()
      .setTitle(`Cooldowns for ${toTitleCase(champion)}`)
      .setThumbnail(`https://opgg-static.akamaized.net/images/lol/champion/${champion}.png?image=c_scale,q_auto,w_250&v=1615953009`)

    if (args.length > 1) {

    } else {
      embed.addField("🔹 **Q**", cooldowns[champion]["q"].map(cd => `Level ${cooldowns[champion]["q"].indexOf(cd)+1} **${cd}s**`).join("\n"), true);
      embed.addField("🔹 **W**", cooldowns[champion]["w"].map(cd => `Level ${cooldowns[champion]["w"].indexOf(cd)+1} **${cd}s**`).join("\n"), true);
      embed.addField("⠀", "⠀");
      embed.addField("🔹 **E**", cooldowns[champion]["e"].map(cd => `Level ${cooldowns[champion]["e"].indexOf(cd)+1} **${cd}s**`).join("\n"), true);
      embed.addField("🔸 **R**", cooldowns[champion]["r"].map(cd => `Level ${cooldowns[champion]["r"].indexOf(cd)+1} **${cd}s**`).join("\n"), true);
      if (cooldowns[champion]["passive"]) embed.addField("🔸 **Passive**", cooldowns[champion]["passive"].toString().replace("%n", "\n"));
    }
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