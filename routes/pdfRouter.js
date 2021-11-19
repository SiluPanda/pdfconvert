import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

let router = express.Router()


router.post('/url', async (req, res, next) => {
    let browser = req.app.locals.browser

    let pageId = uuidv4()
    try {
        let url = req.body.url
        if (!url) {
            return res.status(400).json({
                message: "url is missing in request body"
            })
        }

        let page = await browser.newPage()
        await page.goto(url, {
            waitUntil: 'networkidle2'
        })

        
        await page.pdf({
            path: `public/${pageId}.pdf`, 
            format: 'a4'
        })
        await page.close()

        res.download(`public/${pageId}.pdf`, req.body.file_name || `${pageId}.pdf`)

        res.on('finish', function() {
            fs.unlink(`public/${pageId}.pdf`, (err) => {
                if (!err) {
                    console.log(`pdf with id ${pageId} is deleted successfully`)
                }
            })
            
        })


    } catch (error) {
        next(error)
    }
})

export default router

