import React from 'react';
import ImmutableComponent from '../widgets/immutableComponent';





class Validator extends ImmutableComponent {


	render() {

		// Build stage glyph
		let stage;
		let color;
		let message;
		switch (this.props.status) {

			case("pending"):
				stage = <i className="fas fa-circle-notch validator-icon validator-pending" />
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
				break;

			default:
				stage = "";
				color = "";
				message = "ERROR: unknown reference type"

		}

		return (
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
				</div>
			</div>
		);

	}
}

export default Validator;
