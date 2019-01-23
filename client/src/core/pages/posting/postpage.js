import React, { Component } from 'react';


class PostPage extends Component {

	render() {
		return (
			<div ref="postpage">
				Page for post: {this.props.postAddress}
			</div>
		);
	}
}

export default PostPage;
