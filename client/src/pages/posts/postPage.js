import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import { Set, Map, List } from 'immutable';

import Post from './post';
import PostFeed from './postFeed';




class PostPage extends ImmutableComponent {


	immutableComponentDidMount() {
		this.props.require("parent", "replies")
	}


	render() {

		const replies = this.props.replies || Set()

		return (
			<div className="postpage content">

				{this.props.parent ?
					<div className="content-row">
						<Post

							podium={this.props.podium}
							activeUser={this.props.activeUser}
							balance={this.props.balance}

							target={this.props.parent}
							format="thread"

							getUser={this.props.getUser}
							followUser={this.props.followUser}
							unfollowUser={this.props.unfollowUser}

							getPost={this.props.getPost}
							sendPost={this.props.sendPost}

							transition={this.props.transition}
							exit={this.props.exit}

						/>
					</div>
					: null
				}


				<div className="postpage-subject">
					{this.props.post ?
						<Post

							podium={this.props.podium}
							activeUser={this.props.activeUser}
							balance={this.props.balance}

							target={this.props.post}
							format="card"
							suppressLabels={List(["reply", "promote"])}

							getUser={this.props.getUser}
							followUser={this.props.followUser}
							unfollowUser={this.props.unfollowUser}

							getPost={this.props.getPost}
							sendPost={this.props.sendPost}

							transition={this.props.transition}
							exit={this.props.exit}

						/>
						: null
					}
				</div>


				<div className="content-row">
					<PostFeed

						posts={replies
							.map(r => Map({ target: r }))
							.toList()
						}
						from="address"
						format="card"
						label={["reply", "replies"]}

						podium={this.props.podium}
						activeUser={this.props.activeUser}
						balance={this.props.balance}

						getUser={this.props.getUser}
						followUser={this.props.followUser}
						unfollowUser={this.props.unfollowUser}

						getPost={this.props.getPost}
						sendPost={this.props.sendPost}

						transition={this.props.transition}
						exit={this.props.exit}

					/>
				</div>
				
			</div>
		)
	}

}

export default PostPage;
