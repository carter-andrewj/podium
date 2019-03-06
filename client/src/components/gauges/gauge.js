import React from 'react';
import ImmutableComponent from '../immutableComponent';




class Gauge extends ImmutableComponent {

	constructor() {
		super({
			highlight: false
		})
	}

	highlight() {
		this.updateState(state => state.set("highlight", true))
	}

	unlight() {
		this.updateState(state => state.set("highlight", false))
	}

	render() {
		//const height = 3.0 * this.props.value;
		return <div />
		// 	( <div className="gauge">
		// 		{this.getState("highlight") ?
		// 			<div
		// 				className={(this.props.captionPosition === "top") ?
		// 					"gauge-caption gauge-caption-top" :
		// 					"gauge-caption gauge-caption-bottom"}>
		// 				<p className="gauge-caption-text">
		// 					{this.props.caption}
		// 				</p>
		// 			</div>
		// 			: null
		// 		}
		// 		<div
		// 			className="gauge-holder"
		// 			onMouseEnter={this.highlight.bind(this)}
		// 			onMouseLeave={this.unlight.bind(this)}>
					
		// 			<div className="gauge-under" />
		// 			<div className="gauge-over" style={{ height: `${height}em`}} />
		// 			<div className="gauge-label">
		// 				{this.getState("highlight") ?
		// 					<p className="gauge-label-text">
		// 						{`${Math.floor(100.0 * this.props.value)}%`}
		// 					</p>
		// 					:
		// 					<i className={`fas fa-${this.props.icon} gauge-icon`} />
		// 				}
		// 			</div>
		// 		</div>
		// 	</div>
		// )
	}
}

export default Gauge;
