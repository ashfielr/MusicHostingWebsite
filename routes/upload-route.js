
import Router from 'koa-router'

const router = new Router({ prefix: '/upload' })
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
	const track = await new Tracks(dbName)
	//console.log(ctx.request.files)
	console.log(ctx.request.files.tracksInput)

	const tracksInput = ctx.request.files.tracksInput // The files uploaded via form
	if(Array.isArray(tracksInput)) { // More than one track uploaded
		// Loop over track files and add them to database
		let i=0
		while(i < tracksInput.length) {
			await track.addTrackFromFile(ctx.session.userID, tracksInput[i].path)
			i++
		}
		console.log('>1')
	} else { // Only one track uploaded
		// Add single track file to database
		await track.addTrackFromFile(ctx.session.userID, tracksInput.path)
		console.log('1')
	}
	ctx.redirect('/upload') // Reload the page to show tracks
})

export default router
