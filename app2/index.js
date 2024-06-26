const { createClient } = require('@commercetools/sdk-client');
const { createAuthMiddlewareForClientCredentialsFlow } = require('@commercetools/sdk-middleware-auth');
const { createHttpMiddleware } = require('@commercetools/sdk-middleware-http');
const { createApiBuilderFromCtpClient } = require('@commercetools/platform-sdk');
const fetch = require('node-fetch');
const fs = require('fs');

function initializeClientInstance() {
  const projectKey = process.env.CTP_PROJECT_KEY;

  const opt = {
    host: 'https://auth.europe-west1.gcp.commercetools.com/',
    projectKey,
    credentials: {
      clientId: process.env.CTP_CLIENT_ID,
      clientSecret: process.env.CTP_CLIENT_SECRET,
    },
    fetch,
    scopes: [`manage_project:${projectKey}`]
    // scopes: process.env.CT_SCOPE.split(' '),
  }
  console.log(opt, projectKey, ">>>")
  const authMiddleware = createAuthMiddlewareForClientCredentialsFlow(opt);

  const httpMiddleware = createHttpMiddleware({
    host: 'https://api.europe-west1.gcp.commercetools.com/',
    fetch,
  });

  const client = createClient({
    middlewares: [authMiddleware, httpMiddleware],
    // middlewares: [httpMiddleware]
  });

  return createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
}

async function main() {
  const output = []
  const ctClient = initializeClientInstance();
  for (let k = 0; k < 100; k += 1) {
    const time = Date.now();
    const r = await ctClient.products().withKey({ key: '630a4cdc-118c-11ed-861d-0242ac120002' }).get().execute();

    // console.log({ took: Date.now() - time, status: r.statusCode });
    output.push({ took: Date.now() - time, status: r.statusCode })
  }

  return output
}

main().then(result => {
  fs.writeFile('./.data/result2.json', JSON.stringify(result), { encoding: 'utf-8' }, function (error) {
    if (error) throw error
    console.log("done")
  });
});
