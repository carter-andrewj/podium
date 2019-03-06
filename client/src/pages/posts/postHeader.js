import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import { timeform } from 'utils';

import MiniLoader from '../../components/miniLoader';



class PostHeader extends ImmutableComponent {

	render() {
		return (
			<div className="post-header">
				<div className={this.props.first ?
						"post-header-picture-holder post-header-picture-first" :
						"post-header-picture-holder"
					}>
					{this.props.author ?
						<img
							className={this.props.first ?
								"post-header-picture post-header-picture-first" :
								"post-header-picture"
							}
							src={this.props.author.picture}
							alt=""
						/>
						:
						<div className="post-header-picture-loader">
							<MiniLoader size={1.2} color="white" />
						</div>
					}
				</div>
				<div className="post-title-holder">
					{this.props.author ?
						<p className="post-title">
							<span className="post-title-name">{this.props.author.name}</span>
							<span className="post-title-id">
								{`@${this.props.author.id}` +
									(this.props.post ?
										`\u2000\u2022\u2000${timeform(this.props.post.created)}`
										: ""
									)
								}
							</span>
						</p>
						: null
					}
				</div>
				{this.props.children ?
					<div className="post-core">
						{this.props.children}
					</div>
					: null
				}
			</div>
		)
	}
	
}

export default PostHeader;
