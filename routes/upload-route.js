
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
 * @route {GET} /upload
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

export default router
