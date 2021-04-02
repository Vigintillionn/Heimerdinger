const path = require("path");
const Command = require(path.join(process.cwd(), "util", "Command.js"));
const items = require(path.join(process.cwd(), "constants", "items.js"))
const basicItems = require(path.join(process.cwd(), "constants", "basicItems.js"))

module.exports = class PingCmd extends Command {
    constructor(client) {
      super(client, {
        name: "item",
        aliases: ["i"],
        description: "View an item's stats and it's gold efficiency!",
        category: "main"
      });

      this.statPrices = {
        ad: basicItems["long sword"].price / basicItems["long sword"].stats.ad,
        ap: basicItems["amplifying tome"].price / basicItems["amplifying tome"].stats.ap,
        arm: basicItems["cloth armor"].price / basicItems["cloth armor"].stats.arm,
        mr: basicItems["null-magic mantle"].price / basicItems["null-magic mantle"].stats.mr,
        hp: basicItems["ruby crystal"].price / basicItems["ruby crystal"].stats.hp,
        mana: basicItems["sapphire crystal"].price / basicItems["sapphire crystal"].stats.mana,
        hpR: basicItems["rejuvenation bead"].price / basicItems["rejuvenation bead"].stats.hpR,
        manaR: basicItems["faerie charm"].price / basicItems["faerie charm"].stats.manaR,
        crit: basicItems["cloak of agility"].price / basicItems["cloak of agility"].stats.crit,
        as: basicItems["dagger"].price / basicItems["dagger"].stats.as,
        ms: basicItems["boots"].price / basicItems["boots"].stats.ms,
      }

      this.statNames = {
        ad: "attack damage",
        ap: "ability power",
        arm: "armor",
        mr: "magic resist",
        hp: "health",
        mana: "mana",
        hpR: "base health regen",
        manaR: "base mana regen",
        crit: "critical strike chance",
        as: "attack speed",
        ms: "movement speed",

        ls: "life steal",
        le: "lethality",
        pmp: "magic penetration",
        hsp: "healing & shielding",
        vamp: "omnivamp",
        pms: "movement speed",
        arpen: "armor penetration",
        mpen: "magic penetration",
        cdr: "ability haste",
        onhit: "on hit damage"
      }

      this.perc = ["hpR", "manaR", "as", "ls", "pmp", "hsp", "vamp", "pms", "arpen"]

      this.getStatPrices()
    }

    async run(message, args) {
        let nicknames = { // Nicknames for users to make it easier to access long named items
          bork: "blade of the ruined king",
        }

        let itemList = {...items, ...basicItems }; // Merge both lists of items into one
        let item = this.client.mostSimilarModule(Object.keys(nicknames).includes(args[0]) ? nicknames[args[0]] : args.join(" "), Object.keys(itemList), 0.4); //"trinity force"; // Get the item from the user's input

        let itemData = itemList[item]; // Get the data of the item

        let goldEfficiency = this.getGoldEfficiency(itemData.stats, itemData.price); // Calculate the gold efficiency

        let stats = "";
        for (const stat of Object.keys(itemData.stats)) {
          stats += `🔸 ${toTitleCase(this.statNames[stat])}: **${itemData.stats[stat]}${this.perc.includes(stat) ? "%" : ""}**\n` // Make the stats look pretty
        }

        let rawRecipeOrder = [];
        if (itemData.recipe) {
          for (const it of itemData.recipe) {
            if (itemList[it] && this.getGoldEfficiency(itemList[it].stats, itemList[it].price)) rawRecipeOrder.push({ it, gEff: this.getGoldEfficiency(itemList[it].stats, itemList[it].price) }) // Create a list of the recipe of the item with the component's prices
            else rawRecipeOrder.push({ it, gEff: 0 }) // If we can't calculate the gold efficiency just say we don't know it
          }
        }
        let recipeOrder = rawRecipeOrder.length > 0 ? rawRecipeOrder.sort((a, b) => (a.gEff < b.gEff) ? 1 : -1) : false; // Sort the list based on component's price

        let mythicBonus = false;
        if (itemData.mythicBonus) mythicBonus = this.getGoldEfficiency(itemData.mythicBonus, itemData.price); // Add a mythic bonus for gold efficiency to mythic items

        let embed = message.embed() // Prep the embed
          .setTitle(`Item info`)
          .setDescription(`Details for ${toTitleCase(item)}:`)
          .addField("Name", toTitleCase(item), true)
          .addField("⠀", "⠀", true)
          .addField("Price", `Price: <:coin:826223682028175481> **${itemData.price.toLocaleString("en")}**\nThis item is: **${goldEfficiency}%** Gold Efficient${mythicBonus ? `\n➥ Gold efficiency goes up by\n⠀⠀**${mythicBonus}%** for every other\n⠀⠀Legendary Item` : ""}`, true)
        .addField("⠀", "⠀")
        .addField("Stats", `${stats}${itemData.mythicBonus ? `🔹 __Mythic Bonus__:\n${Object.keys(itemData.mythicBonus).map(stat => `⠀⠀➥ ${toTitleCase(this.statNames[stat])}: **+${itemData.mythicBonus[stat]}${this.perc.includes(stat) ? "%" : ""}**`).join("\n")}` : ""}`, true)
        .addField("⠀", "⠀", true)
        .setThumbnail(itemData.thumbnail)
        .setFooter("Note: Gold Efficiency does not include passives or actives")
      if (recipeOrder) embed.addField("Recipe", `__Most gold efficient order to build__:\n${recipeOrder.map(item => `**${toTitleCase(item.it)}**:\n➥ ${item.gEff}% Gold Efficient`).join("\n")}`, true)
      return message.channel.send(embed) // Send the embed
    }

  getStatPrices() {
    let list = {
      ls: "vampiric sceptre",
      le: "serrated dirk",
      pmp: "blighting jewel",
      hsp: "forbidden idol",
      vamp: "leeching leer",
      pms: "aether wisp",
      arpen: "last whisper",
      mpen: "sorcerer's shoes",
      cdr: "kindlegem",
      onhit: "recurve bow"
    }

    for (const stat of Object.keys(list)) {
      let value = items[list[stat]].price; // Set the base value as the item's price
      for (const itemStat of Object.keys(items[list[stat]].stats)) {
        if (itemStat !== stat) value -= items[list[stat]].stats[itemStat] * this.statPrices[itemStat]; // Remove the price of the other stats from the value
      }
      this.statPrices[stat] = Math.round((value / items[list[stat]].stats[stat]) * 10) / 10; // Calculate the value for the left over stat
    }
  }

  getGoldEfficiency(stats, price) {
    let statArray = Object.keys(stats);
    let goldValue = 0;
    for (const stat of statArray) {
      goldValue += this.statPrices[stat] * stats[stat]; // Add goldvalue for the stats of an item
    }
    return isNaN(Math.floor(((goldValue / price) * 100) * 100) / 100) ? false : Math.floor(((goldValue / price) * 100) * 100) / 100; // Return with the gold efficiency of an item
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