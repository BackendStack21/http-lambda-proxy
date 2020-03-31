const AWS = require('aws-sdk')
const URL = require('fast-url-parser')

const invocationType = 'RequestResponse'

module.exports = ({
  region, // lambda AWS region
  target, // the name of the Lambda function, version, or alias.
  logType = 'None', // set to "Tail" to include the execution log in the response
  qualifier, // specify a version or alias to invoke a published version of the function
  clientContext, // up to 3583 bytes of base64-encoded data about the invoking client to pass to the function in the context object
  lambdaProxy = getLambdaProxy(region) // AWS lambda invocation proxy
}) => {
  return (req, res, url, opts) => {
    const onResponse = opts.onResponse
    const rewriteHeaders = opts.rewriteHeaders || headersNoOp
    const { _query, pathname } = URL.parse(url, true)

    const params = {
      ClientContext: clientContext,
      FunctionName: target,
      LogType: logType,
      InvocationType: invocationType,
      Qualifier: qualifier,
      Payload: JSON.stringify({
        headers: req.headers,
        body: req.body,
        httpMethod: req.method,
        path: pathname,
        isBase64Encoded: false,
        queryStringParameters: _query
      })
    }

    lambdaProxy(params, (err, response) => {
      if (err) {
        res.statusCode = err.statusCode
        res.end(err.message)
      } else {
        const { headers, statusCode, body } = JSON.parse(response.Payload)
        copyHeaders(
          rewriteHeaders(headers),
          res
        )

        if (onResponse) {
          onResponse(req, res, response)
        } else {
          res.statusCode = statusCode
          res.end(body)
        }
      }
    })
  }
}

function copyHeaders (headers, res) {
  const headersKeys = Object.keys(headers)

  let header
  let i
  for (i = 0; i < headersKeys.length; i++) {
    header = headersKeys[i]
    if (header.charCodeAt(0) !== 58) { // fast path for indexOf(':') === 0
      res.setHeader(header, headers[header])
    }
  }
}

function headersNoOp (headers) {
  return headers
}

function getLambdaProxy (region) {
  const lambda = new AWS.Lambda({
    region
  })

  return (params, cb) => lambda.invoke(params, cb)
}
