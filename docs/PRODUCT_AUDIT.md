# LifeOS — Product audit and competitive benchmark

Last reviewed: 2026-11-12

## Executive assessment

LifeOS already brings personal finance, goals, projects, tasks, habits, calendar and study tracking into one Expo app. Its differentiator should be the connection between those areas: a single daily operating view that turns goals and obligations into the next useful action.

The current implementation is an early MVP, not yet a mature personal operating system. It uses one large React Native screen, a single JSON document per user, basic task metadata, manual habit reset, a limited calendar experience, and simple finance tracking.

## Benchmark

| Product | Strong patterns worth learning from | LifeOS opportunity |
| --- | --- | --- |
| Todoist | Fast task capture, recurring dates, priorities, filters, calendar views and clear project hierarchy | Quick capture, due dates, useful filters, recurring tasks, subtasks |
| TickTick | Calendar views, habit statistics, Pomodoro, Eisenhower matrix, task focus and widgets | Daily focus flow, habit history/streaks, time tracking, weekly planning |
| Notion | Flexible connected databases, docs, dashboards, search and automation | Connect projects, tasks, notes and goals rather than duplicating information |
| YNAB | Intentional category budgets, savings targets and actionable spending reports | Monthly planning, recurring transactions, account balances, savings allocation and cash-flow forecasting |

References:
- https://www.todoist.com/task-management
- https://www.todoist.com/help/todoist/features
- https://ticktick.com/features
- https://www.notion.com/product/features
- https://www.ynab.com/features

## Current weaknesses found in code

### Product and UX
- Bottom navigation attempts to fit nine destinations into one row; labels become cramped on phones.
- Backup controls occupy the top of the Home dashboard instead of a dedicated account/settings area.
- Tasks only have name, priority and completion state; there is no due date, useful filtering or delete affordance in the task list.
- Habits are stored as a boolean and require a manual reset; this cannot support reliable streaks or history.
- The dashboard has useful summaries, but tasks and events are not consistently treated as one schedule.
- Several inputs require manually typed dates without a date picker or validation beyond basic checks.
- The interface has no global search, tags, recurring items, subtasks or keyboard-first quick capture.

### Data and reliability
- All user data is stored in one JSON document. This is simple for an MVP but creates conflict and scaling risks as the app grows.
- Cloud sync is last-write-wins; concurrent edits on two devices can overwrite each other.
- The app needs explicit conflict handling, versioning and safer account-switch behavior before multi-device use is trusted.
- Native backup import is unavailable; backup restore should work on iOS/iPadOS too.
- Transaction dates are stored as localized display strings, which are unsuitable for robust sorting and reporting.
- There is no automated unit or end-to-end test suite yet.

### Platform and commercial readiness
- Apple Calendar access is native-only; browser limitations must be explained clearly in product UI.
- Push notifications, widgets, background reminders and focus timers are not yet implemented.
- AI must run through a server-side function; provider secrets must never ship in the client.
- Subscription entitlements need server-side validation and platform-specific purchase flows.
- Account deletion, privacy policy, terms, data export and retention controls need to be completed before commercial launch.

## Improvements shipped in the first UX pass

- Added optional task due dates while preserving older task records.
- Added task views for all, open, today, overdue and completed tasks.
- Sorted open tasks by due date and priority.
- Added task deletion with confirmation and accessible labels.
- Included dated tasks in dashboard reminders and the suggested next action.
- Moved backup actions from the main dashboard into Account.
- Replaced the cramped nine-item bottom row with horizontally scrollable navigation and an Account destination.

## Prioritized roadmap

### P0 — Trust and data safety
1. Confirm Supabase is fully online and verify the deployed schema and RLS with two test users.
2. Rotate the exposed historical secret and remove it from Git history; audit old deployment artifacts.
3. Add sync revision/version checks and conflict resolution; never silently overwrite newer remote data.
4. Add account-scoped local storage and a safe sign-out/account-switch flow.
5. Add native backup import and restore verification.

### P1 — Daily operating experience
1. Global search across tasks, projects, events, goals and transactions.
2. Quick capture from any screen.
3. A proper Today view with overdue, scheduled, priority and estimated-duration grouping.
4. Habit history, streaks, weekly consistency and missed-day handling.
5. Calendar agenda/week/month views, date picker and reminders.
6. Task subtasks, tags, recurring rules and estimated duration.
7. Project milestones linked to tasks and goals.

### P2 — Finance and study depth
1. Multiple accounts and account transfers.
2. Recurring income/expenses, subscriptions and transaction editing.
3. Budget rollover, savings allocation and cash-flow forecast.
4. Study sessions with history, exam countdowns, study targets and spaced repetition.
5. Better analytics with selectable periods and empty-state guidance.

### P3 — Differentiation and business model
1. AI daily planner grounded in the user's own data, with explicit confirmation before actions.
2. Automations and reminders with transparent permissions and logs.
3. Freemium/Pro entitlements with server-side checks.
4. Collaboration only if user demand validates it.
5. Native widgets, Shortcuts and polished iPad split-view experience.

## Product principle

LifeOS should not try to copy every feature from every competitor. Its advantage should be a coherent personal command center: one place to capture, plan, act, review and understand the consequences for time, money and long-term goals.
