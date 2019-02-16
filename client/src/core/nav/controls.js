import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Map, fromJS } from 'immutable';




class Controls extends Component {

	constructor(props) {
		super()
		this.state = {
			data: Map(fromJS({
				highlight: "none",
				signout: false
			}))
		}
		this.hoverStatus = this.hoverStatus.bind(this);
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return { data: up(data)} },
			callback
		);
	}


	hoverStatus(target) {
		this.updateState(state => state
			.set("highlight", target)
		);
	}


	render() {

		let active;
		switch (this.props.active) {
			case ("/"):
				active = "feed"
				break
			case ("/governance"):
				active = "governance"
				break
			case ("/topics"):
				active = "topics"
				break
			default:
				active = ""
		}

		let over = this.state.data.get("highlight");
		let ttOn = "menu-tooltip menu-tooltip-right menu-tooltip-on";
		let ttOff =  "menu-tooltip menu-tooltip-right menu-tooltip-off";

		return (
			<div ref="controls" className="menu menu-right">
				<div className="menu-bar menu-bar-right card">
					<div
						className={(over === "feed" && active !== "feed") ?
							"menu-box menu-box-right menu-box-top-right menu-box-over" :
							"menu-box menu-box-right menu-box-top-right"
						}
						onClick={() => this.feedLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "feed")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.feedLink = ref}
							style={{ display: "none" }}
							to="/"
						/>
						<i className={(active === "feed") ?
							"fas fa-comments menu-icon menu-icon-active" :
							"fas fa-comments menu-icon"
						}/>
						<div className={(over === "feed") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">feed</p>
						</div>
					</div>
					<div
						className={(over === "topics" && active !== "topics") ?
							"menu-box menu-box-right menu-box-over" :
							"menu-box menu-box-right"
						}
						onClick={() => this.topicsLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "topics")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.topicsLink = ref}
							style={{ display: "none" }}
							to="/topics"
						/>
						<i className={(active === "topics") ?
							"fas fa-hashtag menu-icon menu-icon-active" :
							"fas fa-hashtag menu-icon"
						}/>
						<div className={(over === "topics") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">topics</p>
						</div>
					</div>
					<div
						className={(over === "governance" && active !== "governance") ?
							"menu-box menu-box-right menu-box-over" :
							"menu-box menu-box-right"
						}
						onClick={() => this.governanceLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "governance")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.governanceLink = ref}
							style={{ display: "none"}}
							to="/governance"
						/>
						<i className={(active === "governance") ?
							"fas fa-gavel menu-icon menu-icon-active" :
							"fas fa-gavel menu-icon"
						}/>
						<div className={(over === "governance") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">governance</p>
						</div>
					</div>
					<div
						className={(over === "sign-out") ?
							"menu-box menu-box-right menu-box-over" :
							"menu-box menu-box-right"
						}
						onClick={() => this.props.signOut()}
						onMouseOver={this.hoverStatus.bind(this, "sign-out")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="fas fa-sign-out-alt menu-icon"></i>
						<div className={(over === "sign-out") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">sign-out</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

}

export default Controls;