'use strict'
require('dotenv').config()

const proxy = require('../index')({
  target: process.env.FUNCTION_NAME,
  region: process.env.AWS_REGION
})

const service = require('restana')()
service.all('/*', (req, res) => proxy(req, res, req.url, {}))

service.start(8080)
