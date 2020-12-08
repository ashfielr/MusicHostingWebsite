/* duration.js */

/**
 * Duration module - ES6 module that handles track durations.
 * @module Duration
 */

/**
 * Gets the display duration string for a given durations in seconds
 * @param {Number} duration The duration to convert to a string format
 * @returns {String} Returns string formated duration
 */
export function getDisplayDurationString(duration) {
	const secInMin = 60
	const ten = 10
	const minutes = Math.floor(duration/secInMin)
	const seconds = Math.floor(duration%secInMin)
	if (seconds < ten) {
		return `${minutes}:0${seconds}` // Add zero before seconds
	} else {
		return `${minutes}:${seconds}`
	}
}
