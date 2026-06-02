const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
    const contractPath = path.resolve(__dirname, 'contracts', 'OBSIDIANIntel.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'OBSIDIANIntel.sol': {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode.object'],
                },
            },
        },
    };

    console.log('Compiling contract...');
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        let hasError = false;
        output.errors.forEach(err => {
            console.error(err.formattedMessage);
            if (err.severity === 'error') hasError = true;
        });
        if (hasError) throw new Error("Compilation failed");
    }

    const compiledContract = output.contracts['OBSIDIANIntel.sol']['OBSIDIANIntel'];
    const abi = compiledContract.abi;
    const bytecode = compiledContract.evm.bytecode.object;

    console.log('Connecting to Ritual Testnet...');
    const provider = new ethers.JsonRpcProvider('https://rpc.ritualfoundation.org');
    
    // Fallback if dotenv fails to load for some reason in this raw script
    const pk = process.env.PRIVATE_KEY || '0x379d4dffc0d58c7830e95293cc10636c7679efda977ff79da293216292dc371b';
    const wallet = new ethers.Wallet(pk, provider);
    
    console.log(`Deploying from address: ${wallet.address}`);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    console.log('Sending deployment transaction...');
    const contract = await factory.deploy({
        // Optional override if needed, Ritual is fast
    });

    await contract.waitForDeployment();
    const address = await contract.getAddress();
    
    console.log(`Contract deployed to: ${address}`);

    const deploymentsDir = path.resolve(__dirname, 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }
    
    const deploymentPath = path.join(deploymentsDir, 'OBSIDIANIntel.json');
    fs.writeFileSync(deploymentPath, JSON.stringify({ address }, null, 2));
    console.log(`Address saved to ${deploymentPath}`);
    
    // Update .env
    const envPath = path.resolve(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('NEXT_PUBLIC_CONTRACT_ADDRESS=')) {
        envContent = envContent.replace(/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/, `NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
    } else {
        envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${address}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log('Updated .env with NEXT_PUBLIC_CONTRACT_ADDRESS');
}

main().catch(console.error);
