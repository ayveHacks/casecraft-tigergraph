# Agent Workflow

The Investigator Agent uses a deterministic state machine modeled around LLM reasoning loops.

## Loop Steps
1. **Trigger Received**: The agent is invoked with a `case_id` pointing to a `trigger_transaction_id`.
2. **Graph Exploration**: The agent calls TigerGraph via MCP to gather 1-hop and N-hop context (Card history, Device connections).
3. **Hypothesis Formation**: The agent lists competing hypotheses (e.g., `card_testing` vs `legitimate_activity`) along with explicitly mapped supporting and contradicting evidence.
4. **Evidence Planning**: The agent determines the most critical piece of missing evidence (usually `customer_validation`).
5. **Simulation**: Since the benchmark does not provide a live customer, the agent simulates the customer response based on the dataset logic.
6. **Reassessment**: The fraud probability is updated using the simulated evidence.
7. **Policy Enforcement**: The final probability and evidence context is passed to the deterministic Policy Engine (R1-R10) to select actions.
8. **Case Generation**: Output is structured into the benchmark-required JSON format.
