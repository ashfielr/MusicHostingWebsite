
/** @module Tracks */

import bcrypt from 'bcrypt-promise'
import sqlite from 'sqlite-async'

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
            trackFile TEXT NOT NULL, trackName TEXT NOT NULL,\
            artist TEXT NOT NULL, albumArt TEXT,\
            duration TEXT NOT NULL, albumArtists TEXT,\
            year TEXT, track TEXT, disk TEXT, genre TEXT,\
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
	 * Gets a track from the database
	 * @param {Number} trackID The trackID of the track to retrieve from the database
	 * @returns {Object} Returns the track for the given trackID - returns null if it does not exist.
	 */
	async getTrack(trackID) {
		/* Check if user exists with userID */
		const sql = `SELECT * FROM tracks WHERE trackID="${trackID}";`
		const track = await this.db.get(sql)
		if(track) return track
		return null
	}

	/**
	 * Adds a new track
	 * @param {Number} userID The user who is uploading the file
	 * @param {Object} trackObj Object containing all data about the track
	 * @returns {Boolean} Returns true if the new track has been added
	 */
	async addTrack(trackObj) {
		await this.throwErrIfMissingData(trackObj) // Check if missing any data
		let sql = `SELECT COUNT(*) as records FROM tracks WHERE trackFile="${trackObj.trackFile}";`
		const trackFiles = await this.db.get(sql)
		if(trackFiles.records !== 0) throw new Error(`track file name "${trackObj.trackFile}" is already in use`)
		// Run the correct insert statement depending on if albumArt is undefined or not
		if(trackObj.albumArt) {
			sql = await this.SQLToInsertIntoDB(trackObj)
		} else {
			sql = await this.SQLToInsertIntoDBWithoutAlbumArt(trackObj)
		}
		const trackID = (await this.db.run(sql)).lastID
		await this.insertExtraData(trackObj, trackID)
		return true
	}

	/**
	 * Throws an error if the track is missing data
	 * @param {Object} trackObj Object containing all data about the track
	 */
	async throwErrIfMissingData(trackObj) {
		const requiredKeys = ['userID','trackFile','trackName','artist','duration']
		for(const attribute of requiredKeys) {
			if(trackObj[attribute] === undefined && attribute!=='albumArt') throw new Error(`${attribute} is undefined`)
		}
	}

	/**
	 * Generates SQL statement to add a track to the database
	 * @param {Object} trackObj Object containing all data about the track
	 * @returns {Boolean} Returns the SQL statement required to add the track to database
	 */
	async SQLToInsertIntoDB(trackObj) {
		return `INSERT INTO tracks(userID, trackFile, trackName, artist, albumArt, duration)\
            VALUES("${trackObj.userID}", "${trackObj.trackFile}", "${trackObj.trackName}",\
            "${trackObj.artist}", "${trackObj.albumArt}", "${trackObj.duration}")`
	}

	/**
   * Generates SQL statement to add a track which has no album art to the database
   * @param {Object} trackObj Object containing all data about the track
   * @returns {Boolean} Returns the SQL statement required to add the track to database
   */
	async SQLToInsertIntoDBWithoutAlbumArt(trackObj) {
		return `INSERT INTO tracks(userID, trackFile, trackName, artist, duration)\
            VALUES("${trackObj.userID}", "${trackObj.trackFile}", "${trackObj.trackName}",\
            "${trackObj.artist}", "${trackObj.duration}")`
	}

	/**
   * Generates and executes SQL statements to add the extra ID3 data if it is present
   * @param {Object} trackObj Object containing all data about the track
   * @param {Number} trackID the id of the track to which the extra data needs to be added
   */
	async insertExtraData(trackObj, trackID) {
		const {albumArtists,year,track,disk,genre} = trackObj
		let sql

		if(year !== null) {
			sql = `UPDATE tracks SET year="${year}" WHERE trackID=${trackID};`
			await this.db.run(sql)
		}
		if(albumArtists !== null) {
			const albumArtistsText = await this.getArrayAsText(albumArtists)
			sql = `UPDATE tracks SET albumArtists="${albumArtistsText}" WHERE trackID=${trackID};`
			await this.db.run(sql)
		}
		if(genre !== null) {
			sql =`UPDATE tracks SET genre="${genre[0]}" WHERE trackID=${trackID};`
			await this.db.run(sql)
		}
		await this.insertDiskAndTrack(disk, track, trackID)
	}

	/**
   * Generates and executes SQL statements to add the track and disk data if it is present
   * @param {Object} disk Object containing all data about the disc
   * @param {Object} track Object containing all data about the track in the album
   * @param {Number} trackID the id of the track to which the extra data needs to be added
   */
	async insertDiskAndTrack(disk, track, trackID) {
		let sql
		if(disk !== null) {
			const diskText = await this.getNoOfAsText(disk)
			sql = `UPDATE tracks SET disk="${diskText}" WHERE trackID=${trackID};`
			await this.db.run(sql)
		}
		if(track !== null) {
			const trackText = await this.getNoOfAsText(track)
			sql =`UPDATE tracks SET track="${trackText}" WHERE trackID=${trackID};`
			await this.db.run(sql)
		}
	}

	/**
   * Creates a single string to be used to store an array as text
   * Example: ['Henry','Joe'] will be converted to 'Henry, Joe'
   * @param {Object} albumArtists Array containing all the album artists
   * @returns {Boolean} Returns the formatted string containing all the album artists
   */
	async getArrayAsText(albumArtists) {
		let text = ''
		for(let i=0; i<albumArtists.length; i++) {
			text += `${albumArtists[i]}`
			if(i !== albumArtists.length - 1) text += ', '
		}
		return text
	}

	/**
   * Creates a single string to be used to store track and disk.
   * Example: {no:1,of:2} will be converted to '1/2'
   * @param {Object} objToFormat Object containing to be formatted as a string
   * @returns {Boolean} Returns the formatted string
   */
	async getNoOfAsText(objToFormat) {
		let text = ''
		text += objToFormat.no
		text += '/'
		text += objToFormat.of
		return text
	}

	/**
	 * Closes the database connection
	 */
	async close() {
		await this.db.close()
	}
}

export default Tracks
