# Project rules

This file is the source of truth for changes in this repository.

## Architecture

Dependency flow:

`Nuxt composition root → page deps contract ← infrastructure → final API`

The application calls the existing backend API directly. Do not add Nuxt/Nitro
API endpoints, a second BFF, or separate `client` and `server` implementations
unless a concrete requirement appears, such as a secret, unsupported CORS,
server-only authentication, API aggregation, or server caching.

Keep page contracts with their presentation and API details in infrastructure:

```text
app/sections/{section}/{feature}/
  {Feature}PageApplication.vue
  {Feature}PageApplicationDeps.ts
  actions/
    {action}.ts
  view/
    {Feature}Page.vue
    components/

infrastructure/{section}/{feature}/
  openApi{Action}.ts
```

- Each `actions/{action}.ts` owns its input, page data, expected errors, and
  callable contract.
- An action must not import input, result, or error types from another action.
  Declare its contract locally even when two actions currently have the same
  shape.
- `{Feature}PageApplicationDeps.ts` only groups page actions: `viewBoardPage`,
  `createIssue`, `moveIssue`, `deleteIssue`.
- Do not reuse page-specific operations speculatively. Extract a shared contract
  only after another real consumer appears.
- Infrastructure implements page action contracts and owns `openapi-fetch`,
  generated DTOs, HTTP details, storage, and thrown network errors.
- Keep each action implementation in its own `openApi{Action}.ts` file. Shared
  infrastructure helpers belong in `infrastructure/{section}/shared` only when
  at least two real features use them.
- Shared technical OpenAPI code lives in `infrastructure/api`.
- Do not add factories, intermediate port models, generic services, wrappers, or
  configuration when an API adapter can implement the page operation directly.

## Mapping boundaries

Keep each model inside its layer:

1. Infrastructure maps generated DTOs or mock data directly to action results
   and page errors.
2. Page applications pass the action-result view model through an explicit
   `viewModel` prop and pass their own runtime state as separate props without
   another mapping.

- UI components must not import infrastructure or generated API types.
- Reusable component props types are exported directly from the `.vue`
  component. Keep non-reused props local.
- A page component exports `{Feature}PageViewModel` for data returned by its
  view action and receives it through a required `viewModel` prop. Runtime state
  such as `loading`, `error`, or `submitting` remains in separate props. Keep a
  named `{Feature}PageProps` type local when useful; export the view model, not
  the page props.
- The UI uses `Board`; only OpenAPI infrastructure translates backend `Epic`
  types.

## Presentation and composition

- `app/pages` and `app/layouts` are thin composition roots. They create API
  adapters and pass operations through typed `deps` props.
- Feature pages receive operations through `deps`; child components receive
  plain props and emit UI events.
- Pass component props explicitly. Do not use object `v-bind`.
- `app/layouts/default.vue` composes the shared shell. `AppLayout.vue` owns its
  own props model. Feature screens contain only feature content.
- Keep the single root presentation component in `view/{Feature}Page.vue`.
  Reserve `components` for actual child or shared components; do not add a
  redundant `components/{Feature}Page/{Feature}Page.vue` directory.
- Put every child component in `view/components` and repeat component nesting
  recursively: `view/components/BoardColumn/BoardColumn.vue` and
  `view/components/BoardColumn/components/IssueCard.vue`.
- An action result lives in its action file and uses direct component names as
  keys and their view models as values: `{ BoardPage: BoardPageViewModel }`.
- Add each board action as a separate file in `actions` and a separate typed
  operation in `BoardPageApplicationDeps`; do not hide several actions inside
  one generic callback.
- Nuxt already code-splits routes. Add lazy components only for heavy,
  conditional content.
- Every navigation item uses a real Nuxt route. Never use `href="#"`
  placeholders.

## API and errors

- API base URL comes from `runtimeConfig.public.boardsApiBaseUrl` because the
  browser calls the final API directly.
- Generated types live in `infrastructure/api/generated.ts`. Never edit this
  file manually.
- Treat `v1.json` as read-only. Never edit or regenerate it.
- After changing `v1.yaml`, regenerate types with `pnpm api`.
- Expected failures use the plain `ActionResult<Value, Error>` union from
  `app/utils/actionResult.ts`.
- Build action results with `ok(value)` and `err(error)`.
- Catch thrown network exceptions only in infrastructure adapters.
- Map HTTP/API failures directly to page errors in infrastructure.
- When `Promise.all` combines different endpoints, handle each named response
  separately. Iterate responses only when they come from the same endpoint and
  have identical error semantics.
