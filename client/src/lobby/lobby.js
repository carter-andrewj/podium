import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import Fader from '../core/widgets/fader';




class Lobby extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				highlight: null,
				exit: false
			}))
		}
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return { data: up(data)} },
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

			</div>
		)

	}

}

export default Lobby;
