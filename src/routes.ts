import { ChildProcess, spawn } from 'child_process'
import Koa from 'koa'
import Router from 'koa-router'
import { Logger } from './logger'

const router = new Router()

router.get('/', async (ctx: Koa.Context) => {
  const logger = ctx.state.logger as Logger
  const { response } = ctx

  const child = spawn('uptime')
  let uptimeOutput = ''
  child.stdout.on('data', (data) => {
    logger.debug(data)
    uptimeOutput = uptimeOutput.concat(data)
  })

  try {
    await promisify(child)
    response.status = 200
    response.body = template(uptimeOutput)
    logger.info('Service healthcheck call from ', JSON.stringify(ctx.ips))
    // discord.postMessage({
    //   content: `Serviced a search for: ${count} quotes.`
    // })
  } catch (err) {
    logger.error(err)
    response.status = 500
    response.body = 'Something went wrong :/'
  }
})

router.post("/post", async (ctx: Koa.Context) => {
  ctx.redirect("/foobar")
})
export const routes = router.routes()

function promisify(child: ChildProcess) {
  return new Promise((res, rej) => {
    child.on('exit', (code) => {
      if (code) {
        rej(`Exited with status ${code}`)
      } else {
        res()
      }
    })
    child.on('error', (err) => {
      rej(err)
    })
  })
}

const siteName = process.env.SITE_NAME || 'Chaitown'
const template = (uptimeOutput: string): string => `<html>
  <head>
    <title>Mosey Systems Chaitown Uptime</title>
    <style>
    body {
      background-color: #090909;
      color: #caffca;
      font-family: Tahoma, Verdana, Arial, sans-serif;
    }
    </style>
  </head>
  <body>
    <h1>Mosey Systems ${siteName} Uptime</h1>
    | ${uptimeOutput} |
    </body>
</html>`
