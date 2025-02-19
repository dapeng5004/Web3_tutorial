// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract SimpleStorage {
    uint256 favouriteNumber;
    struct People {
        uint256 favouriteNumber;
        string name;
    }

    People[] public peopleList;
    mapping(string => uint256) public nameTofavouriteNumber;

    //虚函数virtual  
    function storeNumber(uint256 _number) public virtual {
        favouriteNumber = _number;
    }

    function reviewNumber()public view returns (uint256) {
        return favouriteNumber;
    }

    function addPeople(uint256 _number, string memory _name) public {
        // People memory newPeople=People({favouriteNumber:_number,name:_name});
        // People memory newPeople=People(_number,_name);
        // peopleList.push(newPeople);
        peopleList.push(People(_number, _name));
        //将name作为key，number作为value存入mapping
        nameTofavouriteNumber[_name] = _number;
    }
}
