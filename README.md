# http-lambda-proxy
Proxy HTTP requests to AWS Lambda.  

Requests format are compatible with the `serverless-http` module, allowing developers to run downstream REST/HTTP services inside lambda funtions as well.

## Install
```js
npm i http-lambda-proxy
```

## Usage
The following examples describe how to use `http-lambda-proxy` with `restana`:
```js
const lambdaProxy = require('http-lambda-proxy')
const proxy = lambdaProxy({
  target: process.env.FUNCTION_NAME,
  region: process.env.AWS_REGION
})

const service = require('restana')()
service.all('/*', (req, res) => { 
  proxy(req, res, req.url, {}))
}) 

service.start(8080)
```
> In this example, we proxy all http requests on port 8080 to 
an AWS Lambda.

## API
### Options
#### `region *`
Set the AWS Region of the target downstream lambda.
#### `target *`
AWS Lambda funcion name, version, or alias.
#### logType
Set to "Tail" to include the execution log in the response. Default: "None"
#### qualifier
Specify a version or alias to invoke a published version of the function.
#### clientContext 
Up to 3583 bytes of base64-encoded data about the invoking client to pass to the function in the context object.
#### lambdaProxy
Function wrapper to AWS Lambda invocation proxy. Allows to overwrite default implementation.
> Any other AWS.Lambda constructor option is allowed: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html

---
More details on `aws-sdk / lambda / invoke`: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#invoke-property

## Proxying 
```js
proxy(
  originReq,                          // http.IncomingMessage 
  originRes,                          // http.ServerResponse
  req.url,                            // Request URL
  {}                                  // Options described below
)
```
### Options
#### onResponse(req, res, response)
Called when the remote lambda response is received. If defined, default behavior is overwritten. 

#### rewriteHeaders(headers)
Called to rewrite the headers of the response, before them being copied over to the outer response. It must return the new headers object.

## Supported response formats
The following alternatives describe the supported response formats:
- Ideally, your lambda function is implemented using the [serverless-http module](https://github.com/dougmoscrop/serverless-http)
- Your lambda respond using a JSON Payload with the following format:
  ```json
  {
    "headers": {
      ...
    },
    "statusCode": 200,
    "body": ...
  }
  ```
- Your lambda respond with a JSON Payload:
  ```js
  exports.handler = async function () {
    return JSON.stringigy({})
  }
  ```

## Related topics
- fast-gateway: https://www.npmjs.com/package/fast-gateway
- fast-proxy: https://www.npmjs.com/package/fast-proxy

## License
MIT

## Sponsors
- Kindly sponsored by [ShareNow](https://www.share-now.com/), a company that promotes innovation! 