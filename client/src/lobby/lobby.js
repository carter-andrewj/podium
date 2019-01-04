import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import Register from './register';
import Login from './login';



class Lobby extends Component {

	constructor(props) {
		super()
		this.state = {
			data: Map(fromJS({
				mode: "login",
			}))
		}
		this.setLobbyMode = this.setLobbyMode.bind(this);
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}


	setLobbyMode(mode) {
		this.updateState(state => state
			.set("mode", mode)
		);
	}


	render() {

		let content;
		switch (this.state.data.get("mode")) {

			case("register"):
				content = <Register
					setLobbyMode={this.setLobbyMode}
					registerUser={this.props.registerUser}
				/>
				break;

			default:
				content = <Login
					setLobbyMode={this.setLobbyMode}
					signIn={this.props.signIn}
				/>
		}

		return (
			<div ref="lobby">
				{content}
			</div>
		);
	}

}

export default Lobby;