// Imports
const OWS = require('obs-websocket-js').default;
const config = require('./config');
const createTwitchChatClient = require('./twitch');

// The main handler function
async function main() {
	// Create the OBS client
	const obs = new OWS();
	const address = `ws://${config.server.ip}:${config.server.port}`;

	// Connect to OBS
	const obsConnData = await obs.connect(address, config.server.password);
	console.log(`Connected to OBS`);

	// Create the Twitch Chat Client and connect
	createTwitchChatClient(obs);
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