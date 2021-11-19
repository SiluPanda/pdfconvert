import express from 'express'
import path  from 'path'
import puppeteer from 'puppeteer'
import pdfRouter from './routes/pdfRouter.js'
import screenshotRouter from './routes/screenshotRouter.js'
const __dirname = path.resolve()


const app = express()
app.use(express.json())
app.use('/static', express.static(path.join(__dirname, 'public')))
let browser = await puppeteer.launch({
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    timeout: 40000
})

app.locals.browser = browser

app.get("/ping", async (req, res, next) => {
    return res.send({
        message: 'server is healthy'
    })
})

app.use('/pdf', pdfRouter)
app.use('/screenshot', screenshotRouter)

app.use(function(error, req, res, next) {
    console.log(error)
    return res.status(500).json({
        message: 'something unexpectedly went wrong'
    })
})


let PORT = process.env.PORT || 5001
app.listen(PORT, () => {
    console.log("server started at PORT " + PORT)
})