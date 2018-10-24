import { RadixAccount, RadixUtil, RadixKeyPair } from 'radixdlt';

import Settings from './config';



function getAccount(seed) {
	const hash = RadixUtil.hash(Buffer.from(seed));
	return new RadixAccount(RadixKeyPair.fromPrivate(hash));
}




class ChannelSet {
	master() {
		return getAccount(Settings.ApplicationID)
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
	forOwnershipOf(id) {	//TODO - Implement
		return getAccount("podium-ownership-of-id-" + id)
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
		return getAccount("podium-post-by-" + user.address + "-" + user.posts);
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

						// Handle whitespace
						if (word === "") {
							depth += 1;
							return {
								word: String.fromCharCode(32),
								type: "word",
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




