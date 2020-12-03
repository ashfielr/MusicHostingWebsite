
/** @module Tracks */

import bcrypt from 'bcrypt-promise'
import sqlite from 'sqlite-async'
import musicMetaData from 'music-metadata'
import fs from 'fs-extra'

const saltRounds = 10

/**
 * Tracks
 * ES6 module that handles a user's tracks
 */
class Tracks {
	/**
   * Create a track object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// need this table to store required track info
			let sql = 'CREATE TABLE IF NOT EXISTS users\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, pass TEXT, email TEXT);'
			await this.db.run(sql)
			sql = 'CREATE TABLE IF NOT EXISTS tracks(\
            trackID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
            userID INTEGER NOT NULL,\
            trackFile TEXT NOT NULL,\
            trackName TEXT NOT NULL,\
            artist TEXT NOT NULL,\
            albumArt TEXT,\
            duration TEXT NOT NULL,\
            FOREIGN KEY(userID) REFERENCES users(id));'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * Registers a new user - used for testing the module
	 * @param {String} user The chosen username
	 * @param {String} pass The chosen password
	 * @param {String} email The chosen email
	 * @returns {Boolean} Returns true if the new user has been added
	 */
	async registerUser(user, pass, email) {
		Array.from(arguments).forEach( val => {
			if(val.length === 0) throw new Error('missing field')
		})
		let sql = `SELECT COUNT(id) as records FROM users WHERE user="${user}";`
		const data = await this.db.get(sql)
		if(data.records !== 0) throw new Error(`username "${user}" already in use`)
		sql = `SELECT COUNT(id) as records FROM users WHERE email="${email}";`
		const emails = await this.db.get(sql)
		if(emails.records !== 0) throw new Error(`email address "${email}" is already in use`)
		pass = await bcrypt.hash(pass, saltRounds)
		sql = `INSERT INTO users(user, pass, email) VALUES("${user}", "${pass}", "${email}")`
		await this.db.run(sql)
		return true
	}

	/**
	 * Adds a new track
	 * @param {Number} userID The user who is uploading the file
	 * @param {String} trackFile The filename and extension of track
	 * @param {String} trackName The name of the track
	 * @param {String} artist The artist for the track
	 * @param {String} albumArt The filename of the album art image
	 * @param {String} duration The duration of the track in MM:SS
	 * @returns {Boolean} Returns true if the new track has been added
	 */
	async addTrack(trackObj) {
		for(const attribute in trackObj) {
			if(trackObj[attribute] === undefined) throw new Error(`${attribute} is undefined`)
		}
		let sql = `SELECT COUNT(*) as records FROM tracks WHERE trackFile="${trackObj.trackFile}";`
		const trackFiles = await this.db.get(sql)
		if(trackFiles.records !== 0) throw new Error(`track file name "${trackObj.trackFile}" is already in use`)
		sql = `INSERT INTO tracks(userID, trackFile, trackName, artist, albumArt, duration)\
            VALUES("${trackObj.userID}", "${trackObj.trackFile}", "${trackObj.trackName}",\
            "${trackObj.artist}", "${trackObj.albumArt}", "${trackObj.duration}")`
		await this.db.run(sql)
		return true
	}

	/**
	 * Gets all of the tracks The user has uploaded
	 * @param {Number} userID The user to get the tracks for
	 * @returns {Object} Returns the tracks the user has uploaded - returns null if user has no tracks.
	 */
	async getTracks(userID) {
		/* Check if user exists with userID */
		let sql = `SELECT count(id) AS count FROM users WHERE id="${userID}";`
		const records = await this.db.get(sql)
		if(!records.count) throw new Error(`User with id "${userID}" not found`)
		/* Get tracks for user */
		sql = `SELECT * FROM tracks WHERE userID="${userID}";`
		const tracks = await this.db.all(sql)
		if(tracks.length === 0) return null
		return tracks
	}

	/**
	 * Creates a unique filename for the track to store
	 * @param {String} tempFilePath The temporary file path of the track to store
	 * @returns {String} Returns filename of the track which has been stored
	 */
	async saveMP3File(tempFilePath) {
		const fileName = `${Date.now()}.mp3` // Unique file name - seconds from 00:00:00 UTC Jan 1 1970
		console.log(fileName)
		await fs.copy(tempFilePath, `public/tracks/${fileName}`)
		console.log(`Track mp3 file saved: ${fileName}`)
		return fileName
	}

	/**
	 * Stores an image from the buffer provided
	 * @param {Object} buffer The buffer for the image to store
	 * @returns {String} The name of the jpg file that was stored
	 */
	async saveAlbumArt(buffer) {
		console.log(typeof buffer)
		// REFERENCE - https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
		const fileName = `${Date.now()}.jpg` // Unique file name - seconds from 00:00:00 UTC Jan 1 1970
		const filePath = `public/tracks/albumArt/${fileName}`
		fs.writeFile(filePath, buffer, (err) => {
			if (err) throw err
			console.log(`Album art saved: ${fileName}`)
		})
		return fileName
	}

	/**
	 * Extracts the ID3 metadata from the mp3 file
	 * @param {String} filePath The file path of the mp3 file from which to extract the data
	 * @returns {Object} Returns the metadata for the mp3 file
	 */
	async extractMP3Data(filePath) {
		return await musicMetaData.parseFile(filePath)
	}

	/**
	 * Gets the display duration string for a given durations in seconds
	 * @param {Number} duration The duration to convert to a string format
	 * @returns {String} Returns string formated duration
	 */
	async getDisplayDurationString(duration) {
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

	/**
	 * Adds the track with all its details to the database
	 * @param {Number} userID The userID value for the user who is uploading the track
	 * @param {String} tempFilePath The temporary file path of the uploaded track
	 * @returns {Boolean} Returns true if sucessful
	 */
	async addTrackFromFile(userID, tempFilePath) {
		// Save mp3 file
		const fileName = await this.saveMP3File(tempFilePath)

		// Get meta data
		const metaData = await this.extractMP3Data(`public/tracks/${fileName}`)
		const com = metaData.common

		// Save album art
		let albumArtFileName
		try {
			// Save the album image if there is one
			const imageBuffer = com.picture[0].data
			albumArtFileName = await this.saveAlbumArt(imageBuffer)
		} catch (err) {
			// No album image found
			albumArtFileName = null // Will use placeholder image
		}

		// Format duration
		const duration = await this.getDisplayDurationString(metaData.format.duration)

		// Create object to pass the track data
		const trackDataObj = { userID: userID, trackFile: fileName, trackName: com.title,
			artist: com.artist, albumArt: albumArtFileName, duration: duration}
		console.log(trackDataObj)

		return await this.addTrack(trackDataObj) // Add the track data to database
	}

	/**
	 * Closes the database connection
	 */
	async close() {
		await this.db.close()
	}
}

export default Tracks
