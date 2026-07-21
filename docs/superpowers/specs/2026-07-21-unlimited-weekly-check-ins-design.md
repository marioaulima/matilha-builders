# Unlimited Weekly Check-ins Design

## Summary

Founders can post any number of check-ins during the same seven-day period, including multiple check-ins for the same product. Additional check-ins in that period do not advance the founder's weekly streak.

## Current behavior

The check-in API rejects a second check-in for the same product when the latest one is less than seven days old. The products endpoint mirrors that restriction by returning `checkInLockedUntil`, and the check-in form disables products carrying that value.

## Design

The API will continue verifying that a selected product belongs to the authenticated founder, but it will no longer query the latest check-in or reject a new one based on age. The products endpoint will return the founder's products directly, without calculating weekly lock metadata. The check-in form will render every product as selectable and remove the weekly-lock message.

The existing streak calculation remains unchanged. It stores every accepted check-in while allowing at most one streak increment within a seven-day period.

## Compatibility

No schema or migration changes are required. The change removes the additive `checkInLockedUntil` response property, which is used only by the check-in form. Open PR #3 also changes `packages/api/src/routers/matilha.ts`, but in separate helper and procedure sections; this work will keep the router edits limited to `checkIns.create`, `products.mine`, and now-unused imports.

## Verification

Regression coverage will confirm the intended same-week streak behavior while the API and UI restrictions are removed. The API tests, web tests, type checks, and repository formatting/lint checks will run before publishing the PR.
