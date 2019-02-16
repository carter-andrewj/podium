import { RadixAccount, RadixUtil, RadixKeyPair } from 'radixdlt';

import Settings from 'settings';



function getAccount(seed) {
	const hash = RadixUtil.hash(Buffer.from(seed));
	return new RadixAccount(RadixKeyPair.fromPrivate(hash));
}




class ChannelSet {
	master() {
		return getAccount(Settings.ApplicationID)
	}
	faucet() {
		return RadixAccount.fromAddress(
			'9he94tVfQGAVr4xoUpG3uJfB2exURExzFV6E7dq4bxUWRbM5Edd', true);
	}

	// Users
	forUserRoster() {	//TODO - Rename to index
		return getAccount("podium-user-roster")
	}
	forProfileOf(address) {
		return RadixAccount.fromAddress(address)
	}
	forKeystoreOf(id, pw) {
		return getAccount("podium-keystore-for-" + id + pw)
	}
	forProfileWithID(id) {	//TODO - Implement
		return getAccount("podium-ownership-of-id-" + id)
	}
	forIntegrityOf(address) {
		return getAccount("podium-integrity-score-of-" + address);
	}

	// Tokens
	forPODof(address) {
		return getAccount("podium-token-transactions-of-" + address);
	}
	forAUDof(address) {
		return getAccount("audium-token-transactions-of-" + address);
	}

	// Topics
	forTopicIndexOf(prefix) {
		return getAccount("podium-topic-index-of-" + prefix.substring(0, 2))
	}
	forTopic(address) {
		return RadixAccount.fromAddress(address)
	}
	forTopicWithID(id) {
		return getAccount("podium-topic-" + id);
	}
	
	// Posts
	forPostsBy(address) {
		return getAccount("podium-user-posts-" + address)
	}
	forPost(address) {
		return RadixAccount.fromAddress(address)
	}
	forNextPostBy(user) {
		// TODO - Fix this so posts are stored deterministicly again
		return getAccount("podium-post-by-" + user.get("address") +
			              "-" + (user.get("posts") + user.get("pending")));
	}
	forNewPost(post) {
		return getAccount("podium-post-with-content-" + post);
	}
	
	// Follows
	forFollowing(address) {
		return getAccount("podium-user-followers-" + address)
	}
	forFollowsBy(address) {
		return getAccount("podium-user-following-" + address)
	}
	forRelationOf(address1, address2) {
		return getAccount("podium-user-" + address1 +
						  "-follows-user-" + address2)
	}

	// Alerts
	forAlertsTo(address) {
		return getAccount("podium-user-alerts-" + address)
	}
	
}

var Channel = new ChannelSet();
export default Channel;




export function getCaretWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection !== "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel === doc.selection) && sel.type !== "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}


export function markupPost(post) {

	//TODO - Split mentions and topics on special characters

	// Init tracking variables
	var depth = 0;

	// Break out post by lines
	const lineListRaw = post.split("\r");
	const lineList = lineListRaw.reduce(
		(result, next, i) => {
			if (i === lineListRaw.length - 1) {
				if (next !== "") {
					result.push(next);
				}
			} else if (next !== "") {
				result.push(...[next, ""]);
			} else {
				result.push(next);
			}
			return result;
		}, []);

	// Deconstruct each line
	const result = lineList.map((line, l) => {

		// Check for orphan lines
		if (line === "") {

			// Handle whitespace
			// (New lines need an empty character -8203- in
			// order for the window to position the caret
			// at the start of the line. The new line itself
			// is acheived from the 'return' type adding a
			// new paragraph DOM node when the output post
			// text is constructed).
			depth += 1;
			return [{
				word: String.fromCharCode(8203),
				type: "return",
				reference: false,
				length: 1,
				line: Math.floor(l / 2.0),
				depth: depth,
				cost: Settings.costs.return
			}];

		} else {

			// Break out line by sections
			const sectionListRaw = line.split("\t");
			const sectionList = sectionListRaw.reduce(
				(result, next, i) => {
					if (i === sectionListRaw.length - 1) {
						if (next !== "") {
							result.push(next);
						}
					} else if (next !== "") {
						result.push(...[next, ""]);
					} else {
						result.push(next);
					}
					return result;
				}, []);

			// Deconstruct sections
			return sectionList.map((section, s) => {

				// Check for orphan sections
				if (section === "") {

					// Handle whitespace
					depth += 1;
					return [{
						word: "\t",
						type: "tab",
						reference: false,
						length: 1,
						line: Math.floor((l + 1.0) / 2.0),
						depth: depth,
						cost: Settings.costs.tab
					}];

				} else {

					// Break out section by words
					const wordListRaw = section.split(" ");
					const wordList = wordListRaw.reduce(
						(result, next, i) => {
							if (i === wordListRaw.length - 1) {
								if (next !== "") {
									result.push(next);
								}
							} else if (next !== "") {
								result.push(...[next, ""]);
							} else {
								result.push(next);
							}
							return result;
						}, []);

					// Handle trailing whitespace
					return wordList.map((word, w) => {

						//TODO - Handle punctuation separately from
						// 		 the word itself (i.e.) to allow
						//		 users to write #topic! without
						//		 the ! counting towards the
						//		 associated topic ID.

						// Handle whitespace
						if (word === "") {
							depth += 1;
							return {
								word: String.fromCharCode(32),
								type: "word",
								reference: false,
								length: 1,
								line: Math.floor((l + 1.0) / 2.0),
								depth: depth,
								cost: Settings.costs.word
							}
						}

						// Handle topics
						if (word.charAt(0) === "#" && word.length > 3) {
							depth += word.length;
							return {
								word: word,
								type: "topic",
								reference: word.substring(1, word.length),
								length: word.length,
								line: Math.floor((l + 1.0) / 2.0),
								depth: depth,
								cost: Settings.costs.topic
							}
						}

						// Handle mentions
						if (word.charAt(0) === "@" && word.length > 3) {
							depth += word.length;
							return {
								word: word,
								type: "mention",
								reference: word.substring(1, word.length),
								length: word.length,
								line: Math.floor((l + 1.0) / 2.0),
								depth: depth,
								cost: Settings.costs.mention
							}
						}

						// Handle links
						const dots = word.split(".");
						if (dots.length > 1 &&
								dots[dots.length - 1] !== "" &&
								word.length >= 5) {
							depth += word.length;
							return {
								word: word,
								type: "link",
								reference: true,
								length: word.length,
								line: Math.floor((l + 1.0) / 2.0),
								depth: depth,
								cost: Settings.costs.link
							}
						}

						// Handle normal words
						depth += word.length;
						return {
							word: word,
							type: "word",
							reference: false,
							length: word.length,
							line: Math.floor((l + 1.0) / 2.0),
							depth: depth,
							cost: Settings.costs.word * word.length
						}
						
					});

				}

			}).reduce((a, b) => a.concat(b), []);

		}

	}).reduce((a, b) => a.concat(b), []).filter(x => x);

	// Return result
	return result

}



