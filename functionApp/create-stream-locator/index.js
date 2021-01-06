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

  let streamLocator = await azMediaServStreams.createStreamingLocator(
    req.body.outputAssetName,
    req.body.outputAssetName.replace("output", "locator"),
    req.body.streamingPolicyName
  );

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: streamLocator,
  };
};
