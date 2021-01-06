// Maybe is not needed
// const msRest = require("@azure/ms-rest-js");
// const msRestAzure = require("@azure/ms-rest-azure-js");
// const AzureMediaServicesModels = armMediaservices.AzureMediaServicesModels;
// const AzureMediaServicesMappers = armMediaservices.AzureMediaServicesMappers;

const msRestNodeAuth = require("@azure/ms-rest-nodeauth");
const armMediaservices = require("@azure/arm-mediaservices");
const AzureMediaServices = armMediaservices.AzureMediaServices;
const { v4: uuidv4 } = require("uuid");

const MediaServAccount = require("../shared/az.mediaServ.account");
const MediaServTransforms = require("../shared/az.mediaServ.transforms");
const MediaServJobs = require("../shared/az.mediaServ.jobs");
const MediaServStreams = require("../shared/az.mediaServ.streams");

const azureMediaServResourceGroupName = "mediaServicesTest";
const azureMediaServAccountName = "mediaservicelulutube";

module.exports = async function (context, req) {
  let authReponse;
  let azMediaServInstance;
  let azMediaServAccount;
  let azMediaServTransforms;
  let azMediaServJobs;
  let azMediaServStreams;

  try {
    authReponse = await msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(
      process.env["AadClientId"],
      process.env["AadSecret"],
      process.env["AadTenantId"]
    );

    azMediaServInstance = new AzureMediaServices(
      authReponse.credentials,
      process.env["SubscriptionId"]
    );

    azMediaServAccount = new MediaServAccount(
      azMediaServInstance,
      azureMediaServResourceGroupName,
      azureMediaServAccountName
    );

    azMediaServTransforms = new MediaServTransforms(
      azMediaServInstance,
      azureMediaServResourceGroupName,
      azureMediaServAccountName,
      "Central US"
    );

    azMediaServJobs = new MediaServJobs(
      azMediaServInstance,
      azureMediaServResourceGroupName,
      azureMediaServAccountName
    );

    azMediaServStreams = new MediaServStreams(
      azMediaServInstance,
      azureMediaServResourceGroupName,
      azureMediaServAccountName
    );
  } catch (error) {
    context.res = {
      status: 400 /* Defaults to 200 */,
      body: error,
    };
    context.done();
    return;
  }

  /*******************/
  /*******************/
  // let asset = await azMediaServAccount.getAsset("testInput-helloworld_4");
  // if (asset == null) {
  //   console.log("==> asset notexist");
  //   await azMediaServAccount.createOrUpdateInputAsset(
  //     "testInput-helloworld_4" + getGUID(),
  //     {
  //       description: "Input Sample assets",
  //     }
  //   );
  // }
  // let assets = await azMediaServAccount.listAssets();
  /*******************/
  /*******************/

  /*******************/
  /*******************/

  // let presetOutputs = azMediaServTransforms.getTransformOutputs([
  //   "AdaptiveStreaming",
  // ]);

  // let transform = await azMediaServTransforms.getOrCreateTransform(
  //   "test-adbf",
  //   presetOutputs
  // );

  // let outputAsset = await azMediaServAccount.createOutputAsset(
  //   "testOutput-" + getGUID(),
  //   {
  //     description: "output Sample assets",
  //   }
  // );

  /*******************/
  /*******************/
  // let jobOutputs = await azMediaServJobs.getJobOutputs([
  //   "testOutputAsset-3a42",
  // ]);
  // let jobInput = azMediaServJobs.getJobInput("planet-mp4-20201026-110723");

  // let newJob = await azMediaServJobs.submitJob(
  //   "testJob-" + getGUID(),
  //   "test-adbf",
  //   jobInput,
  //   jobOutputs
  // );

  // let job = await azMediaServJobs.getJobState("test-adbf", "testJob-7daa");
  /*******************/
  /*******************/

  //let locatorName = "testLocatorName" + getGUID();
  // let streamLocator = await azMediaServStreams.createStreamingLocator(
  //   "testOutputAsset-3a42",
  //   locatorName,
  //   "Predefined_ClearStreamingOnly"
  // );

  let streamingUrls = await azMediaServStreams.getStreamingUrls(
    "testLocatorName894b"
  );

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: streamingUrls,
  };
};

function getGUID() {
  return uuidv4().slice(0, 4);
}
