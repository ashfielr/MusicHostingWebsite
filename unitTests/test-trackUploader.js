
import test from 'ava'
import TrackUploader from '../modules/trackUploader.js'
import mockFS from 'mock-fs' // https://www.npmjs.com/package/mock-fs - using to mock a fs for tests
import delay from 'delay' // using to add delay between switching between mock fs and real fs

// ###### NOTE - if tests are failing due to not finding files or directories
// ###### the delay needs to be increased in the test before and after hook

const testFilesLocation = 'testDir/tracks' // Location of files to use in tests
const outputFileLocation = 'savedFiles' // Location to save files during tests

/* This runs before each test - sets up mock file system */
test.beforeEach(async t => {
	t.context.trackUploader = await new TrackUploader()
	await t.context.trackUploader.tracks.registerUser('doej', 'password', 'doej@gmail.com')

	// mock fs - so no files are written to real fs
	mockFS({
		// Location of test tracks
		'testDir/tracks': mockFS.load('unitTests/testAssets/tracks'),
		'node_modules/musicmetadata': mockFS.load('node_modules/musicmetadata'),
		'savedFiles': {/** empty directory */}
	}, {lazy: false})
	await delay(15)
})

/* This runs after each test */
test.afterEach(async() => {
	await delay(50)
	mockFS.restore() // revert back to real file system to remove mock fs from previous test
})

test('ADD TRACK FROM FILE : adds track to data database if all data present', async test => {
	/* Arrange */
	test.plan(2)
	const tUploader = test.context.trackUploader
	const filePath = `${testFilesLocation}/AllData.mp3`

	try {
		/* Act */
		const trackWasAdded = await tUploader.addTrackFromFile(1,filePath,outputFileLocation)
		const userTracks = await tUploader.tracks.getTracks(1)

		/* Assert */
		test.is(trackWasAdded, true, 'track was not added')
		test.is(userTracks.length,1, 'track was not added')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('ADD TRACK FROM FILE : track not added if metadata header missing', async test => {
	/* Arrange */
	test.plan(2)
	const tUploader = test.context.trackUploader
	const filePath = `${testFilesLocation}/MissingMetadataHeader.mp3`

	try {
		/* Act */
		const trackWasAdded = await tUploader.addTrackFromFile(1,filePath,outputFileLocation)
		const userTracks = await tUploader.tracks.getTracks(1)

		/* Assert */
		test.is(trackWasAdded, false, 'track was added')
		test.is(userTracks,null, 'track was added')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('ADD TRACK FROM FILE : track not added if artist missing', async test => {
	/* Arrange */
	test.plan(2)
	const tUploader = test.context.trackUploader
	const filePath = `${testFilesLocation}/MissingArtist.mp3`

	try {
		/* Act */
		const trackWasAdded = await tUploader.addTrackFromFile(1,filePath,outputFileLocation)
		const userTracks = await tUploader.tracks.getTracks(1)

		/* Assert */
		test.is(trackWasAdded, false, 'track was added')
		test.is(userTracks,null, 'track was added')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('ADD TRACK FROM FILE : track not added if track name missing', async test => {
	/* Arrange */
	test.plan(2)
	const tUploader = test.context.trackUploader
	const filePath = `${testFilesLocation}/MissingTrackName.mp3`
	try {
		/* Act */
		const trackWasAdded = await tUploader.addTrackFromFile(1,filePath,outputFileLocation)
		const userTracks = await tUploader.tracks.getTracks(1)

		/* Assert */
		test.is(trackWasAdded, false, 'track was added')
		test.is(userTracks,null, 'track was added')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('ADD TRACK FROM FILE : track added if all data required present but no album art', async test => {
	/* Arrange */
	test.plan(3)
	const tUploader = test.context.trackUploader
	const filePath = `${testFilesLocation}/MissingAlbumArt.mp3`
	try {
		/* Act */
		const trackWasAdded = await tUploader.addTrackFromFile(1,filePath,outputFileLocation)
		const userTracks = await tUploader.tracks.getTracks(1)

		/* Assert */
		test.is(trackWasAdded, true, 'track was added')
		test.is(userTracks.length,1, 'track was added')
		// test that album art is missing in database
		test.is(userTracks[0].albumArt,null, 'track album was added but it was missing')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})
