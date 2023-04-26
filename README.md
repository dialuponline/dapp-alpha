# Alpha DApp

This DApp provides the capability to browse SingularityNET Agents from the SingularityNET Registry and calling them for providing a service. The DApp utilizes SingularityNET contracts deployed on the Kovan testnet.

For acquiring Kovan AGI to use the Dapp, you can opt for the official [SingularityNET AGI Faucet](https://faucet.singularitynet.io/). And to obtain Kovan ETH for paying gas costs, kindly refer to [this repo](https://github.com/kovan-testnet/faucet).

## Service Usage Instructions
The DApp currently supports interaction with services that align with the API of the example service. This support will be extended in future by facilitating a generic mechanism for declaratively describing a service's API. In the interim, the steps [11, 14] are specific to the example service's input and output format.

Follow these steps for calling a service using the DApp:
1. Obtain [Ether](https://github.com/kovan-testnet/faucet) and [AGI](https://faucet.singularitynet.io/) on the Kovan network
2. Visit the SingularityNET alpha [dapp](http://alpha.singularitynet.io/)
3. Unlock MetaMask
4. Press the 'Create Job' button adjacent to the 'Alpha TensorFlow Agent'
5. Press the 'Create Job Contract' button present at the bottom of the 'Job' section
6. Press the 'SUBMIT' button in the 'CONFIRM TRANSACTION' box
7. Press the 'Approve AGI Transfer' button at the bottom of the 'Job' section
8. Press the 'SUBMIT' button in the 'CONFIRM TRANSACTION' box
9. Press the 'Fund Job Contract' button at the bottom of the 'Job' section
10. Press the 'SUBMIT' button in the 'CONFIRM TRANSACTION' box
11. Use the file uploader to submit an image of your choosing
12. Press the 'Call Agent API' button at the bottom of the 'Job' section
13. Press the 'Sign' button in the 'CONFIRM TRANSACTION' box
14. View the predictions and confidence level for image classification in the 'Job' section

## Development & Deployment Guide
1. Download [Node.js and npm](https://nodejs.org/)
2. Enter `npm install` for installing dependencies
3. Enter `npm run serve` for serving the application locally and watch source files for changes
4. For deployment, `npm run build` needs to be entered for building the application distributable files to the `dist` directory followed by `npm run deploy`. The target S3 Bucket for the deployment and its region are specified as command line parameters in the package.json file npm script
5. Lastly, `npm run build-analyze` and `npm run serve-dist` can optionally be used for viewing the size of the application's bundle components and serving the `dist` directory locally.