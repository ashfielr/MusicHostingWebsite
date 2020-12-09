
/** @module TrackFileHandler */
// Unit testing is not needed - all functions are based wholly on imported module functionality

import fs from 'fs-extra'
import { getDisplayDurationString } from './duration.js'
import mm from 'musicmetadata'

/**
 * TrackFileHandler
 * ES6 module that handles extracting data from MP3 files and saving the mp3 file and album art.
 */
class TrackFileHandler {
	/**
	 * Extracts the ID3 metadata from the mp3 file
	 * @param {String} filePath The file path of the mp3 file from which to extract the data
	 * @returns {Object} Returns the metadata for the mp3 file
	 */
	async extractMP3Data(filePath) {
		// REFERENCE - https://www.npmjs.com/package/musicmetadata
		// returning the promise - resolves with the metadata
		return new Promise((resolve,reject) => {
			mm(fs.createReadStream(filePath), { duration: true }, (err, metadata) => {
				if (err) reject(err)
				resolve(metadata)
			})
		})
	}

	/**
	 * Gets the metadata for a mp3 file
	 * @param {String} tempFilePath The file path of the mp3 file from which to extract the data
	 * @returns {Object} Returns the metadata for the mp3 file.
	 * Returns undefined if file has no metadata header
	 */
	async getMetaData(tempFilePath) {
		try {
			return await this.extractMP3Data(`${tempFilePath}`) // Get meta data
		} catch(err) {
			return undefined
		}
	}

	/**
	 * Creates a unique filename for the track to store
	 * @param {String} tempFilePath The temporary file path of the track to store
	 * @returns {String} Returns filename of the track which has been stored
	 */
	async saveMP3File(tempFilePath, outputFileLocation) {
		const fileName = `${Date.now()}.mp3` // Unique file name - seconds from 00:00:00 UTC Jan 1 1970
		try {
			await fs.copy(tempFilePath, `${outputFileLocation}/${fileName}`)
			return fileName
		} catch (err) {
			console.log(err)
		}
	}

	/**
	 * Stores an image from the buffer provided
	 * @param {Object} buffer The buffer for the image to store
	 * @returns {String} The name of the jpg file that was stored
	 */
	async saveAlbumArt(buffer, outputFileLocation) {
		const fileName = `${Date.now()}.jpg` // Unique file name - seconds from 00:00:00 UTC Jan 1 1970
		const filePath = `${outputFileLocation}/albumArt/${fileName}`

		// Save the file
		await fs.outputFile(filePath, buffer)
		return fileName
	}

	/**
	 * Gets an object containing all the required track data for uploading a track
	 * @param {String} tempFilePath The temporary file path for an mp3 file
	 * @returns {Oject} The track object containing all required data for uploading.
	 * Will return undefined if no metadata header found or vital data missing.
	 */
	async getTrackObj(tempFilePath, outputFileLocation) {
		const metaData = await this.getMetaData(tempFilePath)

		let trackDataObj
		let albumArtFileName // If all the required data exists
		if(metaData && metaData.artist.length > 0 && metaData.title) {
			const duration = await getDisplayDurationString(metaData.duration) // Format duration
			const fileName = await this.saveMP3File(tempFilePath, outputFileLocation) // Save mp3 file

			// Return object containing required track data
			trackDataObj = { trackFile: fileName, trackName: metaData.title,
				artist: metaData.artist[0], duration: duration}

			if(metaData.picture.length > 0) { // If album art exists - save it
				albumArtFileName = await this.saveAlbumArt(metaData.picture[0].data, outputFileLocation)
				trackDataObj.albumArt = albumArtFileName
			}
			return trackDataObj
		} else {
			return undefined
		}
	}
}

export default TrackFileHandler
