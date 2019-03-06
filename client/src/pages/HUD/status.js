import React from 'react';
import { Link } from 'react-router-dom';
import ImmutableComponent from '../../components/immutableComponent';

import MiniLoader from '../../components/miniLoader';


class Status extends ImmutableComponent {

	constructor() {
		super({
			highlight: "none"
		})
		this.hoverStatus = this.hoverStatus.bind(this);
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
			case ("/integrity"):
				active = "integrity"
				break
			case ("/miner"):
				active = "miner"
				break
			case ("/settings"):
				active = "settings"
				break
			default:
				active = ""
		}

		let over = this.getState("highlight");
		let ttOn = "menu-tooltip menu-tooltip-left menu-tooltip-on";
		let ttOff =  "menu-tooltip menu-tooltip-left menu-tooltip-off";

		return (
			<div ref="status" className="menu menu-left">
				<Link
					innerRef={ref => this.profileLink = ref}
					style={{ display: "none" }}
					to={`/user/${this.props.activeUser.id || ""}`}
				/>
				<Link
					innerRef={ref => this.integrityLink = ref}
					style={{ display: "none" }}
					to="/integrity"
				/>
				<Link
					innerRef={ref => this.minerLink = ref}
					style={{ display: "none" }}
					to="/miner"
				/>
				<Link
					innerRef={ref => this.settingsLink = ref}
					style={{ display: "none"}}
					to="/settings"
				/>
				<div className="menu-bar menu-bar-left card">
					<div
						className={(over === "profile" && active !== "profile") ?
							"menu-box menu-box-left menu-box-top-left menu-box-over" :
							"menu-box menu-box-left menu-box-top-left"
						}
						onClick={active !== "profile" ?
							() => this.props.transition(
								() => this.profileLink.click()
							)
							: null
						}
						onMouseOver={this.hoverStatus.bind(this, "profile")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
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
							/>
							:
							<div className="menu-picture-placeholder">
								<MiniLoader color="white" size={1.2} />
							</div>
						}
						<div className={(over === "profile") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">profile</p>
						</div>
					</div>
					<div
						className={(over === "integrity" && active !== "integrity") ?
							"menu-box menu-box-left menu-box-over" :
							"menu-box menu-box-left"
						}
						onClick={active !== "integrity" ?
							() => this.props.transition(
								() => this.integrityLink.click()
							)
							: null
						}
						onMouseOver={this.hoverStatus.bind(this, "integrity")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className={(active === "integrity") ?
							"fas fa-balance-scale menu-icon menu-icon-active" :
							"fas fa-balance-scale menu-icon"
						}/>
						<div className={(over === "integrity") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">integrity</p>
						</div>
					</div>
					<div
						className={(over === "miner" && active !== "miner") ?
							"menu-box menu-box-left menu-box-over" :
							"menu-box menu-box-left"
						}
						onClick={active !== "miner" ?
							() => this.props.transition(
								() => this.minerLink.click()
							)
							: null
						}
						onMouseOver={this.hoverStatus.bind(this, "miner")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className={(active === "miner") ?
							"fas fa-atom menu-icon menu-icon-active" :
							"fas fa-atom menu-icon"
						}/>
						<div className={(over === "miner") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">node</p>
						</div>
					</div>
					<div
						className={(over === "settings" && active !== "settings") ?
							"menu-box menu-box-left menu-box-over" :
							"menu-box menu-box-left"
						}
						onClick={active !== "settings" ?
							() => this.props.transition(
								() => this.settingsLink.click()
							)
							: null
						}
						onMouseOver={this.hoverStatus.bind(this, "settings")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
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
