# Graph Schema

Our TigerGraph schema defines the entities and relationships required for deep fraud investigation.

## Vertices
- `Customer`
- `Card`
- `Transaction`
- `DeviceProfile`
- `EmailDomain`
- `BillingRegion`
- `ClosedCase` (Memory of past decisions)
- `InvestigationCase` (Active cases)
- `Evidence`
- `InvestigationAction`

## Edges
- `OWNS` (Customer -> Card)
- `MADE` (Card -> Transaction)
- `FROM_DEVICE` (Transaction -> DeviceProfile)
- `PURCHASER_EMAIL` (Transaction -> EmailDomain)
- `BILLED_IN` (Transaction -> BillingRegion)
- `NEXT` (Transaction -> Transaction) for sequential pattern analysis
- `INVOLVES` (ClosedCase -> Transaction)
- `SIMILAR_TO` (InvestigationCase -> ClosedCase)

For the full GSQL definition, see `tigergraph/schema/schema.gsql`.
