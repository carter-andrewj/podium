import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import Post from './post';

import Expander from '../../components/animators/expander';



class PostCard extends ImmutableComponent {

	render() {
		return <div className="postcard-holder">
			<Expander time={1.0}>
				<div className={this.props.first ?
						"postcard postcard-first card hover-card" :
						"postcard card hover-card"
					}>
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

						first={this.props.first}
						format="content"
						suppressLabels={this.props.suppressLabels}

						transition={this.props.transition}
						exit={this.props.exit}

					/>
				</div>
			</Expander>
		</div>
	}

}

export default PostCard;
