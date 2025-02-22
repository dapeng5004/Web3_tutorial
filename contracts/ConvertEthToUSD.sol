// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library ConvertEthToUSD {
    /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
        //DataFeed在Sepolia测试网络上的地址： 0x694AA1769357215DE4FAC081bf1f309aDC325306
        AggregatorV3Interface dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    // 从预言机获得ETH兑美元价格
    function convertEthToUsd(uint256 ethAmount)
        internal
        view
        returns (uint256)
    {
        //eth兑usd价格
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        //除以USD的精度（10**8）
        return (ethAmount * ethPrice) / (10**8);
    }

    // 查看1 Eth兑换美元price(精确到个位)
    function getPriceOfEthToUsd() public view returns (uint256) {
        //eth兑usd价格
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        //除以USD的精度（10**8）

        return (ethPrice) / (10**8);
    }
}
