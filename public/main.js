
/* main.js */

window.addEventListener('DOMContentLoaded', () => {
	console.log('DOMContentLoaded')

	/* Show message for time period */
	const msgDisplayTime = 1500
	document.querySelector('.msg').hidden = false
	window.setTimeout( () => {
		document.querySelector('.msg').hidden = true
	}, msgDisplayTime)
})
