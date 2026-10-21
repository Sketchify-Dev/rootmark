#![cfg_attr(not(feature = "std"), no_std, no_main)]

/**
 * PortalAnchor for the WASM execution environment.
 *
 * The EVM side of Portaldot V3 commits batch roots through the Solidity contract. This ink!
 * contract is the same idea expressed for the ink!/WASM side, so a reader can check that
 * PortalIndex really indexes both execution environments of the same chain rather than
 * claiming it in a slide.
 */
#[ink::contract]
mod anchor {
    use ink::env::hash::{HashOutput, Keccak256};

    type Hash32 = [u8; 32];

    #[ink(event)]
    pub struct Anchored {
        #[ink(topic)]
        batch_id: Hash32,
        #[ink(topic)]
        root: Hash32,
        count: u64,
        from_block: u64,
        to_block: u64,
    }

    #[ink(storage)]
    pub struct Anchor {
        latest_root: Hash32,
        latest_batch: Hash32,
        anchors: u32,
    }

    impl Anchor {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                latest_root: [0u8; 32],
                latest_batch: [0u8; 32],
                anchors: 0,
            }
        }

        /// Commit the Merkle root of one batch of indexed records.
        #[ink(message)]
        pub fn anchor(
            &mut self,
            batch_id: Hash32,
            root: Hash32,
            count: u64,
            from_block: u64,
            to_block: u64,
        ) {
            assert!(root != [0u8; 32], "root must not be empty");

            self.latest_root = root;
            self.latest_batch = batch_id;
            self.anchors = self.anchors.saturating_add(1);

            self.env().emit_event(Anchored {
                batch_id,
                root,
                count,
                from_block,
                to_block,
            });
        }

        /// Root of the most recently anchored batch.
        #[ink(message)]
        pub fn latest_root(&self) -> Hash32 {
            self.latest_root
        }

        /// Identifier of the most recently anchored batch.
        #[ink(message)]
        pub fn latest_batch(&self) -> Hash32 {
            self.latest_batch
        }

        /// How many batches have been anchored.
        #[ink(message)]
        pub fn anchor_count(&self) -> u32 {
            self.anchors
        }

        /// Rebuild a Merkle root from a leaf and its path, then compare with the latest root.
        #[ink(message)]
        pub fn verify_latest(&self, leaf: Hash32, proof: Vec<Hash32>, positions: Vec<bool>) -> bool {
            if self.anchors == 0 || proof.len() != positions.len() {
                return false;
            }

            let mut current = leaf;
            for index in 0..proof.len() {
                let mut buffer = [0u8; 64];
                if positions[index] {
                    buffer[..32].copy_from_slice(&proof[index]);
                    buffer[32..].copy_from_slice(&current);
                } else {
                    buffer[..32].copy_from_slice(&current);
                    buffer[32..].copy_from_slice(&proof[index]);
                }
                current = keccak(&buffer);
            }

            current == self.latest_root
        }
    }

    fn keccak(data: &[u8]) -> Hash32 {
        let mut output = <Keccak256 as HashOutput>::Type::default();
        ink::env::hash_bytes::<Keccak256>(data, &mut output);
        output
    }
}
