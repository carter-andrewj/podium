import React, { Component } from 'react';
import '../../App.css';




class About extends Component {

	constructor(props) {
		super()
		this.state = {
			hide: true
		}
	}

	componentDidMount() {
		requestAnimationFrame(() => {
			this.setState({
				hide: false
			});
		}, 150);
	}

	render() {

		return (
			<div ref="about" style={{
				opacity: this.state.hide ? 0.0 : 1.0,
				transition: '0.9s ease-in-out'
				}}>
				<p className="title">What is Podium?</p>
				<p>
					Podium is a decentralized social network designed to be fairly
					moderated by its own community. Every post you make costs a
					number of PDM tokens which you earn by reacting to posts from
					other users in the community.
				</p>
				<p>
					This allows us to characterise everyone's bias. So, whenever
					a post gets reported, we can allow the community to vote on
					whether a rule has been violated while factoring bias out of
					the final result.
				</p> 
				<p>
					Furthermore, as Podium is 100% decentralized, you own all of
					your content and have full control over your data.
				</p> 
				<button
					className="def-button red-button back-button"
					onClick={this.props.setHomeMode.bind(this, "menu")}>
					<span className="fa fa-arrow-circle-left" aria-hidden="true"></span> back
				</button>
			</div>
		);
	}

}

export default About;