//单元测试
const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { DEVELOPMENT_CHAINS } = require("../../helper-hardhat.config")

// Before running the test, make sure to deploy the contract first

!DEVELOPMENT_CHAINS.includes(network.name)
    ? describe.skip
    : describe("FundMe Contract Test", async function () {

        let fundMe
        let firstAccount
        let fundMeSecond
        let secondAccount
        let mockV3Aggregator
        //deploy the contract before each test
        beforeEach(async function () {
            //deploy contracts tags of "all"
            await deployments.fixture(["all"])
            firstAccount = (await getNamedAccounts()).firstAccount
            secondAccount = (await getNamedAccounts()).secondAccount
            //get the deployed contract
            const fundMeDeployment = await deployments.get("FundMe")
            mockV3Aggregator = await deployments.get("MockV3Aggregator")

            //get the contract with the first account
            fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
            //get the contract with the second account
            fundMeSecond = await ethers.getContract("FundMe", secondAccount)
        })

        it("test if the owner is msg.sender", async function () {

            //deploy the contract
            // const [firstAccount] = await ethers.getSigners()
            // const fundMeFactory = await ethers.getContractFactory("FundMe")
            // const fundMe = await fundMeFactory.deploy(300)
            await fundMe.waitForDeployment()
            assert.equal((await fundMe.owner()), firstAccount)
            // expect(await fundMe.owner()).to.equal(firstAccount.address)
        })


        it("test if the dataFeed is assigned correctly", async function () {
            // const FundMe = await ethers.getContractFactory("FundMe")
            // const fundMe = await FundMe.deploy(300)
            await fundMe.waitForDeployment()
            // assert.equal(await fundMe.dataFeed(), "0x694AA1769357215DE4FAC081bf1f309aDC325306")
            assert.equal(await fundMe.dataFeed(), mockV3Aggregator.address)
        })

        //test fund getFund reFund function

        //unit test for fund
        //window open,value bigger than minimum value,funder balance increase
        it("window close, value bigger than minimum , fund failed",
            async function () {
                //make sure the window is close
                await helpers.time.increase(200)
                await helpers.mine()

                //value is bigger than minimum value
                await expect(fundMe.fund({ value: ethers.parseEther("0.1") }))
                    .to.be.revertedWith("fund window has closed")
            })

        //window open,value smaller than minimum value,fund failed
        it("window open, value smaller than minimum , fund failed",
            async function () {
                // make sure the window is open
                // await helpers.time.increase(100)
                // await helpers.mine()

                //value is smaller than minimum value
                await expect(fundMe.fund({ value: ethers.parseEther("0.001") })).to.be.revertedWith("Send More ETH")
            })

        //window open,value bigger than minimum value,fund success
        it("window open, value bigger than minimum , fund success",
            async function () {
                //value is bigger than minimum value
                await fundMe.fund({ value: ethers.parseEther("0.01") })

                // make sure the window is close
                await helpers.time.increase(200)
                await helpers.mine()

                // const balance = await fundMe.fundersToAmount(firstAccount)
                // expect(balance).to.equal(ethers.parseEther("0.1"))

                //check the balance of the funder
                assert.equal(await fundMe.fundersToAmount(firstAccount), ethers.parseEther("0.01"))
            })

        //unit test for getFund
        //onlyOwner, windowClosed, targetReached

        //not owner, getFund failed
        it("not owner, window closed, target reached, getFund failed",
            async function () {
                //not owner
                //use firstAccount to fund
                //use secondAccount to call getFund

                //make sure the target is reached
                await fundMe.fund({ value: ethers.parseEther("0.1") })
                // make sure the window is close
                await helpers.time.increase(200)
                await helpers.mine()
                //use secondAccount to call getFund
                await expect(fundMeSecond.getFund()).to.be.revertedWith("this function can only be called by owner")
            })

        // window open, getFund failed
        it("window open, target reached, getFund failed",
            async function () {
                //make sure the target is reached
                await fundMe.fund({ value: ethers.parseEther("0.1") })
                //make sure  owner  call getFund
                await expect(fundMe.getFund()).to.be.revertedWith("Fund is not finished")
            })

        //target not reached, getFund failed
        it("window closed, target not reached, getFund failed",
            async function () {
                // target is not reached
                await fundMe.fund({ value: ethers.parseEther("0.01") })
                //make sure the window is close
                await helpers.time.increase(200)
                await helpers.mine()
                //make sure  owner  call getFund
                await expect(fundMe.getFund()).to.be.revertedWith("target is not reached")
            })

        //getFund success
        it("window closed, target reached, getFund success",
            async function () {
                //make sure the target is reached
                await fundMe.fund({ value: ethers.parseEther("1") })
                //make sure the window is close
                await helpers.time.increase(200)
                await helpers.mine()
                //make sure  owner  call getFund
                await expect(fundMe.getFund())
                    .to.emit(fundMe, "FundWithdrawByOwner")
                    .withArgs(ethers.parseEther("1"))
                //check the balance of the funder
                // assert.equal(await fundMe.fundersToAmount(firstAccount), 0)
            })

        //unit test for reFund
        // windowClosed, targetNotReached, funder has balance
        it("window open, target not reached, funder has balance, reFund failed",
            async function () {
                //make sure the target is not reached
                await fundMe.fund({ value: ethers.parseEther("0.01") })

                //call reFund
                await expect(fundMe.reFund())
                    .to.revertedWith("Fund is not finished")
            })

        // window closed, target reached, funder has balance
        it("window closed, target reached, funder has balance, reFund failed",
            async function () {
                //make sure the target is reached
                await fundMe.fund({ value: ethers.parseEther("1") })
                //make sure the window is close
                await helpers.time.increase(200)
                await helpers.mine()
                //call reFund
                await expect(fundMe.reFund())
                    .to.revertedWith("Target is reached")
            })

        // window closed, target not reached, funder has no balance
        it("window closed, target not reached, funder has no balance, reFund failed",
            async function () {
                //make sure the target is not reached
                await fundMe.fund({ value: ethers.parseEther("0.01") })

                //make sure the window is close
                await helpers.time.increase(200)
                await helpers.mine()
                //use second account to call reFund
                await expect(fundMeSecond.reFund())
                    .to.revertedWith("There is no fund for you!")
            })

        //reFund success
        it("window closed, target not reached, funder has balance, reFund success",
            async function () {
                // make sure the target is not reached
                await fundMe.fund({ value: ethers.parseEther("0.01") })
                // make sure the window is close
                await helpers.time.increase(200)
                await helpers.mine()
                // call reFund
                await expect(fundMe.reFund())
                    .to.emit(fundMe, "RefundByFunder")
                    .withArgs(firstAccount, ethers.parseEther("0.01"))

            })

    });