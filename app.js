const express = require('express')
const path = require('path')
const uuid = require('uuid')
const puppeteer = require('puppeteer')
const fs = require('fs')



const app = express()
app.use(express.json())
app.use('/static', express.static(path.join(__dirname, 'public')))

app.get("/ping", async (req, res, next) => {
    return res.send({
        message: 'server is healthy'
    })
})

app.post("/convert", async (req, res, next) => {
    let pageId = uuid.v4()
    try {
        let url = req.body.url
        if (!url) {
            return res.status(400).json({
                message: "url is missing in request body"
            })
        }

        let browser = await puppeteer.launch(
            {
                args: [
                  '--no-sandbox',
                  '--disable-setuid-sandbox',
                ],
            }
        )
        
        let page = await browser.newPage()
        await page.goto(url, {
            waitUntil: 'networkidle2'
        })

        
        await page.pdf({
            path: `public/${pageId}.pdf`, 
            format: 'a4'
        })

        res.download(`public/${pageId}.pdf`, req.body.fileName || `${pageId}.pdf`)

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


app.use(function(error, req, res, next) {
    console.log(error)
    return res.status(500).json({
        message: 'something unexpecteedly went wrong'
    })
})


let PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log("server started at PORT " + PORT))