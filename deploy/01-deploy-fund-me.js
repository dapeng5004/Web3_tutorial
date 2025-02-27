// function deployFunction(){
//     console.log('Deploying the contract!');
// }
// module.exports.default = deployFunction;


//简写
// module.exports = async (hre) => {
//     const getNamedAccounts = hre.getNamedAccounts;
//     const deployments = hre.deployments
//     console.log('Deploying the contract!');

//     const firstAccount = (await getNamedAccounts()).firstAccount;
//     const deploy = deployments.deploy;
// }

const { network } = require("hardhat");
const { NetwotConfig, DEVELOPMENT_CHAINS, LOCK_TIME, WAIT_CONFIRMATIONS } = require('../helper-hardhat.config');

module.exports = async ({ getNamedAccounts, deployments }) => {

    const { firstAccount } = await getNamedAccounts();
    const { deploy } = deployments;
    console.log("firstAccount: ", firstAccount)
    //get the dataFeed address
    let dataFeedAddress
    let waitConfirmations
    //check if the network is local
    if (DEVELOPMENT_CHAINS.includes(network.name)) {
        const mockV3Aggregator = await deployments.get("MockV3Aggregator")
        dataFeedAddress = mockV3Aggregator.address
        waitConfirmations=0
    } else {
        dataFeedAddress = NetwotConfig[network.config.chainId].ethUsdDataFeed
        waitConfirmations=WAIT_CONFIRMATIONS
    }
    console.log("dataFeedAddress: ", dataFeedAddress)
    console.log('Deploying the FundMe contract...');

    //deploy the contract
    const fundMe = await deploy("FundMe", {
        from: firstAccount,
        args: [LOCK_TIME, dataFeedAddress],
        log: true,
        waitConfirmations: waitConfirmations, //等待5个区块
    })

    //remove deployments directory or run npx hardhat deoloy --reset if you want redeploy contract
    //verify the contract
    if (network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        //获取hardhat runtime environment
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCK_TIME, dataFeedAddress],
        });

    } else {
        console.log("Network is not sepolia, skipping verification")
    }
}
//add tag to the contract
module.exports.tags = ["all", "fundme"]