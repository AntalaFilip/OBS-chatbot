# OBS Chatbot

A quick and easy chatbot script to bridge OBS Studio and your stream chats (currently supports Twitch only). 
You or your moderators can control certain functions right from the chat.
You will need an access token from Twitch from an account that will do the receiving and sending (the script will guide you through it).

Currently under development and testing.
Right now only supports scene switching and does not yet reply to commands.

## Installation and configuration

### Prerequisites
You will need the following:
- OBS Studio
  - [OBS websocket extension](https://github.com/obsproject/obs-websocket) by the OBS Team installed. If you do not have OBS Studio > 28.0.0
- [NodeJS Runtime](https://nodejs.org) installed on your machine that will host the Bot, or on your streaming machine.

### Setup
#### OBS Websocket
Firstly, configure your OBS Websocket extension in OBS Studio. Navigate to: `Tools -> obs-websocket settings`    
Enable the WebSocket server and, if needed, configure a custom server port, and note down the info in Show Connect Info.
Make sure to allow the firewall dialog, if it pops up.      
!! Security notice: you should only run obs-websocket on your **own _trusted_ network** and still with a strong password. If you are planning to stream outside of a trusted network, like at a coffee shop, I encourage you to disable it beforehand, because it exposes a (password protected) server on your network through which you can control OBS studio remotely. 

#### The chatbot itself
* Clone/download and extract this repository to your machine that will host the bot. It can be any machine, even the one you are streaming on, with the condition that it must be on the same network as your streaming machine.  
* Open up a terminal and navigate to the folder with the repository.  
* Run `npm ci` which will install all the necessary packages for your application from the npm repository.
* COPY the `config.example.js` file into a new file called `config.js` and fill in your specific values.
* Start the chatbot by running `npm start` in your terminal. This will launch it in an interactive session, so when you close your terminal it will terminate. You should see a list of messages detailing the status of everything.

If you want to run the script as a service, then for Linux systems I recommend [PM2](https://pm2.keymetrics.io/). For Windows, out-of-the-box support is under development. For now you can try to Google for existing solutions to run NodeJS scripts as a service.

## How does this work?
Essentially, it connects by websocket to your OBS instance and also by websocket to the Twitch Chat API.  
In the Twitch API, it listens for chat messages from the chosen channels and when it detects a command, it checks permissions and, if passing, executes the OBS command.
