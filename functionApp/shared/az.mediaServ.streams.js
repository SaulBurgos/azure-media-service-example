const AzureMediaServicesCommon = require("./az.mediaServ.common");

class Streams extends AzureMediaServicesCommon {
  constructor(azMediaClient, resourceGroup, accountName) {
    super(azMediaClient, resourceGroup, accountName);
  }

  // https://docs.microsoft.com/en-us/javascript/api/%40azure/arm-mediaservices/streaminglocator?view=azure-node-latest#streamingPolicyName
  // you can not create 2 stream locators with the same name
  async createStreamingLocator(
    outputAssetName,
    locatorName,
    streamingPolicyName
  ) {
    //https://docs.microsoft.com/en-us/azure/media-services/latest/streaming-policy-concept
    let streamingLocator = {
      assetName: outputAssetName,
      streamingPolicyName: streamingPolicyName,
    };
    let locator;

    try {
      locator = await this.azMediaClient.streamingLocators.create(
        this.resourceGroup,
        this.accountName,
        locatorName,
        streamingLocator
      );
    } catch (error) {
      console.error(error.error.message);
    }

    return locator;
  }

  async getStreamingUrls(locatorName) {
    let streamingUrls = [];
    let streamingEndpoint = await this.getStreamingEndpoint();

    //List Paths supported by this Streaming Locator
    let paths = await this.azMediaClient.streamingLocators.listPaths(
      this.resourceGroup,
      this.accountName,
      locatorName
    );

    for (let i = 0; i < paths.streamingPaths.length; i++) {
      let path = paths.streamingPaths[i].paths[0];

      if (path) {
        streamingUrls.push("https://" + streamingEndpoint.hostName + path);
      }
    }
    return streamingUrls;
  }

  // Make sure the streaming endpoint is in the "Running" state.
  async getStreamingEndpoint(streamingEndpointName = "default") {
    return await this.azMediaClient.streamingEndpoints.get(
      this.resourceGroup,
      this.accountName,
      streamingEndpointName
    );
  }
}

module.exports = Streams;
