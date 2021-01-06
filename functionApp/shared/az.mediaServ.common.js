class AzureMediaServicesCommon {
  constructor(azMediaClient, resourceGroup, accountName) {
    this.azMediaClient = azMediaClient;
    this.accountName = accountName;
    this.resourceGroup = resourceGroup;
  }
}

module.exports = AzureMediaServicesCommon;
