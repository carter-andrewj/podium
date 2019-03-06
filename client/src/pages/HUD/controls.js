import React from 'react';
import { Link } from 'react-router-dom';
import ImmutableComponent from '../../components/immutableComponent';





class Controls extends ImmutableComponent {

	constructor(props) {
		super({
			highlight: "none",
			signout: false
		})
		this.hoverStatus = this.hoverStatus.bind(this);
	}



	hoverStatus(target) {
		this.updateState(state => state
			.set("highlight", target)
		)
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
			case ("/trending"):
				active = "trending"
				break
			default:
				active = ""
		}

		let over = this.getState("highlight");
		let ttOn = "menu-tooltip menu-tooltip-right menu-tooltip-on";
		let ttOff =  "menu-tooltip menu-tooltip-right menu-tooltip-off";

		return (
			<div ref="controls" className="menu menu-right">
				<Link
					innerRef={ref => this.feedLink = ref}
					style={{ display: "none" }}
					to="/"
				/>
				<Link
					innerRef={ref => this.trendingLink = ref}
					style={{ display: "none" }}
					to="/trending"
				/>
				<Link
					innerRef={ref => this.governanceLink = ref}
					style={{ display: "none"}}
					to="/governance"
				/>
				<div className="menu-bar menu-bar-right card">
					<div
						className={(over === "feed" && active !== "feed") ?
							"menu-box menu-box-right menu-box-top-right menu-box-over" :
							"menu-box menu-box-right menu-box-top-right"
						}
						onClick={active !== "feed" ?
							() => this.props.transition(
								() => this.feedLink.click()
							)
							: null
						}
						onMouseOver={this.hoverStatus.bind(this, "feed")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className={(active === "feed") ?
							"fas fa-comments menu-icon menu-icon-active" :
							"fas fa-comments menu-icon"
						}/>
						<div className={(over === "feed") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">feed</p>
						</div>
					</div>
					<div
						className={(over === "trending" && active !== "trending") ?
							"menu-box menu-box-right menu-box-over" :
							"menu-box menu-box-right"
						}
						onClick={active !== "trending" ?
							() => this.props.transition(
								() => this.trendingLink.click()
							)
							: null
						}
						onMouseOver={this.hoverStatus.bind(this, "trending")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className={(active === "trending") ?
							"fas fa-globe menu-icon menu-icon-active" :
							"fas fa-globe menu-icon"
						}/>
						<div className={(over === "trending") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">trending</p>
						</div>
					</div>
					<div
						className={(over === "governance" && active !== "governance") ?
							"menu-box menu-box-right menu-box-over" :
							"menu-box menu-box-right"
						}
						onClick={active !== "governance" ?
							() => this.props.transition(
								() => this.governanceLink.click()
							)
							: null
						}
						onMouseOver={this.hoverStatus.bind(this, "governance")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
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