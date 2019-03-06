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

							post={this.props.parent}
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

							post={this.props.post}
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



// <div className="postpage-subject card">
// 	<PostHeader

// 		first={true}
// 		activeUser={this.props.activeUser}
// 		author={this.props.author}
// 		post={this.props.post}>

// 		{this.props.content}

// 	</PostHeader>
// 	{this.props.activeUser && this.props.post ?
// 		<div className="newpost-holder">
// 			<div
// 				className="newpost-capture"
// 				onMouseEnter={this.showReply.bind(this)}
// 				onMouseLeave={this.hideReply.bind(this)}>
// 				<div className="newpost card">
// 					<Send

// 						podium={this.props.podium}
// 						activeUser={this.props.activeUser}
// 						balance={this.props.balance}

// 						getUser={this.props.getProfileFromID}

// 						sendPost={this.props.sendPost}
// 						postKey={this.props.post.address}

// 						replyingTo={this.props.post}

// 						open={open}
// 						lock={this.lock}
// 						unlock={this.unlock}
// 						innerRef={ref => this.input = ref}

// 					/>
// 				</div>
// 			</div>
// 		</div>
// 		: null
// 	}
// </div>
