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
		"password": "uawCGHF91qAu9yGC"
	},
	// If you do not have an access token, 
	"twitch": {
		// The Access Token of the Twitch Account used in Authentication
		"access_token": "hs5inz7fthml59ai6pv9d7fcr6hlg9",
		// The lowercase name of the Twitch Account used in Authentication
		"account_name": "filipantala",
		// Whether to reply when somebody uses a command; needs an additional chat:edit scope
		"respondToCommands": true,
		// The lowercase channel names to join to
		"channels": [
			'filipantala'
		]
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
				'filipantala',
			],
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
	}
}