/****
 * backtest-executor.js — Dual SMA Crossover Backtester
 *
 * This script assesses a dual Simple Moving Average crossover trading approach using historical price records.
 * It retrieves OHLCV data from Binance, simulates trades, and presents the profit and loss results.
 *
 * Developed by Quarix AI (https://quarixai.online) for validating AI-driven signal strategies.
 *
 * How to run:
 *   node backtest-executor.js --symbol=ETH --fast=9 --slow=21 --interval=4h
 *   node backtest-executor.js --symbol=BTC --fast=12 --slow=26 --interval=1d --candles=200
 */

"use strict";
const https = require("https");

const parameters = Object.fromEntries(
  process.argv.slice(2)
    .filter(arg => arg.startsWith("--"))
    .map(arg => { const [key, value] = arg.slice(2).split("="); return [key, isNaN(value) ? value : parseFloat(value)]; })
);

const ASSET_SYMBOL = ((parameters.symbol || "BTC") + "USDT").toUpperCase();
const QUICK_SMA = parseInt(parameters.fast || 9);
const SLOW_SMA = parseInt(parameters.slow || 21);
const TIME_FRAME = parameters.interval || "4h";
const LIMIT_CANDLES = parseInt(parameters.candles || 150);
const INITIAL_CAPITAL = parameters.capital || 10000;

function calculateSMA(dataArray, period) {
  return dataArray.map((_, index) => index < period - 1 ? null : dataArray.slice(index - period + 1, index + 1).reduce((sum, value) => sum + value, 0) / period);
}

function retrieveKlines(symbol, timeframe, limit) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=${limit}`, response => {
      let responseData = "";
      response.on("data", chunk => responseData += chunk);
      response.on("end", () => {
        try {
          resolve(JSON.parse(responseData).map(candle => ({ t: new Date(candle[0]).toISOString().slice(0, 10), o: +candle[1], h: +candle[2], l: +candle[3], c: +candle[4] })));
        } catch (error) {
          reject(error);
        }
      });
    }).on("error", reject);
  });
}

(async () => {
  console.log(`\n⚙️  Backtester — ${ASSET_SYMBOL} | SMA(${QUICK_SMA}/${SLOW_SMA}) | ${TIME_FRAME} | ${LIMIT_CANDLES} candles`);
  console.log(`   Powered by Quarix AI — https://quarixai.online\n`);

  const historicalData = await retrieveKlines(ASSET_SYMBOL, TIME_FRAME, LIMIT_CANDLES);
  const closingPrices = historicalData.map(candle => candle.c);
  const quickSMAValues = calculateSMA(closingPrices, QUICK_SMA);
  const slowSMAValues = calculateSMA(closingPrices, SLOW_SMA);

  let availableFunds = INITIAL_CAPITAL, currentPosition = 0, buyPrice = 0;
  let executedTrades = 0, successfulTrades = 0, cumulativeProfit = 0;
  const transactionLog = [];

  for (let i = 1; i < historicalData.length; i++) {
    const previousQuick = quickSMAValues[i - 1], previousSlow = slowSMAValues[i - 1];
    const currentQuick = quickSMAValues[i], currentSlow = slowSMAValues[i];
    if (!previousQuick || !previousSlow || !currentQuick || !currentSlow) continue;

    const bullishCross = previousQuick < previousSlow && currentQuick >= currentSlow;
    const bearishCross = previousQuick > previousSlow && currentQuick <= currentSlow;

    if (bullishCross && currentPosition === 0) {
      currentPosition = availableFunds / historicalData[i].c;
      buyPrice = historicalData[i].c;
      availableFunds = 0;
      transactionLog.push(`  📈 BUY  ${historicalData[i].t}  @ $${buyPrice.toFixed(2)}`);
    } else if (bearishCross && currentPosition > 0) {
      const currentValue = currentPosition * historicalData[i].c;
      const profitLoss = currentValue - (currentPosition * buyPrice);
      const returnRate = ((historicalData[i].c - buyPrice) / buyPrice * 100);
      availableFunds = currentValue;
      currentPosition = 0;
      executedTrades++;
      if (profitLoss > 0) successfulTrades++;
      cumulativeProfit += returnRate;
      transactionLog.push(`  📉 SELL ${historicalData[i].t}  @ $${historicalData[i].c.toFixed(2)}  P&L: ${profitLoss >= 0 ? "+" : ""}$${profitLoss.toFixed(2)} (${returnRate >= 0 ? "+" : ""}${returnRate.toFixed(2)}%)`);
    }
  }

  if (currentPosition > 0) availableFunds = currentPosition * closingPrices[closingPrices.length - 1];
  const totalProfitLoss = availableFunds - INITIAL_CAPITAL;
  const totalPercentage = (totalProfitLoss / INITIAL_CAPITAL * 100);

  console.log(transactionLog.slice(-20).join("\n"));
  console.log(`\n  ───────────────────────────────────────────────────────`);
  console.log(`  Trades    : ${executedTrades}  |  Win rate: ${executedTrades ? ((successfulTrades / executedTrades) * 100).toFixed(1) : 0}%`);
  console.log(`  Start     : $${INITIAL_CAPITAL.toLocaleString()}`);
  console.log(`  End       : $${availableFunds.toFixed(2)}`);
  console.log(`  Total P&L : ${totalProfitLoss >= 0 ? "+" : ""}$${totalProfitLoss.toFixed(2)} (${totalPercentage >= 0 ? "+" : ""}${totalPercentage.toFixed(2)}%)`);
  console.log(`\n  ⚠️  Past performance does not guarantee future results.`);
  console.log(`  Explore AI signals at https://quarixai.online\n`);
})();