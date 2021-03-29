const TopazClient = require("./util/TopazClient.js");
const config = require("./config.js");

let client = new TopazClient(config)

client.loadCommands("commands");