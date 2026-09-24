# Technical Blog: CASECRAFT – A Native Graph Approach to Agentic Fraud Investigation

## 1. The Problem
Conventional fraud classification is fundamentally limited by tabular data structures and binary outcomes. An ML model might see `risk_score=0.9` and classify a transaction as fraud, but an analyst needs to know *why*, *what relates to it*, and *what the bank should do*. Black-box classifiers fail to produce defensible decisions that can be audited against bank policy.

## 2. Why Conventional Classification is Insufficient
Fraud rings do not operate in isolated, single-row transactions. They coordinate across devices, reuse compromised credentials, and exploit systemic weaknesses. To catch coordinated abuse, we must look at relationships. Tabular joins become computationally intractable at scale (O(N²) or worse for multi-hop relationships). 

## 3. CASECRAFT Concept
"Do not ask the AI to guess whether a transaction is fraud. Ask the AI to investigate it."
CASECRAFT is an agentic framework that connects large language model reasoning directly with TigerGraph's native graph database capabilities. It explores the graph, forms competing hypotheses, searches for counter-evidence, and requests missing decision-sensitive evidence.

## 4. Architecture and Why TigerGraph
We chose TigerGraph because of its distributed architecture and massively parallel processing capabilities. 
TigerGraph allows us to define relationships like `Transaction -> FROM_DEVICE -> DeviceProfile` and run real-time queries to find all transactions sharing a specific device footprint across thousands of customers in milliseconds.

## 5. Graph Schema and GSQL
Our schema heavily models the investigation domain:
- **Core Entities**: `Customer`, `Card`, `Transaction`, `DeviceProfile`, `EmailDomain`, `BillingRegion`
- **Investigation Entities**: `InvestigationCase`, `Evidence`, `InvestigationAction`, `ClosedCase`
Using GSQL, the LLM agent triggers algorithms to identify Card Testing bursts or shared origin networks.

## 6. The Policy Firewall
A unique feature of CASECRAFT is the "Policy Firewall." The LLM is given freedom to explore and recommend, but a strict, deterministic Python rule engine (Rules R1-R10) evaluates the final probability, the customer's response, and the exposure amount to authorize actual system actions (like `BLOCK_CARD` or `FILE_REPORT`). This ensures safety and determinism.

## 7. Simulated Evidence and Reassessment
When the agent realizes its probability of fraud is too ambiguous to block a card, it issues an evidence request (`VERIFY_WITH_CUSTOMER`). In our benchmark runner, we simulate this response deterministically, allowing the agent to reassess the case with the new evidence and alter the final approved actions.

## 8. Results and Engineering Challenges
Implementing this end-to-end taught us the value of deterministic guardrails around LLMs. The benchmark runs through 20 challenging edge cases. We found that the structured LangGraph/State-Machine reasoning loop was necessary to prevent the agent from jumping to conclusions too early. 
