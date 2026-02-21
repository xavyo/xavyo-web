# Persona Expiry & Propagation API Contract

## GET /governance/personas/expiring
List personas approaching expiration.
- Query: `days_ahead?`, `limit?`, `offset?`
- Response 200: `{ items: ExpiringPersona[], total: number }`

## POST /governance/personas/{id}/extend
Extend a persona's expiration date.
- Body: `{ new_valid_until: string, reason?: string }`
- Response 200: `ExtendPersonaResponse`

## POST /governance/personas/{id}/propagate-attributes
Propagate archetype attributes to a persona.
- Response 200: `{ persona_id: string, attributes_updated: number }`
