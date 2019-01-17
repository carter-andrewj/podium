import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';




let timer;


class Search extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				show: false,
				target: "",
				results: {},
				category: "all"		// "user", "topic", "all"
			}))
		}
		this.doSearch = this.doSearch.bind(this);
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return { data: up(data) } },
			callback
		);
	}


	setCategory(category) {
		this.updateState(state => state
			.set("category", category)
		)
	}


	showSearch() {
		this.updateState(state => state
			.set("show", true)
		)
	}


	hideSearch() {
		this.updateState(state => state
			.set("show", false)
		)
	}


	search() {

		// Get current search string
		const target = this.searchInput.value;
		this.updateState(state => state.set("target", target));

		// Do search on delay
		clearTimeout(timer);
		setTimeout(
			() => this.props.search(target, false)
				.then(results => {
					this.updateState(state => state
						.update("results", r => r.mergeDeep(results))
					)
				})
				.catch(error => null),
			500
		)

	}


	searchResults(event) {

		// Catch default form submission
		event.preventDefault()
		clearTimeout(timer)

		// Get search string
		const target = this.searchInput.value;
		this.props.search(target);

	}


	render() {
		return (
			<div ref="search" className="search-container">
				<div
					className="search-capture"
					onMouseOver={this.showSearch.bind(this)}
					onMouseLeave={this.hideSearch.bind(this)}>
					<div
						className="search-box"
						onClick={() => this.searchInput.focus()}>
						<form onSubmit={this.searchResults.bind(this)}>
							<input
								ref={ref => this.searchInput = ref}
								onKeyPress={this.quickSearch.bind(this)}
								className={(this.state.data.get("show")) ?
									"search-input search-input-on" :
									"search-input search-input-off"}
								placeholder="Search..."
							/>
							<div
								className="search-button"
								onClick={this.searchResults.bind(this)}>
								<span className="fas fa-search search-icon">
								</span>
							</div>
							<button
								type="submit"
								style={{ display: "none" }}
							/>
						</form>
					</div>
					<div className="search-results">
						{this.state.data.get("results")
							.filter()
							.sort()
							.map()
							.toList()
						}
					</div>
				</div>
			</div>
		);
	}


	componentWillUnmount() {
		clearTimeout(timer);
	}

}

export default Search;
