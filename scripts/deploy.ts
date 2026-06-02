import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying OBSIDIANIntel...");
  
  const OBSIDIANIntel = await ethers.getContractFactory("OBSIDIANIntel");
  const intel = await OBSIDIANIntel.deploy();
  await intel.waitForDeployment();

  const address = await intel.getAddress();
  console.log(`OBSIDIANIntel deployed to: ${address}`);

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentPath = path.join(deploymentsDir, "OBSIDIANIntel.json");
  fs.writeFileSync(deploymentPath, JSON.stringify({ address }, null, 2));
  console.log(`Address saved to ${deploymentPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
