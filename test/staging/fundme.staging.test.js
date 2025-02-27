//集成测试
const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

const { DEVELOPMENT_CHAINS } = require("../../helper-hardhat.config")

// Before running the test, make sure to deploy the contract first

DEVELOPMENT_CHAINS.includes(network.name)
    ? describe.skip
    : describe("FundMe Contract Test", async function () {

        let fundMe
        let firstAccount
        //deploy the contract before each test
        beforeEach(async function () {
            //deploy contracts tags of "all"
            await deployments.fixture(["all"])
            firstAccount = (await getNamedAccounts()).firstAccount
            //get the deployed contract
            const fundMeDeployment = await deployments.get("FundMe")

            //get the contract with the first account
            fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)

        })

        //test fund and getFund success
        it("fund and getFund success",
            async function () {
                //make sure target reached
                await fundMe.fund({ value: ethers.parseEther("0.02") })   //0.02*3000=60
                //make sure the window is close
                await new Promise(resolve => setTimeout(resolve, 200 * 1000))  // 200 seconds > 180 seconds

                //make sure we can get the receipt
                const fundTx = await fundMe.getFund();
                const fundReceipt = await fundTx.wait();
                console.log("fundReceipt: ", fundReceipt)
                expect(fundReceipt)
                    .to.be.emit(fundMe, "FundWithdrawByOwner")
                    .withArgs(ethers.parseEther("0.02"))

            })

        //test fund and reFund success
        it("fund and reFund success",
            async function () {
                //make sure target not reached
                await fundMe.fund({ value: ethers.parseEther("0.01") })   //0.01*3000=30
                //make sure the window is close
                await new Promise(resolve => setTimeout(resolve, 200 * 1000))  // 200 seconds > 180 seconds

                //make sure we can get the receipt
                const refundTx = await fundMe.reFund();
                const refundReceipt = await refundTx.wait();

                console.log("refundReceipt: ", refundReceipt)

                expect(refundReceipt)
                    .to.be.emit(fundMe, "RefundByFunder")
                    .withArgs(firstAccount, ethers.parseEther("0.01"))

            })
    })