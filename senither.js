let data = {
  skillAvg: 42,
  catacombs: 30,
  slayerXP: 3000000
}

console.log(calculate(data))

function calculate(data) {
  let skill = Math.pow(data.skillAvg * 10, 0.5 + (data.skillAvg / 100));
  // Calculates the catacomb weight by powering it by 2, and then
  // dividing the result by 8.333, this will end up rewarding
  // 300 points at max level on a soft exponential curve.
  let catacomb = Math.pow(data.catacombs, 2) / 8.3333333333333333;
  // Calcualtes the slayer weight with a flat curve,
  // giving 1 point every 12,000 average slayer up
  // to 3,000,000 XP, the weight past the 3 million
  // limit is first divided by 18,000, and then
  // reducded by 10%
  let slayerOverflow = 3000000 - data.slayerXP;
  let slayer = slayerOverflow > 0
      ? data.slayerXP / 12000
      : (data.slayerXP + slayerOverflow) / 12000;

  if (slayerOverflow < 0) {
      slayer += Math.pow((slayerOverflow * -1) / 18000, .90);
  }
  return slayer+skill+catacomb
}