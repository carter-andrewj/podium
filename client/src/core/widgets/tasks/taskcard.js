import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';



let interval;


class TaskCard extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				new: true,
				step: 0.0
			}))
		}
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}


	componentDidMount() {
		setTimeout(() => {
			this.updateState(state => state
				.set("new", false)
				.set("step", 0)
			);
		}, 50);
		interval = setInterval(() => {
			this.updateState(state => state
				.update("step", (s) => Math.max(
					this.props.task.get("step") - 1,
					Math.min(
						this.props.task.get("step"),
						s + 0.01
					)
				))
			);
		}, 20)
	}

	componentWillUpdate(newProps) {
		if (this.props.task.get("complete")) {
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
		if (this.props.task.get("complete")) {
			prog = 100.0;
			progress = <p className="task-progress task-done">
				<span className="fa fa-check"></span>
			</p>
		} else {
			prog = 100.0 * ((this.state.data.get("step") + 1) /
				this.props.task.get("maxstep"));
			progress = <p className="task-progress">
				{prog.toFixed(0)}%
				<span className="far fa-compass task-spinner"></span>
			</p>
		}

		// Manage entrance/exit animation
		let classes;
		if (this.props.task.get("complete") || this.state.data.get("new")) {
			classes = "task-card card task-out"
		} else {
			classes = "task-card card task-in"
		}

		return (
			<div className={classes}>
				<div className="task-title-holder">
					<p className="task-title">
						{this.props.task.get("title")}
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
