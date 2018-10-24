import React, { Component } from 'react';
import '../../../App.css';

import Settings from '../config';
import { getCaretWithin, markupPost } from '../utils';




const emptyCaret = {
	start: {
		node: "post-item-0",
		offset: 0
	},
	end: {
		node: "post-item-0",
		offset: 0
	}
}

const defState = {
	raw: "",
	focus: false,
	caret: emptyCaret,
	html: "",
	cost: 0
}


function constructPost(rawPost, cursor=[]) {

	// Create post object
	const post = markupPost(rawPost);

	// Process post object
	var result = [];
	var cost = Settings.costs.overhead;
	var line = 0;
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
			line += 1
			leader = '</p><p' +
				' id="post-line-' + line + '"' +
				' class="post-input-line">';
		}
		
		// Build result
		result.push(leader +
			'<span' +
				' id="' + wordID + '"' +
				' class="post-input-text post-input-' + word.type + '">' +
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

		this.setFocus = this.setFocus.bind(this);
		this.clearFocus = this.clearFocus.bind(this);

		this.keyDown = this.keyDown.bind(this);
		this.keyStroke = this.keyStroke.bind(this);
		
		this.sendPost = this.sendPost.bind(this);
	}


	// Clear placeholder from posting box on first selection
	setFocus() {
		const state = this.state;
		state.focus = true;
		this.setState(state);
	}

	// Restore placeholder in event of unfocus with no text
	clearFocus(event) {
		const state = this.state;
		state.focus = false;
		this.setState(state);
	}


	// Catches caracters not reported by keyPressed event
	// (specifically backspace, tab, cursor-left, and cursor-right)
	keyDown(event) {
		if (Array.of(8, 9, 37, 39).includes(event.keyCode)) {
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

		// Get current post string
		var raw = this.state.raw;

		// Get cursor and selection position
		let cursor;
		let selected;
		if (raw === "") {
			selected = 0;
			cursor = [0, 0];
		} else {
			const caretNow = getCaretWithin(this.input);
			selected = window.getSelection().toString().length;
			cursor = [caretNow - selected, caretNow];
		}

		console.log("BEFORE", raw)

		// Handle keystroke
		let pos;
		switch (code) {

			// Backspace
			//TODO - Fix delete selection across multiple words
			case 8:
				if (selected === 0) {
					cursor = [Math.max(0, cursor[0] - 1), cursor[0]]
				}
				raw = raw.slice(0, cursor[0]) + raw.slice(cursor[1]);
				cursor = [cursor[0], cursor[0]]
				break;

			// Tab
			case 9:
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

			//TODO - Sanitise input of special characters

			// For all other characters, add to text string at cursor position
			default:
				raw = raw.slice(0, cursor[0]) + String.fromCharCode(key) +
					raw.slice(cursor[1]);
				cursor = [cursor[0] + 1, cursor[0] + 1]

		}

		// Construct post html from result
		let out;
		if (raw === "") {
			out = {
				tags: "",
				caret: emptyCaret,
				cost: 0
			}
		} else {
			out = constructPost(raw, cursor);
		}

		console.log("AFTER", raw)

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

		//TODO - Lock post on send

		console.log("sending");

		// Dispatch post to radix net
		this.props.sendPost(this.state.raw)
			.then(this.setState(defState));

	}


	componentDidUpdate(lastProps, lastState) {

		// Place cursor if send box is focussed
		if (this.state.focus) {
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

		// Build footer
		const footer = <div className="post-input-footer">
			<p className="post-input-cost">
				{this.state.cost} <span className="fa fa-database post-input-cost-icon"></span>
			</p>
			<button
				className="def-button green-button post-input-button"
				onClick={this.sendPost.bind(this)}>
				post
			</button>
		</div>

		// Build post content
		let content;
		if (!(this.state.focus) && this.state.raw === "") {
			content = '<p id="post-line-0" class="post-input-line post-input-placeholder">' +
				'Post something new...' +
			'</p>';
		} else if (this.state.raw === "") {
			content = '<p id="post-line-0" class="post-input-line post-input-line-empty">' +
				'<span id="post-item-0">' + String.fromCharCode(8203) +
				'</span>' +
			'</p>';
		} else {
			content = '<p' +
				' id="post-line-0"' +
				' class="post-input-line">' +
				this.state.html +
			'</p>';
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
							onFocus={this.setFocus.bind(this)}
							onBlur={this.clearFocus.bind(this)}
							onKeyDown={this.keyDown.bind(this)}
							onKeyPress={this.keyStroke.bind(this)}
							dangerouslySetInnerHTML={{__html: content}}>
						</div>
						{(this.state.focus || this.state.raw !== "") ? footer : null}
					</div>
				</div>
			</div>
		);
	}


	componentWillUnmount () {
		// Save to drafts
	}


}

export default Send;
