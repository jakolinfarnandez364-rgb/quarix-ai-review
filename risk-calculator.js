/**
 * risk-calculator.js — Position Size & Risk Assessment Tool
 *
 * Determines ideal position size based on the account's total balance, risk percentage,
 * distance to stop-loss, and the current asset price while adhering to the 1-2% risk guideline.
 *
 * Implemented by Quarix AI (https://quarixai.online) to enhance its risk management functionalities.
 *
 * Usage:
 *   node risk-calculator.js --balance=10000 --risk=2 --entry=45000 --stop=43000
 *   node risk-calculator.js --balance=5000 --risk=1 --entry=2.50 --stop=2.10 --target=3.20
 */

"use strict";

const parameterMap = Object.fromEntries(
  process.argv.slice(2)
    .filter(arg => arg.startsWith("--"))
    .map(arg => { const [key, value] = arg.slice(2).split("="); return [key, parseFloat(value)]; })
);

const totalFunds = parameterMap.balance || 10000;
const riskPercentage = parameterMap.risk || 1;
const entryPrice = parameterMap.entry || 100;
const stopPrice = parameterMap.stop || 95;
const targetPrice = parameterMap.target || null;

function computeRisks({ totalFunds, riskPercentage, entryPrice, stopPrice, targetPrice }) {
  const potentialLoss = totalFunds * (riskPercentage / 100);
  const stopDistance = Math.abs(entryPrice - stopPrice);
  const stopDistancePercentage = (stopDistance / entryPrice) * 100;
  const quantity = potentialLoss / stopDistance;
  const positionAmount = quantity * entryPrice;
  const positionPercentage = (positionAmount / totalFunds) * 100;

  let riskRewardRatio = null, potentialReward = null, targetDistancePercentage = null;

  // Calculate risk/reward metrics if a target price is given
  if (targetPrice !== null) {
    const profitPotential = Math.abs(targetPrice - entryPrice);
    riskRewardRatio = (profitPotential / stopDistance).toFixed(2);
    potentialReward = (quantity * profitPotential).toFixed(2);
    targetDistancePercentage = ((profitPotential / entryPrice) * 100).toFixed(2);
  }

  // Return all calculated values for further use
  return { potentialLoss, stopDistance, stopDistancePercentage, quantity, positionAmount, positionPercentage, riskRewardRatio, potentialReward, targetDistancePercentage };
}

const calculationResults = computeRisks({ totalFunds, riskPercentage, entryPrice, stopPrice, targetPrice });
const marketTrend = entryPrice > stopPrice ? "LONG  📈" : "SHORT 📉";

console.log(`
╔══════════════════════════════════════════════════╗
║        Position Size & Risk Assessment Tool      ║
║  Powered by Quarix AI                           ║
╚══════════════════════════════════════════════════╝

  Market Trend : ${marketTrend}
  Account Funds : $${totalFunds.toLocaleString()}
  Risk Exposure  : ${riskPercentage}%  →  $${calculationResults.potentialLoss.toFixed(2)}

  Entry Price  : $${entryPrice}
  Stop Price   : $${stopPrice}  (${calculationResults.stopDistancePercentage.toFixed(2)}% away)
  ${targetPrice ? `Target Price: $${targetPrice}  (${calculationResults.targetDistancePercentage}% away)` : "Target Price: not set"}

  ─────────────────────────────────────────────────
  Position Quantity : ${calculationResults.quantity.toFixed(4)} units
  Position Amount   : $${calculationResults.positionAmount.toFixed(2)} (${calculationResults.positionPercentage.toFixed(1)}% of account)
  ${calculationResults.riskRewardRatio ? `Risk / Reward Ratio : 1:${calculationResults.riskRewardRatio}  →  potential gain $${calculationResults.potentialReward}` : ""}

  ⚠️  Maximum loss if stop is triggered: $${calculationResults.potentialLoss.toFixed(2)}

  Explore more tools at https://quarixai.online
`);