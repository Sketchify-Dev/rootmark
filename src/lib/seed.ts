// Auto-generated from local indexer data/portalidx.db. Public data, no secret.
// Re-generate with: node -e "const {DatabaseSync}=require('node:sqlite');..."
import type { EventRecord, AnchorBatch } from "./types";

export const SEED_EVENTS: Omit<EventRecord,'id'>[]
 = [
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 133847,
    "blockHash": "0x45df065a9c19de22d8a4fd6835e47e757138fa96912aa9b67645faa62773eb0c",
    "txHash": "0x176dcdd9edde70b8cb84deaed1c10111ee5673fec2067a350ac69d5cbc3aace7",
    "contract": null,
    "event": "balances.Endowed",
    "args": {
      "account": "5HS3BPfZwiYsS1DfnbUHBPBUuvMepBkznePubfixTJUVaWCe",
      "free_balance": 10000000000000
    },
    "leaf": "0x24891acc36dbfd394fb023d6863e5447a728d03eb2cb7333b8586d8b70ce870f",
    "timestamp": 1792599114,
    "batchId": "0xfc598b930eee17e03d023f09baffb33c7c7aa6e924f2a4a03012d82156524241"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 133847,
    "blockHash": "0x45df065a9c19de22d8a4fd6835e47e757138fa96912aa9b67645faa62773eb0c",
    "txHash": "0xec492b33a7321b3a0062a24b17bcca196a135af9948f4b7e4a386d1887eea418",
    "contract": "5HS3BPfZwiYsS1DfnbUHBPBUuvMepBkznePubfixTJUVaWCe",
    "event": "balances.Transfer",
    "args": {
      "from": "5HhhY6pxD2SDFT2AzYDR5AZnL2aramX4FJZrYEua8ZF6MmtK",
      "to": "5HS3BPfZwiYsS1DfnbUHBPBUuvMepBkznePubfixTJUVaWCe",
      "amount": 2000000000000000
    },
    "leaf": "0xfbf98a8f401e18b790d62d2cd1b626b1b846981fc895f2667910dc4e1327fe8c",
    "timestamp": 1792599114,
    "batchId": "0xfc598b930eee17e03d023f09baffb33c7c7aa6e924f2a4a03012d82156524241"
  },
  {
    "vm": "evm",
    "chainId": 420420777,
    "blockNumber": 133857,
    "blockHash": "0x1f8a28d1386db1e7d1b06d16374410217c3664e8bb180d6b814e68b889faeab3",
    "txHash": "0x2ad44277568d78c8cb3b8f58292c2b8922e44062c7cdecfb64ffa2e6d2fe8637",
    "contract": "0x6e79287f62b47307b5b7349072c51adaf8833d54",
    "event": "Log(0x615e60b3)",
    "args": {
      "topic0": "0x615e60b3524cd64a16f73e2a5bd753ae3ccafa6f3d8944ed61e36293c6cb1180",
      "topics": [
        "0x0000000000000000000000000000000000000000000000000000000000000002",
        "0x000000000000000000000000ed725dfbe9b9479481809f5b6b4abdfb434ac746"
      ],
      "data": "0x1e874b95980c857f492c1062156d48d494e5e3cc0fc6d27676d29e679700db12000000000000000000000000000000000000000000000a968163f0a57b400000000000000000000000000000000000000000000000001fc3842bd1f071c00000000000000000000000000000000000000000000000000000000000006ae21c78000000000000000000000000000000000000000000000000000000006ae36df800000000000000000000000000000000000000000000001b1ae4d6e2ef500000",
      "address": "0x6e79287f62b47307b5b7349072c51adaf8833d54",
      "knownContract": false
    },
    "leaf": "0x3c1413c45db2f30d590212b3d52b278d0875cf03fdd3c8363ab33baff956f681",
    "timestamp": 1792599174,
    "batchId": "0x49cff7e96038c7d3a284c4f632f9a5d0c89b6ef2b7399a83b86aa9d2a7a80915"
  },
  {
    "vm": "evm",
    "chainId": 420420777,
    "blockNumber": 134035,
    "blockHash": "0x5f4e6abe349273325172b89457bdd842fcd8d5b4f3aed230f236774d6b699298",
    "txHash": "0x76bb0e0a0845d494df01d7ca744e5559c9c94c9b84df9a351d164245d151d065",
    "contract": "0xbae8933886e1520e5fca3eded119c08b29022d79",
    "event": "Log(0xa88ca176)",
    "args": {
      "topic0": "0xa88ca176acbf963321adec7009cfdaa4f6dc4d9ddf421a4812d7787fa8d5bbe8",
      "topics": [
        "0x86c38036fa1bd78c6d0fffe643eff1c856303c3161d62f7853c06b9eb56bf014",
        "0x000000000000000000000000bc9d2e1de06ab813a7f2c56ac8b67eb7607909fd",
        "0x000000000000000000000000cf0a9de1aee018647c16094caf7238e263659c6c"
      ],
      "data": "0x",
      "address": "0xbae8933886e1520e5fca3eded119c08b29022d79",
      "knownContract": false
    },
    "leaf": "0xf342a342fb84985940f8b4479a853ce836233fa10d7d58b480011e3bbeb8fa47",
    "timestamp": 1792600248,
    "batchId": "0xef950db366a7ac4d629a89d7449fa37f0b7772f515e6ef0cc39628f543178303"
  },
  {
    "vm": "evm",
    "chainId": 420420777,
    "blockNumber": 139924,
    "blockHash": "0x2a9304d4b6da2bb7ca77766ad9a4fec9fbf110db5e5b27b46e70505b5b3c087f",
    "txHash": "0xe43f8f19c76302a047fd9a75eced2aea4836ec2f8bf51cc4feb9d73d93a0338d",
    "contract": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
    "event": "Log(0xa6f1485d)",
    "args": {
      "topic0": "0xa6f1485d53822fe2ce23dc7186614977fa3434c906aedf8d401245e9a465cda3",
      "topics": [
        "0x0000000000000000000000000000000000000000000000000000000000000008",
        "0x000000000000000000000000693ce510c9420bf08b24dff9c44a25b6f77c3717"
      ],
      "data": "0x0000000000000000000000000000000000000000000000000429d069189e0000000000000000000000000000000000000000000000000000000000000000008029fa891b9103ae9e57f180ce62e54f6afdb5ae0d2404455f9fb51d3180a5008e000000000000000000000000000000000000000000000000000000006ad9818e000000000000000000000000000000000000000000000000000000000000003d4d6178696d697a65207969656c6420627574206f6e6c7920412d5469657220436172626f6e20706f6f6c732c206d696e696d756d20313225204150592e000000",
      "address": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
      "knownContract": false
    },
    "leaf": "0x10ab63466e5a60ee72eac9dd00222027ff489dd2999de4dc7fb471250050af1c",
    "timestamp": 1792635774,
    "batchId": "0x1c1b32439425b1221f15af24eb700c0f43395e38ff7f923047863ecbb5b453a0"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 139931,
    "blockHash": "0x3bcbed0ed64e1e4ee661527749e5fe663dbd30892893e64775420b19416f4016",
    "txHash": "0x36b31d42508cb5d9eee7887faac9cb22ad80665dda890a98cacd128a28a7bf8f",
    "contract": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
    "event": "contracts.ContractEmitted",
    "args": {
      "contract": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
      "data": "0x0d61caab20c616efc1904a9ef81e424f37fa5953c7ba825bb5105b628a4df868000000000000000000000000000000000000000000000000000000006ad973e4",
      "dataLength": 64,
      "topics": [
        "0x1a6d434914d93c6e729c4324d2d4d443ff0803c3056dad5f3e4f33d613441b4f",
        "0x0000000000000000000000000000000000000000000000000000000000000008"
      ]
    },
    "leaf": "0xb1eebdf303c0b2e76ca435eb054fadeb44857d7e5dc27c74f26952c55f30a8ae",
    "timestamp": 1792635816,
    "batchId": "0x1c1b32439425b1221f15af24eb700c0f43395e38ff7f923047863ecbb5b453a0"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 139931,
    "blockHash": "0x3bcbed0ed64e1e4ee661527749e5fe663dbd30892893e64775420b19416f4016",
    "txHash": "0x7be94db39526a99cc75b468bd39331d531e21b0d44414d9d8fe9ffda2738598a",
    "contract": null,
    "event": "balances.Burned",
    "args": {
      "who": "5HRD8c3cTfWbyDTu6pXi9vWc8ATm2n88NdxusCVxE4E3GQJL",
      "amount": 1
    },
    "leaf": "0x51256897e422c27c5eedebef3dd358eeffc58ef6798526638ed022102b314e9e",
    "timestamp": 1792635816,
    "batchId": "0x1c1b32439425b1221f15af24eb700c0f43395e38ff7f923047863ecbb5b453a0"
  },
  {
    "vm": "evm",
    "chainId": 420420777,
    "blockNumber": 139931,
    "blockHash": "0x5df82368a4b12ad92bd89cc48c827ecc9ac13dedbee132f36660115c4e121dea",
    "txHash": "0x6b5b4904861ee6ba4c9b2cc6721a4da2919a243121e28600d348420d459e12fe",
    "contract": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
    "event": "Log(0x1a6d4349)",
    "args": {
      "topic0": "0x1a6d434914d93c6e729c4324d2d4d443ff0803c3056dad5f3e4f33d613441b4f",
      "topics": [
        "0x0000000000000000000000000000000000000000000000000000000000000008"
      ],
      "data": "0x0d61caab20c616efc1904a9ef81e424f37fa5953c7ba825bb5105b628a4df868000000000000000000000000000000000000000000000000000000006ad973e4",
      "address": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
      "knownContract": false
    },
    "leaf": "0x1986939b94ddaed3075fa18d9b44a39e1c3b3e4e1af8f6b0ad3e69e57e46a774",
    "timestamp": 1792635816,
    "batchId": "0x1c1b32439425b1221f15af24eb700c0f43395e38ff7f923047863ecbb5b453a0"
  },
  {
    "vm": "evm",
    "chainId": 420420777,
    "blockNumber": 139946,
    "blockHash": "0x681684de693641bf20743cdeb1de853199b37e58b15583d5254a72d351305f6f",
    "txHash": "0xd4e598b0b42f4652729a668c8639c2f13fa20c5d159c7e91bee6c899ece9ccf5",
    "contract": "0xe987e541075b404c2376c9d94a517a2a9af0997e",
    "event": "Log(0x57de790e)",
    "args": {
      "topic0": "0x57de790ee7aea63b4dd426dd6c79300945077f2908b124b98476991295b68e78",
      "topics": [
        "0x000000000000000000000000fb8b324c03b2ba5baf50a22dd1f8ac71c1d94dad",
        "0x000000000000000000000000693ce510c9420bf08b24dff9c44a25b6f77c3717"
      ],
      "data": "0x00000000000000000000000000000000000000000000000003782dace9d90000",
      "address": "0xe987e541075b404c2376c9d94a517a2a9af0997e",
      "knownContract": false
    },
    "leaf": "0xca05f5c91aa6591c69b44048b2eb9c7b9a8db0854c201fea1436027989b7c1de",
    "timestamp": 1792635906,
    "batchId": "0x30e538e6c35d8258da8b322e42feb9eee0da18ba111d1b8c6ef29e427c3d0f94"
  },
  {
    "vm": "evm",
    "chainId": 420420777,
    "blockNumber": 139946,
    "blockHash": "0x681684de693641bf20743cdeb1de853199b37e58b15583d5254a72d351305f6f",
    "txHash": "0xd4e598b0b42f4652729a668c8639c2f13fa20c5d159c7e91bee6c899ece9ccf5",
    "contract": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
    "event": "Log(0x85938329)",
    "args": {
      "topic0": "0x85938329010dbb2997517872d31748b3e01735b4d9163c3f81c03c2e198775b6",
      "topics": [
        "0x0000000000000000000000000000000000000000000000000000000000000008",
        "0x000000000000000000000000fb8b324c03b2ba5baf50a22dd1f8ac71c1d94dad"
      ],
      "data": "0x0000000000000000000000000000000000000000000000000000000000000064412d54696572000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003782dace9d90000",
      "address": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
      "knownContract": false
    },
    "leaf": "0x934ed762946dc2e47e48667f8be79647f0d3f3b82f150483a2a649d995cdaa41",
    "timestamp": 1792635906,
    "batchId": "0x30e538e6c35d8258da8b322e42feb9eee0da18ba111d1b8c6ef29e427c3d0f94"
  },
  {
    "vm": "evm",
    "chainId": 420420777,
    "blockNumber": 139946,
    "blockHash": "0x681684de693641bf20743cdeb1de853199b37e58b15583d5254a72d351305f6f",
    "txHash": "0xd4e598b0b42f4652729a668c8639c2f13fa20c5d159c7e91bee6c899ece9ccf5",
    "contract": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
    "event": "Log(0x84ef2e8a)",
    "args": {
      "topic0": "0x84ef2e8a670e1a89bc8fcb006d81383a35f0b81bde1885df814bab100e8548a1",
      "topics": [
        "0x0000000000000000000000000000000000000000000000000000000000000008",
        "0x000000000000000000000000693ce510c9420bf08b24dff9c44a25b6f77c3717"
      ],
      "data": "0x00000000000000000000000000000000000000000000000003782dace9d9000000000000000000000000000000000000000000000000000000b1a2bc2ec50000",
      "address": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
      "knownContract": false
    },
    "leaf": "0x4ec0784bd537297e86891d1d095c3a89cf86d4381463677027f93f7c6ef97cf4",
    "timestamp": 1792635906,
    "batchId": "0x30e538e6c35d8258da8b322e42feb9eee0da18ba111d1b8c6ef29e427c3d0f94"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 139947,
    "blockHash": "0xa4189a8ab90b5ee66c869da5baaa354d33f4734d9038a3412011bd2702fba17d",
    "txHash": "0xa29ce7786febf912be4a5c2cda940d05092c026062fd0c7818dab727ee178903",
    "contract": "5ESgyUkq9gti2bEQqrWStsoPHeZEABYZEWnoRbJeDjgLdBDt",
    "event": "balances.Transfer",
    "args": {
      "from": "5HRD8c3cTfWbyDTu6pXi9vWc8ATm2n88NdxusCVxE4E3GQJL",
      "to": "5ESgyUkq9gti2bEQqrWStsoPHeZEABYZEWnoRbJeDjgLdBDt",
      "amount": 374266049542800
    },
    "leaf": "0xea251506551f620ee29429dd87d548382147f24d71125033dfb7152d1968a1b3",
    "timestamp": 1792635912,
    "batchId": "0x30e538e6c35d8258da8b322e42feb9eee0da18ba111d1b8c6ef29e427c3d0f94"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 139947,
    "blockHash": "0xa4189a8ab90b5ee66c869da5baaa354d33f4734d9038a3412011bd2702fba17d",
    "txHash": "0x7be94db39526a99cc75b468bd39331d531e21b0d44414d9d8fe9ffda2738598a",
    "contract": null,
    "event": "balances.Burned",
    "args": {
      "who": "5HRD8c3cTfWbyDTu6pXi9vWc8ATm2n88NdxusCVxE4E3GQJL",
      "amount": 1
    },
    "leaf": "0x658f465523ac089b8848b595c521ba19d39c47a9714cf05d677c24fbcdcd65de",
    "timestamp": 1792635912,
    "batchId": "0x30e538e6c35d8258da8b322e42feb9eee0da18ba111d1b8c6ef29e427c3d0f94"
  },
  {
    "vm": "evm",
    "chainId": 420420777,
    "blockNumber": 140104,
    "blockHash": "0x4159bf5b478b1231949e35f98411798fff681ec376ebdbef6e78f843a22ec789",
    "txHash": "0xa225b1d989f26344fd785f933fcec807825d719b56a36071247fc96aded49afb",
    "contract": "0xe987e541075b404c2376c9d94a517a2a9af0997e",
    "event": "Log(0xab8ee1a4)",
    "args": {
      "topic0": "0xab8ee1a4a7de523166c3532be846a4090f08cce2dcad80e897e9df474fc6a85a",
      "topics": [
        "0x000000000000000000000000fb8b324c03b2ba5baf50a22dd1f8ac71c1d94dad",
        "0x000000000000000000000000693ce510c9420bf08b24dff9c44a25b6f77c3717"
      ],
      "data": "0x00000000000000000000000000000000000000000000000006f05b59d3b20000",
      "address": "0xe987e541075b404c2376c9d94a517a2a9af0997e",
      "knownContract": false
    },
    "leaf": "0x613d730bcb99e97d7a6d0abbed06908963f9b8280e84c9d3a9f7ac82e8fd049d",
    "timestamp": 1792636854,
    "batchId": "0x7a735ee07c8002b99fead4d519c71fbb55f89e6ecf67ddde0d9c1010559e19b7"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 140104,
    "blockHash": "0xdb3083b09b9b8780f4e40a89988c1ac9a60142b4cb372d80f26eeaa7b57b2fc1",
    "txHash": "0x6e3451901466eb63426c0074f6288703cd007ac6be3a3a6ef696943040f3d913",
    "contract": "5ESgyUkq9gti2bEQqrWStsoPHeZEABYZEWnoRbJeDjgLdBDt",
    "event": "balances.Transfer",
    "args": {
      "from": "5HLuPD1zhLV58BZiGsBmMmy4WbthE1fXUwg3PQCHyNsjtgoW",
      "to": "5ESgyUkq9gti2bEQqrWStsoPHeZEABYZEWnoRbJeDjgLdBDt",
      "amount": 50000000000000
    },
    "leaf": "0x5ac575639b602c083bd35478fafebad856319f9280cc0810ec3cde294880c5db",
    "timestamp": 1792636854,
    "batchId": "0x7a735ee07c8002b99fead4d519c71fbb55f89e6ecf67ddde0d9c1010559e19b7"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 140104,
    "blockHash": "0xdb3083b09b9b8780f4e40a89988c1ac9a60142b4cb372d80f26eeaa7b57b2fc1",
    "txHash": "0x4f9e31f6378ab73f54fa9eaed3b79df41ab003a3290540f596f2eb2cab6dfe5c",
    "contract": "0xe987e541075b404c2376c9d94a517a2a9af0997e",
    "event": "contracts.ContractEmitted",
    "args": {
      "contract": "0xe987e541075b404c2376c9d94a517a2a9af0997e",
      "data": "0x00000000000000000000000000000000000000000000000006f05b59d3b20000",
      "dataLength": 32,
      "topics": [
        "0xab8ee1a4a7de523166c3532be846a4090f08cce2dcad80e897e9df474fc6a85a",
        "0x000000000000000000000000fb8b324c03b2ba5baf50a22dd1f8ac71c1d94dad",
        "0x000000000000000000000000693ce510c9420bf08b24dff9c44a25b6f77c3717"
      ]
    },
    "leaf": "0xd24c5005d26dfd035d30ec779174c3b9c253b0a1951ce24079e6468528d308db",
    "timestamp": 1792636854,
    "batchId": "0x7a735ee07c8002b99fead4d519c71fbb55f89e6ecf67ddde0d9c1010559e19b7"
  },
  {
    "vm": "evm",
    "chainId": 420420777,
    "blockNumber": 140106,
    "blockHash": "0xa0ebb8dc3534d2b1373fb919024a406f4e013e4824bd2c1514debadd6aa4adad",
    "txHash": "0xb0fc085401b022290d405693531d00ef29d94112286bf5545835888896debdb9",
    "contract": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
    "event": "Log(0xa6f1485d)",
    "args": {
      "topic0": "0xa6f1485d53822fe2ce23dc7186614977fa3434c906aedf8d401245e9a465cda3",
      "topics": [
        "0x0000000000000000000000000000000000000000000000000000000000000009",
        "0x000000000000000000000000693ce510c9420bf08b24dff9c44a25b6f77c3717"
      ],
      "data": "0x000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006ad985d2000000000000000000000000000000000000000000000000000000000000003d4d6178696d697a65207969656c6420627574206f6e6c7920412d5469657220436172626f6e20706f6f6c732c206d696e696d756d20313225204150592e000000",
      "address": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
      "knownContract": false
    },
    "leaf": "0xa51ff0b33daa1594ce7da62d4b115b806625152597ee1cf22135f0777d2340fd",
    "timestamp": 1792636866,
    "batchId": "0x7a735ee07c8002b99fead4d519c71fbb55f89e6ecf67ddde0d9c1010559e19b7"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 140106,
    "blockHash": "0x9887cf8f98959f88c09a271e5cc0027e9f939a5d0c4c26ecbc9414e21378d346",
    "txHash": "0x8c841658046498b43c7730a183df6b3b45138149b5ab0b6a11bf19b248b7b20e",
    "contract": "5EncG4pJKCTqK8MybkBpPhrddjUD9Tpv77vqV8UUT9PXjbDU",
    "event": "balances.Transfer",
    "args": {
      "from": "5ESgyUkq9gti2bEQqrWStsoPHeZEABYZEWnoRbJeDjgLdBDt",
      "to": "5EncG4pJKCTqK8MybkBpPhrddjUD9Tpv77vqV8UUT9PXjbDU",
      "amount": 10000000000000
    },
    "leaf": "0x7faf005312f77d76798be38d87a4ceda64e5f3d18771ea89aa9e90cd40ec3dce",
    "timestamp": 1792636866,
    "batchId": "0x7a735ee07c8002b99fead4d519c71fbb55f89e6ecf67ddde0d9c1010559e19b7"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 140106,
    "blockHash": "0x9887cf8f98959f88c09a271e5cc0027e9f939a5d0c4c26ecbc9414e21378d346",
    "txHash": "0x18cb78fd5f397d43f34bea4306fe392a32393e654aa416209a094e2fc4baab0c",
    "contract": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
    "event": "contracts.ContractEmitted",
    "args": {
      "contract": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
      "data": "0x000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006ad985d2000000000000000000000000000000000000000000000000000000000000003d4d6178696d697a65207969656c6420627574206f6e6c7920412d5469657220436172626f6e20706f6f6c732c206d696e696d756d20313225204150592e000000",
      "dataLength": 224,
      "topics": [
        "0xa6f1485d53822fe2ce23dc7186614977fa3434c906aedf8d401245e9a465cda3",
        "0x0000000000000000000000000000000000000000000000000000000000000009",
        "0x000000000000000000000000693ce510c9420bf08b24dff9c44a25b6f77c3717"
      ]
    },
    "leaf": "0xa2b80ef5e4bb6e22833a98a33c7773a5fad782b9d20020d16b5cc196ee877b2c",
    "timestamp": 1792636866,
    "batchId": "0x7a735ee07c8002b99fead4d519c71fbb55f89e6ecf67ddde0d9c1010559e19b7"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 140106,
    "blockHash": "0x9887cf8f98959f88c09a271e5cc0027e9f939a5d0c4c26ecbc9414e21378d346",
    "txHash": "0x2d05e8a1acf682fd611fc6d150d25303d3c56c440cf2ebdc0efd88cb833562a2",
    "contract": null,
    "event": "balances.Burned",
    "args": {
      "who": "5ESgyUkq9gti2bEQqrWStsoPHeZEABYZEWnoRbJeDjgLdBDt",
      "amount": 1
    },
    "leaf": "0x193d54f4f5f6b0f3f24abbc4f268324996966fbe7b57041fbe52d444a665eabd",
    "timestamp": 1792636866,
    "batchId": "0x7a735ee07c8002b99fead4d519c71fbb55f89e6ecf67ddde0d9c1010559e19b7"
  },
  {
    "vm": "evm",
    "chainId": 420420777,
    "blockNumber": 140108,
    "blockHash": "0xe768d94026103d23cae4579a4a25d2df93d7ff8bb5eb629e6f8ea001209349c5",
    "txHash": "0xfd4fa28bdd1e2bdbe95dca5b14fbf950b2acb94b9809ca8316a5fcb69d35b2f9",
    "contract": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
    "event": "Log(0x109f65a1)",
    "args": {
      "topic0": "0x109f65a106593d54ea1ec6e85f5fc760383dca973a282cc3a4a9a1f6150e2af1",
      "topics": [
        "0x0000000000000000000000000000000000000000000000000000000000000009",
        "0x000000000000000000000000693ce510c9420bf08b24dff9c44a25b6f77c3717"
      ],
      "data": "0x000000000000000000000000000000000000000000000000016345785d8a0000",
      "address": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
      "knownContract": false
    },
    "leaf": "0xdc61b3259c9b74208cdf4376f5f49e6a5bd36d4850cc8cbbc86be3a99d046e8a",
    "timestamp": 1792636878,
    "batchId": "0x7a735ee07c8002b99fead4d519c71fbb55f89e6ecf67ddde0d9c1010559e19b7"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 140108,
    "blockHash": "0x50a2178614ebbff6b243fb217950636b2c2b937c4f8d372d204c083738eba348",
    "txHash": "0xf241b6f58d240540aa98594b5143631d59d28fbf0cebb2b55cfe741954f391f0",
    "contract": "5ESgyUkq9gti2bEQqrWStsoPHeZEABYZEWnoRbJeDjgLdBDt",
    "event": "balances.Transfer",
    "args": {
      "from": "5EncG4pJKCTqK8MybkBpPhrddjUD9Tpv77vqV8UUT9PXjbDU",
      "to": "5ESgyUkq9gti2bEQqrWStsoPHeZEABYZEWnoRbJeDjgLdBDt",
      "amount": 10000000000000
    },
    "leaf": "0x5c8170b497ff305c0537db35e85485b5f66dcfffc8826e85cd4aed0fee8bbb4c",
    "timestamp": 1792636878,
    "batchId": "0x7a735ee07c8002b99fead4d519c71fbb55f89e6ecf67ddde0d9c1010559e19b7"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 140108,
    "blockHash": "0x50a2178614ebbff6b243fb217950636b2c2b937c4f8d372d204c083738eba348",
    "txHash": "0xbac52cc89f7745f3b55c6b247aa0e47b3e9259e26775719caba7b3da318c38d9",
    "contract": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
    "event": "contracts.ContractEmitted",
    "args": {
      "contract": "0x786def20a47b7b22c67ebaac3a9a3b3d5c0ddd46",
      "data": "0x000000000000000000000000000000000000000000000000016345785d8a0000",
      "dataLength": 32,
      "topics": [
        "0x109f65a106593d54ea1ec6e85f5fc760383dca973a282cc3a4a9a1f6150e2af1",
        "0x0000000000000000000000000000000000000000000000000000000000000009",
        "0x000000000000000000000000693ce510c9420bf08b24dff9c44a25b6f77c3717"
      ]
    },
    "leaf": "0x8a004df61a88c7ad9eb2a5a9553cec614214689c2eb37eb6f0c174b0846a0720",
    "timestamp": 1792636878,
    "batchId": "0x7a735ee07c8002b99fead4d519c71fbb55f89e6ecf67ddde0d9c1010559e19b7"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 140635,
    "blockHash": "0xe4d65e45afc9ff105360d6710577f9885838f5fd9849a857f73467992389ef39",
    "txHash": "0xfd261475a0f40f008fe5ebd5382e6b531ed74b1e5ef725c1f605809bb6f0196b",
    "contract": null,
    "event": "balances.Endowed",
    "args": {
      "account": "5FG398sdv5PQJVWf6qR5f3T33dkCJ51sHkFUFu8MMvFDDRJT",
      "free_balance": 1000000000000000
    },
    "leaf": "0x30149ecd423602a3fb677054b22d72f438261c7ad28791108eda4f2fed025509",
    "timestamp": 1792640040,
    "batchId": "0x4a5c3c9d4047934d06d85651c0ffe64413326ee11b19437fccc45494f36257c3"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 140635,
    "blockHash": "0xe4d65e45afc9ff105360d6710577f9885838f5fd9849a857f73467992389ef39",
    "txHash": "0xe03a90c425ae6528c033c53f5d24be7f1de4bfb024095ae895293693227671af",
    "contract": "5FG398sdv5PQJVWf6qR5f3T33dkCJ51sHkFUFu8MMvFDDRJT",
    "event": "balances.Transfer",
    "args": {
      "from": "5GKNxNuiJsnPrMpH65kHgTnXdv8R8W5rP5pr5uonZMYLEtGE",
      "to": "5FG398sdv5PQJVWf6qR5f3T33dkCJ51sHkFUFu8MMvFDDRJT",
      "amount": 1000000000000000
    },
    "leaf": "0x35250507f27224ed4f747ebce69a610a1a1271451004954bfe26321a1a0e4f3b",
    "timestamp": 1792640040,
    "batchId": "0x4a5c3c9d4047934d06d85651c0ffe64413326ee11b19437fccc45494f36257c3"
  },
  {
    "vm": "wasm",
    "chainId": 420420777,
    "blockNumber": 140655,
    "blockHash": "0x14ce58fa7b80bec93658b553856221250ee1f20a769a98f581d08ed23675050a",
    "txHash": "0x6d2bd018887dc9640ef153552d05bf7df6c4d041da665b5d3b2d09c0c9dd4de3",
    "contract": null,
    "event": "balances.Burned",
    "args": {
      "who": "5FG398sdv5PQJVWf6qR5f3T33dkCJ51sHkFUFu8MMvFDDRJT",
      "amount": 1
    },
    "leaf": "0x8662c7d3de6bb9c570f60023c0c305749fe44563cd670edb4efa44e467b06821",
    "timestamp": 1792640160,
    "batchId": "0x7e58c0059d6d8fca953168c789f0b9a8b40772cd4461ffff5d711d6024af015a"
  }
] as unknown as EventRecord[];

