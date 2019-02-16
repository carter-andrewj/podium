import React from 'react';
import ImmutableComponent from './widgets/immutableComponent';
import { withRouter } from 'react-router-dom';

import Status from './nav/status';
import Controls from './nav/controls';

import SearchHUD from './search/searchHUD';
import AlertsHUD from './alerts/alertsHUD';

import Slider from './widgets/animators/slider';
import Fader from './widgets/fader';




class _HUD extends ImmutableComponent {

	constructor() {
		super({ show: false })
	}

	componentDidMount() {

	}

	render() {
		return (
			<div ref="core" className="demo-core">

				<div className="content-holder">
					<div className="content-column">
						{this.props.children}
					</div>
				</div>

				<Fader time={0.5} delay={0.5}>
					<SearchHUD

						podium={this.props.podium}
						activeUser={this.props.activeUser}

						route={this.props.location.pathname}

						getUser={this.props.getUser}

						search={this.props.search}
						resetSearch={this.props.resetSearch}

						target={this.props.searchData.get("target")}
						loading={this.props.searchData.get("loading")}
						results={this.props.searchData.get("results")}

					/>
				</Fader>

				<Fader time={0.5} delay={0.5}>
					<AlertsHUD

						podium={this.props.podium}
						activeUser={this.props.activeUser}

						route={this.props.location.pathname}

						getUser={this.props.getUser}

						alerts={this.props.alerts}

					/>
				</Fader>

				<Slider
					offset={{ x: -5, y: 0 }}
					position="fixed"
					time={0.6}>
					<Status
						active={this.props.location.pathname}
						activeUser={this.props.activeUser}
					/>
				</Slider>

				<Slider
					offset={{ x: 5, y: 0 }}
					position="fixed"
					time={0.6}>
					<Controls
						active={this.props.location.pathname}
						signOut={this.props.signOut}
					/>
				</Slider>

			</div>
		);
	}

}


const HUD = withRouter(_HUD);

export default HUD;
