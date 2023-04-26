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
6. Press the 'SUB