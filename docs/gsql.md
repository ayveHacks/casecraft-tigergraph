# GSQL Queries

CaseCraft utilizes TigerGraph's GSQL for highly efficient, multi-hop relationship traversals that would be too slow in a traditional relational database.

## Core Queries

- `get_transaction`: Retrieves a transaction and its immediate 1-hop neighborhood (Card, Device, Customer, Region).
- `get_card_history`: Traverses `Card -> MADE -> Transaction` ordered by `ts`.
- `find_related_transactions`: Identifies all transactions sharing the same `DeviceProfile` within a given time window to detect bursts of unauthorized activity.
- `find_similar_cases`: Explores `Transaction -> ON_CARD -> ClosedCase` or matches similar structural patterns (e.g., same region and same device) to fetch historical case precedents.

## Analytics Patterns (Deterministically modeled via GSQL)

1. **Card Testing (`detect_card_testing`)**:
   Looks for `>=3` small (`amount < $5`) online authorizations within a short time window (`time_diff < 1h`), followed immediately by a significantly larger purchase.
2. **Shared Origin (`detect_shared_origin`)**:
   Starts at a `DeviceProfile` or `BillingRegion`, traversing back to find multiple distinct `Card` or `Customer` entities making transactions within minutes of each other.
