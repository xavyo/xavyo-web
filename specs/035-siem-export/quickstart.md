# Phase 035 — SIEM Export & Audit Streaming: Integration Test Scenarios

## Scenario 1: Create and View Destination

1. Navigate to `/governance/siem`.
2. Click "Add Destination".
3. Fill in the form: name = "Production Splunk", type = `splunk_hec`, host = `splunk.example.com`, port = `8088`, format = `json`.
4. Fill Splunk-specific fields: source = `xavyo`, sourcetype = `idp_events`, index = `security`.
5. Submit the form. Expect redirect to the destination detail page.
6. Verify the info card shows all config fields with correct values.
7. Click "Test Connection" and verify the result is displayed.

## Scenario 2: Enable/Disable/Delete Destination

1. Navigate to a destination detail page.
2. Click "Disable". Verify the status badge changes to `disabled`.
3. Click "Enable". Verify the status badge changes back to `enabled`.
4. Click "Delete". Confirm in the dialog. Expect redirect to the destination list.
5. Verify the destination is no longer shown in the list.

## Scenario 3: View Health Metrics

1. Navigate to a destination detail page, then click the Health tab.
2. Verify health summary cards are displayed: events sent, events delivered, events failed, events dropped.
3. Verify the success rate percentage is displayed.
4. Verify the circuit state badge is shown with the correct color (closed = green, open = red, half_open = yellow).

## Scenario 4: Create Batch Export

1. Navigate to `/governance/siem`, then click the Batch Exports tab.
2. Click "Create Export".
3. Fill in the form: date range = last 7 days, format = `json`.
4. Submit the form. Verify the export appears in the list with a "Pending" status badge.
5. Refresh the page. Verify the status changes to "Completed" (or "Failed" with an error message).
6. Click the download button on a completed export.

## Scenario 5: Dead Letter Queue

1. Navigate to a destination detail page, then click the Dead Letter tab.
2. View failed events with their error details.
3. Click "Redeliver All". Verify a toast notification shows the requeued count.
4. Verify the DLQ table refreshes and entries are removed if redelivery succeeds.

## Scenario 6: Edit Destination

1. Navigate to a destination detail page, then click Edit.
2. Change the name and export format fields.
3. Submit the form. Expect redirect to the detail page with the updated field values displayed.

## Scenario 7: Dynamic Form Fields

1. On the create destination form, select type `splunk_hec`. Verify Splunk-specific fields (source, sourcetype, index, ack) appear.
2. Switch type to `syslog_tcp_tls`. Verify Syslog-specific fields (facility, tls_verify) appear and Splunk fields disappear.
3. Switch type to `webhook`. Verify neither Splunk nor Syslog fields are shown.
