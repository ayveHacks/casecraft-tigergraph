import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.agent.workflow import run_investigation

cases_to_test = ["HHG-001", "HHG-009", "HHG-016"]

print("Running E2E tests for specific cases...")
for case_id in cases_to_test:
    try:
        print(f"Testing {case_id}...")
        result = run_investigation(case_id)
        print(f"Success: {case_id} -> Verdict: {result['case']['verdict']} | Prob: {result['case']['fraud_probability']}")
    except Exception as e:
        print(f"Failed {case_id}: {e}")
