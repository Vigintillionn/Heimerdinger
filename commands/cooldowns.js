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
    this.message = message;
    let cooldowns = this.client.champCooldowns.champions;
    let champion = false;

    if (!args[0]) champion = Object.keys(cooldowns)[Math.floor(Math.random() * Object.keys(cooldowns).length)];
    else champion = this.client.mostSimilarModule(args[0], Object.keys(cooldowns), 0.7);

    if (!champion) return message.channel.send("Please give up a valid champion.");

    if (args.length > 1) {

    } else {
      if (this.client.champCooldowns.formChamps.includes(champion)) {
        // Form
        message.channel.send("Gathering data...").then(async msg => {
          let collector = msg.createReactionCollector((reaction, user) => user.id === message.author.id && user.id !== "566599144655945740", { time: 1 * 60 * 1000 });
          await msg.react("1️⃣");
          await msg.react("2️⃣");

          let forms = Object.keys(cooldowns[champion]);

          let embed = this.updateMessage(cooldowns[champion][forms[0]], champion);
          msg.edit("", embed);

          collector.on("collect", async(reaction) => {
            console.log(cooldowns[champion])
            let currentIndex = 0;

            if (reaction.emoji.name === '1️⃣') {
              await reaction.users.remove(message.author.id);

              currentIndex = 0;
              let embed = this.updateMessage(cooldowns[champion][forms[currentIndex]], champion, cooldowns[champion][forms[currentIndex]].form);
              msg.edit("", embed);
            } else {
              await reaction.users.remove(message.author.id);

              currentIndex = 1;
              let embed = this.updateMessage(cooldowns[champion][forms[currentIndex]], champion, cooldowns[champion][forms[currentIndex]].form);
              msg.edit("", embed);
            }
          });
        });
      } else {
        // No Form
        let embed = this.updateMessage(cooldowns[champion], champion);
        return message.channel.send("", embed);
      }
    }
  }



  updateMessage(champion, champName) {
    let embed = this.message.embed()
      .setTitle(`Cooldowns for ${toTitleCase(champName)}`)
      .setThumbnail(`https://opgg-static.akamaized.net/images/lol/champion/${champName.replace(/[\']/g, "")}.png?image=c_scale,q_auto,w_250&v=1615953009`)
      .setDescription(champion.form ? `Form: **${toTitleCase(champion.form)}**` : "")
      .addField("🔹 **Q**", this.getCooldownLevel(champion["q"]), true)
      .addField("🔹 **W**", this.getCooldownLevel(champion["w"]), true)
      .addField("⠀", "⠀")
      .addField("🔹 **E**", this.getCooldownLevel(champion["e"]), true)
      .addField("🔸 **R**", this.getCooldownLevel(champion["r"]), true)
    if (champion["passive"]) embed.addField("🔸 **Passive**", champion["passive"].toString().replace("%n", "\n"));
    return embed;
  }

  getCooldownLevel(array) { // [6, 6, 6, 6, 6];
    let output = [];
    for (let i = 0; i < array.length; i++) {
      output.push(`Level ${i+1} **${array[i]}**`);
    }
    return output.join("\n");
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