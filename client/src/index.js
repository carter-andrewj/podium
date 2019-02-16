import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import "App.css";

import registerServiceWorker from './registerServiceWorker';

// Swallow event emitter warning
//TODO - Remove this once we have the ability to close radix channels
require('events').EventEmitter.prototype._maxListeners = 1000;

// Scale to window
function rescale() {
	Object.assign(document.getElementById("root").style, {
		fontSize: Math.round(5 + (12 * (((3 * Math.pow(window.innerWidth, 0.85)) - 300) / 1300))) + "px",
		lineHeight: 1.8 + (3 * ((window.innerWidth - 300) / 13000)) + "em"
	})
}
let resizeTimer;
window.addEventListener("resize",
	() => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(rescale, 200)
	}
)
rescale()


ReactDOM.render(
	<Router>
		<App />
	</Router>,
	document.getElementById('root')
);

registerServiceWorker();