# Quarix AI — Developer Tools & Utilities

> Open-source trading utilities used by the **[Quarix AI](https://quarixai.online)** Quarix AI platform for HK traders.

## Overview

This repository contains the utility scripts that power the analysis and risk management features on [Quarix AI](https://quarixai.online).
All tools use only public APIs — no API key required to run them.

## Tools


### `backtest-runner.js` — Simple Moving Average Crossover Backtester

Backtests a dual SMA crossover strategy on historical OHLCV data with trade log and performance stats.

```bash
node backtest-runner.js --symbol=ETH --fast=9 --slow=21 --interval=4h
```


### `risk-calculator.js` — Position Size & Risk Calculator

Calculates optimal position size based on account balance, risk %, stop-loss distance and asset price.

```bash
node risk-calculator.js --balance=10000 --risk=2 --entry=45000 --stop=43000
```


## Installation

```bash
# Clone the repo
git clone https://github.com/jakolinfarnandez364-rgb/quarix-ai-review.git
cd quarix-ai-review

# Run any tool directly (no dependencies — Node.js stdlib only)
node backtest-runner.js
```

## Requirements

- Node.js v16 or higher
- Internet connection (fetches live data from Binance public API)

## Platform

These utilities are integrated into **[Quarix AI](https://quarixai.online)**, an AI-powered Quarix AI for traders in HK.

- 🌐 Official website: [https://quarixai.online](https://quarixai.online)
- 📊 Live signals, risk management, and portfolio tracking
- 🚀 Free registration in under 2 minutes

## Disclaimer

⚠️ These tools are for educational and informational purposes only.
Trading cryptocurrencies and financial instruments involves substantial risk.
Past performance does not guarantee future results.

---

*2026 · [Quarix AI](https://quarixai.online) · For informational purposes only*
