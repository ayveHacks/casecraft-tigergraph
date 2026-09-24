# Implementation Audit: CaseCraft

## 1. What Already Works
- **Frontend Architecture**: React + Vite + Tailwind CSS. The dashboard has the fundamental styling, benchmark sidebar, and structural layout (branding, probability, exposure). ReactFlow is integrated for basic graph visualization.
- **Backend Architecture**: FastAPI server running on port 8000, serving `/api/cases` endpoints.
- **Policy Engine**: `backend/policy/rules.py` implements a deterministic rule evaluation for R1-R10.
- **Benchmark Runner**: `scripts/run_benchmark.py` iterates over the case pack and orchestrates investigation calls.
- **Validation**: `scripts/validate_cases.py` checks the JSON structure against the required schema.

## 2. What Is Currently Mocked (Fabricated)
- **Graph Retrieval**: `workflow.py` currently loads transactions from CSVs using flat file reading rather than graph traversals.
- **Evidence Generation**: If the LLM rate-limits or fails, a hardcoded Python `if amount > 100` block intercepts the process and fabricates a "card_testing" verdict.
- **Counter-evidence / Hypotheses**: Only superficially generated or hardcoded.
- **Closed Case Memory**: Not currently implemented.
- **Investigation Replay / Timeline**: The backend returns a static single-step stub.

## 3. What Is Actually Connected to TigerGraph
- **Nothing**. Currently, the system uses flat CSVs or hardcoded fallbacks. The schema (`schema.gsql`) and `docs/mcp.md` exist conceptually, but the active runtime does not execute live GSQL through `pyTigerGraph` or an active MCP server.

## 4. What Is Missing
- **MockGraphAdapter / RealTigerGraphAdapter**: A clean interface layer that either routes to a live TigerGraph instance or performs legitimate simulated graph traversals over the real local `transactions.csv`.
- **Rich UI Panels**: "What would change my decision?", "Prior Cleared Cases", "Investigation Replay", and a detailed "Hypothesis Board".
- **Dynamic ReactFlow Data**: The graph currently uses static nodes (Txn, Customer, Card) rather than dynamically parsing the actual graph paths discovered during investigation.

## 5. What Must Be Changed
- **`backend/agent/workflow.py`**: Must be completely rewritten into a multi-step Agentic pipeline (Trigger -> Graph Retrieval -> Pattern Analysis -> Hypothesis Generation -> Simulated Response -> Policy -> Write to Memory). No fabricated fallback logic.
- **`App.tsx`**: Must be expanded to render the rich JSON output (Timeline, Hypotheses, Evidence Ledger with Sources).
- **Data Integrity**: Ensure `Txn: Unknown` never happens. The system must natively read from `data/raw/transactions.csv` properly mapping `case_pack.csv`.

## 6. What Will Be Preserved
- The existing React Dashboard aesthetic (Dark analyst interface, Lucide icons, Tailwind structure).
- The deterministic `policy/rules.py` engine.
- The benchmark runner structure.
- The `FastAPI` integration.
