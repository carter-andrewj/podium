import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import { formatNumber } from 'utils';


import Slider from '../core/widgets/slider';
import Fader from '../core/widgets/fader';






class Lobby extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				stats: {
					newUsers: 2132,
					returningUsers: 494294,
					posts: 6294651,
					pod: 1257328427,
					aud: 6372901,
					promoted: 1144838,
					reports: 12327,
					sanctions: 8321
				},
				highlight: null,
				exit: false
			}))
		}
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}


	highlight(target) {
		this.updateState(state => state
			.set("highlight", target))
	}


	render() {

		const exit = this.state.data.get("exit")

		return (
			<div ref="lobby">
				
				<Fader
					timeIn={1.5}
					timeOut={0.5}
					exit={exit}>
					<div className="title-box">
						<img
							className="lobby-image"
							src="./images/title-logo.png"
							alt=""
						/>
					</div>
				</Fader>

				<Slider
					direction="bottom"
					timeIn={1.0} delayIn={1.0}
					timeOut={0.4} delayOut={0.2}
					exit={exit}>
					<div className="stat-container">
						<div
							className="stat-box card"
							onMouseOver={this.highlight.bind(this, "stats")}
							onMouseOut={this.highlight.bind(this, null)}>
							{(this.state.data.get("highlight") === "stats") ?
								<div className="stat-caveat">
									public dashboards under construction
								</div>
								: null
							}
							<div className="stat-title">
								Today
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-blue">
									{formatNumber(this.state.data.getIn(["stats", "newUsers"]))}
								</p>
								<p className="stat-label">
									new members
								</p>
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-blue">
									{formatNumber(this.state.data.getIn(["stats", "returningUsers"]))}
								</p>
								<p className="stat-label">
									active users
								</p>
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-green">
									{formatNumber(this.state.data.getIn(["stats", "posts"]))}
								</p>
								<p className="stat-label">
									new posts
								</p>
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-green">
									{formatNumber(this.state.data.getIn(["stats", "pod"]))}
								</p>
								<p className="stat-label">
									POD spent
								</p>
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-purple">
									{formatNumber(this.state.data.getIn(["stats", "aud"]))}
								</p>
								<p className="stat-label">
									AUD spent
								</p>
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-purple">
									{formatNumber(this.state.data.getIn(["stats", "promoted"]))}
								</p>
								<p className="stat-label">
									posts promoted
								</p>
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-red">
									{formatNumber(this.state.data.getIn(["stats", "reports"]))}
								</p>
								<p className="stat-label">
									new reports
								</p>
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-red">
									{formatNumber(this.state.data.getIn(["stats", "sanctions"]))}
								</p>
								<p className="stat-label">
									sanctions
								</p>
							</div>
							<div className="stat-ender">
								<span className="fas fa-chart-bar stat-icon"></span>
							</div>
						</div>
					</div>
				</Slider>
			</div>
		)

	}

}

export default Lobby;
