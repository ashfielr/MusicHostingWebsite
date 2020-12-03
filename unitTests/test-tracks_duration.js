
import test from 'ava'
import Tracks from '../modules/tracks.js'

/* This file is used to split up the unit tests for tracks module
 * This test file contains all unit tests for the
 * getDisplayDurationString(duration) function */

test('DURATION : returns correct string for valid duration', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = await new Tracks()
	const duration = 130

	try {
		/* Act */
		const displayDurationString = await tracks.getDisplayDurationString(duration)
		/* Assert */
		test.is(displayDurationString, '2:10', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	} finally {
		tracks.close()
	}
})

test('DURATION : valid duration with seconds less than 10 - edge case 9', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = await new Tracks()
	const duration = 129

	try {
		/* Act */
		const displayDurationString = await tracks.getDisplayDurationString(duration)
		/* Assert */
		// 0 should be added before the seconds 9 -> 09
		test.is(displayDurationString, '2:09', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	} finally {
		tracks.close()
	}
})

test('DURATION : valid duration with seconds more than 10 - edge case 11', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = await new Tracks()
	const duration = 131

	try {
		/* Act */
		const displayDurationString = await tracks.getDisplayDurationString(duration)
		/* Assert */
		test.is(displayDurationString, '2:11', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	} finally {
		tracks.close()
	}
})

test('DURATION : valid duration with seconds more than 10 - extreme case 0', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = await new Tracks()
	const duration = 120

	try {
		/* Act */
		const displayDurationString = await tracks.getDisplayDurationString(duration)
		/* Assert */
		// 0 should be added before the seconds 0 -> 00
		test.is(displayDurationString, '2:00', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	} finally {
		tracks.close()
	}
})

test('DURATION : valid duration with seconds more than 10 - extreme case 59', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = await new Tracks()
	const duration = 179

	try {
		/* Act */
		const displayDurationString = await tracks.getDisplayDurationString(duration)
		/* Assert */
		test.is(displayDurationString, '2:59', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	} finally {
		tracks.close()
	}
})

test('DURATION : valid duration with zero minutes', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = await new Tracks()
	const duration = 55

	try {
		/* Act */
		const displayDurationString = await tracks.getDisplayDurationString(duration)
		/* Assert */
		test.is(displayDurationString, '0:55', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	} finally {
		tracks.close()
	}
})

test('DURATION : valid duration with minutes less than 10 - edge case 9', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = await new Tracks()
	const duration = 540

	try {
		/* Act */
		const displayDurationString = await tracks.getDisplayDurationString(duration)
		/* Assert */
		test.is(displayDurationString, '9:00', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	} finally {
		tracks.close()
	}
})

test('DURATION : valid duration with minutes more than 10 - edge case 11', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = await new Tracks()
	const duration = 660

	try {
		/* Act */
		const displayDurationString = await tracks.getDisplayDurationString(duration)
		/* Assert */
		test.is(displayDurationString, '11:00', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	} finally {
		tracks.close()
	}
})

test('DURATION : valid duration with minutes - extreme case 0', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = await new Tracks()
	const duration = 0

	try {
		/* Act */
		const displayDurationString = await tracks.getDisplayDurationString(duration)
		/* Assert */
		test.is(displayDurationString, '0:00', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	} finally {
		tracks.close()
	}
})

test('DURATION : valid duration with minutes - extreme case 59', async test => {
	/* Arrange */
	test.plan(1)
	const tracks = await new Tracks()
	const duration = 3540

	try {
		/* Act */
		const displayDurationString = await tracks.getDisplayDurationString(duration)
		/* Assert */
		test.is(displayDurationString, '59:00', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	} finally {
		tracks.close()
	}
})
