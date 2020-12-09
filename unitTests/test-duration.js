
import test from 'ava'
import { getDisplayDurationString as getD } from '../modules/duration.js'

test('DURATION : returns correct string for valid duration', async test => {
	/* Arrange */
	test.plan(1)
	const duration = 130

	try {
		/* Act */
		const displayDurationString = await getD(duration)
		/* Assert */
		test.is(displayDurationString, '2:10', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('DURATION : valid duration with seconds less than 10 - edge case 9', async test => {
	/* Arrange */
	test.plan(1)
	const duration = 129

	try {
		/* Act */
		const displayDurationString = await getD(duration)
		/* Assert */
		// 0 should be added before the seconds 9 -> 09
		test.is(displayDurationString, '2:09', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('DURATION : valid duration with seconds more than 10 - edge case 11', async test => {
	/* Arrange */
	test.plan(1)
	const duration = 131

	try {
		/* Act */
		const displayDurationString = await getD(duration)
		/* Assert */
		test.is(displayDurationString, '2:11', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('DURATION : valid duration with seconds more than 10 - extreme case 0', async test => {
	/* Arrange */
	test.plan(1)
	const duration = 120

	try {
		/* Act */
		const displayDurationString = await getD(duration)
		/* Assert */
		// 0 should be added before the seconds 0 -> 00
		test.is(displayDurationString, '2:00', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('DURATION : valid duration with seconds more than 10 - extreme case 59', async test => {
	/* Arrange */
	test.plan(1)
	const duration = 179

	try {
		/* Act */
		const displayDurationString = await getD(duration)
		/* Assert */
		test.is(displayDurationString, '2:59', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('DURATION : valid duration with zero minutes', async test => {
	/* Arrange */
	test.plan(1)
	const duration = 55

	try {
		/* Act */
		const displayDurationString = await getD(duration)
		/* Assert */
		test.is(displayDurationString, '0:55', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('DURATION : valid duration with minutes less than 10 - edge case 9', async test => {
	/* Arrange */
	test.plan(1)
	const duration = 540

	try {
		/* Act */
		const displayDurationString = await getD(duration)
		/* Assert */
		test.is(displayDurationString, '9:00', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('DURATION : valid duration with minutes more than 10 - edge case 11', async test => {
	/* Arrange */
	test.plan(1)
	const duration = 660

	try {
		/* Act */
		const displayDurationString = await getD(duration)
		/* Assert */
		test.is(displayDurationString, '11:00', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('DURATION : valid duration with minutes - extreme case 0', async test => {
	/* Arrange */
	test.plan(1)
	const duration = 0

	try {
		/* Act */
		const displayDurationString = await getD(duration)
		/* Assert */
		test.is(displayDurationString, '0:00', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})

test('DURATION : valid duration with minutes - extreme case 59', async test => {
	/* Arrange */
	test.plan(1)
	const duration = 3540

	try {
		/* Act */
		const displayDurationString = await getD(duration)
		/* Assert */
		test.is(displayDurationString, '59:00', 'display string not correct')
	} catch(err) {
		console.log(err)
		test.fail('unexpected error was thrown')
	}
})
