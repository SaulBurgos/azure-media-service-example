const AzureMediaServicesCommon = require("./az.mediaServ.common");

/**********Jobs operations************/
/*
- In order to apply transform we need to create a job
- A job has the location of the asset, the transform to apply and the location output
- Assets could be store on an store, a url , stream file
- You need to create the ouput before you execute the job
  - You need to create a "output assets" where all the result of transformations will be saved
  - Check that the assets don't exist with "createOrUpdate" Method
    - Doesn't exist differes between input asset and output asset, output is a empty container

States
  - Scheduled
  - Queue
  - processing
  - finished
  - cancelling
  - canceled
  - error
*/

class Jobs extends AzureMediaServicesCommon {
  timeoutSeconds = 60 * 10; //minutes
  sleepInterval = 1000 * 15;

  constructor(azMediaClient, resourceGroup, accountName) {
    super(azMediaClient, resourceGroup, accountName);
  }

  //If you submit a job with the same parameters the files will be overwritten
  async submitJob(jobName, transformName, jobInput, jobOutputs) {
    return await this.azMediaClient.jobs.create(
      this.resourceGroup,
      this.accountName,
      transformName,
      jobName,
      {
        input: jobInput,
        outputs: jobOutputs,
      }
    );
  }

  // https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.management.media.models.joboutputasset?view=azure-dotnet
  getJobOutputs(outputAssetNames = []) {
    let outputs = [];

    outputAssetNames.forEach((val) => {
      outputs.push({
        odatatype: "#Microsoft.Media.JobOutputAsset",
        assetName: val,
      });
    });

    return outputs;
  }

  //https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.management.media.models.jobinputasset?view=azure-dotnet
  getJobInput(assetName) {
    return {
      odatatype: "#Microsoft.Media.JobInputAsset",
      assetName: assetName,
    };
  }

  async getJob(transformName, jobName) {
    let job = await this.azMediaClient.jobs.get(
      this.resourceGroup,
      this.accountName,
      transformName,
      jobName
    );

    return job;
  }

  // once the job is done we can move our asset onto streaming
  // to make it public
  async getJobState(transformName, jobName) {
    let job = await this.getJob(transformName, jobName);
    return job.state;
  }

  //this can take long periods of time, a better approach would be grid events for Production scenarios
  async waitForJobToFinish(transformName, jobName) {
    let timeout = new Date();
    timeout.setSeconds(timeout.getSeconds() + this.timeoutSeconds);

    let pollForJobStatus = async () => {
      let job = await this.getJob(transformName, jobName);

      console.log(job.state);

      if (
        job.state == "Finished" ||
        job.state == "Error" ||
        job.state == "Canceled"
      ) {
        return job;
      } else if (new Date() > timeout) {
        console.log(`Job ${job.name} timed out.`);
        return job;
      } else {
        await setTimeoutPromise(this.sleepInterval, null);
        return pollForJobStatus();
      }
    };

    return await pollForJobStatus();
  }
}

module.exports = Jobs;
