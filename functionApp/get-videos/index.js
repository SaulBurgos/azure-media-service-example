const AzureTables = require("@azure/data-tables");
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
  let videoEntities = [];
  let entitiesIter = clientWithSAS.listEntities();
  let entityItem = await entitiesIter.next();

  while (!entityItem.done) {
    videoEntities.push({
      rowKey: entityItem.value.rowKey,
      jobName: entityItem.value.jobName,
      streamingLocatorName: entityItem.value.streamingLocatorName,
      name: entityItem.value.name,
      timestamp: entityItem.value.timestamp,
    });
    entityItem = await entitiesIter.next();
  }

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: {
      videos: videoEntities,
    },
  };
};
