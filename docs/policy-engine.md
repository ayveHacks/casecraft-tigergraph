# Policy Engine

The Policy Engine is a deterministic Python firewall that sits between the Agent's recommendations and the actual execution of actions in the system. It implements Rules R1-R10.

## Rules
- **R1**: Weak signal (<0.70 probability) -> Verify before blocking.
- **R2**: Customer denies -> BLOCK_CARD, CREATE_CASE. Escalate to SAR (FILE_REPORT) if exposure > $1000.
- **R3**: Customer confirms -> CLOSE_NO_FRAUD.
- **R4**: No reply in 24h -> MONITOR_CARD, DECLINE pending. Escalate if exposure > $500.
- **R5**: Card Testing pattern -> DECLINE_TRANSACTION, STEP_UP_AUTH. BLOCK if exposure > $100.
- **R6**: Shared Origin -> CREATE_CASE, FILE_REPORT, MONITOR_CONNECTED_CARDS.
- **R7**: Disputed recurring -> WARN_CUSTOMER, do not block.
- **R8**: Uncertain + high exposure > $500 -> ESCALATE_TO_ANALYST.
- **R9**: Undocumented abuse -> ESCALATE_TO_ANALYST, FILE_REPORT.
- **R10**: Never BLOCK_ALL_CARDS unless 2+ cards show confirmed fraud or credentials compromised.

## Approval Routing
- **AUTO**: Automated system actions (ALLOW, MONITOR, VERIFY, CREATE_CASE, CLOSE).
- **L1**: Analyst Level 1 (DECLINE, BLOCK if <= $2500).
- **L2**: Analyst Level 2 (BLOCK if > $2500, BLOCK_ALL_CARDS, FILE_REPORT).
