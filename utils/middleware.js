const logger = require('./logger')

const BEARER_STR = 'bearer '

const tokenExtractor = (request, response, next) => {
  const auth = request.get('Authorization')
  request.token = (auth && auth.toLowerCase().startsWith(BEARER_STR))
    ? auth.substring(BEARER_STR.length)
    : null
  next()
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  }

  next(error)
}

module.exports = {
  errorHandler,
  tokenExtractor
}