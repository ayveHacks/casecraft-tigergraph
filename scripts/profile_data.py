import pandas as pd
import os

def profile_data():
    raw_dir = os.path.join("data", "raw")
    docs_dir = "docs"
    os.makedirs(docs_dir, exist_ok=True)
    
    with open(os.path.join(docs_dir, 'data-profile.md'), 'w') as f:
        f.write("# Internal Data Profile\n\n")
        
        # Profile Transactions
        txns_path = os.path.join(raw_dir, 'transactions.csv')
        if os.path.exists(txns_path):
            f.write("## Transactions\n")
            # We read in chunks to avoid memory issues (simulating for the 708MB file)
            chunk_iter = pd.read_csv(txns_path, chunksize=10000)
            total_rows = 0
            channels = set()
            nulls = {}
            for chunk in chunk_iter:
                total_rows += len(chunk)
                channels.update(chunk['channel'].dropna().unique())
                for col in chunk.columns:
                    nulls[col] = nulls.get(col, 0) + chunk[col].isnull().sum()
            
            f.write(f"- Total Rows (approx): {total_rows}\n")
            f.write(f"- Channels observed: {list(channels)}\n")
            f.write("\n")
        else:
            f.write("## Transactions\nFile missing.\n\n")

        # Profile Identity
        id_path = os.path.join(raw_dir, 'identity.csv')
        if os.path.exists(id_path):
            f.write("## Identity\n")
            df_id = pd.read_csv(id_path)
            f.write(f"- Total Rows: {len(df_id)}\n")
            f.write(f"- Devices observed: {df_id['DeviceInfo'].nunique()} unique\n")
            f.write("\n")
        else:
            f.write("## Identity\nFile missing.\n\n")
            
        # Profile Closed Cases
        cases_path = os.path.join(raw_dir, 'closed_cases_history.csv')
        if os.path.exists(cases_path):
            f.write("## Closed Cases History\n")
            df_cases = pd.read_csv(cases_path)
            f.write(f"- Total Closed Cases: {len(df_cases)}\n")
            f.write(f"- Verdicts: {df_cases['verdict'].value_counts().to_dict()}\n")
            f.write(f"- Patterns: {df_cases['pattern'].value_counts().to_dict()}\n")
            f.write("\n")
            
        # Profile Case Pack
        pack_path = os.path.join(raw_dir, 'case_pack.csv')
        if os.path.exists(pack_path):
            f.write("## Benchmark Case Pack\n")
            df_pack = pd.read_csv(pack_path)
            f.write(f"- Total Cases: {len(df_pack)}\n")
            f.write("\n")
            
    print("Data profile written to docs/data-profile.md")

if __name__ == '__main__':
    profile_data()
