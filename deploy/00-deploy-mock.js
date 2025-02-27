const { DECIMAL, INITIAL_PRICE, DEVELOPMENT_CHAINS } = require('../helper-hardhat.config');

module.exports = async ({ getNamedAccounts, deployments }) => {

    if (DEVELOPMENT_CHAINS.includes(network.name)) {

        const { firstAccount } = await getNamedAccounts();
        const { deploy } = deployments;

        console.log('Deploying the Mock contract...');
        //deploy the contract
        await deploy("MockV3Aggregator", {
            from: firstAccount,
            args: [DECIMAL, INITIAL_PRICE],
            log: true
        })
    } else {
        console.log("Network is not local, mock contract deployment is skipped")
    }

}
//add tag to the contract
module.exports.tags = ["all", "mock"]