
import test from 'ava'
import Tracks from '../modules/tracks.js'

/* This runs before each test - add a user to the database */
test.beforeEach(async t => {
	t.context.tracks = await new Tracks() // Using context so Tracks can be accessed by tests
	await t.context.tracks.registerUser('doej', 'password', 'doej@gmail.com')
	t.context.trackObj = { userID: 1, trackFile: 'test-track.mp3', trackName: 'test-track',
		artist: 'artist', albumArt: 'albumArt.jpg', duration: '1:30'}
})

test('ADD TRACK : add a valid track to registered user', async test => {
	/* Arrange */
	test.plan(8) // Expecting 8 assertions
	const tracks = test.context.tracks
	const trackObj = test.context.trackObj
	try {
		/* Act */
		const trackAdded = await tracks.addTrack(trackObj)
		const userTracks = await tracks.getTracks(1)

		/* Assert */
		// Check if it was added to DB
		test.is(trackAdded,true,'no track was not added')
		test.is(userTracks.length,1,'track not added to database')

		// Check all fields added to database correctly
		const userTrack = userTracks[0]
		for(const key in userTrack) {
			if(key !== 'trackID') // trackID is auto incremented primary key in DB - will be returned by getTracks()
				test.is(userTrack[key],trackObj[key],`${key} not added correctly`)
		}
	} catch(err) {
		test.fail(`error thrown - ${err}`)
	} finally {
		tracks.close()
	}
})

test('ADD TRACK : error if adding duplicated track', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = test.context.tracks
	const trackObj = test.context.trackObj
	try {
		/* Act */
		for(let i=0; i<2; i++) {
			await tracks.addTrack(trackObj)
		}

		/* Assert */
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'track file name "test-track.mp3" is already in use', 'incorrect error message')
	} finally {
		tracks.close()
	}
})

test('ADD TRACK : error if userID undefined', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = test.context.tracks
	const trackObj = test.context.trackObj
	trackObj.userID = undefined

	try {
		/* Act */
		await tracks.addTrack(trackObj)

		/* Assert */
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'userID is undefined', 'incorrect error message')
	} finally {
		tracks.close()
	}
})

test('ADD TRACK : error if trackFile undefined', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = test.context.tracks
	const trackObj = test.context.trackObj
	trackObj.trackFile = undefined

	try {
		/* Act */
		await tracks.addTrack(trackObj)

		/* Assert */
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'trackFile is undefined', 'incorrect error message')
	} finally {
		tracks.close()
	}
})

test('ADD TRACK : error if trackName undefined', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = test.context.tracks
	const trackObj = test.context.trackObj
	trackObj.trackName = undefined

	try {
		/* Act */
		await tracks.addTrack(trackObj)

		/* Assert */
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'trackName is undefined', 'incorrect error message')
	} finally {
		tracks.close()
	}
})

test('ADD TRACK : error if artist undefined', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = test.context.tracks
	const trackObj = test.context.trackObj
	trackObj.artist = undefined

	try {
		/* Act */
		await tracks.addTrack(trackObj)

		/* Assert */
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'artist is undefined', 'incorrect error message')
	} finally {
		tracks.close()
	}
})

test('ADD TRACK : albumArt undefined for track upload - added as NULL in DB', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = test.context.tracks
	const trackObj = test.context.trackObj
	trackObj.albumArt = undefined

	try {
		/* Act */
		await tracks.addTrack(trackObj)
		const userTracks = await tracks.getTracks(1)

		/* Assert */
		test.is(userTracks[0].albumArt,null,'albumArt was not added as NULL')

	} catch(err) {
		test.fail(`error was thrown: ${err}`)
	} finally {
		tracks.close()
	}
})

test('ADD TRACK : error if duration undefined', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = test.context.tracks
	const trackObj = test.context.trackObj
	trackObj.duration = undefined

	try {
		/* Act */
		await tracks.addTrack(trackObj)

		/* Assert */
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'duration is undefined', 'incorrect error message')
	} finally {
		tracks.close()
	}
})

test('GET TRACKS : get tracks for user who has uploaded tracks', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = test.context.tracks
	const trackObj = test.context.trackObj
	const trackObj2 = { ...test.context.trackObj } // Cloning the test track object
	trackObj2.trackFile = 'test-track2.mp3' // Giving it a different name - so it can be added to DB

	try {
		await tracks.addTrack(trackObj)
		await tracks.addTrack(trackObj2)

		/* Act */
		const userTracks = await tracks.getTracks(1)

		/* Assert */
		test.is(userTracks.length, 2, 'no tracks found')
	} catch(err) {
		test.fail(`error thrown - ${err}`)
	} finally {
		tracks.close()
	}
})

test('GET TRACKS : error if user does not exist', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = test.context.tracks
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

test('GET TRACKS : returns null if user has no uploaded tracks', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = test.context.tracks

	try {
		/* Act */
		const userTracks = await tracks.getTracks(1)

		/* Assert */
		test.is(userTracks, null, 'did not return null')
	} catch(err) {
		test.fail('unexpected error was thrown')
	} finally {
		tracks.close()
	}
})
