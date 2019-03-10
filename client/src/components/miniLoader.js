import React from 'react';
import ImmutableComponent from './immutableComponent';


class Loader extends ImmutableComponent {

	render() {
		return (
			<div className={this.props.inline ?
					"miniloader" :
					"miniloader miniloader-boxed"
				}>
				<div
					style={{
						transform: `scale(${this.props.size || 1.0})`,
						color: this.props.color || "inherit"
					}}
					className="miniloader-holder">
					<span className="miniloader-dot miniloader-dot-1">&#183;</span>
					<span className="miniloader-dot miniloader-dot-2">&#183;</span>
					<span className="miniloader-dot miniloader-dot-3">&#183;</span>
				</div>
			</div>
		)
	}

}

export default Loader;
