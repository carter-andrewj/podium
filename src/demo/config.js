const Settings = {

	// ApplicationID: "podiumLIVE",
	ApplicationID: "podiumALPHA-11",	// Radix Identifier for the app,
										//	(increment to reset)

	costs: {
		topic: 10.0,
		mention: 12.0,
		link: 8.0,
		tab: 1.0,
		return: 1.0,
		word: 1.0,		//per character
		overhead: 10	//flat, per-post rate
	},

	colors: {
		black: "#000",
		white: "#fff",
		green: "#01B050",
		paleGreen: "#73d096",
		red: "#b01501",
		paleRed: "#d07c73",
		grey: "#D9D9D9",
		lightGrey: "#E9E9E9",
		darkGrey: "#B7B7B7",
		blue: "#2A01B0",
		pink: "#A701B0",
		tan: "#B06D01",
		yellow: "#B0AA01"
	},

	timeout: 10000						// Dormant time before an open radix
										// 		subscription is killed

}

export default Settings;