import React, { Component } from 'react';




class Search extends Component {

	constructor() {
		super()
		this.doSearch = this.doSearch.bind(this);
	}

	doSearch() {
		const searchString = this.refs.searchterms.value;
		this.props.action(searchString);
	}

	render() {
		return (
			<div ref="search" className="search-box card">
				<input
					ref="searchterms"
					className="search-bar"
					placeholder={this.props.placeholder}
				/>
				<button
					className="def-button search-button"
					onClick={this.doSearch.bind(this)}>
					search
				</button>
			</div>
		);
	}
}

export default Search;
