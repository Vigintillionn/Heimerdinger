const xlsx = require("xlsx")
const fs = require("fs")

module.exports = class ChampionCooldowns {
  constructor(client, file) {
    this.client = client;

    this.champions = {};
    this.formChamps = ["nidalee", "elise", "rek'sai", "jayce"];

    this.readSheet(file)
  }

  readSheet(file) {
    // Get Sheet
    let sheet = xlsx.readFile(file).Sheets["Cooldowns"];

    // Looping through all the objects
    let data = [];
    let dataKeys = {};
    for (let i in sheet) {
      if (i.startsWith("!")) continue; // Don't need unnecessary data
      let coordinates = this.getCoordinates(i); // Get the Coordinates
      let value = sheet[i].v; // Get the value of the cell
      if (coordinates.number === 1) dataKeys[coordinates.letter] = value; // First row define the names
      else { // Other rows are the data
        if (!data[coordinates.number - 2]) data[coordinates.number - 2] = {};
        data[coordinates.number - 2][dataKeys[coordinates.letter]] = value;
      }
    }
    for (let i = 0; i < data.length; i++) {
      let champion = data[i]; // Get champion data

      if (!champion || !champion.Champion) continue;
      if (this.champions[this.formChamps.includes(champion.Champion.split(" ")[0].toLowerCase()) ? champion.Champion.split(" ")[0].toLowerCase() : champion.Champion.toLowerCase()]) continue;

      if (this.formChamps.includes(champion.Champion.split(" ")[0].toLowerCase())) { // Check if champ has multiple forms
        let secondFormData = data[i + 5];
        let name = champion.Champion.split(" ")[0];
        let firstForm = champion.Champion.split(" ")[1];
        let secondForm = secondFormData.Champion.split(" ")[1];
        this.champions[name.toLowerCase()] = {
          firstForm: {
            form: firstForm,
            q: [champion["Q1"], champion["Q2"], champion["Q3"], champion["Q4"], champion["Q5"]],
            w: [champion["W1"], champion["W2"], champion["W3"], champion["W4"], champion["W5"]],
            e: [champion["E1"], champion["E2"], champion["E3"], champion["E4"], champion["E5"]],
            r: [champion["R1"], champion["R2"], champion["R3"]]
          },
          secondForm: {
            form: secondForm,
            q: [secondFormData["Q1"], secondFormData["Q2"], secondFormData["Q3"], secondFormData["Q4"], secondFormData["Q5"]],
            w: [secondFormData["W1"], secondFormData["W2"], secondFormData["W3"], secondFormData["W4"], secondFormData["W5"]],
            e: [secondFormData["E1"], secondFormData["E2"], secondFormData["E3"], secondFormData["E4"], secondFormData["E5"]],
            r: [secondFormData["R1"], secondFormData["R2"], secondFormData["R3"]]
          }
        }
      } else {
        this.champions[champion.Champion.toLowerCase()] = {
          q: [champion["Q1"], champion["Q2"], champion["Q3"], champion["Q4"], champion["Q5"]],
          w: [champion["W1"], champion["W2"], champion["W3"], champion["W4"], champion["W5"]],
          e: [champion["E1"], champion["E2"], champion["E3"], champion["E4"], champion["E5"]],
          r: [champion["R1"], champion["R2"], champion["R3"]],
          passive: champion.Passive ? champion.Passive : false
        }
      }
    }
  }

  getCoordinates(cellName) {
    let letter = "";
    let number = "";
    let alphabet = "abcdefghijklmnopqrstuvwxyz";

    // Looping through each character 
    cellName.split("").forEach(i => {
      if (alphabet.includes(i.toLowerCase())) letter += i;
      else number += i;
    });

    // Returning the value
    return {
      letter: letter,
      number: Number(number) // Make the number a number type
    };
  }
}