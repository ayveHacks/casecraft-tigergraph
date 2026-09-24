from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(title="CaseCraft API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InvestigateRequest(BaseModel):
    case_id: str

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/cases")
def list_cases():
    cases_dir = "cases"
    if not os.path.exists(cases_dir):
        return {"cases": []}
    
    cases = []
    for filename in os.listdir(cases_dir):
        if filename.endswith(".json"):
            cases.append(filename.replace(".json", ""))
    return {"cases": cases}

@app.get("/api/cases/{case_id}")
def get_case(case_id: str):
    import json
    filepath = os.path.join("cases", f"{case_id}.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Case not found")
    with open(filepath, 'r') as f:
        return json.load(f)

def _load_case_data(case_id: str):
    import json
    filepath = os.path.join("cases", f"{case_id}.json")
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'r') as f:
        return json.load(f)

@app.get("/api/investigations/{case_id}/timeline")
def get_timeline(case_id: str):
    data = _load_case_data(case_id)
    return {"timeline": data.get("timeline", [])} if data else {"timeline": []}

@app.get("/api/investigations/{case_id}/evidence")
def get_evidence(case_id: str):
    data = _load_case_data(case_id)
    return {"evidence": data.get("case", {}).get("evidence", [])} if data else {"evidence": []}

@app.get("/api/investigations/{case_id}/graph")
def get_graph(case_id: str):
    data = _load_case_data(case_id)
    return {"nodes": [], "edges": []}

@app.get("/api/investigations/{case_id}/hypotheses")
def get_hypotheses(case_id: str):
    data = _load_case_data(case_id)
    return {"hypotheses": data.get("hypotheses", [])} if data else {"hypotheses": []}

@app.get("/api/investigations/{case_id}/actions")
def get_actions(case_id: str):
    data = _load_case_data(case_id)
    return {"actions": data.get("next_best_actions", {})} if data else {"actions": {}}

@app.get("/api/cases/{case_id}/sar")
def get_sar(case_id: str):
    data = _load_case_data(case_id)
    return {"sar": data.get("sar", {})} if data else {"sar": {}}

@app.get("/api/memory/similar/{case_id}")
def get_similar(case_id: str):
    data = _load_case_data(case_id)
    return {"similar_cases": data.get("case", {}).get("similar_prior_cases", [])} if data else {"similar_cases": []}

@app.post("/api/investigate")
def investigate(req: InvestigateRequest, background_tasks: BackgroundTasks):
    from agent.workflow import run_investigation
    # In a real app we might run this in a background task
    # For now we'll run it synchronously for simplicity in returning the result
    result = run_investigation(req.case_id)
    return {"status": "investigation_started", "result": result}

@app.post("/api/benchmark/run")
def run_benchmark():
    import subprocess
    # Run the benchmark script
    subprocess.Popen(["python", "scripts/run_benchmark.py"])
    return {"status": "benchmark_started"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
