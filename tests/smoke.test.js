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
      .get('/service/get')
      .expect(200)
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

  it('close all', async () => {
    await gateway.close()
  })
})
