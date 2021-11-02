# Telegram Tip Bot

<https://t.me/webdollar_tip_bot>

## Supported cryptocurrencies

* WebDollar - <https://webdollar.io>

## Commands

* __help__ - Shows the help message
* __tip__ - Tip the user with the specified amount
* __tipbalance__ - Shows your balance
* __wallet__ - Shows your WEBD wallet for deposits and withdrawals
* __setwallet__ - Set the WEBD wallet that you are using for deposits and withdrawals
* __deposit__ - Deposit funds to your account from the wallet you set
* __withdraw__ - Withdraw funds from your account to the wallet you set or a WEBD adress
* __transactions__ - Shows the transactions for your account
* __fees__ - Shows the fees
* __price__ - Shows the price and volume for WEBD
* __staking__ - Shows the staking rewards received
* __system__ - Private and hidden command. Only admin can call it
* __stats__ - Bot statistics
* __scoreboard__ - Top 10 tippers (only public tips are counted)
* __topup__ - Buy WEBD with your card or PayPal
* __tutorial__ - How to use WebDollar in the browser
* __lottery__ - Shows information about the current round
* __lottery_deposit__ - Move funds to lottery balance
* __lottery_withdraw__ - Move funds to balance
* __lottery_tickets__ - Shows the tickets for the current round
* __lottery_faq__ - Most common questions about the lottery
* __lottery_history__ - Shows the last 10 rounds

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
