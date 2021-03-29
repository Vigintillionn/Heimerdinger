const path = require("path");
const Command = require(path.join(process.cwd(), "util", "Command.js"));
const oddCases = require(path.join(process.cwd(), "constants", "oddCases.js"))

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
    let cooldowns = {...oddCases, "aphelios": {}}//this.client.champCooldowns.champions;
    let champion = false;

    if (!args[0]) champion = Object.keys(cooldowns)[Math.floor(Math.random() * Object.keys(cooldowns).length)];
    else champion = this.client.mostSimilarModule(args[0], Object.keys(cooldowns), 0.7);

    //if (!champion) return message.channel.send("Please give up a valid champion.");
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

  /**
   * 
   * @param {Object} champion champion data
   * @param {String} champName champion name
   * @returns {Object} the embed to send
   */
  updateMessage(champion, champName) {
    let embed = this.message.embed()
      .setTitle(`Cooldowns for ${toTitleCase(champName)}`)
      .setThumbnail(`https://opgg-static.akamaized.net/images/lol/champion/${champName.replace(/[\']/g, "")}.png?image=c_scale,q_auto,w_250&v=1615953009`)
      .setDescription(champion.form ? `Form: **${toTitleCase(champion.form)}**` : "")

    if (champName.toLowerCase() === "aphelios") { // Why riot? Why?
      embed.setDescription("Abilities (except for ult) scale with\nChampion level instead of abilitiy level.")
      embed.addField("🔹 **Sniper**", "Level 1 **10s**\nLevel 3 **9.5s**\nLevel 5 **9s**\nLevel 7 **8.5s**\nLevel 9 **8s**", true)
      embed.addField("🔹 **Scythe**", "Level 1 **10s**\nLevel 3 **10s**\nLevel 5 **9s**\nLevel 7 **9s**\nLevel 9 **8s**", true)
      embed.addField("⠀", "⠀")
      embed.addField("🔹 **Gravity**", "Level 1 **12**\nLevel 3 **11.5s**\nLevel 5 **11s**\nLevel 7 **10.5s**\nLevel 9 **10s**", true)
      embed.addField("🔹 **Flame**", "Level 1 **9s**\nLevel 3 **8s**\nLevel 5 **8s**\nLevel 7 **7s**\nLevel 9 **6s**", true)
      embed.addField("⠀", "⠀")
      embed.addField("🔹 **Chakram**", "Level 1 **9s**\nLevel 3 **8.25s**\nLevel 5 **7.5s**\nLevel 7 **6.75s**\nLevel 9 **6s**", true)
      embed.addField("🔸 **R**", "Level 1 **120s**\nLevel 2 **110s**\nLevel 3 **100s**", true)
      return embed;
    }

    if (champion["q"]) embed.addField("🔹 **Q**", this.getCooldownLevel(champion["q"]), true)
    if (champion["w"]) embed.addField("🔹 **W**", this.getCooldownLevel(champion["w"]), true)
    if (champion["q"] && champion["e"]) embed.addField("⠀", "⠀")
    if (champion["e"]) embed.addField("🔹 **E**", this.getCooldownLevel(champion["e"]), true)
    if (champion["r"]) embed.addField("🔸 **R**", this.getCooldownLevel(champion["r"]), true)
    if (champion["passive"]) embed.addField("🔸 **Passive**", champion["passive"].toString().replace(/\%n/g, "\n"));
    return embed;
  }

  /**
   * 
   * @param {Array} array 
   * @returns {String} the output
   */
  getCooldownLevel(array) { // [6, 6, 6, 6, 6];
    let output = [];
    for (let i = 0; i < array.length; i++) {
      output.push(`Level ${i+1} **${array[i]}s**`);
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