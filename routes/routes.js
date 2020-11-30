
import Router from 'koa-router'

import publicRouter from './public.js'
import secureRouter from'./home.js'
import uploadRouter from'./upload-route.js'

const mainRouter = new Router()

const nestedRoutes = [publicRouter, secureRouter, uploadRouter]
for (const router of nestedRoutes) {
	mainRouter.use(router.routes())
	mainRouter.use(router.allowedMethods())
}

export default mainRouter
