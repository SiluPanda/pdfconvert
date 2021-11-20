import express from 'express'
import fs from 'fs'
import {v4 as uuidV4} from 'uuid'

const router = express.Router()


router.post('/url', async (req, res, next) => {
    try {
        let browser = req.app.locals.browser

        let url = req.body.url
        if (!url) {
            return res.status(400).json({
                message: 'url is missing'
            })
        }
        let pageId = uuidV4()

        let viewPort = req.body.viewPort || {}
        let height = viewPort.height || 1080
        let width = viewPort.width || 1440

        let format = req.body.format || 'png'

        let validFormats = ['png', 'jpeg']

        if (validFormats.includes(format) === false) {
            return res.status(400).json({
                message: `invalid value for file format, valid values are ${validFormats}`
            })
        }

        let fileName = req.body.file_name
        let fullPage = req.body.full_page || false
        let initialDelay = req.body.initial_delay || 1

        if (initialDelay > 20) {
            return res.status(400).json({
                message: `initial delay can not be more than 20 seconds, you provided ${initialDelay}`
            })
        }

        let page = await browser.newPage()

        page.setViewport({
            width: width,
            height: height
        })

        await page.goto(url, {
            waitUntil: 'networkidle2'
        })

        await page.waitForTimeout(Number(initialDelay) * 1000)

        let savedFilePath = `public/${pageId}.${format}`
        await page.screenshot({
            path: savedFilePath,
            fullPage: fullPage

        })

        

        await page.close()

        res.download(savedFilePath, fileName || `${pageId}.${format}`)

        res.on('finish', function() {
            fs.unlink(savedFilePath, function(err) {
                if (!err) {
                    console.log(`screenshot with id ${pageId} is deleted successfully`)
                }
            })
        })


    } catch (err) {
        let placeholder = req.body.placeholder || false;

        if (placeholder) {
            return res.download('public/defaults/default.jpeg')
        }
        else {
            next(err)
        }
    }
})


export default router