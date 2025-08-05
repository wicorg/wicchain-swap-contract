# Steps to Deploy Contracts

## Step 1: Configure the `configs.ts` File
Rename `configs.ts.example` to `configs.ts` and update the following parameters:

```typescript
{
  WNATIVE: string // address of the wrapped native token for each network
  nativeCurrencyLabel: string // symbol of the native currency
  orb: string // ORB token address
  relayReceiver: string // wallet address to receive native tokens when bridging
  relayResolver: string // wallet address that signs messages for relay
  privateKey: string // private key of the wallet deploying the contract
  rpcUrl: string // RPC URL
  verifyKey: string // API key for verifying the contract on networks
  chainId: number // network chainId
  feeProtocolAddress: string // address of the feeProtocol token
}
```

---

## Step 2: Deploy Contracts in the **_swap_** Folder
Run the following commands to deploy contracts:

1. Deploy core contracts:
   ```bash
   npx hardhat run .\scripts\v3_core_deploy.ts --network network_name_from_config
   ```
2. Deploy periphery contracts:
   ```bash
   npx hardhat run .\scripts\v3_periphery_deploy.ts --network network_name_from_config
   ```

---

## Step 3: Deploy Contracts in the **_masterchef_** Folder
Similar to the previous step, but run:
```bash
npx hardhat run .\scripts\masterchef_deploy.ts --network network_name_from_config
```

---

## Step 4: Deploy Contracts in the **_lmPool_** Folder
Similar to the previous step, but run:
```bash
npx hardhat run .\scripts\lm_pool_deploy.ts --network network_name_from_config
```

---

## Step 5: Deploy Contracts in the **_bridge_** Folder
Similar to the previous step, but run:
1. Deploy faucet:
   ```bash
   npx hardhat run .\scripts\deploy_faucet.ts --network network_name_from_config
   ```
2. Add faucet:
   ```bash
   npx hardhat run .\scripts\add_faucet.ts --network network_name_from_config
   ```

---

## Step 6: Deploy Contracts in the **_route_** Folder
Similar to the previous step, but run:
```bash
npx hardhat run .\scripts\smart_router_deploy.ts --network network_name_from_config
```

---

**The deployed contract addresses will be saved in the `deployment` folder inside each respective directory.**
