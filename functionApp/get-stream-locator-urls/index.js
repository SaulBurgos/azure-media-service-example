const AzureMediaAuth = require("../shared/az.mediaServ.auth");
const CONSTANTS = require("../shared/constanst");
const MediaServStreams = require("../shared/az.mediaServ.streams");

module.exports = async function (context, req) {
  let azMediaServStreams;

  try {
    let azMediaServInstance = await AzureMediaAuth.loginWithServicePrincipalSecretWithAuthResponse(
      process.env["AadClientId"],
      process.env["AadSecret"],
      process.env["AadTenantId"],
      process.env["SubscriptionId"]
    );

    azMediaServStreams = new MediaServStreams(
      azMediaServInstance,
      CONSTANTS.azureMediaServResourceGroupName,
      CONSTANTS.azureMediaServAccountName
    );
  } catch (error) {
    context.res = {
      status: 400 /* Defaults to 200 */,
      body: error,
    };
    context.done();
    return;
  }

  let streamingUrls = await azMediaServStreams.getStreamingUrls(
    req.query.streamingLocatorName
  );

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: streamingUrls,
  };
};
