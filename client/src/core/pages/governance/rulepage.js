import React, { Component } from 'react';


class RulePage extends Component {

	render() {
		return (
			<div ref="rulepage">
				Page for rule: {this.props.ruleAddress}
			</div>
		);
	}
}

export default RulePage;
