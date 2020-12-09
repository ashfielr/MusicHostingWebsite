
import Router from 'koa-router'

const router = new Router({ prefix: '/home' })

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
 * The secure home page.
 *
 * @name Home Page
 * @route {GET} /
 */
router.get('/', async ctx => {
	const track = await new Tracks(dbName)
	try {
		const userTracks = await track.getTracks(ctx.session.userID) // Array of user's tracks
		console.log(`User's tracks: ${userTracks}`)
		ctx.hbs.userTracks = userTracks
		await ctx.render('home', ctx.hbs)
	} catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	} finally{
		track.close()
	}
})

/**
 * A page for a track.
 *
 * @name Track Page
 * @route {GET} /track/:trackID
 */
router.get('/track/:trackID', async ctx => {
	const track = await new Tracks(dbName)
	try {
		console.log(ctx.params.trackID) // the ID of the track to display details for
		await ctx.render('track', ctx.hbs)
	} catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	} finally{
		track.close()
	}
})

export default router