const months = [
	"jan",
	"feb",
	"mar",
	"apr",
	"jun",
	"jul",
	"aug",
	"sep",
	"oct",
	"nov",
	"dec"
]

const cutoff = {
	date: 4.0 * 7.0 * 24.0 * 60.0 * 60.0 * 1000.0,
	weeks: 7.0 * 24.0 * 60.0 * 60.0 * 1000.0,
	days: 24.0 * 60.0 * 60.0 * 1000.0,
	hours: 60.0 * 60.0 * 1000.0,
	minutes: 60.0 * 1000.0,
}

export function timeform(t) {

	// Formats a timestamp into a human readable date.

	// Convert timestamp into datetime object
	const now = new Date();
	const date = new Date(t);
	const diff = now.getTime() - date.getTime();

	// Format date
	if (diff > cutoff.date) {
		if (now.getYear() === date.getYear()) {
			return date.getDay() + " " + months[date.getMonth()];
		} else {
			return date.getDay() + " " + months[date.getMonth()] +
			       " " + date.getYear();
		}
	} else if (diff > cutoff.weeks) {
		const weeks = Math.round(diff / cutoff.weeks);
		if (weeks > 1) {
			return weeks + " weeks ago";
		} else {
			return "1 week ago";
		}
	} else if (diff > cutoff.days) {
		const days = Math.round(diff / cutoff.days);
		if (days > 1) {
			return days + " days ago";
		} else {
			return "1 day ago";
		}
	} else if (diff > cutoff.hours) {
		const hrs = Math.round(diff / cutoff.hours);
		if (hrs > 1) {
			return hrs + " hours ago";
		} else {
			return "1 hour ago";
		}
	} else if (diff > cutoff.minutes) {
		const mins = Math.round(diff / cutoff.minutes);
		if (mins > 1) {
			return mins + " minutes ago";
		} else {
			return "1 minute ago";
		}
	} else {
		return "just now";
	}

}




export function formatNumber(num) {
	if (num < 1000) {
		return num
	} else if (num < 1000) {
		return Math.round(num / 10.0) / 100 + "k"
	} else if (num < 10000) {
		return Math.round(num / 100.0) / 10 + "k"
	} else if (num < 100000) {
		return Math.round(num / 1000.0) + "k"
	} else if (num < 1000000) {
		return Math.round(num / 10000.0) / 100 + "M"
	} else if (num < 10000000) {
		return Math.round(num / 100000.0) / 10 + "M"
	} else if (num < 100000000) {
		return Math.round(num / 1000000.0) + "M"
	} else if (num < 1000000000) {
		return Math.round(num / 10000000.0) / 100 + "Bn"
	} else if (num < 10000000000) {
		return Math.round(num / 100000000.0) / 10 + "Bn"
	} else if (num < 100000000000) {
		return Math.round(num / 1000000000.0) + "Bn"
	}
}






