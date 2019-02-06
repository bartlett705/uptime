import chalk from 'chalk'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import { BuildType, config } from './config'
import { Logger, requestLoggerMiddleware } from './logger'
import { routes } from './routes'

const logger = new Logger(config.logLevel)
const app = new Koa()
app.proxy = true

const rateLimiterOpts = {
  duration: 30, // Time to reset
  points: 3
}

const rateLimiter = new RateLimiterMemory(rateLimiterOpts)

app.use(async (ctx, next) => {
  try {
    const res = await rateLimiter.consume(ctx.ip, ctx.query.count || 1)
    logger.debug(
      `${ctx.ip} consumed ${ctx.query.count || 1} point(s), ${
        res.remainingPoints
      } remaining, ${res.msBeforeNext}ms to reset.`
    )
    await next()
  } catch (rejRes) {
    ctx.status = 429
    ctx.body = 'Slow down there, cowboy 😛'
  }
})

app.use(
  bodyParser({
    onerror(err, ctx) {
      logger.error('Body Parser shat:', err)
      ctx.throw('body parse error', 422)
    }
  })
)

app.use(requestLoggerMiddleware(logger))

app.use(routes)
app.listen(config.port)

logger.warn('hi yall ^_^')
console.log(
  chalk.greenBright(`uptime backend is running on port ${config.port} | `),
  chalk.greenBright('build type:'),
  config.buildType === BuildType.Production
    ? chalk.redBright('PROD')
    : chalk.yellowBright(config.buildType)
)
