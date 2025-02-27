const { task } = require("hardhat/config")
// const { ethers } = require("hardhat")

task("interact-fundme", "interact with fundme contract")
    .addParam("fundmeaddress", "fundme contract address")
    .setAction(async (taskArgs, hre) => {

        //create factory
        const fundMeFactory = await ethers.getContractFactory("FundMe")
        //attack contract
        const fundMe = await fundMeFactory.attach(taskArgs.fundmeaddress)
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
        console.log("First account balance:", firstAccountBalance.toString())
        console.log("First account balance:", ethers.formatEther(firstAccountBalance.toString()))
        console.log("Second account balance:", secondAccountBalance.toString())
        console.log("Second account balance:", ethers.formatEther(secondAccountBalance.toString()))

    })

module.exports = {};


