import BloombergTerminal from "@/components/bloomberg/layout/bloomberg-terminal";
import { Provider } from "jotai";
import { Web3Provider } from "../components/bloomberg/providers/web3-provider";

export default function Home() {
  return (
    <Provider>
      <Web3Provider>
        <BloombergTerminal />
      </Web3Provider>
    </Provider>
  );
}
