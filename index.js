// Imports
const OWS = require('obs-websocket-js').default;
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

// The main handler function
async function main() {
	// Create the OBS client
	const obs = new OWS();
	const address = `ws://${config.server.ip}:${config.server.port}`;

	// Connect to OBS
	const connectionData = await obs.connect(address, config.server.password);
	console.log(`Connected to OBS`);

	// Create the Twitch Chat Client and connect
	const TwitchChatClient = new WS();
	TwitchChatClient.connect(`wss://irc-ws.chat.twitch.tv:443`);
	TwitchChatClient.on('connect', async (connection) => {
		console.log(`Connected to Twitch, loading...`);

		// Authenticate to the Twitch Server
		const joining = new Promise(res => {
			/** @param msg {import('websocket').Message} */
			const handleJoin = (msg) => {
				if (msg.type === 'utf8' && msg.utf8Data.includes('JOIN')) {
					connection.off('message', handleJoin);
					res();
				}
			}
			// Request the TAGS capability, allowing us to get more info about messages
			connection.sendUTF(`CAP REQ :twitch.tv/tags`);
			// Pass authentication
			connection.sendUTF(`PASS oauth:${config.twitch.access_token}`);
			connection.sendUTF(`NICK ${config.twitch.account_name}`);
			// Join specified channels
			connection.sendUTF(`JOIN ${config.twitch.channels.map(c => '#' + c).join(',')}`)

			connection.on('message', handleJoin);
		});

		/** @param message {import('websocket').Message} */
		const handleMessage = async (message) => {
			if (message.type === 'utf8') {
				const data = message.utf8Data;
				console.log(data);
				// Split multiple 
				const messages = data.split('\r\n');
				for (const p of messages) {
					const parts = p.split(':');
					if (parts.length < 2) return;
					const mainParts = parts[1].split(' ');
					const userString = mainParts[0];
					const username = userString.slice(0, userString.indexOf('!'));
					const badges = parseBadges(parts[0]);

					const command = mainParts[1];
					const args = mainParts.slice(2);
					if (command === 'PRIVMSG') {
						const channel = args[0];
						const message = parts[2];
						if (message.startsWith('!obs')) {
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
			command.run(obs, ...args);
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
	});
}


if (!config.twitch.access_token) {
	console.log(`You currently do not have an access token set in your configuration. If you have one, please set it there. If you do not have one, please follow the next instructions`);
	console.log(`If you want to use your account as the Bot interface (receiving/sending messages), just log in with your account. If you do NOT want to use your account, create a new Twitch account for the Bot and use that one.`);
	console.log(`If you want to only receive commands (no response to commands), use the FIRST link. If you also want the Bot to send messages (optional, like responses to successful commands), use the SECOND link`);
	console.log(`Receive only: https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=wk0m5b39eu5r2w5ks0tb4hbbseqeil&redirect_uri=http://localhost:3456&scope=chat%3Aread`);
	console.log(`Send and receive: https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=wk0m5b39eu5r2w5ks0tb4hbbseqeil&redirect_uri=http://localhost:3456&scope=chat%3Aread+chat%3Aedit`);
	const app = require('express')();
	app.get('/', (req, res) => {
		res.send(`
		Your access token should be in your URL, in the part called access_token=.........&.... copy the part after the equals until the ampersand\n
		Put the token into your config.js and restart the program from the command line.
		`);
	});
	app.listen(3456);
}
else {
	// Run the main function
	main();
}