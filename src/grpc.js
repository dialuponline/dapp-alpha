const { ChunkParser, ChunkType } = require("grpc-web-client/dist/ChunkParser") 

export function grpcJSONRequest(host, packageName, serviceName, methodName, requestHeaders, requestObject) {
  const service = [ packageName, serviceName ].filter(Boolean).join(".")
  return window.fetch(`${host}/${service}/${methodName}`, {
    "method": "POST",
    "headers": Object.assign(
      {},
      {
        "content-type": "application/grpc-web+json",
        "x-grpc-web": "1"
      },
      requestHeaders
    ),
    "body": frameRequest(Buffer.from(JSON.stringify(requestObject)))
  })
    .then(response => response.arrayBuffer())
    .then(buffer => {
      return grpcJSONResponseToString(buffer)
    })
    .catc