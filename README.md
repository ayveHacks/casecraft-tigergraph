# CASECRAFT

**"From suspicious signals to defensible decisions."**

Hacker House Goa 2026 - Task 04 — TigerGraph Agentic Fraud Investigation HHGOA

## Project Overview

CaseCraft is an AI-powered fraud INVESTIGATOR that connects to TigerGraph. Unlike generic fraud classifiers or simple transaction dashboards, CaseCraft models the entire investigation process: it ingests a trigger, explores graph relationships (Customer, Card, Device, Transactions, Region, Email), forms hypotheses, evaluates evidence, and deterministically applies policy (R1-R10) to reach defensible next-best-actions. 

## Key Features

- **TigerGraph Investigation Engine**: Native GSQL queries traverse relationships to detect patterns like card testing, shared origin, and out-of-region use.
- **Hypothesis Board**: Explores competing hypotheses and explicitly lists both supporting and contradicting evidence.
- **Evidence Planner**: Identifies missing decision-sensitive evidence, simulating requests when necessary.
- **Policy Firewall**: LLM-recommended actions are filtered through a strict, deterministic rule engine (R1-R10) defining approval routes.
- **Case Memory**: Graph-stored historical case outcomes inform the probability of fraud for new cases.
- **SAR Generation**: Automatic generation of Suspicious Activity Reports when required by policy.

## Architecture

Please see [docs/architecture.md](docs/architecture.md) for a complete system diagram and component breakdown.

## Installation & Setup

1. **Clone the repository.**
2. **Environment Setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your LLM keys and TigerGraph credentials
   ```
3. **Data Placement:**
   Ensure the following files are present in `data/raw/`:
   - `transactions.csv`
   - `identity.csv`
   - `closed_cases_history.csv`
   - `case_pack.csv`
   
   *(Note: If the dataset is not present, you can run `python scripts/prepare_mock_data.py` to generate a synthetic dataset for testing).*

4. **Backend Setup:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   pip install -r backend/requirements.txt
   ```

5. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## TigerGraph Setup

1. Spin up a TigerGraph instance (Savanna or Community Edition).
2. Run the schema creation script located at `tigergraph/schema/schema.gsql`.
3. Use the TigerGraph MCP for native integration with the LLM reasoning agent.

## Running the Benchmark

To evaluate the system against the 20 test cases in `case_pack.csv`:
```bash
python scripts/run_benchmark.py
python scripts/validate_cases.py
```
This will produce output JSONs in the `cases/` directory, log metrics, and validate schema constraints.

## Technical Blog

For an in-depth dive into our engineering decisions, graph schema, and agent workflows, read our [Technical Blog](blog/technical-blog.md).

## Contributors
- Ayush Verma
