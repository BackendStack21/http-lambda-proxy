/* global describe, it */
'use strict'

const request = require('supertest')
const bodyParser = require('body-parser')
const expect = require('chai').expect
let gateway, proxy, gHttpServer

describe('Smoke Test Suite', () => {
  it('init proxy', async () => {
    proxy = require('../index')({
      region: 'eu-central-1',
      lambdaProxy: require('./proxy-mock')
    })

    expect(proxy instanceof Function).to.equal(true)
  })

  it('start gateway', async () => {
    // init gateway
    gateway = require('restana')()
    gateway.use(bodyParser.json())

    gateway.all('/service/*', function (req, res) {
      proxy(req, res, req.url, {})
    })

    gHttpServer = await gateway.start(8080)
  })

  it('should fail 503 on remote service unavailable', async () => {
    await request(gHttpServer)
      .get('/service/get503')
      .expect(503)
  })

  it('should 404 if 404 on remote', async () => {
    await request(gHttpServer)
      .get('/service/404')
      .expect(404)
  })

  it('should 200 on GET to valid remote endpoint', async () => {
    await request(gHttpServer)
      .get('/service/get?foo=bar')
      .expect(200)
      .then((res) => {
        expect(res.body.foo).to.equal('bar')
      })
  })

  it('should 200 on POST to valid remote endpoint', async () => {
    await request(gHttpServer)
      .post('/service/post')
      .send({ name: 'john' })
      .expect(200)
      .then((res) => {
        expect(res.body.name).to.equal('john')
      })
  })

  it('should 200 on GET /service/headers', async () => {
    await request(gHttpServer)
      .get('/service/headers')
      .expect(200)
      .then((res) => {
        expect(res.headers['x-agent']).to.equal('http-lambda-proxy')
      })
  })

  it('should 500 on GET /service/unhandled', async () => {
    await request(gHttpServer)
      .get('/service/unhandled')
      .expect(500)
      .then((res) => {
        expect(res.text).to.equal('ReferenceError:x is not defined')
      })
  })

  it('should 200 on GET /service/unformatted', async () => {
    await request(gHttpServer)
      .get('/service/unformatted')
      .expect(200)
      .then((res) => {
        expect(res.text).to.deep.equal('Hello World!')
      })
  })

  it('should 200 on GET /service/nojson', async () => {
    await request(gHttpServer)
      .get('/service/nojson')
      .expect(500)
      .then((res) => {
        res.text = 'Lambda not responded using JSON format!'
      })
  })

  it('close all', async () => {
    await gateway.close()
  })
})
