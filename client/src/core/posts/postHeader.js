import React from 'react';
import ImmutableComponent from '../widgets/immutableComponent';

import { timeform } from 'utils';



class PostHeader extends ImmutableComponent {

	render() {

		return (
			<div className="post-header">
				<div className="post-header-picture-holder">
					<img
						className="post-header-picture"
						src={this.props.author.picture}
						alt=""
					/>
				</div>
				<div className="post-title-holder">
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
