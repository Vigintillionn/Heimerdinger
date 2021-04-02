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

    this.positions = {
      mid: "middle",
      top: "top",
      jungle: "jungle",
      bottom: "bottom",
      adc: "bottom",
      support: "bottom"
    }
  }

  async run(message, args) {
    if (!args[0]) return message.channel.send("Please give up a champion to look up the counters for."); // If user didn't give up a champion

    let givenPosition = false;
    if (Object.keys(this.positions).includes(args[args.length - 1].toLowerCase())) { // Check if players gave a position
      this.lane = args[args.length - 1].toLowerCase(); // Put the position to a variable for later use
      givenPosition = this.positions[args[args.length - 1].toLowerCase()]; // Make the position to the right string for the html parser
      args.pop(); // Remove the position from the argument array
    }

    this.champ = args[0].toLowerCase() === "nunu" ?
      "nunu-willump" : this.client.mostSimilarModule(args.join(" ").replace("&", "").split(/ +/g).join("-"), this.possibleChamps, 0.7); // Select champ

    if (!this.champ) return message.channel.send("This is not a valid champion."); // Check if champ exists
    else this.champ = this.champ.replace("&", "").split(/ +/g).join("-"); // If exists alter string so it's easier to use in the methods below

    this.actualName = this.client.mostSimilarModule(this.champ, this.possibleChamps, 0.7); // Get the actual champion name

    let msg = await message.channel.send("Gathering data..."); // Send initial message so people know something is happening

    const res = await p(`https://www.counterstats.net/league-of-legends/${this.champ}`); // Get the data from countersats.net
    let body = res.body.toString();

    let data = cheerio.load(body); // Load the data into cheerio
    let champs = [];

    let found = false;
    data(".champ-box__wrap").each((i, elem) => { // Scrape the website
      let lane = data(elem).find("h2"); // Find if the lane equals the given position of the user
      if (lane.text().split(" ")[givenPosition == "jungle" ? 3 : 1].toLowerCase() === givenPosition || (!givenPosition && i == 0)) {
        found = true; // Set found to true, used to check if this champion has counter stats in this position
        data(elem).each((j, elem) => { // Loop over all the data inside of the position's data
          const img = data(elem).find('a'); // Get the data for the counters as counterstats also gives us data for worst picks and most popular counters

          img.each((n, el) => { // Loop over the counters
            const champ = data(el).find("img"); // Get the champ counter data
            if (n < 10) {
              champs.push({ // Add the counter data to the array
                name: champ.attr('alt').toLowerCase().replace(n < 3 ? "counter stats for " : `countering ${this.actualName}`, "").split("-").join(" "), // Get the champion's name
                image: champ.attr('src'), // Get the image idk why since we use a different image anyways ¯\_(ツ)_/¯
                percentage: data(el).find(n > 2 ? 'b' : "span").text() // Get the winrate from the counter
              });
            }
          });

        });
      }
    });
    if (!found) return msg.edit("Cannot found counterstats for this champion in this lane."); // If we didn't find any counters for that champ on a certain position

    let formattedCounters = this.getCounters(champs) // Format the counters

    let embed = message.embed() // Prep the embed
      .setTitle(`Counters for ${toTitleCase(this.actualName)}${givenPosition ? ` for ${toTitleCase(this.lane)}${["jungle", "support"].includes(this.lane) ? "": " lane"}` : " for Most Common lane"}`)
      .addField("🔸 Champion", formattedCounters[0], true)
      .addField("⠀", formattedCounters[1], true)
      .setThumbnail(`https://opgg-static.akamaized.net/images/lol/champion/${this.actualName.split(" ").join("").replace(/[\']/g, "") == "nunu&willump" ? "nunu" : this.actualName.split(" ").join("").replace(/[\']/g, "")}.png?image=c_scale,q_auto,w_250&v=1615953009`)
      .setFooter("Counter stats obtained from counterstats.net")
    return msg.edit("", embed) // Send the embed with counters
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