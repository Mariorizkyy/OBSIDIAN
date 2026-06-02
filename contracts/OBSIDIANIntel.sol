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

    // 1. HTTP Request (DEX Anomaly)
    function requestHTTP(bytes calldata payload, string calldata displaySource) external payable {
        bytes32 jobId = IAsyncPrecompile(HTTP_PRECOMPILE).request{value: msg.value}(
            address(this),
            this.onHTTPResult.selector,
            payload
        );
        
        alphaFeed.push(AlphaIntel({
            summary: "Processing DEX Anomaly...",
            alphaType: "DEX",
            source: displaySource,
            confidence: 0,
            timestamp: block.timestamp,
            settled: false
        }));
        jobToFeedIndex[jobId] = alphaFeed.length - 1;
        
        emit IntelRequested(jobId, msg.sender, "DEX Anomaly Check");
    }

    function onHTTPResult(bytes32 jobId, bytes calldata result) external onlyAsyncDelivery {
        uint256 idx = jobToFeedIndex[jobId];
        AlphaIntel storage intel = alphaFeed[idx];
        
        // Ritual HTTP returns: (uint16 statusCode, string[] headerKeys, string[] headerValues, bytes body, string errorMessage)
        (uint16 statusCode, , , bytes memory bodyBytes, string memory errorMessage) = abi.decode(result, (uint16, string[], string[], bytes, string));
        
        if (bytes(errorMessage).length > 0 || statusCode != 200) {
            intel.summary = "HTTP Request Failed";
            intel.confidence = 0;
        } else {
            intel.summary = string(bodyBytes);
            intel.confidence = 88;
        }
        intel.settled = true;
        
        emit IntelSettled(jobId, intel.summary, intel.alphaType, intel.confidence);
    }

    // 2. LLM Request (News/Narrative)
    function requestLLM(bytes calldata payload, string calldata alphaType, string calldata displaySource) external payable {
        bytes32 jobId = IAsyncPrecompile(LLM_PRECOMPILE).request{value: msg.value}(
            address(this),
            this.onLLMResult.selector,
            payload
        );
        
        alphaFeed.push(AlphaIntel({
            summary: "Processing AI Narrative...",
            alphaType: alphaType,
            source: displaySource,
            confidence: 0,
            timestamp: block.timestamp,
            settled: false
        }));
        jobToFeedIndex[jobId] = alphaFeed.length - 1;
        
        emit IntelRequested(jobId, msg.sender, "AI Analysis");
    }

    struct ConvoHistory {
        string a;
        string b;
        string c;
    }

    function onLLMResult(bytes32 jobId, bytes calldata result) external onlyAsyncDelivery {
        uint256 idx = jobToFeedIndex[jobId];
        AlphaIntel storage intel = alphaFeed[idx];
        
        // LLM returns: (bool has_error, bytes completion_data, bytes model_metadata, string error_message, (string, string, string) updated_convo_history)
        (bool hasError, bytes memory completionData, , string memory errorMsg, ) = abi.decode(
            result, 
            (bool, bytes, bytes, string, ConvoHistory)
        );
        
        if (hasError) {
            intel.summary = string(abi.encodePacked("LLM Error: ", errorMsg));
            intel.confidence = 0;
        } else {
            intel.summary = string(completionData);
            intel.confidence = 85;
        }
        intel.settled = true;
        
        emit IntelSettled(jobId, intel.summary, intel.alphaType, intel.confidence);
    }

    // 3. JQ Request (Whale Alert)
    function requestJQ(bytes calldata payload, string calldata displaySource) external payable {
        bytes32 jobId = IAsyncPrecompile(JQ_PRECOMPILE).request{value: msg.value}(
            address(this),
            this.onJQResult.selector,
            payload
        );
        
        alphaFeed.push(AlphaIntel({
            summary: "Processing Whale Alert...",
            alphaType: "WHALE",
            source: displaySource,
            confidence: 0,
            timestamp: block.timestamp,
            settled: false
        }));
        jobToFeedIndex[jobId] = alphaFeed.length - 1;
        
        emit IntelRequested(jobId, msg.sender, "Whale Alert");
    }

    function onJQResult(bytes32 jobId, bytes calldata result) external onlyAsyncDelivery {
        uint256 idx = jobToFeedIndex[jobId];
        AlphaIntel storage intel = alphaFeed[idx];
        
        // For JQ, we assume it's just bytes returning the parsed string
        intel.summary = string(result);
        intel.confidence = 90;
        intel.settled = true;
        
        emit IntelSettled(jobId, intel.summary, intel.alphaType, intel.confidence);
    }
    
    function getAlphaFeedLength() external view returns (uint256) {
        return alphaFeed.length;
    }
}
