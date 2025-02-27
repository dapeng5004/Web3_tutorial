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

    //合约交互
    await interactFundMe(fundMe.target)
     
}

//合约交互
async function interactFundMe(fundMeAddr) { 
    //create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    //attack contract
    const fundMe = await fundMeFactory.attach(fundMeAddr)
    console.log("FundMe Contract deployed to:", fundMe.target)

    //init 2 accounts
    //0xcF4D0bd2077E4DFEf8Ad4BcC93b49bCc435da693
    //0x1a3D022C33aFb47343E842eeF9a4BC7aaa45E879

    const [funderAccount1, funderAccount2] = await ethers.getSigners()
    console.log("Funder account1:", funderAccount1.address)
    console.log("Funder account2:", funderAccount2.address)

    //call fund contract with first account
    const fundTxWithFirstAccount = await fundMe.fund({ value: ethers.parseEther("0.02") })
    await fundTxWithFirstAccount.wait()

    //check balance of contract
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
    console.log("Contract balance after firstAccount fund :", balanceOfContract.toString())
    console.log("Contract balance after firstAccount fund :", ethers.formatEther(balanceOfContract))

    //call fund contract with second account
    const fundTxWithSecondAccount = await fundMe.connect(funderAccount2).fund({ value: ethers.parseEther("0.01") })
    await fundTxWithSecondAccount.wait()

    //check balance of contract
    const balanceOfContract2 = await ethers.provider.getBalance(fundMe.target)
    console.log("Contract balance after secondAccount fund :", balanceOfContract2.toString())
    console.log("Contract balance after secondAccount fund :", ethers.formatEther(balanceOfContract2))

     // check mapping of fundersToAmount
     const firstAccountBalance = await fundMe.fundersToAmount(funderAccount1.address)
     const secondAccountBalance = await fundMe.fundersToAmount(funderAccount2.address)
     console.log("First account balance:", ethers.formatEther(firstAccountBalance.toString()))
     console.log("First account balance:", ethers.formatEther(secondAccountBalance.toString()))
 
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