# Security Specification for The Bridge Cafe

## Data Invariants
1. A customer cannot have negative loyalty points.
2. Orders must have at least one item.
3. Order totals must be calculated based on item prices (enforced by application logic, but validated by type).
4. Order status must follow the defined `enum`.
5. Timestamps (`createdAt`, `updatedAt`) must be server-generated.

## The Dirty Dozen Payloads
1. **Identity Theft**: Creating a customer profile with someone else's ID.
2. **Infinite Points**: Setting `loyaltyPoints` to 999999 on creation.
3. **Price Manipulation**: Creating an order with a `total` of $0 but containing premium items.
4. **Status Shortcut**: Setting an order to "Delivered" immediately upon creation.
5. **Orphaned Order**: Creating an order without a `customerName`.
6. **Path Poisoning**: Using a 1MB string as a `customerId`.
7. **Timestamp Spoofing**: Sending an old date as `createdAt` to bypass recent activity checks.
8. **Field Injection**: Adding an `isAdmin: true` field to a customer document.
9. **Negative Quantity**: Ordering -5 muffins to reduce the total.
10. **Cross-User Points**: Updating another customer's loyalty points balance.
11. **Status Reversion**: Moving a "Delivered" order back to "Preparing".
12. **Blanket Read**: Querying the entire `customers` collection without a phone number filter.

## Test Runner (Draft)
A standard `firestore.rules.test.ts` would verify these, but for now, we focus on the rule logic.