- Use `null` for normal absence. Do not represent an optional value as a
  failure.
- Mock adapters are allowed during UI work. Keep them in infrastructure and
  implement the same page operation contracts. Switching mock and real data must
  change only composition-root registration.
- Prefer stateless mock adapters. View mocks return fixed page data; mutation
  mocks return success or the identifier required for navigation.

## Action execution

Use one action flow throughout the application:

1. `actions/{action}.ts` declares its own input, result, expected error union,
   and callable contract returning `Promise<ActionResult<Result, Error>>`.
2. Infrastructure calls the final API, maps DTOs to the action result, maps
   expected failures to that action's error union, and returns `ok(...)` or
   `err(...)`.
3. `{Feature}PageApplication.vue` executes actions, converts their results to UI
   state, invalidates related Nuxt data after successful mutations, and passes
   plain props to the view.
4. View components only emit user intent. They do not call actions, inspect
   `ActionResult`, import infrastructure, or invalidate cached data.

For initial keyed page data, use `useActionData`:

```ts
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewFeaturePage(input),
  fallbackMessage: 'Could not load the page.',
  key: () => asyncDataKeys.feature.page(input.id),
  messages: {
    AccessDenied: 'You do not have access to this page.',
    ResourceNotFound: 'The requested resource was not found.',
    TemporarilyUnavailable: 'The service is temporarily unavailable.',
  },
})
```

- Render `pageState.type === 'ready'`, `'pending'`, and `'error'` explicitly.
- Pass `pageState.data.{Feature}Page` as the required `viewModel` prop in the
  ready branch.
- `useActionData` owns the integration with `useAsyncData`; do not repeat its
  `ActionResult | undefined` and loading-state conversion in page applications.
- Use `useActionData` for initial or route-keyed page loading, not for every
  button click or lazy select.

For mutations, searches, lazy selects, and pagination, consume every action
result with `matchActionResult`:

```ts
const result = await props.deps.updateFeature(input)

matchActionResult({
  result,
  ok: (value) => {
    actionError.value = ''
    viewModel.value = value.FeaturePage
    invalidation.afterFeatureChanged(value.id)
  },
  err: (error) => {
    actionError.value = getErrorMessage({
      error,
      messages: {
        AccessDenied: 'You cannot update this resource.',
        ResourceNotFound: 'The requested resource was not found.',
        TemporarilyUnavailable: 'Could not save the changes.',
      },
    })
  },
})
```

- Page applications must not inspect `result.ok`, `result.value`, or
  `result.error` directly; use `matchActionResult` instead. The generic
  `matchActionResult` and `useActionData` implementations may inspect the union
  discriminator internally.
- Do not convert `ActionResult` to another temporary `{ ok, value, error }`
  shape, throw expected failures, or wrap expected action handling in
  `try/catch`.
- Use `getErrorMessage` with a complete `messages` record. Adding an error to an
  action contract must cause every incomplete UI mapping to fail type checking.
- Clear previous action errors and update local view state only in the `ok`
  branch. Show expected failures only in the `err` branch.
- Invalidate related data through `useAsyncDataInvalidation` only after a
  successful mutation. Do not call `refreshNuxtData` directly from a page or
  view component.
- Use `createLatestRequest` only for concurrent searches or other replaceable
  requests where an older response could overwrite a newer one. Normal mutations
  and lazy select loads do not need it.
- Keep action loading/submitting state local to the page application and pass it
  separately from the action-result view model.

## UI implementation

- `index.html` is the visual prototype and layout reference. Preserve its
  structure, placement, spacing, colors, and navigation unless the user requests
  a design change.
- Use existing CSS in `app/assets/css/main.css`; do not add Tailwind CSS unless
  explicitly requested.
- Use `lucide-vue-next` for interface icons instead of hand-written
  placeholders.
- Keep Board and Backlog as sidebar destinations; do not add tabs inside the
  board screen.

## Working rules

- Never run `pnpm install`, `pnpm i`, or `pnpm add`; the user installs
  dependencies.
- Prefer existing code, Vue/Nuxt features, browser APIs, CSS, and installed
  dependencies.
- Preserve unrelated user changes in the working tree.
- Use `apply_patch` for edits. Do not rewrite unrelated files.
- Do not edit generated API types manually.
- Non-trivial mapping or error logic requires one small runnable test.
- Run relevant tests after changes. Use `npm test` for the current test suite.
- A build failure containing `spawn EPERM` is an environment restriction; report
  it without repeatedly retrying.
