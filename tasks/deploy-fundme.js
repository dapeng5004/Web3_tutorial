/**
 * 创建task
 * 1、引入task关键字
 * const { task } = require("hardhat/config")
 * 2、创建task()
 * task("taskname").setAction(async (taskArgs, hre) => { }
 * 3、导出task
 * module.exports = {}
 */
// const { ethers } = require("hardhat")
const { task } = require("hardhat/config");

task("deploy-fundme", "deploy and vertify fundme contract").setAction(async (taskArgs, hre) => {
    //create factory 
    const factory = await ethers.getContractFactory("FundMe")
    console.log("Deploying contract...")
    // deploy contract from the factory
    const fundMe = await factory.deploy(300)
    //等待合约部署完成
    await fundMe.waitForDeployment()
    console.log("Contract deployed to:", fundMe.target)

    //verify fundMe contract on Etherscan
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waitting for 5 confirmations...")
        //等待5个区块
        await fundMe.deploymentTransaction().wait(5)
        await verifyFundMe(fundMe.target, [300])
    } else {
        console.log("Etherscan verification skipped...")
    }
})

//验证合约
async function verifyFundMe(fundMeAddr, args) {
    console.log("Verifying contract on Etherscan...")

    //获取hardhat runtime environment
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
    });
}

module.exports = {};
