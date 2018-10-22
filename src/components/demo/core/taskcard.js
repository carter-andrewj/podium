import React, { Component } from 'react';
import '../../../App.css';


let interval;


class TaskCard extends Component {

	constructor() {
		super()
		this.state = {
			new: true,
			step: 0.0
		}
	}


	componentDidMount() {
		setTimeout(() => {
			this.setState({
				new: false,
				step: 0
			});
		}, 50);
		interval = setInterval(() => {
			this.setState({
				new: this.state.new,
				step: Math.max(this.props.task.step - 1,
					Math.min(this.props.task.step,
						this.state.step + 0.01))
			})
		}, 20)
	}

	componentWillUpdate(newProps) {
		if (this.props.task.complete) {
			clearInterval(interval);
			setTimeout(() => {
				this.props.endTask(this.props.id);
			}, 1600);
		}
	}


	render() {

		//TODO - Handle errors during task

		// Set progress output
		let prog;
		let progress;
		if (this.props.task.complete) {
			prog = 100.0;
			progress = <p className="task-progress task-done">
				<span className="fa fa-check"></span>
			</p>
		} else {
			prog = 100.0 * ((this.state.step + 1) /
				this.props.task.maxstep);
			progress = <p className="task-progress">
				{prog.toFixed(0)}%
				<span className="fa fa-spinner task-spinner"></span>
			</p>
		}

		// Manage entrance/exit animation
		let classes;
		if (this.props.task.complete || this.state.new) {
			classes = "task-card card task-out"
		} else {
			classes = "task-card card task-in"
		}

		return (
			<div className={classes}>
				<div className="task-title-holder">
					<p className="task-title">
						{this.props.task.title}
					</p>
				</div>
				<div className="task-progress-holder">
					{progress}
				</div>
				<div className="task-progbar task-progbar-out">
				</div>
				<div
					className="task-progbar task-progbar-in"
					style={{width: prog + "%"}}>
				</div>
			</div>
		);

	}
	
}

export default TaskCard;
