import os
import json
import time
import csv
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.agent.workflow import run_investigation

def main():
    cases_dir = "cases"
    os.makedirs(cases_dir, exist_ok=True)
    os.makedirs("benchmark/logs", exist_ok=True)
    
    pack_path = "data/raw/case_pack.csv"
    if not os.path.exists(pack_path):
        print(f"Error: {pack_path} not found. Please run prepare_mock_data.py first.")
        return

    results = []
    total_time = 0
    start_time = time.time()
    
    with open(pack_path, 'r') as f:
        reader = csv.DictReader(f)
        cases = list(reader)
        
    print(f"Running benchmark on {len(cases)} cases...")
    for idx, row in enumerate(cases):
        case_id = row['case_id']
        print(f"[{idx+1}/{len(cases)}] Investigating {case_id}...")
        
        try:
            res = run_investigation(case_id)
            results.append({
                "case_id": case_id,
                "status": "SUCCESS",
                "fraud_probability": res["case"]["fraud_probability"],
                "verdict": res["case"]["verdict"],
                "latency_s": res["latency_s"]
            })
            total_time += res["latency_s"]
        except Exception as e:
            print(f"  Error on {case_id}: {e}")
            results.append({
                "case_id": case_id,
                "status": "ERROR",
                "error": str(e)
            })
            
    metrics = {
        "total_cases": len(cases),
        "successful_cases": len([r for r in results if r["status"] == "SUCCESS"]),
        "total_latency_s": round(total_time, 2),
        "avg_latency_s": round(total_time / len(cases), 2) if len(cases) > 0 else 0,
        "total_wall_time_s": round(time.time() - start_time, 2)
    }
    
    with open("benchmark/results.json", "w") as f:
        json.dump(results, f, indent=2)
        
    with open("benchmark/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
        
    print("Benchmark completed.")

if __name__ == '__main__':
    main()
