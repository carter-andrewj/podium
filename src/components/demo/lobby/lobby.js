import React, { Component } from 'react';
import '../../../App.css';

import Register from './register';
import Login from './login';



class Lobby extends Component {

	constructor(props) {
		super()
		this.state = {
			mode: "login",
		}
		this.setLobbyMode = this.setLobbyMode.bind(this);
	}


	setLobbyMode(mode) {
		this.setState({ mode: mode });
	}


	render() {

		let content;
		switch (this.state.mode) {

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