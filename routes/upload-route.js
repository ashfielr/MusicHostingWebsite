
import Router from 'koa-router'

const router = new Router({ prefix: '/upload' })

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
	try {
		await ctx.render('upload', ctx.hbs)
	} catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}
})

export default router
