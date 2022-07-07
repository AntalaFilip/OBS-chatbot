const { default: OBSWebSocket } = require("obs-websocket-js");

// This is the configuration file for the OBS chatbot.
// Please DO NOT touch the structure unless you know what you're doing, only change the values in valid JSON format.
// ALL options are REQUIRED
module.exports = {
	// Settings for OBS websocket (values can be found in OBS -> Tools -> obs-websocket settings -> Show Connect Info)
	"server": {
		// The IP address shown in the Server IP field. If OBS is running on the same PC as this script, leave it at 127.0.0.1
		"ip": "127.0.0.1",
		// The port shown in the Server Port field (default 4455)
		"port": 4455,
		// The password shown in the Server Password field
		"password": "passwordhere"
	},
	// If you do not have an access token, run the script without it, you will get a prompt to generate one from Twitch.
	"twitch": {
		// The Access Token of the Twitch Account used in Authentication
		"access_token": "",
		// The lowercase name of the Twitch Account used in Authentication
		"account_name": "",
		// Whether to reply when somebody uses a command; needs an additional chat:edit scope, optional
		"respondToCommands": false,
		// The lowercase channel names to join to
		"channels": [
			
		],
		// The prefix used before the specific commands. If the prefix is '!obs' the commands would look like '!obs setscene scenename'
		"commandPrefix": '!obs',
	},
	// List of all enabled commands, a user can use them if they either have one of the allowed badges or are in the allowedUsers list
	/** @type {Record<string, {allowedBadges: string[], allowedUsers: string[], run: (obs, ...args) => {}}} */
	"commands": {
		"setscene": {
			/*
				Possible badges:
				- broadcaster/1 (you)
				- moderator/1
			 */
			allowedBadges: [
				'broadcaster/1',
				'moderator/1',
			],
			// lowercase Twitch usernames
			allowedUsers: [
				
			],
			// Do not touch the run function, unless you want to make edits to how it behaves
			/** @param {OBSWebSocket} obs */
			run: async (obs, ...args) => {
				const scene = args.join(' ');
				if (!scene) return;

				try {
					await obs.call(`SetCurrentProgramScene`, { sceneName: scene });
				}
				catch (err) {
					return;
				}
			}
		}
	},
	"debug": true
}