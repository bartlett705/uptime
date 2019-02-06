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

// async function queryDB(
//   logger: Logger,
//   client: Client,
//   query: string,
//   params?: any
// ) {
//   return new Promise<QueryResult | null>(async (res, _) => {
//     try {
//       logger.debug('QUERY:', query)
//       const result = await client.query(query, params)
//       if (result.rows) {
//         logger.debug(`Returning ${result.rows.length} rows`)
//       }
//       res(result)
//     } catch (err) {
//       logger.error('hrm')
//       logger.error(err)
//       res(null)
//     }
//   })
// }

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
    <h1>Mosey Systems Chaitown Uptime</h1>
    | ${uptimeOutput} |
    </body>
</html>`
