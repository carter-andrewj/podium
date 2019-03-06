import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import Placeholder from '../placeholder';



class Miner extends ImmutableComponent {

	render() {
		return (
			<Placeholder
				title="miner"
				icon="atom"
				text={
					<div>
						<p className="placeholder-text">
							words
						</p>
					</div>
				}
				exit={this.props.exit}
			/>
		)
	}
	
}

export default Miner;
