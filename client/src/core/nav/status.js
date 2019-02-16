import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Map, fromJS } from 'immutable';




class Status extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				highlight: "none"
			}))
		}
		this.hoverStatus = this.hoverStatus.bind(this);
	}


	getState() {
		const args = Array.prototype.slice.call(arguments)
		if (args.length === 1) {
			return this.state.data.get(args[0])
		} else {
			return this.state.data.getIn([...args])
		}
	}

	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
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
			case (`/user/${this.props.activeUser.id}`):
				active = "profile"
				break
			case ("/wallet"):
				active = "wallet"
				break
			case ("/integrity"):
				active = "integrity"
				break
			case ("/settings"):
				active = "settings"
				break
			default:
				active = ""
		}

		let over = this.state.data.get("highlight");
		let ttOn = "menu-tooltip menu-tooltip-left menu-tooltip-on";
		let ttOff =  "menu-tooltip menu-tooltip-left menu-tooltip-off";

		return (
			<div ref="status" className="menu menu-left">
				<div className="menu-bar menu-bar-left card">
					<div
						className={(over === "profile" && active !== "profile") ?
							"menu-box menu-box-left menu-box-top-left menu-box-over" :
							"menu-box menu-box-left menu-box-top-left"
						}
						onClick={() => this.profileLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "profile")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.profileLink = ref}
							style={{ display: "none" }}
							to={`/user/${this.props.activeUser.id || ""}`}
						/>
						{this.props.activeUser.picture ?
							<img
								className={(active === "profile") ?
									"menu-picture menu-picture-left menu-picture-active" :
									(over === "profile") ?
										"menu-picture menu-picture-left menu-picture-on" :
										"menu-picture menu-picture-left menu-picture-off"
								}
								src={this.props.activeUser.picture}
								alt=""
							/> :
							<div className="menu-profile-placeholder">
								<i className="fas fa-spinner menu-loader" />
							</div>
						}
						<div className={(over === "profile") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">profile</p>
						</div>
					</div>
					<div
						className={(over === "wallet" && active !== "wallet") ?
							"menu-box menu-box-left menu-box-over" :
							"menu-box menu-box-left"
						}
						onClick={() => this.walletLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "wallet")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.walletLink = ref}
							style={{ display: "none" }}
							to="/wallet"
						/>
						<i className={(active === "wallet") ?
							"fas fa-wallet menu-icon menu-icon-active" :
							"fas fa-wallet menu-icon"
						}/>
						<div className={(over === "wallet") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">wallet</p>
						</div>
					</div>
					<div
						className={(over === "integrity" && active !== "integrity") ?
							"menu-box menu-box-left menu-box-over" :
							"menu-box menu-box-left"
						}
						onClick={() => this.integrityLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "integrity")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.integrityLink = ref}
							style={{ display: "none" }}
							to="/integrity"
						/>
						<i className={(active === "integrity") ?
							"fas fa-balance-scale menu-icon menu-icon-active" :
							"fas fa-balance-scale menu-icon"
						}/>
						<div className={(over === "integrity") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">integrity</p>
						</div>
					</div>
					<div
						className={(over === "settings" && active !== "settings") ?
							"menu-box menu-box-left menu-box-over" :
							"menu-box menu-box-left"
						}
						onClick={() => this.settingsLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "settings")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.settingsLink = ref}
							style={{ display: "none"}}
							to="/settings"
						/>
						<i className={(active === "settings") ?
							"fas fa-cogs menu-icon menu-icon-active" :
							"fas fa-cogs menu-icon"
						}/>
						<div className={(over === "settings") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">settings</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Status;
