const URL = require("url");
const { v4: uuidv4 } = require("uuid");
const AzureMediaServicesCommon = require("./az.mediaServ.common");

class MediaServAccount extends AzureMediaServicesCommon {
  constructor(azMediaClient, resourceGroup, accountName) {
    super(azMediaClient, resourceGroup, accountName);
  }

  //return a container
  async getAsset(assetName) {
    let asset = await this.azMediaClient.assets.get(
      this.resourceGroup,
      this.accountName,
      assetName
    );

    if (typeof asset.error !== "undefined") {
      return null;
    } else {
      return asset;
    }
  }

  async createUpdateAsset(assetName, assetProperties) {
    //https://docs.microsoft.com/en-us/javascript/api/%40azure/arm-mediaservices/asset?view=azure-node-latest
    return await this.azMediaClient.assets.createOrUpdate(
      this.resourceGroup,
      this.accountName,
      assetName,
      assetProperties
    );
  }

  // this create a container empty in storage for the asset, later you can use it to upload a file
  // reference it to download it
  // in mediaServices you will see the assetName but in storage you see a GUID this is the Storage link
  async createOrUpdateInputAsset(assetName, assetProperties) {
    let asset = await this.getAsset(assetName);

    if (!asset) {
      //https://docs.microsoft.com/en-us/javascript/api/%40azure/arm-mediaservices/asset?view=azure-node-latest
      asset = await this.createUpdateAsset(assetName, assetProperties);
    }

    return asset;
  }

  async createOutputAsset(assetName, assetProperties) {
    let asset = await this.getAsset(assetName);

    if (asset) {
      //assets exist, change name to avoid conflicts
      assetName = assetName + "-" + uuidv4().slice(0, 4);
    }

    //https://docs.microsoft.com/en-us/javascript/api/%40azure/arm-mediaservices/asset?view=azure-node-latest
    asset = await this.createUpdateAsset(assetName, assetProperties);
    return asset;
  }

  async deleteAsset(assetName) {
    await this.azMediaClient.assets.deleteMethod(
      this.resourceGroup,
      this.accountName,
      assetName
    );
  }

  // Get back a response that contains SAS URL for the asset container to uploading and downloading a blob
  async getSASUrl(assetName) {
    let date = new Date();
    date.setHours(date.getHours() + 5);

    let input = {
      permissions: "ReadWrite",
      expiryTime: date,
    };

    let response = await this.azMediaClient.assets.listContainerSas(
      this.resourceGroup,
      this.accountName,
      assetName,
      input
    );

    if (response.assetContainerSasUrls[0]) {
      return URL.parse(response.assetContainerSasUrls[0]);
    } else {
      return null;
    }
  }

  // retun an assetsCollection
  // https://docs.microsoft.com/en-us/javascript/api/%40azure/arm-mediaservices/assetcollection?view=azure-node-latest
  async listAssets() {
    return await this.azMediaClient.assets.list(
      this.resourceGroup,
      this.accountName
    );
  }

  // no test yet
  // the container name is the assets created in media services
  async uploadFile(sasUri) {
    let sharedBlobService = azureStorage.createBlobServiceWithSas(
      sasUri.host,
      sasUri.search
    );
    let containerName = sasUri.pathname.replace(/^\/+/g, "");
    let randomInt = Math.round(Math.random() * 100);
    blobName = fileName + randomInt;

    console.log("uploading to blob...");

    function createBlobPromise() {
      return new Promise(function (resolve, reject) {
        sharedBlobService.createBlockBlobFromLocalFile(
          containerName,
          blobName,
          fileToUpload,
          resolve
        );
      });
    }
    await createBlobPromise();
    return asset;
  }
}

module.exports = MediaServAccount;