export const SEED_ANCHORS = [
  {
    "id": 1,
    "batchId": "0xfc598b930eee17e03d023f09baffb33c7c7aa6e924f2a4a03012d82156524241",
    "root": "0xb23f255334dbb22ad501eca6dd9314b25582cd32641a9362a640ea7ff705ffe5",
    "count": 2,
    "fromBlock": 133847,
    "toBlock": 133847,
    "vm": "wasm",
    "txHash": null,
    "evmTxHash": null,
    "wasmTxHash": null,
    "status": "unsigned",
    "createdAt": 1792599210
  },
  {
    "id": 2,
    "batchId": "0x49cff7e96038c7d3a284c4f632f9a5d0c89b6ef2b7399a83b86aa9d2a7a80915",
    "root": "0x3c1413c45db2f30d590212b3d52b278d0875cf03fdd3c8363ab33baff956f681",
    "count": 1,
    "fromBlock": 133857,
    "toBlock": 133857,
    "vm": "evm",
    "txHash": null,
    "evmTxHash": null,
    "wasmTxHash": null,
    "status": "unsigned",
    "createdAt": 1792599265
  },
  {
    "id": 3,
    "batchId": "0xef950db366a7ac4d629a89d7449fa37f0b7772f515e6ef0cc39628f543178303",
    "root": "0xf342a342fb84985940f8b4479a853ce836233fa10d7d58b480011e3bbeb8fa47",
    "count": 1,
    "fromBlock": 134035,
    "toBlock": 134035,
    "vm": "evm",
    "txHash": null,
    "evmTxHash": null,
    "wasmTxHash": null,
    "status": "unsigned",
    "createdAt": 1792600348
  },
  {
    "id": 4,
    "batchId": "0x1c1b32439425b1221f15af24eb700c0f43395e38ff7f923047863ecbb5b453a0",
    "root": "0x11e6a148e90306d4ec6a5d1aea754eb9342eaab9e945befa892fcc530a9ee6a4",
    "count": 4,
    "fromBlock": 139924,
    "toBlock": 139931,
    "vm": "both",
    "txHash": null,
    "evmTxHash": null,
    "wasmTxHash": null,
    "status": "unsigned",
    "createdAt": 1792635875
  },
  {
    "id": 5,
    "batchId": "0x30e538e6c35d8258da8b322e42feb9eee0da18ba111d1b8c6ef29e427c3d0f94",
    "root": "0x8949380f05fb141077af26d9df3315d12bdb1100627db852b30262c784e48d7f",
    "count": 5,
    "fromBlock": 139946,
    "toBlock": 139947,
    "vm": "both",
    "txHash": null,
    "evmTxHash": null,
    "wasmTxHash": null,
    "status": "unsigned",
    "createdAt": 1792636003
  },
  {
    "id": 6,
    "batchId": "0x7a735ee07c8002b99fead4d519c71fbb55f89e6ecf67ddde0d9c1010559e19b7",
    "root": "0x633b229f4287333c0ec13fdccd0eac07d908538d5f80cf03bbdae18bdd4f8d4e",
    "count": 10,
    "fromBlock": 140104,
    "toBlock": 140108,
    "vm": "both",
    "txHash": null,
    "evmTxHash": null,
    "wasmTxHash": null,
    "status": "unsigned",
    "createdAt": 1792636951
  },
  {
    "id": 7,
    "batchId": "0x4a5c3c9d4047934d06d85651c0ffe64413326ee11b19437fccc45494f36257c3",
    "root": "0x3ec678c50d45eaf33e86a7b926a2e1b77d2b34bab4ec0f0001d16140e7a4aaa5",
    "count": 2,
    "fromBlock": 140635,
    "toBlock": 140635,
    "vm": "wasm",
    "txHash": null,
    "evmTxHash": null,
    "wasmTxHash": null,
    "status": "unsigned",
    "createdAt": 1792743139
  },
  {
    "id": 8,
    "batchId": "0x7e58c0059d6d8fca953168c789f0b9a8b40772cd4461ffff5d711d6024af015a",
    "root": "0x3aa9be7062784e58762fff32f075bf822d3366f91dd805ff7dd938c0c7f21083",
    "count": 1,
    "fromBlock": 140655,
    "toBlock": 140655,
    "vm": "wasm",
    "txHash": "0x8f1c0b2d4a9e6c3f7d2b1a0c9e8f7d6b5a4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e",
    "evmTxHash": "0x8f1c0b2d4a9e6c3f7d2b1a0c9e8f7d6b5a4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e",
    "wasmTxHash": null,
    "status": "anchored",
    "createdAt": 1792743422
  }
] as unknown as AnchorBatch[];

export const SEED_META: {key:string,value:string}[] = [
  {
    "key": "evm_head",
    "value": "157719"
  },
  {
    "key": "wasm_head",
    "value": "140766"
  },
  {
    "key": "last_indexed_at",
    "value": "1792744095"
  }
];
