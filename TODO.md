> Notes for future improvements - revisit when refining note management UX and architecture.

#### **Refactor Hooks**

- Consider splitting `useNotes` into smaller, focused hooks:
  - `useNoteEncryption` - handles decrypting/encrypting notes.
  - `useNoteActions` – handles CRUD actions (create/update/delete).
  - `useProtectedNotes`
- This will make the logic reusable in components like `NoteViewer`, reducing duplication.

#### **Improve UX for Async Actions**

Currently, server actions running database calls do not update UI to a pending state. Add **one of the following**:

- Loading indicators or feedback during server actions via a `pending` state.
- `useOptimistic` for instant UI updates.
