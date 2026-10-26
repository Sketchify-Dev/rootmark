// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * A small contract that emits events, used to rehearse the indexer against a local chain.
 *
 * The Portaldot V3 testnet is quiet, so most blocks hold no logs. This contract gives the
 * local rehearsal real logs to index, with the same shape as a third party contract.
 */
contract Emitter {
    event Ping(address indexed from, uint256 indexed value, string note);

    function ping(uint256 value, string calldata note) external {
        emit Ping(msg.sender, value, note);
    }
}
