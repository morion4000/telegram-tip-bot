# Telegram Tip Bot

<https://t.me/webdollar_tip_bot>

## Supported cryptocurrencies

- WebDollar - <https://webdollar.io>

## Commands

- **help** - Shows the help message
- **game** - Play 👻 Haunted Tower and win rewards
- **rain** - Tip the users active on the channel
- **tip** - Tip the user with the specified amount
- **tipbalance** - Shows your balance
- **wallet** - Shows your WEBD wallet for deposits and withdrawals
- **setwallet** - Set the WEBD wallet that you are using for deposits and withdrawals
- **deposit** - Deposit funds to your account from the wallet you set
- **withdraw** - Withdraw funds from your account to the wallet you set or a WEBD adress
- **transactions** - Shows the transactions for your account
- **fees** - Shows the fees
- **price** - Shows the price and volume for WEBD
- **staking** - Shows the staking rewards received
- **system** - Private and hidden command. Only admin can call it
- **stats** - Bot statistics
- **scoreboard** - Top 10 tippers (only public tips are counted)
- **topup** - Buy WEBD with your card or PayPal
- **tutorial** - How to use WebDollar in the browser
- **lottery** - Shows information about the current round
- **lotterytickets** - Shows the tickets for the current round
- **lotterydeposit** - Move funds to lottery balance
- **lotterywithdraw** - Move funds to balance
- **lotteryfaq** - Most common questions about the lottery
- **lotteryhistory** - Shows the last 10 rounds

## Install

`npm run install`

## Load .env file

`export $(cat .env | xargs)`

## Start bot

`node bot`

## Start app (bot + API)

`node app`

## Docker image

https://hub.docker.com/repository/docker/morion4000/telegram-tip-bot

## Deploy

`sls deploy`
