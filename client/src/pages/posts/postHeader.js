import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import { timeform } from 'utils';

import MiniLoader from '../../components/miniLoader';



class PostHeader extends ImmutableComponent {

	constructor() {
		super({
			highlight: false
		})
		this.activate = this.activate.bind(this)
		this.deactivate = this.deactivate.bind(this)
	}

	activate() {
		this.updateState(
			state => state.set("highlight", true),
			() => {
				this.props.setLink("author")
				this.props.showReference("user", this.props.author.id)
			}
		)
	}

	deactivate() {
		this.updateState(
			state => state.set("highlight", false),
			() => {
				this.props.setLink("post")
				this.props.hideReference("user", this.props.author.id)
			}
		)
	}


	render() {
		const post = this.props.post
		const author = this.props.author
		const reactive = post && author && !this.props.off
		const highlight = this.getState("highlight")
		return (
			<div className="post-header">
				<div 
					onMouseOver={reactive ? () => this.activate() : null}
					onMouseOut={reactive ? () => this.deactivate() : null}
					className={this.props.first ?
						"post-header-picture-holder post-header-picture-first" :
						"post-header-picture-holder"
					}>
					{author ?
						<img
							className={this.props.first ?
								"post-header-picture post-header-picture-first" :
								"post-header-picture"
							}
							src={author.picture}
							alt=""
						/>
						:
						<div className="post-header-picture-loader">
							<MiniLoader size={1.2} color="white" />
						</div>
					}
				</div>
				<div
					onMouseOver={reactive ? () => this.activate() : null}
					onMouseOut={reactive ? () => this.deactivate() : null}
					className={reactive ?
						"post-title-holder post-title-holder-active" :
						"post-title-holder"
					}>
					{author ?
						<p className="post-title">
							<span className={highlight ?
									"post-title-name post-title-name-on" :
									"post-title-name"
								}>
								{author.name}
							</span>
							<span className="post-title-id">
								{`@${author.id}` +
									(post ?
										`\u2000\u2022\u2000${timeform(post.created)}`
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
