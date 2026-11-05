# Geriatric Care Assessment form

The take-home from the brief: a one page form a visiting nurse fills in while checking on
an elderly patient at home. React 19, TypeScript, Mantine 9, `@mantine/form` and the Zod 4
schema that came with the brief. All data in the repo is made up.

Live: https://geriatric-assessment-amit.netlify.app/

## Running it

The template pins Node 26 in `.node-version`, so use that. On Node 22 `yarn test` crashes
while vitest loads undici, which is how I found out.

```
corepack enable
yarn install
yarn dev        # http://localhost:5173
yarn test       # typecheck, oxlint, format check, stylelint, vitest, build
```

"Load sample patient" fills the form with the valid fixture from the brief.

## Layout

`src/App.tsx` has the Container, Paper and heading. Everything else is in
`src/features/assessment/`:

- `schema.ts`, the schema as given, rules and messages untouched
- `values.ts`, the form's value type, the empty values and the sample patient
- `AssessmentForm.tsx`, the form
- `save.ts`, the fake 800ms save
- two test files next to the code

## How the schema is used

Validation is `schemaResolver(assessmentSchema)` and nothing else, so no rule lives in
a component. The only numbers in the JSX are the ones the brief asks for (`step`, `min`,
`max`, `maxDate`).

An empty form can't be an `Assessment`, so the form's value type, `AssessmentDraft`, is
mapped from `Assessment` instead of being written out a second time: numbers may be empty,
enums and dates start as `''`. Add a field to the schema and the compiler points at
`values.ts`.

The resolver only reports errors, it doesn't hand back parsed data. For that I use
`transformValues`, which calls `assessmentSchema.parse`. Mantine runs it after validation
passed, so it can't throw, and the submit handler gets a real `Assessment`. That is what
ends up in the success box. The form test types stray spaces around the name and checks
the trimmed name arrives; saving the raw state would fail it.

## Decisions

- **A typed number is never changed.** Mantine's `NumberInput` clamps to `min` and `max`
  on blur, so 105 would quietly become 100 and pass. I set `clampBehavior="none"`: 105
  stays 105 and gets rejected. Decimals and negatives stay typeable too, otherwise the
  "whole number" and "cannot be negative" messages could never show.
- **Some rules sit on another field.** The age rule depends on the assessment date, the
  pharmacist rule on the medication count. Without a nudge, fixing the assessment date left
  a red error under date of birth until you clicked back into it. So leaving one of those
  fields also re-checks the fields that depend on it, but only the ones already touched.
- **Dates** are typed and shown as `YYYY-MM-DD`, the format the schema wants, so nothing
  gets converted on the way in.
- **Asterisks, but no `required` attribute.** The browser's own popup would stop the form
  before Zod gets to say anything.
- **Consent** has its own label above a checkbox carrying the sentence from the brief, and
  the error shows once under both.
- **A failed save** shows a red alert and keeps the answers. Nothing can fail here, but a
  rejected promise shouldn't go unhandled.

Besides the two tests the brief asks for there are the fixture tables from section 5, the
empty form giving exactly 9 errors, a blur test and one checking that 105 stays 105.

## Changes to the template

I removed the router, the demo page, Storybook and `react-router-dom`, since the brief
rules those out. With no `.css` file left, `stylelint '**/*.css'` errors out, so that
script now has `--allow-empty-input`; the stylelint config itself is untouched.
`@mantine/core` and `@mantine/hooks` moved from 9.7.4 to 9.7.5 because `@mantine/dates`
asks for exactly that version.

## Not done

- The build is one 578 kB chunk and Vite warns about it. For a single page I left it.
- `maxDate` uses the browser's local date. The schema has no rule against future dates and
  I didn't add one.
- Half typed input like `-` or `8.` reaches Zod as a string, so it reads "score is
  required" instead of something more precise.
- I clicked through the app in Chromium with a throwaway Playwright script (empty submit,
  sample patient, save, the Barthel edge cases, the age boundary). It isn't in the repo,
  so the only automated tests are the Vitest ones.
- No accessibility work beyond what Mantine does by default.

## Time

About 1 hour 45 minutes.
