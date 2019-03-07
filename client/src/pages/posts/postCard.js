import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import Post from './post';

import Expander from '../../components/animators/expander';



class PostCard extends ImmutableComponent {

	render() {
		return <Expander time={1.0}>
			<div className="postcard card">
				<Post

					podium={this.props.podium}
					activeUser={this.props.activeUser}
					balance={this.props.balance}

					getUser={this.props.getUser}
					followUser={this.props.followUser}
					unfollowUser={this.props.unfollowUser}

					getPost={this.props.getPost}
					sendPost={this.props.sendPost}

					target={this.props.post}

					first={true}
					format="content"

					transition={this.props.transition}
					exit={this.props.exit}

				/>
			</div>
		</Expander>
	}

}

export default PostCard;
