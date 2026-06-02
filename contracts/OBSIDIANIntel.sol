// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAsyncPrecompile {
    function request(address callbackAddr, bytes4 callbackFunc, bytes calldata data) external payable returns (bytes32 jobId);
}

contract OBSIDIANIntel {
    address public constant ASYNC_DELIVERY = 0x5A16214fF555848411544b005f7Ac063742f39F6;
    
    address public constant HTTP_PRECOMPILE = 0x0000000000000000000000000000000000000801;
    address public constant LLM_PRECOMPILE = 0x0000000000000000000000000000000000000802;
    address public constant JQ_PRECOMPILE = 0x0000000000000000000000000000000000000803;

    struct AlphaIntel {
        string summary;
        string alphaType;
        string source;
        uint8 confidence;
        uint256 timestamp;
        bool settled;
    }

    AlphaIntel[] public alphaFeed;
    
    // Mapping from jobId to the index in alphaFeed
    mapping(bytes32 => uint256) public jobToFeedIndex;

    event IntelRequested(bytes32 indexed jobId, address indexed requester, string query);
    event IntelSettled(bytes32 indexed jobId, string summary, string alphaType, uint8 confidence);

    modifier onlyAsyncDelivery() {
        require(msg.sender == ASYNC_DELIVERY, "Only ASYNC_DELIVERY can call this");
        _;
    }

    // 1. News Alpha
    function requestNewsAlpha(string calldata rssUrl) external payable {
        bytes memory data = abi.encodePacked("Fetch RSS: ", rssUrl, " and summarize.");
        bytes32 jobId = IAsyncPrecompile(LLM_PRECOMPILE).request{value: msg.value}(
            address(this),
            this.onNewsResult.selector,
            data
        );
        
        alphaFeed.push(AlphaIntel({
            summary: "Processing News Alpha...",
            alphaType: "NEWS",
            source: rssUrl,
            confidence: 0,
            timestamp: block.timestamp,
            settled: false
        }));
        jobToFeedIndex[jobId] = alphaFeed.length - 1;
        
        emit IntelRequested(jobId, msg.sender, rssUrl);
    }

    function onNewsResult(bytes32 jobId, bytes calldata result) external onlyAsyncDelivery {
        uint256 idx = jobToFeedIndex[jobId];
        AlphaIntel storage intel = alphaFeed[idx];
        intel.summary = string(result);
        intel.confidence = 85; // Example confidence
        intel.settled = true;
        
        emit IntelSettled(jobId, intel.summary, intel.alphaType, intel.confidence);
    }

    // 2. Whale Alert
    function requestWhaleAlert(address target) external payable {
        bytes memory data = abi.encodePacked("Fetch Etherscan txs for ", target, " and parse.");
        bytes32 jobId = IAsyncPrecompile(JQ_PRECOMPILE).request{value: msg.value}(
            address(this),
            this.onWhaleResult.selector,
            data
        );
        
        alphaFeed.push(AlphaIntel({
            summary: "Processing Whale Alert...",
            alphaType: "WHALE",
            source: "Etherscan",
            confidence: 0,
            timestamp: block.timestamp,
            settled: false
        }));
        jobToFeedIndex[jobId] = alphaFeed.length - 1;
        
        emit IntelRequested(jobId, msg.sender, "Whale Alert");
    }

    function onWhaleResult(bytes32 jobId, bytes calldata result) external onlyAsyncDelivery {
        uint256 idx = jobToFeedIndex[jobId];
        AlphaIntel storage intel = alphaFeed[idx];
        intel.summary = string(result);
        intel.confidence = 90;
        intel.settled = true;
        
        emit IntelSettled(jobId, intel.summary, intel.alphaType, intel.confidence);
    }

    // 3. DEX Anomaly
    function requestDEXAnomaly(string calldata symbol) external payable {
        bytes memory data = abi.encodePacked("Fetch Binance volume for ", symbol);
        bytes32 jobId = IAsyncPrecompile(HTTP_PRECOMPILE).request{value: msg.value}(
            address(this),
            this.onDEXResult.selector,
            data
        );
        
        alphaFeed.push(AlphaIntel({
            summary: "Processing DEX Anomaly...",
            alphaType: "DEX",
            source: "Binance",
            confidence: 0,
            timestamp: block.timestamp,
            settled: false
        }));
        jobToFeedIndex[jobId] = alphaFeed.length - 1;
        
        emit IntelRequested(jobId, msg.sender, symbol);
    }

    function onDEXResult(bytes32 jobId, bytes calldata result) external onlyAsyncDelivery {
        uint256 idx = jobToFeedIndex[jobId];
        AlphaIntel storage intel = alphaFeed[idx];
        intel.summary = string(result);
        intel.confidence = 88;
        intel.settled = true;
        
        emit IntelSettled(jobId, intel.summary, intel.alphaType, intel.confidence);
    }

    // 4. Narrative Intel
    function requestNarrativeIntel(string calldata keyword) external payable {
        bytes memory data = abi.encodePacked("Analyze narrative for ", keyword);
        bytes32 jobId = IAsyncPrecompile(LLM_PRECOMPILE).request{value: msg.value}(
            address(this),
            this.onNarrativeResult.selector,
            data
        );
        
        alphaFeed.push(AlphaIntel({
            summary: "Processing Narrative Intel...",
            alphaType: "NARRATIVE",
            source: "CoinGecko",
            confidence: 0,
            timestamp: block.timestamp,
            settled: false
        }));
        jobToFeedIndex[jobId] = alphaFeed.length - 1;
        
        emit IntelRequested(jobId, msg.sender, keyword);
    }

    function onNarrativeResult(bytes32 jobId, bytes calldata result) external onlyAsyncDelivery {
        uint256 idx = jobToFeedIndex[jobId];
        AlphaIntel storage intel = alphaFeed[idx];
        intel.summary = string(result);
        intel.confidence = 82;
        intel.settled = true;
        
        emit IntelSettled(jobId, intel.summary, intel.alphaType, intel.confidence);
    }
    
    function getAlphaFeedLength() external view returns (uint256) {
        return alphaFeed.length;
    }
}
