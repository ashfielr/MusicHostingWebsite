
import test from 'ava'
import Tracks from '../modules/tracks.js'

/* Function to add a user to the database */
async function addTestUser(tracks) {
  	await tracks.registerUser('doej', 'password', 'doej@gmail.com')
}

test('ADD TRACK : add a valid track to registered user', async test => {
	test.plan(1)
	const tracks = await new Tracks()
	try {
		/* Arrange */
		await addTestUser(tracks)  
		const userID = 1

		/* Act */
		const trackAdded = await tracks.addTrack(userID,'test-track.mp3')

		/* Assert */
		test.is(trackAdded,true,'no track was not added')
	} catch(err) {
		test.fail(`error thrown - ${err}`)
	} finally {
		tracks.close()
	}
})

test('ADD TRACK : error if adding duplicated track', async test => {
	test.plan(1)
	const tracks = await new Tracks()
	const trackFileName = 'test-track.mp3'

	try {
		/* Arrange */
		await addTestUser(tracks)
		const userID = 1

		/* Act */
		await tracks.addTrack(userID,trackFileName)
		await tracks.addTrack(userID,trackFileName)

		/* Assert */
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, `track file name "${trackFileName}" is already in use`, 'incorrect error message')
	} finally {
		tracks.close()
	}
})

test('GET TRACKS : get tracks for user who has uploaded tracks', async test => {
	test.plan(1)
	const tracks = await new Tracks()
	try {
		/* Arrange */
		await addTestUser(tracks)
		await tracks.addTrack(1,'test-track.mp3')
		await tracks.addTrack(1,'test-track2.mp3')
		const userID = 1
		const numberOfTracks = 2

		/* Act */
		const userTracks = await tracks.getTracks(userID)

		/* Assert */
		test.is(userTracks.length, numberOfTracks, 'no tracks found')
	} catch(err) {
		test.fail(`error thrown - ${err}`)
	} finally {
		tracks.close()
	}
})

test('GET TRACKS : error if user does not exist', async test => {
	test.plan(1)
	const tracks = await new Tracks()

	/* Arrange */
	const userID = 999999

	try {
		/* Act */
		await tracks.getTracks(userID)

		/* Assert */
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, `User with id "${userID}" not found`, 'incorrect error message')
	} finally {
		tracks.close()
	}
})

test('GET TRACKS : error if user has no uploaded tracks', async test => {
	test.plan(1)
	const tracks = await new Tracks()

	/* Arrange */
	await addTestUser(tracks)
	const userID = 1

	try {
		/* Act */
		await tracks.getTracks(userID)

		/* Assert */
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, `The user with id "${userID}" has no uploaded tracks`, 'incorrect error message')
	} finally {
		tracks.close()
	}
})
