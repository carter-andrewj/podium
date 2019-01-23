import React, { Component } from 'react';


class TopicPage extends Component {

	render() {
		return (
			<div ref="topicpage">
				Page for topic: {this.props.topicAddress}
			</div>
		);
	}
}

export default TopicPage;
