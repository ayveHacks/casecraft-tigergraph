import csv
import random
import os
from datetime import datetime, timedelta

def generate_mock_data():
    raw_dir = os.path.join("data", "raw")
    os.makedirs(raw_dir, exist_ok=True)
    
    num_txns = 1000
    random.seed(42)
    
    # 1. Transactions
    base_time = datetime(2023, 1, 1)
    
    with open(os.path.join(raw_dir, 'transactions.csv'), 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['TransactionID', 'customer_id', 'ts', 'channel', 'risk_score', 'TransactionAmt', 'ProductCD', 'card1'])
        for i in range(num_txns):
            txn_id = 3000000 + i
            cust_id = random.randint(10000, 10500)
            ts = base_time + timedelta(minutes=random.randint(0, 500000))
            channel = random.choices(['online', 'in_person'], weights=[80, 20])[0]
            risk_score = round(random.uniform(0.01, 0.99), 2)
            amt = round(random.expovariate(1/100), 2)
            prod = 'W' if channel == 'in_person' else random.choice(['C', 'H', 'R', 'S'])
            card1 = random.randint(1000, 15000)
            writer.writerow([txn_id, cust_id, ts.isoformat(), channel, risk_score, amt, prod, card1])
            
    # 2. Case Pack
    with open(os.path.join(raw_dir, 'case_pack.csv'), 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['case_id', 'trigger_transaction_id', 'customer_id'])
        for i in range(1, 21):
            writer.writerow([f"HHG-{i:03d}", 3000000 + i*10, 10000 + i])
            
    print("Mock dataset generated successfully without pandas.")

if __name__ == '__main__':
    generate_mock_data()
