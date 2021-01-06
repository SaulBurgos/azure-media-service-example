const AzureMediaServicesCommon = require("./az.mediaServ.common");

/*********Transform operations*********/
/*

- Transform area steps to make transformation to your video or audio. Are reusable for any media
  EX: extract thumbnail or enconde the video

1) Define a workflow(transform) : are the rules (preset) about how to process the media
2) set where is located the media and where to write the output. this part is do it with jobs
*/

class Transforms extends AzureMediaServicesCommon {
  constructor(azMediaClient, resourceGroup, accountName, location) {
    super(azMediaClient, resourceGroup, accountName);
    this.location = location;
  }

  //https://docs.microsoft.com/en-us/javascript/api/%40azure/arm-mediaservices/transform?view=azure-node-latest
  async getOrCreateTransform(transformName, transformOutputs) {
    let transform = await this.azMediaClient.transforms.get(
      this.resourceGroup,
      this.accountName,
      transformName
    );

    // Before using a transform you need to check if exist. names are uniques
    if (typeof transform.error !== "undefined") {
      // Before update a transform should be sure is completed.
      // you shouold only update description and priority of trasforms
      // If you want change outputs transform is recommend to create a new transform and change the presets
      transform = await this.azMediaClient.transforms.createOrUpdate(
        this.resourceGroup,
        this.accountName,
        transformName,
        {
          name: transformName,
          location: this.location,
          outputs: transformOutputs,
        }
      );
    }

    return transform;
  }

  //for values visit:
  //https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.management.media.models.builtinstandardencoderpreset?view=azure-dotnet
  getTransformOutputs(presetNames = []) {
    let outputs = [];

    // Exist pre-built presets in azure
    // We can create custom presets
    presetNames.forEach((val) => {
      outputs.push({
        preset: {
          odatatype: "#Microsoft.Media.BuiltInStandardEncoderPreset",
          presetName: val,
        },
      });
    });

    return outputs;
  }
}

module.exports = Transforms;
