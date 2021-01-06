const AzureMediaAuth = require("../shared/az.mediaServ.auth");
const CONSTANTS = require("../shared/constanst");
const MediaServJobs = require("../shared/az.mediaServ.jobs");

module.exports = async function (context, req) {
  let azMediaServJobs;

  try {
    let azMediaServInstance = await AzureMediaAuth.loginWithServicePrincipalSecretWithAuthResponse(
      process.env["AadClientId"],
      process.env["AadSecret"],
      process.env["AadTenantId"],
      process.env["SubscriptionId"]
    );

    azMediaServJobs = new MediaServJobs(
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

  let state = await azMediaServJobs.getJobState(
    req.query.transformName,
    req.query.jobName
  );

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: {
      state: state,
    },
  };
};
