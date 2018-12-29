import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import Search from './search';
import NewTopic from 'demo/core/pages/posting/references/topics/newtopic';



class SearchTopics extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				topics: {},
				search: "",
				showNewTopic: false
			}))
		}
		this.toggleNewTopic = this.toggleNewTopic.bind(this);
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}


	searchTopics() {

	}


	toggleNewTopic(x) {
		this.updateState(state => state
			.update("showNewTopic", (x) => !x)
		);
	}


	render() {

		// Display search results (or lack thereof)
		let content;
		if (this.state.data.get("topics").length > 0) {
			content = <div className="topic-search-results">
				{this.state.get("topics").map((id, topic) => 
					<div className="search-results topic-search-results">
						{topic}
						<div className="footer-spacer"></div>
					</div>
				)}
			</div>
		} else {
			content = <div className="search-placeholder">
				{(this.state.data.get("search") !== "") ?
					"Topic not found. Why not create it?" : ""}
				<div
					onClick={this.props.popupNewTopic}
					className="new-topic-button card">
					new topic
				</div>
			</div>
		}

		// Throw new topic popup, if required
		let newTopic;
		if (this.state.data.get("showNewTopic")) {
			newTopic = <NewTopic
				togglePopup={this.toggleNewTopic}
				createTopic={this.props.createTopic}
			/>
		}

		return (
			<div ref="topics" className="topic-search">
				<Search
					placeholder="Find a topic..."
					action={this.searchTopics}
				/>
				{content}
				{newTopic}
			</div>
		);
	}
}

export default SearchTopics;
