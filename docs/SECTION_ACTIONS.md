# Section actions UX

LifeOS sections now prioritize reading and managing existing information. Creation and editing controls are disclosed only after the user asks for them.

## Dedicated actions

- Attività: `+ Nuova attività`
- Calendario: `+ Nuovo evento`
- Soldi: `+ Nuova operazione` and a separate `Modifica budget` control
- Obiettivi: `+ Nuovo obiettivo`; each goal has a separate `Aggiorna risparmio` action
- Progetti: `+ Nuovo progetto`; each project has a separate `Gestisci progetto` action for status and deletion
- Abitudini: `+ Nuova abitudine`; each habit has a separate `Gestisci` action for edit/delete
- Studio: `+ Aggiungi materia`; each subject exposes session registration and deletion only after `Registra sessione / Gestisci`

## Behavior

- Forms are hidden by default and appear only after the corresponding action is selected.
- Only one form/action panel is open at a time.
- Navigating to another section closes any open form or editor.
- Successful creation closes the form.
- Existing data and storage schemas are unchanged.
