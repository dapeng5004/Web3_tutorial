// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// ethToUSD合约地址：0x87D1a3Bbf31eF94FcF4EA51D24a40e02dc65FDcE
// ethToUSD合约地址：0xD766fFFFC6C5079Ee3863E01b1b541D66ba42024
/**
1、创建一个收款函数
2、记录投资人并且查看
3、在锁定期间内，达到目标值，众筹发起者可以提款
4、在锁定期间内，没有达 到目标值，投资人可在锁定期以后退款
*/
contract FundMe {
    // 记录投资者的(地址=>金额)映射
    mapping(address => uint256) public fundersToAmount;
    //众筹最小金额100 美元
    uint256 constant MINiMUM_VALUE = 10 * 10 ** 18; //$10  10**18 = 1e18
    // 众筹目标1000美元
    uint256 constant TARGET = 40 * 10 ** 18; //$100 USD 1e18 = 10**18
    // dateFeed接口
    // AggregatorV3Interface internal dataFeed;
    AggregatorV3Interface public dataFeed;
    //众筹发起者
    address public owner;
    // 众筹开始时间
    uint256 deploymentTimestamp;
    //锁定时间
    uint256 lockTime;
    //token合约地址
    address tokenAddress;

    // 众筹是否成功的flag
    bool public isFundSuccess = false;

    // getFund event
    event FundWithdrawByOwner(uint256);
    //reFund event
    event RefundByFunder(address, uint256);

    constructor(uint256 _lockTime, address _dataFeedAddress) {
        //sepolia测试网络
        dataFeed = AggregatorV3Interface(_dataFeedAddress);
        owner = msg.sender;
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    //函数修改器： 验证锁定时间
    modifier isFundFinished() {
        //验证时间
        require(
            block.timestamp >= deploymentTimestamp + lockTime,
            "Fund is not finished"
        );
        _;
    }

    //验证是否是发起者
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "this function can only be called by owner"
        );
        _;
    }

    /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
        //DataFeed在Sepolia测试网络上的地址： 0x694AA1769357215DE4FAC081bf1f309aDC325306
        //DataFeed在Eth主网上的地址： 0x19678515847d8DE85034dAD0390e09c3048d31cd

        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;

        //获取当前网络id
        // if (block.chainid == 11155111) {
        //     (, int answer, , , ) = dataFeed.latestRoundData();
        //     return answer;
        // } else {
        //     return 300000000000;
        // }
    }

    // 从预言机获得ETH兑美元价格
    function convertEthToUsd(
        uint256 ethAmount
    ) internal view returns (uint256) {
        //eth兑usd价格
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        // console.log("ethPrice:", ethPrice);
        // console.log("ethToUsdAmount:", (ethAmount * ethPrice) / (10 ** 8));
        //除以USD的精度（10**8）
        return (ethAmount * ethPrice) / (10 ** 8);
    }

    // 查看1 Eth兑换美元price(精确到个位)
    function getPriceOfEthToUsd() public view returns (uint256) {
        //eth兑usd价格
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        //除以USD的精度（10**8）

        return (ethPrice) / (10 ** 8);
    }

    //众筹函数 payable--可收款
    function fund() public payable {
        // 验证时间
        require(
            block.timestamp < deploymentTimestamp + lockTime,
            "fund window has closed"
        );
        //验证fund金额
        // require(msg.value >= MINiMUM_VALUE, "Send More ETH");

        // 将eth转换成usd
        require(convertEthToUsd(msg.value) >= MINiMUM_VALUE, "Send More ETH");
        fundersToAmount[msg.sender] = msg.value;
    }

    //改变发起者地址
    function transferOwnShip(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    //锁定时间结束，众筹达到目标，发起者提款
    function getFund() external isFundFinished onlyOwner {
        // 验证是否已经提款
        require(!isFundSuccess, "you have already funded once!");
        //验证众筹目标是否达到
        uint256 ethAmount = address(this).balance;
        // require(ethAmount >= TARGET, "Target is not reached!");
        require(convertEthToUsd(ethAmount) >= TARGET, "target is not reached");

        //转账的三种方式
        // 1、transfer ：transfer Eth and revert if tx failed
        // payable(msg.sender).transfer(address(this).balance);

        // 2、send : transfer Eth and return false if tx failed
        // bool success=payable(msg.sender).send(address(this).balance);
        // require(success,"Payment failed");

        // 3、call: transfer Eth with calldata return value of function and bool
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}(" ");
        // (bool success, ) = owner.call{value: address(this).balance}(" ");
        require(success, "GetFund tx failed!");
        fundersToAmount[msg.sender] = 0;
        //众筹结束，提款成功
        isFundSuccess = true;
        //emit event
        emit FundWithdrawByOwner(balance);
    }

    //锁定时间结束，众筹未达到目标,投资者退款
    function reFund() external isFundFinished {
        // 验证target
        // require(address(this).balance < TARGET, "Target is reached");
        require(
            convertEthToUsd(address(this).balance) < TARGET,
            "Target is reached"
        );

        // 验证投资者众筹金额
        require(fundersToAmount[msg.sender] != 0, "There is no fund for you!");

        uint256 balance = fundersToAmount[msg.sender];
        // 投资者退款
        (bool success, ) = payable(msg.sender).call{value: balance}(" ");
        require(success, "Refund tx failed!");
        // 退款后，众筹账户金额置零
        fundersToAmount[msg.sender] = 0;
        //emit event
        emit RefundByFunder(msg.sender, balance);
    }

    function setTokenAddress(address _tokenAddress) public onlyOwner {
        tokenAddress = _tokenAddress;
    }

    // funder领取token后更新mapping记录
    function updateFunderToAmount(
        address funderAddr,
        uint256 amountToUpdate
    ) external {
        require(
            msg.sender == tokenAddress,
            "you do not have permission to call this function"
        );
        fundersToAmount[funderAddr] = amountToUpdate;
    }

    //当value>0, calldata为空时，执行receive函数
    receive() external payable {
        fund();
    }

    //当calldata不为空，函数解析器找不到所调用函数时，执行fallback函数
    fallback() external payable {
        fund();
    }
}
