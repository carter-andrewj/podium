import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';





let timer;

class Search extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				show: false,
				lock: false,
				category: "all"		// "user", "topic", "all"
			}))
		}
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


	lockSearch() {
		this.updateState(state => state
			.set("lock", true))
	}


	unlockSearch() {
		if (this.searchInput.value === "") {
			this.updateState(state => state
				.set("lock", false))
		}
	}


	doSearch(event) {

		// Get current search string
		const target = this.searchInput.value;

		// Do search on delay
		clearTimeout(timer);
		timer = setTimeout(
			() => this.props.search(target, false),
			500
		)

	}


	searchResults(event) {

		// Catch default form submission
		event.preventDefault()
		clearTimeout(timer)

		// Get search string
		const target = this.searchInput.value;

		// If search string is not empty
		if (target !== "") {

			// Trigger search
			this.props.search(target);

			// Pre-emptively set core mode to search results
			this.setCoreMode("search");

		}

	}


	render() {

		const showSearch = this.state.data.get("show") ||
						   this.state.data.get("lock");

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
							<div
								className={(showSearch) ?
									"search-input-holder card search-input-on" :
									"search-input-holder card search-input-off"}>
								<input
									ref={ref => this.searchInput = ref}
									className="search-input"
									onKeyUp={this.doSearch.bind(this)}
									onFocus={this.lockSearch.bind(this)}
									onBlur={this.unlockSearch.bind(this)}
									placeholder="Search..."
								/>
							</div>
							<div
								className={(showSearch) ?
									"search-button card search-button-on" :
									"search-button card search-button-off"}
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
					{(this.props.results.size > 0) ?
						<div className="quicksearch-results card">
							{this.props.results.map(el => el).toList()}
							{(this.props.results.size > 3) ?
								<div
									className="quicksearch-footer"
									onClick={this.searchResults.bind(this)}>
									<p className="quicksearch-footer-text">
										{this.props.results.size - 3} more results
									</p>
								</div>
								: null
							}
						</div>
						: (!this.props.loading && this.props.target.length >= 3) ?
							<div className="quicksearch-results card">
								<div className="quicksearch-footer">
									<p className="quicksearch-footer-text">
										no results found
									</p>
								</div>
							</div>
							: null
					}
				</div>
			</div>
		);
	}


	componentWillUnmount() {
		clearTimeout(timer);
	}

}

export default Search;
