import React, { Component } from 'react';




class ReactPost extends Component {

	constructor() {
		super();
		this.state = {

		};
		this.react = this.react.bind(this);
	}

	react(reaction) {
		console.log(reaction);
	}

	render() {

		// Build feed
		return (
			<div className="react-post">
				<div className="post-taxonomy react-taxonomy">react</div>
				{this.props.children}
				<div className="react-buttons">
					<button
						className="react-button react-support"
						onClick={this.react.bind(this, 1)}>
						<span className="fa fa-like"></span>
					</button>
					<button
						className="react-button react-oppose"
						onClick={this.react.bind(this, -1)}>
						<span className="fa fa-dislike"></span>
					</button>
				</div>
			</div>
		);

	}
}

export default ReactPost;
