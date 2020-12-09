
import Router from 'koa-router'

const router = new Router({ prefix: '/upload' })
import TrackUploader from '../modules/trackUploader.js'
import Tracks from '../modules/tracks.js'
const dbName = 'website.db'

async function checkAuth(ctx, next) {
	console.log('secure router middleware')
	console.log(ctx.hbs)
	if(ctx.hbs.authorised !== true) return ctx.redirect('/login?msg=you need to log in&referrer=/home')
	await next()
}

router.use(checkAuth)

/**
 * The secure upload page.
 *
 * @name Upload Page
 * @route {GET} /
 */
router.get('/', async ctx => {
	const track = await new Tracks(dbName)
	try {
		const userTracks = await track.getTracks(ctx.session.userID) // Array of user's tracks
		ctx.hbs.userTracks = userTracks
		await ctx.render('upload', ctx.hbs)
	} catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}
})

/**
 * The script to process uploading tracks.
 *
 * @name Upload Script
 * @route {POST} /
 */
router.post('/', async ctx => {
	const trackUploader = await new TrackUploader(dbName)
	let message = 'Track(s) uploaded successfully'

	const tracksInput = ctx.request.files.tracksInput // The files uploaded via form

	if(Array.isArray(tracksInput)) { // More than one track uploaded
		let retVal
		let i=0 // Loop over track files and add them to database
		while(i < tracksInput.length) {
			retVal = await trackUploader.addTrackFromFile(ctx.session.userID, tracksInput[i].path, 'public/tracks')
			if(retVal !== true) message = 'A file was missing ID3 data. Check which file(s) didn\'t upload.'
			i++
		}
	} else { // Only one track uploaded
		// Add single track file to database
		const retValue = await trackUploader.addTrackFromFile(ctx.session.userID, tracksInput.path, 'public/tracks')
		if(retValue !== true) message = 'The file was missing ID3 data and was not uploaded.'
	}
	ctx.redirect(`/upload?msg=${message}`) // Reload the page to show tracks
})

export default router
