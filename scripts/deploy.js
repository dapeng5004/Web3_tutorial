//import ethers.js
//create main function

//execute main function

//导入ethers.js
const { ethers } = require("hardhat")

//异步函数才能使用await关键字
async function main() {
    //create factory  await同步等待
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

     
}


//验证合约
async function verifyFundMe(fundMeAddr, args) {
    console.log("Verifying contract on Etherscan...")

    //获取hardhat runtime environment
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
    });
}

//执行main函数li
main().then().catch((error) => {
    console.error(error)
    //异常退出进程；exit(1)——正常退出：exit(0)
    process.exit(1)
})