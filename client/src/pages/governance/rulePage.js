import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';


class RulePage extends ImmutableComponent {

	render() {
		return (
			<div ref="rulepage">
				Page for rule: {this.props.ruleAddress}
			</div>
		);
	}
}

export default RulePage;
