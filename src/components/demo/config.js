const Settings = {

	// ApplicationID: "podiumLIVE",
	ApplicationID: "podiumALPHA-7",		// Radix Identifier for the app,
										//	(increment to reset)

	costs: {
		topic: 10.0,
		mention: 12.0,
		link: 8.0,
		tab: 1.0,
		return: 1.0,
		word: 1.0,		//per char
		overhead: 10	//flat, per-post rate
	},

	timeout: 10000						// Dormant time before an open radix
										// 		subscription is killed

}

export default Settings;