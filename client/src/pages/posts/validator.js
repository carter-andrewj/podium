import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import Expander from '../../components/animators/expander';
import MiniLoader from '../../components/miniLoader';



class Validator extends ImmutableComponent {


	render() {

		// Build stage glyph
		let stage;
		let color;
		let message;
		let controls;
		switch (this.props.status) {

			case("cost"):
				stage = <i className="fas fa-exclamation validator-icon" />
				color = "var(--red)"
				message = <p className="validator-message">
					insufficient funds
				</p>
				break;

			case("pending"):
				stage = <MiniLoader color="var(--dark-grey)" />
				color = "var(--dark-grey)"
				message = <p className="validator-message">
					{`validating ${this.props.subjectType} `}
					<span className="validator-subject">
						{this.props.subject}
					</span>
				</p>
				break;

			case("failed"):
				stage = <i className="fas fa-exclamation validator-icon" />
				color = "var(--red)"
				message = <p className="validator-message">
					{`${this.props.subjectType} `}
					<span className="validator-subject">
						{this.props.subject}
					</span>
					{` not found`}
				</p>
				controls = <p className="validator-controls">
					<span
						onClick={() => this.props.ignore(this.props.subject)}
						className="validator-control-text">
						ignore
					</span>
				</p>
				break;

			case("passed"):
				stage = <i className="fas fa-check validator-icon" />
				color = this.props.color
				message = <p className="validator-message">
					{`found ${this.props.subjectType} `}
					<span className="validator-subject">
						{this.props.subject} 
					</span>
				</p>
				controls = <p className="validator-controls">
					<span
						onClick={() => this.props.hide(this.props.subject)}
						className="validator-control-text">
						hide
					</span>
					<span
						onClick={() => this.props.ignore(this.props.subject)}
						className="validator-control-text">
						ignore
					</span>
				</p>
				break;

			default:
				stage = "";
				color = "";
				message = "ERROR: unknown reference type"

		}

		return (
			<Expander time={0.5}>
				<div
					className="validator"
					style={{ color: color }}>
					<div
						className="validator-background"
						style={{ background: color }}
					/>
					<div className="validator-left">
						<div
							className="validator-title"
							style={{ background: color }}>
							<p className="validator-glyph-holder">
								<i className={`fas fa-${this.props.icon} validator-glyph`} />
							</p>
						</div>
						<div className="validator-message-holder">
							{message}
						</div>
					</div>
					<div className="validator-right">
						<div
							className="validator-icon-holder"
							style={{ color: color }}>
							{stage}
						</div>
						<div className="validator-control-holder">
							{controls}
						</div>
					</div>
				</div>
			</Expander>
		)

	}
}

export default Validator;
