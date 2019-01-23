import React from 'react';

import Search from './search';



class SearchPage extends Search {


	componentWillMount() {

		// Populate existing results, if required
		if (this.props.results) {
			this.updateState(state => state
				.set("results", this.props.results)
			)
		}

		// Perform requested search, if required
		if (this.props.target) {
			this.search(this.props.target);
		}

	}


	render() {
		return (
			<div ref="searchresults">
				<div className="searchpage-box card">
					<form onSubmit={this.doSearch.bind(this)}>
						<input
							ref={ref => this.searchInput = ref}
							onKeyPress={this.search.bind(this)}
							className="searchpage-input"
							placeholder="Search users, topics, etc..."
						/>
						<div
							className="searchpage-button"
							onClick={this.doSearch.bind(this)}>
							search
						</div>
						<button
							type="submit"
							style={{ display: "none" }}
						/>
					</form>
				</div>
				<div className="searchpage-filters">
				</div>
				{this.state.data.get("results")
					.filter()
					.map()
					.toList()
				}
			</div>
		);
	}

}

export default SearchPage;
