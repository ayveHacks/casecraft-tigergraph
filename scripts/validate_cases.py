import os
import json
import glob

def validate():
    cases_dir = "cases"
    case_files = glob.glob(os.path.join(cases_dir, "HHG-*.json"))
    
    if len(case_files) != 20:
        print(f"FAIL: Expected 20 case files, found {len(case_files)}.")
        return False
        
    all_passed = True
    for fpath in case_files:
        with open(fpath, 'r') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                print(f"FAIL: {fpath} is not valid JSON.")
                all_passed = False
                continue
                
        # Required top-level fields
        required_top_level = ["case_id", "case", "evidence_requests", "next_best_actions", "sar", "stop_reason", "tool_calls", "tokens", "latency_s"]
        for field in required_top_level:
            if field not in data:
                print(f"FAIL: {fpath} missing top-level field '{field}'.")
                all_passed = False
                
        # Legitimate case rules
        case_data = data.get("case", {})
        verdict = case_data.get("verdict")
        if verdict == "LEGITIMATE":
            if len(case_data.get("affected_txn_ids", [])) > 0:
                print(f"FAIL: {fpath} is LEGITIMATE but has affected_txn_ids.")
                all_passed = False
            if case_data.get("exposure_usd", 0) > 0:
                print(f"FAIL: {fpath} is LEGITIMATE but has exposure_usd > 0.")
                all_passed = False
            if data.get("sar", {}).get("file") is True:
                print(f"FAIL: {fpath} is LEGITIMATE but sar.file is true.")
                all_passed = False

    if all_passed:
        print("PASS: All cases validated successfully.")
    else:
        print("Validation failed.")
        
    return all_passed

if __name__ == '__main__':
    validate()
