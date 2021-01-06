const msRestNodeAuth = require("@azure/ms-rest-nodeauth");
const armMediaservices = require("@azure/arm-mediaservices");
const AzureMediaServices = armMediaservices.AzureMediaServices;

const Auth = {
  azMediaServInstance: undefined,
  loginWithServicePrincipalSecretWithAuthResponse: async function (
    AadClientId,
    AadSecret,
    AadTenantId,
    SubscriptionId
  ) {
    try {
      if (!this.azMediaServInstance) {
        let authReponse = await msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(
          AadClientId,
          AadSecret,
          AadTenantId
        );

        this.azMediaServInstance = new AzureMediaServices(
          authReponse.credentials,
          SubscriptionId
        );
      }

      return this.azMediaServInstance;
    } catch (error) {
      console.error(error);
      throw new Error("Error on login service princial");
    }
  },
};

module.exports = Auth;
