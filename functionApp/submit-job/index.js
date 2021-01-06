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

  let jobOutputs = await azMediaServJobs.getJobOutputs([
    req.body.outputAssetName,
  ]);
  let jobInput = azMediaServJobs.getJobInput(req.body.inputAssetName);

  let newJob = await azMediaServJobs.submitJob(
    req.body.inputAssetName.replace("input", "job"), // we keep the same GUID of the input asset to be able to be consisten
    req.body.transformName,
    jobInput,
    jobOutputs
  );

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: newJob,
  };
};
