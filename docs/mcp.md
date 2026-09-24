# Model Context Protocol (MCP) Integration

CaseCraft integrates TigerGraph capabilities into the AI Agent via MCP. 

## MCP Setup
1. Configure your LLM client to use the `tigergraph-mcp` server.
2. Provide TigerGraph connection variables (`TIGERGRAPH_HOST`, `TIGERGRAPH_TOKEN`).

## Available MCP Tools
- `execute_gsql`: Run raw GSQL queries to traverse the `CaseCraft` graph.
- `get_transaction_context`: A wrapper that fetches a transaction and its 2-hop neighborhood.
- `detect_pattern`: Calls specific installed algorithms to identify card testing or out-of-region use.

Using MCP, the agent dynamically requests only the data it needs, avoiding the context bloat of loading entire CSV files into prompt memory.
