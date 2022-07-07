const { default: OBSWebSocket } = require('obs-websocket-js');
const WS = require('websocket').client;
const config = require('./config');

/** @param {string} taglist */
const parseBadges = (taglist) => {
	const bText = 'badges=';
	const bFirstIndex = taglist.indexOf(bText);
	const bLastIndex = taglist.indexOf(';', bFirstIndex);
	const bActualText = taglist.slice(bFirstIndex + bText.length, bLastIndex);
	const parsedBadges = bActualText.split(',');

	return parsedBadges;
}

/** @param {OBSWebSocket} obs */
const createTwitchChatClient = async (obs) => {
	// Create a Websocket client to the Twitch IRC API and attempt connection to it.
	const TwitchChatClient = new WS();
	TwitchChatClient.connect(`wss://irc-ws.chat.twitch.tv:443`);

	// Create a Promise that will resolve when the Twitch Client is connected, set up and ready.
	const ready = new Promise((res) => {
		// Runs when the client connects
		TwitchChatClient.on('connect', async (connection) => {
			console.log(`Connected to Twitch, loading...`);

			// Creates a Promise that will resolve when authenticated to the Twitch Server and has joined the channels.
			const joining = new Promise(res => {
				// TODO: we should also check for authentication and capabilities success, not just successfully joining the channel.
				// The function that resolves the promise when receives confirmation from the Twitch API that it has join the channel.
				/** @param msg {import('websocket').Message} */
				const handleJoin = (msg) => {
					if (msg.type === 'utf8' && msg.utf8Data.includes('JOIN')) {
						connection.off('message', handleJoin);
						res();
					}
				}
				// Request the TAGS capability, allowing us to get more info about messages, like the badges of the author.
				console.log(`Requesting capabilities...`);
				connection.sendUTF(`CAP REQ :twitch.tv/tags`);
				// Pass authentication
				console.log(`Authenticating...`);
				connection.sendUTF(`PASS oauth:${config.twitch.access_token}`);
				connection.sendUTF(`NICK ${config.twitch.account_name}`);
				// Join specified channels
				console.log(`Joining channels...`)
				connection.sendUTF(`JOIN ${config.twitch.channels.map(c => '#' + c).join(',')}`)


				connection.on('message', handleJoin);
			});

			/** @param message {import('websocket').Message} */
			const handleMessage = async (message) => {
				if (message.type === 'utf8') {
					const data = message.utf8Data;
					if (config.debug) console.log(`Received messages:\n`, data);
					// Split multiple messages
					const messages = data.split('\r\n');
					// Parse the messages
					for (const p of messages) {
						// Split the big chunk of text into little parts of text we can use
						const parts = p.split(':');
						if (parts.length < 2) return;
						const mainParts = parts[1].split(' ');
						const userString = mainParts[0];
						const username = userString.slice(0, userString.indexOf('!'));
						const badges = parseBadges(parts[0]);

						const command = mainParts[1];
						const args = mainParts.slice(2);
						// If the command received from Twitch is a chat message, handle it as a command.
						if (command === 'PRIVMSG') {
							const channel = args[0];
							const message = parts[2];
							if (message.startsWith(config.twitch.commandPrefix)) {
								await handleCommand(message.slice(4).trim(), { user: username, badges });
							}
						}
					}
				}
			}

			/**
			 * @param {string} message
			 * @param {{user: string, badges: string[]}} data
			 */
			const handleCommand = async (message, data) => {
				const commands = config.commands;
				const parts = message.split(' ');
				const cmd = parts[0].toLowerCase();
				const args = parts.slice(1);

				const command = commands[cmd];
				if (!command) return;
				// Permission check
				if (!command.allowedUsers.includes(data.user.toLowerCase()) && !command.allowedBadges.find(b => data.badges.includes(b))) return;
				try {
					command.run(obs, ...args);
				}
				catch (err) {
					if (config.debug) console.warn(err);
					return;
				}
			}

			connection.on('message', handleMessage);
			connection.on('message', (msg) => {
				if (msg.type === 'utf8') {
					if (msg.utf8Data.startsWith('PING')) {
						const toReturn = msg.utf8Data.split(' ')[1];
						connection.sendUTF(`PONG ${toReturn}`);
						console.log('PONG');
					}
				}
			})
			// Wait until we actually connect
			await joining;
			res();
		});
	});
	await ready;
	return TwitchChatClient;
}

module.exports = createTwitchChatClient;