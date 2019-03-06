
import { Set } from 'immutable';




const urlRegex = /[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi;







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
    	console.log("can this ever actually happen?")
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}


export function markupPost(post, ignore=Set(), only=Set()) {

	// Prevent case-sensitive match failures on ignore/only
	ignore = ignore.map(r => r.toLowerCase())
	only = only.map(r => r.toLowerCase())

	// Init tracking variables
	var depth = 0;

	function markupWord(word, line) {

		// Handle whitespace
		if (word === "") {
			depth += 1;
			return [{
				word: String.fromCharCode(32),
				type: "word",
				reference: false,
				length: 1,
				line: Math.floor((line + 1.0) / 2.0),
				depth: depth,
			}]
		}

		// Handle topics
		if (word.charAt(0) === "#" && word.length > 3) {
			const id = word.substring(1, word.length).split(/[^A-Z0-9_-]+/gi)[0]
			if (!ignore.includes(word.toLowerCase) &&
					(only.size === 0 || only.includes(word.toLowerCase()))) {
				depth += id.length + 1
				const suffix = word.substring(id.length + 1, word.length)
				const out = [{
					word: `#${id}`,
					type: "topic",
					reference: id,
					length: id.length + 1,
					line: Math.floor((line + 1.0) / 2.0),
					depth: depth
				}]
				if (suffix.length > 0) {
					return out.concat(markupWord(suffix, line))
				} else {
					return out
				}
			} else {
				depth += word.length
				return [{
					word: word,
					type: "word",
					reference: false,
					length: word.length,
					line: Math.floor((line + 1.0) / 2.0),
					depth: depth
				}]
			}
		}

		// Handle mentions
		if (word.charAt(0) === "@" && word.length > 3) {
			const id = word.substring(1, word.length).split(/[^A-Z0-9_-]+/gi)[0]
			if (!ignore.includes(word.toLowerCase) &&
					(only.size === 0 || only.includes(word.toLowerCase()))) {
				depth += id.length + 1;
				const suffix = word.substring(id.length + 1, word.length)
				const out = [{
					word: `@${id}`,
					type: "mention",
					reference: id,
					length: id.length + 1,
					line: Math.floor((line + 1.0) / 2.0),
					depth: depth
				}]
				if (suffix.length > 0) {
					return out.concat(markupWord(suffix, line))
				} else {
					return out
				}
			} else {
				depth += word.length;
				return [{
					word: word,
					type: "word",
					reference: false,
					length: word.length,
					line: Math.floor((line + 1.0) / 2.0),
					depth: depth
				}]
			}
		}

		// Handle links
		if (word.match(urlRegex) &&
				!ignore.includes(word.toLowerCase()) &&
				(only.size === 0 || only.includes(word.toLowerCase()))) {
			depth += word.length;
			let url;
			if (word.split("http").length > 1) {
				url = word
			} else {
				url = `http://${word}`
			}
			return [{
				word: word,
				type: "link",
				reference: url,
				length: word.length,
				line: Math.floor((line + 1.0) / 2.0),
				depth: depth
			}]
		}

		// Handle normal words
		depth += word.length;
		return [{
			word: word,
			type: "word",
			reference: false,
			length: word.length,
			line: Math.floor((line + 1.0) / 2.0),
			depth: depth
		}]

	}


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
		}, [])


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
				depth: depth
			}];

		} else {

			// Break out line by sections
			const sectionListRaw = line.split("\t")
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
				}, [])

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
						depth: depth
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
					return wordList
						.map(w => markupWord(w, l))
						.reduce((a, b) => a.concat(b), [])

				}

			}).reduce((a, b) => a.concat(b), [])

		}

	}).reduce((a, b) => a.concat(b), []).filter(x => x)

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


export function commaNumber(num) {
    var parts = num.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
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






