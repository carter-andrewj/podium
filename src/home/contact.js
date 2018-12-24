import React, { Component } from 'react';

import Fader from './fader';



class Contact extends Component {


	render() {

		return (
			<Fader>
				<p className="title">Say Hello</p>
				<p>
					We actively welcome any questions, comments or feedback.
					Please drop us an email or get in touch via one of these
					blue places:
				</p>
				<a
					href="https://twitter.com/podiumnetwork"
					className="buttonlink soc-button soc-twitter">
					<span className="fa fa-twitter" aria-hidden="true"></span>
				</a>
				<a
					href="https://twitter.com/podiumnetwork"
					className="buttonlink soc-button soc-telegram">
					<span className="fa fa-paper-plane" aria-hidden="true"></span>
				</a>
				<a
					href="https://twitter.com/podiumnetwork"
					className="buttonlink soc-button soc-linkedin">
					<span className="fa fa-linkedin" aria-hidden="true"></span>
				</a>
				<a
					href="https://twitter.com/podiumnetwork"
					className="buttonlink soc-button soc-facebook">
					<span className="fa fa-facebook" aria-hidden="true"></span>
				</a>
				<a
					href="mailto:hello@podium-network.com"
					className="buttonlink" >
					<button
						className="def-button green-button">
						<span className="fa fa-envelope" aria-hidden="true"></span> hello@podium-network.com
					</button>
				</a>
				<button
					className="def-button red-button back-button"
					onClick={this.props.setHomeMode.bind(this, "menu")}>
					<span className="fa fa-arrow-circle-left" aria-hidden="true"></span> back
				</button>
			</Fader>
		);
	}

}

export default Contact;