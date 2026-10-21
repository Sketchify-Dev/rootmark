// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PortalAnchor
 * @notice Commits the Merkle root of a batch of indexed records to the Portaldot V3 chain.
 *
 * PortalIndex indexes both execution environments of the chain. An index is only worth
 * trusting if a reader can check it, so every batch of records is reduced to a single 32 byte
 * root and written here. Anything the indexer returns can then be rebuilt from its Merkle path
 * and compared with the root this contract holds.
 *
 * Anchoring is permissionless: anyone may add a batch. A batch id can only be claimed once,
 * so a later writer cannot replace a root that was already committed.
 */
contract PortalAnchor {
    struct RootRecord {
        bytes32 root;
        uint64 count;
        uint64 fromBlock;
        uint64 toBlock;
        uint64 anchoredAt;
        address anchorer;
    }

    event Anchored(
        bytes32 indexed batchId,
        bytes32 indexed root,
        uint64 count,
        uint64 fromBlock,
        uint64 toBlock
    );

    error EmptyRoot();
    error DuplicateBatch(bytes32 batchId);

    mapping(bytes32 => RootRecord) private _anchors;
    bytes32[] private _history;

    /**
     * @notice Commit the root of one batch of indexed records.
     * @param batchId Identifier of the batch, derived from its leaves.
     * @param root Merkle root of the batch.
     * @param count How many records the batch contains.
     * @param fromBlock First block covered by the batch.
     * @param toBlock Last block covered by the batch.
     */
    function anchor(
        bytes32 batchId,
        bytes32 root,
        uint64 count,
        uint64 fromBlock,
        uint64 toBlock
    ) external {
        if (root == bytes32(0)) revert EmptyRoot();
        // The anchorer is used as the existence marker rather than the timestamp, because a
        // development chain can legitimately start at timestamp zero.
        if (_anchors[batchId].anchorer != address(0)) revert DuplicateBatch(batchId);

        _anchors[batchId] = RootRecord({
            root: root,
            count: count,
            fromBlock: fromBlock,
            toBlock: toBlock,
            anchoredAt: uint64(block.timestamp),
            anchorer: msg.sender
        });
        _history.push(root);

        emit Anchored(batchId, root, count, fromBlock, toBlock);
    }

    /// @notice Root of the most recently anchored batch, or zero if nothing is anchored.
    function latestRoot() external view returns (bytes32) {
        if (_history.length == 0) return bytes32(0);
        return _history[_history.length - 1];
    }

    /// @notice Number of batches anchored so far.
    function anchorCount() external view returns (uint256) {
        return _history.length;
    }

    /// @notice Full record for one batch.
    function getAnchor(bytes32 batchId) external view returns (RootRecord memory) {
        return _anchors[batchId];
    }

    /**
     * @notice Rebuild a Merkle root from a leaf and its path.
     * @param leaf Hash of one record.
     * @param proof Sibling hashes from the leaf up to the root.
     * @param positions True when the sibling sits on the left of the current node.
     */
    function computeRoot(
        bytes32 leaf,
        bytes32[] calldata proof,
        bool[] calldata positions
    ) public pure returns (bytes32) {
        require(proof.length == positions.length, "proof and positions differ in length");
        bytes32 current = leaf;
        for (uint256 i = 0; i < proof.length; i += 1) {
            current = positions[i]
                ? keccak256(abi.encodePacked(proof[i], current))
                : keccak256(abi.encodePacked(current, proof[i]));
        }
        return current;
    }

    /**
     * @notice Check a record against the root committed for its batch.
     * @dev This is the on-chain half of the check the console performs in the browser.
     */
    function verifyBatch(
        bytes32 batchId,
        bytes32 leaf,
        bytes32[] calldata proof,
        bool[] calldata positions
    ) external view returns (bool) {
        bytes32 anchored = _anchors[batchId].root;
        if (anchored == bytes32(0)) return false;
        return computeRoot(leaf, proof, positions) == anchored;
    }
}
