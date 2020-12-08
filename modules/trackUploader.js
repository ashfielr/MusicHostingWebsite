
/** @module TrackUploader */

import Tracks from './tracks.js'
import TFHandler from './trackFileHandler.js'

/**
 * TrackUploader
 * ES6 module that handles uploading a user's track.
 */
class TrackUploader {
	/**
   * Create a TrackUploader object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.tracks = await new Tracks(dbName)
			this.tFHandler = await new TFHandler()
			return this
		})()
	}

	/**
	 * Adds the track with all its details to the database
	 * @param {Number} userID The userID value for the user who is uploading the track
	 * @param {String} tempFilePath The temporary file path of the uploaded track
	 * @returns {Boolean} Returns true if sucessful, false if ID3 data was missing
	 */
	async addTrackFromFile(userID, tempFilePath, outputFileLocation) {
		const trackDataObj = await this.tFHandler.getTrackObj(tempFilePath, outputFileLocation)

		if(trackDataObj) { // If the track has all required data
			trackDataObj.userID = userID

			try {
				return await this.tracks.addTrack(trackDataObj) // Return true / Add the track data to database
			} catch(err) {
				// Return false and remove files
				console.log(err)
				return false
			}
		} else {
			return false
		}
	}
}

export default TrackUploader
