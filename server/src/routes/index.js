import express from 'express'
import authRoute from './auth.route.js'
import userRoute from './user.route.js'
import orderRoute from './order.route.js'
import postRoute from './post.route.js'
import threadRoute from './thread.route.js'
import hotelRequestRoute from './hotelRequest.route.js'
import pageRoute from './page.route.js'
import sitemapRoute from './sitemap.route.js'
import categoryRoute from './category.route.js'

const router = express.Router()

router.use('/', sitemapRoute)
router.use('/auth', authRoute)
router.use('/user', userRoute)
router.use('/post', postRoute)
router.use('/page', pageRoute)
router.use('/order', orderRoute)
router.use('/thread', threadRoute)
router.use('/category', categoryRoute)
router.use('/hotelRequest', hotelRequestRoute)

export default router
