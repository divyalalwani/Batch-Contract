// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(string memory name,string memory _symbol) ERC20(name,_symbol) {
        _mint(msg.sender, 100000000 * 10 ** decimals());
    }
}
