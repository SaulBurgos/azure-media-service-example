# Youtube clone with Azure media service

## Project structure

- **functionApp** folder: Azure function in Nodejs that use the SDK to create and process video
- **app** folder: Angular project that made request to Azure function to list videos and upload them to Azure media services

This is a very simple example of a Youtube clone using azure media services. You need to create first:

1. Resource group
2. Azure media service
3. Storage account
4. Azure function

Once you have all the those resources you need to create an AD Service principle with this command on Azure console:

`az ams account sp create --account-name your-mediaservice-name --resource-group your-resource-group`

- Replace **"your-mediaservice-name"** with the name of your azure media service
- Replace **"your-resource-group"** with the name of the resource group where is locate your azure media service.

You will the credentials of you AD service principle that the SDK need to authenticate requests. it look will look something like this:

```json
{
  "AadClientId": "11118103-2222-1111-5688-684af4dad18f",
  "AadEndpoint": "https://login.microsoftonline.com",
  "AadSecret": "111111-52648t-tt66-5689-6fgh29f32c751",
  "AadTenantId": "22222-45986-we56-15rt-b0faf8d6d5ca",
  "AccountName": "mediaservicenametest",
  "ArmAadAudience": "https://management.core.windows.net/",
  "ArmEndpoint": "https://management.azure.com/",
  "Region": "Central US",
  "ResourceGroup": "mediaServicesTest",
  "SubscriptionId": "3333333-09c2-4tyd-fg44-c156608cd765"
}
```

Use that information to replace the values on the Azure function file "local.settings.json" in the folder
"FunctionApp".

Well that is all. You only need to run the angular project with "npm run start" and the azure function.

## Additional information:

- [Azure media services overview](https://www.youtube.com/watch?v=ZDBCGP0j_Bw)
- [Media player for test](https://ampdemo.azureedge.net/)
- [How to live stream](https://www.youtube.com/watch?v=IKdOiVlLW90)
- [Azure media services API Overview](https://docs.microsoft.com/en-us/azure/media-services/latest/media-services-apis-overview)
- [Azure media services API reference](https://docs.microsoft.com/en-us/rest/api/media/)
- [Azure media services SDK Javascript](https://www.npmjs.com/package/@azure/arm-mediaservices)
- [Library provides different node.js based authentication mechanisms for services in Azure](https://www.npmjs.com/package/@azure/ms-rest-nodeauth)
- [Postman collection and Environment variables to test drive the new v3 REST API](https://github.com/Azure-Samples/media-services-v3-rest-postman)
- [Official Azure media service code examples](https://github.com/Azure-Samples/media-services-v3-node-tutorials)
