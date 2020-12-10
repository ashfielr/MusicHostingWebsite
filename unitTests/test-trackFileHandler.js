
import test from 'ava'
import mockFS from 'mock-fs' // https://www.npmjs.com/package/mock-fs - using to mock a fs for tests
import TFHandler from '../modules/trackFileHandler.js'
import fs from 'fs-extra'
import delay from 'delay' // using to add delay between switching between mock fs and real fs

// ###### NOTE - if tests are failing due to not finding files or directories
// ###### the delay needs to be increased in the test before and after hook

const testFilesLocation = 'testDir/tracks' // Location of files to use in tests
const outputFileLocation = 'savedFiles' // Location to save files during tests

/* This runs before each test - sets up mock file system */
test.beforeEach(async() => {
	mockFS({
		// Location of test tracks
		'testDir/tracks': mockFS.load('unitTests/testAssets/tracks'),
		'node_modules/musicmetadata': mockFS.load('node_modules/musicmetadata'),
		'savedFiles': {/** empty directory */}
	}, {lazy: false})
	await delay(5)
})

/* This runs after each test */
test.afterEach(async() => {
	await delay(5)
	mockFS.restore() // revert back to real file system to remove mock fs from previous test
})

test('SAVE MP3 : saves mp3 file', async test => {
	/* Arrange */
	test.plan(1)
	const tFHandler = await new TFHandler()

	try {
		/* Act */
		const filename = await tFHandler.saveMP3File(`${testFilesLocation}/AllData.mp3`,outputFileLocation)
		const fileExists = await fs.pathExists(`${outputFileLocation}/${filename}`)

		/* Assert */
		test.is(fileExists, true, 'mp3 file was not saved')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('SAVE ALBUM ART : saves album art', async test => {
	/* Arrange */
	test.plan(1)
	const tFHandler = await new TFHandler()

	try {
		/* Act */
		//console.log(await fs.pathExists('/testDir/tracks'))
		//console.log(await fs.pathExists('testDir/tracks/AllData.mp3'))
		const testImageBuffer = Buffer.from([8, 6, 7, 5, 3, 0, 9])
		const filename = await tFHandler.saveAlbumArt(testImageBuffer, outputFileLocation)
		const fileExists = await fs.pathExists(`${outputFileLocation}/albumArt/${filename}`)

		/* Assert */
		test.is(fileExists, true, 'album art was not saved')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('EXTRACT TRACK DATA : extracts track data', async test => {
	/* Arrange */
	test.plan(1)
	const tFHandler = await new TFHandler()

	try {
		/* Act */
		const data = await tFHandler.extractMP3Data('testDir/tracks/AllData.mp3')
		//console.log(data)

		const dataObjFormat = { title: 'title',
			artist: [ 'artist' ], albumartist: [], album: 'album', year: '1999',
			track: { no: 1, of: 0 }, genre: ['genre'], disk: { no: 0, of: 0 }, picture: 'picture-data', duration: 123 }
		// picture could be missing

		// Check all attributes are present - data correct
		for(const key in dataObjFormat) {
			try {
				data[key] // will not throw error if key exists in data
			} catch (err) {
				test.fail(`${key} value missing`)
			}
		}
		test.pass()
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('GET METADATA : returns undefined if no metadata header exists', async test => {
	/* Arrange */
	test.plan(1)
	const tFHandler = await new TFHandler()

	try {
		const metaData = await tFHandler.getMetaData(`${testFilesLocation}/MissingMetadataHeader.mp3`)

		/* Assert */
		test.is(metaData, undefined, 'metadata was not returned as undefined')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('GET METADATA : returns metadata', async test => {
	/* Arrange */
	test.plan(1)
	const tFHandler = await new TFHandler()

	try {
		const metaData = await tFHandler.getMetaData(`${testFilesLocation}/AllData.mp3`)
		const mDProperties = ['album','albumartist','disk','artist','duration','genre','picture','title','track','year']
		for(const property of mDProperties) {
			if(!(property in metaData)) {
				test.fail(`${property} property missing`)
			}
		}
		/* Assert */
		test.pass()
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('GET TRACK OBJ : saves files and gets track object', async test => {
	/* Arrange */
	test.plan(13)
	const tFHandler = await new TFHandler()

	try {
		/* Act */
		const trackObj = await tFHandler.getTrackObj(`${testFilesLocation}/AllData.mp3`, outputFileLocation)

		const albumImageExits = await fs.pathExists(`${outputFileLocation}/albumArt/${trackObj.albumArt}`)
		const mp3FileExists = await fs.pathExists(`${outputFileLocation}/${trackObj.trackFile}`)
		//console.log(await fs.promises.readdir(`${outputFileLocation}/`))

		const expectedTObj = { trackFile: 'not underfined', trackName: 'Whatever It Takes (With Vocals)',
			artist: 'Liborio Conti', albumArt: 'not undefined', duration: '3:26', albumArtists: ['Jim','Joe'],
			year: '2000', track: {no: 1, of: 2}, disk: {no: 1, of: 1}, genre: ['Drum & Bass']}

		/* Assert */
		test.is(albumImageExits, true, 'album art not saved')
		test.is(mp3FileExists, true, 'mp3 file not saved')

		//console.log(trackObj)
		// Check all attributes are present - trackObj correct
		for(const key in expectedTObj)
			test.not(trackObj[key], undefined, `${key} value missing`) // will not throw error if key exists in data
		test.pass()

	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('GET TRACK OBJ : returns undefined if mp3 file is missing metadata header', async test => {
	/* Arrange */
	test.plan(1)
	const tFHandler = await new TFHandler()
	const testFilePath = `${testFilesLocation}/MissingMetadataHeader.mp3`
	try {
		/* Act */
		const trackObj = await tFHandler.getTrackObj(testFilePath, outputFileLocation)
		//console.log(trackObj)
		//console.log(await fs.promises.readdir(`${outputFileLocation}/`))

		/* Assert */
		test.is(trackObj, undefined, 'trackObj is not returned as undefined')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('GET TRACK OBJ : returns undefined if artist is missing', async test => {
	/* Arrange */
	test.plan(1)
	const tFHandler = await new TFHandler()
	const testFilePath = `${testFilesLocation}/MissingArtist.mp3`
	try {
		/* Act */
		const trackObj = await tFHandler.getTrackObj(testFilePath, outputFileLocation)

		/* Assert */
		test.is(trackObj, undefined, 'trackObj is not returned as undefined')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('GET TRACK OBJ : returns undefined if track name is missing', async test => {
	/* Arrange */
	test.plan(1)
	const tFHandler = await new TFHandler()
	const testFilePath = `${testFilesLocation}/MissingTrackName.mp3`
	try {
		/* Act */
		const trackObj = await tFHandler.getTrackObj(testFilePath, outputFileLocation)

		/* Assert */
		test.is(trackObj, undefined, 'trackObj is not returned as undefined')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('GET TRACK OBJ : if no album are exists - dont add to trackObj', async test => {
	/* Arrange */
	test.plan(1)
	const tFHandler = await new TFHandler()
	const testFilePath = `${testFilesLocation}/MissingAlbumArt.mp3`
	try {
		/* Act */
		const trackObj = await tFHandler.getTrackObj(testFilePath, outputFileLocation)

		/* Assert */
		test.is(trackObj.albumArt, undefined, 'albumArt key was found in trackObj')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})
