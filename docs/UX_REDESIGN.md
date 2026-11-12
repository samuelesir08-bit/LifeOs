# LifeOS UX refresh

This release focuses on making the existing product easier to use without changing the underlying data model or removing modules.

## Daily experience

- The Home screen is now a compact daily command center: live date and greeting, recorded balance, open tasks, today's habit progress, quick task capture, next recommended action, today's schedule and habit checklist.
- Repeated dashboard summaries were removed in favor of a smaller set of actionable sections.
- The main navigation is reduced to Home, Attività, Calendario and Analisi, with a fifth "Altro" entry for Soldi, Obiettivi, Progetti, Abitudini, Studio and Account.

## Dates and habits

- A local clock refreshes the UI while the app is open, so date-based views move forward without requiring a manual reload.
- New transactions keep their existing display date and month fields and now also store an ISO local date in `dateISO`.
- Existing transaction records are not rewritten.
- Legacy habits that only had a boolean `done` value are migrated once to `completedDates`. Existing date history is preserved.
- Habit completion is derived from today's local date. On a new day, yesterday's completion no longer appears as today's completion; the history and streak calculation remain intact.
- Manual daily reset has been removed because it is unnecessary and risks deleting useful history.

## Finance analysis

- Added a six-month vertical comparison chart for recorded income and expenses.
- The chart uses the actual stored monthly transaction totals; zero-value months remain empty rather than displaying fabricated bars.
- Existing category and month detail views remain available.

## Compatibility and validation

- Existing Supabase account storage and account-specific local snapshots are unchanged.
- Existing task, event, project, habit and transaction records remain supported.
- New transaction dates are additive; old records retain their original fields.
- CI validates the Expo web export. Manual device testing is still required for iOS/iPadOS layout, timezone changes and the midnight transition.
