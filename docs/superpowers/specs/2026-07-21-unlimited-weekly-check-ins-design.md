# Unlimited Weekly Check-ins Design

## Summary

Founders can post any number of check-ins during the same seven-day period, including multiple check-ins for the same product. Additional check-ins in that period do not advance the founder's weekly streak.

## Current behavior

The check-in API rejects a second check-in for the same product when the latest one is less than seven days old. The products endpoint mirrors that restriction by returning `checkInLockedUntil`, and the check-in form disables products carrying that value.

## Design

The API will continue verifying that a selected product belongs to the authenticated founder, but it will no longer query the latest check-in or reject a new one based on age. The check-in form will render every product as selectable and remove the weekly-lock message.

The products endpoint will temporarily retain its `checkInLockedUntil` metadata calculation. The form no longer consumes that value, so it cannot restrict posting. Keeping the response shape unchanged avoids an import-level merge conflict with open PR #3, which adds check-in editing logic beside the same streak constants.

The existing streak calculation remains unchanged. It stores every accepted check-in while allowing at most one streak increment within a seven-day period.

## Compatibility

No schema, migration, or API response changes are required. Open PR #3 also changes `packages/api/src/routers/matilha.ts`; retaining the products response metadata keeps this work's router edit limited to `checkIns.create`, allowing the two branches to merge cleanly.

## Verification

Regression coverage will confirm the intended same-week streak behavior while the API and UI restrictions are removed. The API tests, web tests, type checks, and repository formatting/lint checks will run before publishing the PR.
