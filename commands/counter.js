const p = require("phin");
const cheerio = require("cheerio")
const fs = require("fs")
  //const fetch = require("node-fetch")

const path = require("path");
const Command = require(path.join(process.cwd(), "util", "Command.js"));
const oddCases = require(path.join(process.cwd(), "constants", "oddCases.js"))

module.exports = class PingCmd extends Command {
  constructor(client) {
    super(client, {
      name: "counters",
      aliases: ["counter"],
      description: "View a champ's counter!",
      category: "main",
      usage: "counter <champ>"
    });

    this.possibleChamps = [
      "aatrox", "ahri", "akali", "alistar", "amumu", "anivia", "annie", "aphelios",
      "ashe", "aurelion sol", "azir", "bard", "blitzcrank", "brand", "braum", "caitlyn",
      "camille", "cassiopeia", "cho'gath", "corki", "darius", "diana", "dr. mundo", "draven",
      "ekko", "elise", "evelynn", "ezreal", "fiddlesticks", "fiora", "fizz", "galio", "gangplank",
      "garen", "gnar", "gragas", "graves", "hecarim", "heimerdinger", "illaoi", "irelia", "ivern",
      "janna", "jarvan iv", "jax", "jayce", "jhin", "jinx", "kai'sa", "kalista", "karma", "karthus",
      "kassadin", "katarina", "kayle", "kayn", "kha'zix", "kindred", "kled", "kog'maw", "leblanc",
      "lee sin", "leona", "lissandra", "lucian", "lulu", "lux", "malphite", "malzahar", "maokai",
      "master yi", "miss fortune", "mordekaiser", "morgana", "nami", "nasus", "nautilus", "neeko",
      "nidalee", "nocturne", "nunu & willump", "olaf", "orianna", "ornn", "pantheon", "poppy", "pyke", "qiyana",
      "quinn", "rakan", "rammus", "rek'sai", "renekton", "rengar", "riven", "rumble", "ryze", "samira",
      "sejuani", "senna", "sett", "shaco", "shen", "shyvana", "singed", "sion", "sivir", "skarner", "sona",
      "soraka", "swain", "sylas", "syndra", "tahm kench", "taliyah", "talon", "taric", "teemo", "thresh",
      "tristana", "trundle", "tryndamere", "twisted fate", "twitch", "udyr", "urgot", "varus", "vayne",
      "veigar", "vel'koz", "vi", "viktor", "vladimir", "volibear", "warwick", "wukong", "xayah", "xerath",
      "xin zhao", "yasuo", "yone", "yorick", "yuumi", "zac", "zed", "ziggs", "zilean", "zoe", "zyra", "seraphine",
      "rell", "viego", "lillia", "gwen", "kennen"
    ];
  }

  async run(message, args) {
    if (!args[0]) return message.channel.send("Please give up a champion to look up the counters for.") // If user didn't give up a champion

    this.champ = args[0].toLowerCase() === "nunu" ?
      "nunu-willump" : this.client.mostSimilarModule(args.join(" ").replace("&", "").split(/ +/g).join("-"), this.possibleChamps); // Select champ
    if (!this.champ) return message.channel.send("This is not a valid champion."); // Check if champ exists
    else this.champ = this.champ.replace("&", "").split(/ +/g).join("-"); // If exists alter string so it's easier to use in the methods below

    this.actualName = this.client.mostSimilarModule(this.champ, this.possibleChamps); // Get the actual champion name

    const res = await p(`https://www.counterstats.net/league-of-legends/${this.champ}`); // Get the data from countersats.net
    let body = res.body.toString();

    let data = cheerio.load(body); // Load the data into cheerio
    let champs = [];

    data(".champ-box.ALL > a").each((i, elem) => { // Prep the data into an array with the counters
      const img = data(elem).find('img');
      champs.push({
        name: img.attr('alt').toLowerCase().replace(i < 3 ? "counter stats for " : `countering ${this.actualName}`, ""),
        image: img.attr('src'),
        percentage: data(elem).find(i > 2 ? 'b' : "span").text()
      })
    });

    champs = champs.slice(0, 10); // Only get the top 10 counters
    let formattedCounters = this.getCounters(champs) // Format the counters

    let embed = message.embed() // Prep the embed
      .setTitle(`Counters for ${toTitleCase(this.actualName)}`)
      .addField("🔸 Champion", formattedCounters[0], true)
      .addField("⠀", formattedCounters[1], true)
      .setThumbnail(`https://opgg-static.akamaized.net/images/lol/champion/${this.actualName.split(" ").join("").replace(/[\']/g, "") == "nunu&willump" ? "nunu" : this.actualName.split(" ").join("").replace(/[\']/g, "")}.png?image=c_scale,q_auto,w_250&v=1615953009`)
      .setFooter("Counter stats obtained from counterstats.net")
    return message.channel.send(embed) // Send the embed with counters
  }

  getCounters(array) {
    let output = [];
    let string = "";
    let i = 0;
    for (const champ of array) {
      string += `${toTitleCase(champ.name)} - **${champ.percentage}**\n`;
      if (i === 4) {
        output.push(string);
        string = "";
        i = 0;
      } else i++;
    }
    return output;
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