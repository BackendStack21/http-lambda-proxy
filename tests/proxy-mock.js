module.exports = (params, cb) => {
  const { Payload } = params
  const { path, body, httpMethod } = JSON.parse(Payload)

  switch (httpMethod + ' ' + path) {
    case 'GET /service/get': {
      cb(null, {
        Payload: JSON.stringify({
          headers: {},
          statusCode: 200,
          body: 'Hello World!'
        }),
        StatusCode: 200
      })

      break
    }
    case 'GET /service/get503': {
      const err = new Error()
      err.statusCode = 404
      err.message = 'Function not found: arn:aws:lambda:eu-central-1:432504443338:function:functon-name'

      cb(err)

      break
    }
    case 'POST /service/post': {
      cb(null, {
        Payload: JSON.stringify({
          headers: {
            'content-type': 'application/json'
          },
          statusCode: 200,
          body: JSON.stringify(body)
        }),
        StatusCode: 200
      })

      break
    }
    case 'GET /service/headers': {
      cb(null, {
        Payload: JSON.stringify({
          statusCode: 200,
          headers: {
            'x-agent': 'http-lambda-proxy'
          }
        }),
        StatusCode: 200
      })
      break
    }
    case 'GET /service/unhandled': {
      cb(null, {
        FunctionError: 'Unhandled',
        Payload: JSON.stringify({
          errorType: 'ReferenceError',
          errorMessage: 'x is not defined'
        }),
        StatusCode: 200
      })
      break
    }
    case 'GET /service/unformatted': {
      cb(null, {
        Payload: JSON.stringify({}),
        StatusCode: 200
      })
      break
    }
    case 'GET /service/nojson': {
      cb(null, {
        Payload: '',
        StatusCode: 200
      })
      break
    }
    default: {
      const err = new Error()
      err.statusCode = 404
      err.message = 'Not found!'

      cb(err)
    }
  }
}
