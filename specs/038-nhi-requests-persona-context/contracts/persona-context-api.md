# Persona Context Switching API Contract

## POST /governance/context/switch
Switch to a persona context.
- Body: `{ persona_id: string, reason?: string }`
- Response 200: `SwitchContextResponse`
- Sets new access_token cookie with persona JWT

## POST /governance/context/switch-back
Switch back to physical user identity.
- Body: `{ reason?: string }`
- Response 200: `SwitchContextResponse`
- Restores original access_token cookie

## GET /governance/context/current
Get current identity context.
- Response 200: `CurrentContextResponse`

## GET /governance/context/sessions
List context switch session history.
- Query: `limit?`, `offset?`
- Response 200: `{ items: ContextSessionSummary[], total: number }`
