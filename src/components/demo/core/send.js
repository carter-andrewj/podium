import React, { Component } from 'react';
import '../../../App.css';




const costs = {
	topic: 10.0,
	mention: 12.0,
	link: 8.0,
	tab: 1.0,
	return: 1.0,
	word: 0.5,		//per char
	overhead: 10	//flat, per-post rate
}



const defState = {
	raw: "",
	focus: false,
	cursor: [],
	caret: {},
	html: ""
}


function getCaretWithin(element) {
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


function deconstructPost(post) {
	var depth = 0;
	const lineListRaw = post.split("\r");
	const lineList = lineListRaw.reduce(
		(result, next, i) => {
			console.log(result, next, i)
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
	console.log(post, post.length, "==>", lineList, lineList.length);
	return lineList.map((line, i) => {

		// Check for orphan lines
		if (line === "") {

			// Handle whitespace
			depth += 1;
			return [{
				word: String.fromCharCode(8203),
				type: "return",
				length: 1,
				row: i,
				depth: depth,
				cost: costs.return
			}];

		} else {

			// Otherwise, deconstruct line
			const output = deconstructLine(line, depth, i);
			depth = output.depth;

			// Return last line
			return output.text;

		}

	}).reduce((a, b) => a.concat(b), []).filter(x => x);

}


function deconstructLine(line, depth=0, row=0) {

	// Unpack by tab character
	const sectionListRaw = line.split(String.fromCharCode(9));
	const sectionList = sectionListRaw.reduce(
		(result, next, i) => {
			console.log(result, next, i)
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
	const result = sectionList.map((section, i) => {

		// Check for orphan sections
		if (section === "") {

			// Handle whitespace
			depth += 1;
			return [{
				word: "\t",
				type: "tab",
				length: 1,
				row: row,
				depth: depth,
				cost: costs.return
			}];

		} else {

			// Otherwise, deconstruct line
			const output = deconstructText(section, depth, row);
			depth = output.depth;

			// Return last line
			return output.text;

		}

	}).reduce((a, b) => a.concat(b), []);

	return {
		text: result,
		depth: depth
	}
	
}


function deconstructText(text, depth=0, row=0) {

	// Unpack content
	const wordListRaw = text.split(" ");
	const wordList = wordListRaw.reduce(
		(result, next, i) => {
			console.log(result, next, i)
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
	const result = wordList.map((word, i) => {

		// Handle whitespace
		if (word === "") {
			depth += 1;
			return {
				word: String.fromCharCode(32),
				type: "word",
				length: 1,
				depth: depth,
				row: row,
				cost: costs.word
			}
		}

		// Handle topics
		if (word.charAt(0) === "#") {
			depth += word.length;
			return {
				word: word,
				type: "topic",
				length: word.length,
				depth: depth,
				row: row,
				cost: costs.topic
			}
		}

		// Handle mentions
		if (word.charAt(0) === "@") {
			depth += word.length;
			return {
				word: word,
				type: "mention",
				length: word.length,
				depth: depth,
				row: row,
				cost: costs.mention
			}
		}

		// Handle links
		const dots = word.split(".");
		if (dots.length > 1 && dots[dots.length - 1] !== "") {
			depth += word.length;
			return {
				word: word,
				type: "link",
				length: word.length,
				depth: depth,
				row: row,
				cost: costs.link
			}
		}

		// Handle normal words
		depth += word.length;
		return {
			word: word,
			type: "word",
			length: word.length,
			depth: depth,
			row: row,
			cost: costs.word * word.length
		}
		
	});

	return {
		text: result,
		depth: depth
	}

}





function constructPost(post, cursor=[]) {

	// Process post object
	var result = [];
	var cost = costs.overhead;
	var depth = 0;
	var caret = {};
	for (let w = 0; w < post.length; w++) {

		// Get this post word
		const word = post[w];

		// Sum post cost
		cost += word.cost;

		// Make word id
		const wordID = "post-item-" + w;

		// Detect cursor position
		if (cursor.length > 0) {
			console.log(depth, cursor[0], word.depth);
			console.log(depth <= cursor[0], word.depth >= cursor[0]);
			if (depth <= cursor[0] && word.depth >= cursor[0]) {
				caret.start = {
					node: wordID,
					offset: cursor[0] - depth
				}
			}
			if (depth <= cursor[1] && word.depth >= cursor[1]) {
				caret.end = {
					node: wordID,
					offset: cursor[0] - depth
				}
			}
		}
		depth = word.depth;

		// Handle new lines
		var leader = "";
		if (word.type === "return") {
			leader = '</p><p class="post-line">';
		}
		
		// Build result
		result.push(leader +
			'<span' +
				' id="' + wordID + '"' +
				' class="post-text post-' + word.type + '">' +
				word.word +
			'</span>'
		);

	}

	return {
		tags: result.reduce((full, next) => full + next, ""),
		caret: caret,
		cost: Math.round(cost)
	}

}



class Send extends Component {

	constructor() {
		super()
		this.state = defState;
		this.keyStroke = this.keyStroke.bind(this);
		this.keyStrokePre = this.keyStrokePre.bind(this);
		this.sendPost = this.sendPost.bind(this);
	}


	// Clear placeholder from posting box on first selection
	clearPlaceholder() {
		const state = this.state;
		state.focus = true;
		this.setState(state);
	}

	// Restore placeholder in event of unfocus with no text
	restorePlaceholder(event) {
		const state = this.state;
		state.focus = false;
		state.cursor = [];
		this.setState(state);
	}


	keyStrokePre(event) {
		if (Array.of(8, 37, 39).includes(event.keyCode)) {
			console.log("detected", event.keyCode)
			event.preventDefault();
			this.keyStroke(event);
		}
	}


	// Format post box content upon input
	keyStroke(event) {

		// Stop character appearing
		event.preventDefault();

		// Unpack event
		const key = event.which;
		const code = event.keyCode;

		// Get cursor and selection position
		const caret = getCaretWithin(this.input);
		const sel = window.getSelection()
		let caretSpan;
		if (sel.focusOffset === sel.anchorOffset) {
			caretSpan = 0;
		} else {
			caretSpan = caret - Math.min(sel.focusOffset, sel.anchorOffset);
		}
		var cursor = [caret - caretSpan, caret];

		console.log("caret before", cursor, caretSpan, sel);

		// Handle keystroke
		let pos;
		var raw = this.state.raw;
		switch (code) {

			// Backspace
			case 8:
				if (caretSpan === 0) {
					cursor = [cursor[0] - 1, cursor[0]]
				}
				raw = raw.slice(0, cursor[0]) + raw.slice(cursor[1]);
				cursor = [cursor[0], cursor[0]]
				break;

			// Tab
            case 9:
            	console.log("tab")
            	raw = raw.slice(0, cursor[0]) + "\t" +
            		raw.slice(cursor[1]);
            	cursor = [cursor[0] + 1, cursor[0] + 1]
            	break;

            // Return
            case 13:
	            raw = raw.slice(0, cursor[0]) + "\n" +
	            	raw.slice(cursor[1]);
	            cursor = [cursor[0] + 1, cursor[0] + 1]
	            break;

	        // Cursor Left
            case 37:
            	pos = Math.max(0, cursor[0] - 1);
            	cursor = [pos, pos];
            	break;

            // Cursor Right
            case 39:
            	pos = Math.min(raw.length, cursor[1] + 1);
            	cursor = [pos, pos];
            	break;

            case 160:
            	console.log("nbs");
            	break;

            //TODO - Sanitise input of special characters

            // For all other characters, add to text string at cursor position
			default:
				raw = raw.slice(0, cursor[0]) + String.fromCharCode(key) +
					raw.slice(cursor[1]);
				cursor = [cursor[0] + 1, cursor[0] + 1]

		}

		console.log("caret middle", cursor);

		// Build post
		const post = deconstructPost(raw);

		// Populate HTML
		const out = constructPost(post, cursor);

		console.log("caret after", out.caret);

		// Store in state
		const state = this.state;
		state.raw = raw;
		state.caret = out.caret;
		state.html = out.tags;
		state.cost = out.cost;
		this.setState(state);

	}


	sendPost() {

		//TODO- Validate Post (check price vs balance, etc...)

		// Dispatch post to radix net
		this.props.sendPost(this.state.text);

		// Reset state
		//TODO - Put this in a .then loop from the above
		//		 and add an interrim 'sending' state.
		this.setState(defState);

	}


	componentDidUpdate(lastProps, lastState) {
		if ("start" in this.state.caret && this.state.focus) {
			var range = document.createRange();
			var sel = window.getSelection();
			range.setStart(
				document.getElementById(this.state.caret.start.node).firstChild,
				this.state.caret.start.offset
			);
			range.setEnd(
				document.getElementById(this.state.caret.end.node).firstChild,
				this.state.caret.end.offset
			);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}


	render() {

		console.log(this.state);

		// Build post content
		let content;
		let cost;
		if (this.state.html.length === 0) {
			if (this.state.focus) {
				content = '<p class="post-line"></p>';
			} else {
				content = '<p class="post-line post-placeholder">' +
					'Post something new...' +
				'</p>'
			}
			cost = 0;
		} else {
			content = '<p class="post-line">' + this.state.html + '</p>';
			cost = this.state.cost;
		}

    	// Render
		return (
			<div ref="send" className="send-box card">
				<div className="row">
					<div className="col-sm-12 input-col">
						<div
							contentEditable="true"
							suppressContentEditableWarning={true}
							ref={input => {this.input = input}}
							className="post-input"
							onFocus={this.clearPlaceholder.bind(this)}
							onBlur={this.restorePlaceholder.bind(this)}
							onKeyDown={this.keyStrokePre.bind(this)}
							onKeyPress={this.keyStroke.bind(this)}
							dangerouslySetInnerHTML={{__html: content}}>
						</div>
						<p className="post-cost">
							{cost} <span className="fa fa-database"></span>
						</p>
						<button
							className="def-button green-button post-button"
							onClick={this.sendPost.bind(this)}>
							post
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default Send;
