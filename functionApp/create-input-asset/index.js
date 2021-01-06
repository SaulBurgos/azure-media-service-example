const AzureMediaAuth = require("../shared/az.mediaServ.auth");
const CONSTANTS = require("../shared/constanst");
const helpers = require("../shared/helpers.js");
const MediaServAccount = require("../shared/az.mediaServ.account");

module.exports = async function (context, req) {
  let azMediaServAccount;

  if (!req.body.name) {
    context.res = {
      status: 400,
      body: "name was not sent",
    };
    context.done();
  }

  try {
    let azMediaServInstance = await AzureMediaAuth.loginWithServicePrincipalSecretWithAuthResponse(
      process.env["AadClientId"],
      process.env["AadSecret"],
      process.env["AadTenantId"],
      process.env["SubscriptionId"]
    );

    azMediaServAccount = new MediaServAccount(
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

  let assetName = "input-" + req.body.name + "-" + helpers.getGUID(4);
  let asset = await azMediaServAccount.createOrUpdateInputAsset(assetName, {
    description: "Input Sample assets",
  });

  let assetSASUrl = await azMediaServAccount.getSASUrl(assetName);

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: {
      asset: asset,
      assetSASUrl: assetSASUrl,
    },
  };
};
