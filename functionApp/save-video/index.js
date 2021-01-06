const AzureTables = require("@azure/data-tables");
const helpers = require("../shared/helpers.js");
const account = "mediasrvstoragelulutube";
const sas =
  "?sv=2019-12-12&ss=fqt&srt=sco&sp=rwdlacup&se=2021-01-03T04:32:47Z&st=2020-11-29T20:32:47Z&spr=https&sig=96lM2xkgigPRKyq3CHZQHAY4S2uOSV9rA0X2QbAWidk%3D";

const serviceClientWithSAS = new AzureTables.TableServiceClient(
  `https://${account}.table.core.windows.net${sas}`
);

const clientWithSAS = new AzureTables.TableClient(
  `https://${account}.table.core.windows.net${sas}`,
  "videos"
);

//https://azuresdkdocs.blob.core.windows.net/$web/javascript/azure-data-tables/1.0.0-beta.3/index.html
module.exports = async function (context, req) {
  // https://docs.microsoft.com/en-us/rest/api/storageservices/understanding-the-table-service-data-model
  let result = await clientWithSAS.createEntity({
    partitionKey: "lop5", //can be the same
    rowKey: helpers.getGUID(4),
    jobName: req.body.jobName,
    streamingLocatorName: req.body.streamingLocatorName,
    name: req.body.name,
  });

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: result,
  };
};
