import express from 'express'
import { v4 as uuidV4 } from 'uuid'
import fs from 'fs'

const router = express.Router()


router.post('/url', async (req, res, next) => {
    try {
        let browser = req.app.locals.browser
        let pageId = uuidV4()
        
        let url = req.body.url
        if (!url) {
            return res.status(400).json({
                message: `url not found`
            })
        }
        let download = req.body.download || false
        let fileName = req.body.file_name || pageId

        let page = await browser.newPage()

        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 60000
        })

        let data = await page.content()

        await page.close()
        
        let savedFilePath = `public/${pageId}.html`
        if (download === true) {
            fs.writeFileSync(savedFilePath, data)

            res.download(savedFilePath, fileName + '.html')

            res.on('finish', function() {
                fs.unlink(savedFilePath, function(err) {
                    if (!err) {
                        console.log(`scrape with id ${pageId} deleted successfully`)
                    }
                })
            })
        }
        else {
            return res.send(data)
        }

    } catch (err) {
        next(err)
    }
})

export default router