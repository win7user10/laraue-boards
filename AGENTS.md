# Project rules

This file is the source of truth for changes in this repository.

## Architecture

Dependency flow:

`Nuxt composition root → typed deps tree ← infrastructure → final API`

The application calls the existing backend API directly. Do not add Nuxt/Nitro
API endpoints, a second BFF, or separate `client` and `server` implementations
unless a concrete requirement appears, such as a secret, unsupported CORS,
server-only authentication, API aggregation, or server caching.

Keep page contracts with their presentation and API details in infrastructure:

```text
app/sections/{section}/{feature}/
  {Feature}Page.vue
  {Feature}PageDeps.ts
  deps/
    {dependency}.ts
  components/

infrastructure/{section}/{feature}/
  openApi{Action}.ts
  components/{StatefulChild}/
    openApi{Action}.ts

app/components/{domain}/{feature}/
  {Feature}.vue
  {Feature}Deps.ts
  deps/
    {dependency}.ts
```

- Each `deps/{dependency}.ts` owns its input, application data, expected errors,
  and callable contract.
- A dependency must not import input, result, or error types from another
  dependency. Declare its contract locally even when two actions currently have
  the same shape.
- A component deps contract groups the operations that component executes and
  may contain typed deps for child stateful components. Pass child deps down
  explicitly; do not resolve them through a global store or `provide/inject`.
- When a reusable component owns deps, operations, or runtime operation state,
  keep its component, deps contract, dependency contracts, and presentation
  together in one feature directory. Keep one component file unless its
  presentation has a separate real consumer.
- Keep application operation state and execution directly in the owning
  component; do not extract them into stateful `use*` composables.
- Do not reuse page-specific operations speculatively. Extract a shared contract
  only after another real consumer appears.
- Infrastructure implements dependency contracts and owns `openapi-fetch`,
  generated DTOs, HTTP details, storage, and thrown network errors.
- Mirror a stateful component's feature directory under `infrastructure` for its
  OpenAPI adapters. Do not put adapter implementations in an `impl` folder
  beside the component; application code must not own HTTP or generated DTOs.
- Keep each dependency implementation in its own `openApi{Action}.ts` file.
  Shared infrastructure helpers belong in `infrastructure/{section}/shared` only
  when at least two real features use them.
- Shared technical OpenAPI code lives in `infrastructure/api`.
- Do not add factories, intermediate port models, generic services, wrappers, or
  configuration when an API adapter can implement the page operation directly.

## Mapping boundaries

Keep each model inside its layer:

1. Infrastructure maps generated DTOs or mock data directly to dependency
   results and page errors.
2. The owning stateful component consumes the operation result and renders its
   returned view model. It passes only the plain display data and callbacks
   needed by descendants.

- UI components must not import infrastructure or generated API types.
- Reusable component props types are exported directly from the `.vue`
  component. Keep non-reused props local.
- A page component exports `{Feature}PageViewModel` for data returned by its
  view dependency and consumes it from its own operation state. Descendants may
  expose a `viewModel` prop when that is the simplest way to pass their display
  data.
- The UI uses `Board`; only OpenAPI infrastructure translates backend `Epic`
  types.

## Presentation and composition

- `app/pages` and `app/layouts` are thin composition roots. They create API
  adapters and pass operations through typed `deps` props.
- Use `props` for display data and identifiers, local `state` for mutable
  component data, `deps` for external operations the component executes, and
  direct `onX` props for parent coordination in simple components.
- When a component has several related mutable fields, prefer one typed
  `reactive` state object over a loose collection of refs. Keep independent
  computed values and template-element refs separate.
- Stateful components receive their own operations through `deps`, own the
  resulting runtime state, and pass plain props to descendants. Keep an
  operation in the nearest stateful component whose subtree exclusively owns
  that operation's data.
- Shared state belongs to the nearest common stateful ancestor of every
  consumer. Do not duplicate loading or mutation state in several leaf
  components and do not introduce a global store merely to avoid explicit
  parent-to-child flow.
- Keep `deps` for external operation ports that the component executes and whose
  `ActionResult` it consumes. Do not put parent UI coordination in `deps`.
- Parent coordination flows down through direct typed `onX` function props. Do
  not group them into a `callbacks` object and do not redeclare/re-emit them
  through wrappers.
- Simple presentation components with no external operations do not need a deps
  contract; give them display props and direct `onX` props only.
- A stateful modal, drawer, form section, or other self-contained child owns the
  complete workflow that only its UI needs: loading, form and dirty state,
  errors, mutations, and the matching subtree of `deps`. The parent passes the
  child deps and identifiers, not the child's view model or runtime state.
- A self-contained child reports only successful consequences outside its
  boundary through minimal direct callbacks such as `onSaved`, `onDeleted`, and
  `onClose`. The parent updates its own projection, route, and cache; it must
  not execute the child's operations or mirror the child's loading and error
  state.
- Move the whole workflow when changing ownership. Do not move only a dependency
  contract while its invocation and state remain in the parent.
- Use component emits only when a concrete Vue event API is required, such as
  `v-model`; do not use emits for ordinary parent callbacks.
- Pass component props explicitly. Do not use object `v-bind`.
- `app/layouts/default.vue` composes the shared shell. `AppLayout.vue` owns its
  own props model. Feature screens contain only feature content.
- Keep the stateful route root in `{Feature}Page.vue`; never create parallel
  `Application` and `view` versions of the same page. Extract only a cohesive
  child such as a form, list, modal, toolbar, or editor—not a second full-page
  wrapper—and keep it under `components`.
- Put every child component in `components` and repeat component nesting
  recursively: `components/BoardColumn/BoardColumn.vue` and
  `components/BoardColumn/components/IssueCard.vue`.
- A dependency result lives in its dependency file and uses direct component
  names as keys and their view models as values:
  `{ BoardPage: BoardPageViewModel }`.
- Add each external operation as a separate file in the owning component's
  `deps` directory and as a separate typed operation in its deps contract; do
  not hide several operations inside one generic callback.
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

Use one dependency execution flow throughout the application:

1. `deps/{dependency}.ts` declares its own input, result, expected error union,
   and callable contract returning `Promise<ActionResult<Result, Error>>`.
2. Infrastructure calls the final API, maps DTOs to the operation result, maps
   expected failures to that action's error union, and returns `ok(...)` or
   `err(...)`.
3. The nearest owning stateful component executes operations, converts their
   results to local UI state, invalidates related Nuxt data after successful
   mutations, and passes plain props to descendants.
4. Presentation components invoke typed parent callbacks. They do not call
   operations, inspect `ActionResult`, import infrastructure, or invalidate
   cached data.

For initial keyed application data, use `useActionData`:

```ts
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewFeaturePage(input),
  fallbackMessage: 'Could not load the page.',
  key: () => dataKeys.feature.page(input.id),
  messages: {
    AccessDenied: 'You do not have access to this page.',
    ResourceNotFound: 'The requested resource was not found.',
    TemporarilyUnavailable: 'The service is temporarily unavailable.',
  },
})
```

- Render `pageState.type === 'ready'`, `'pending'`, and `'error'` explicitly.
- Render `pageState.data.{Feature}Page` in the owning component's ready branch.
- `useActionData` owns the integration with `useAsyncData`; do not repeat its
  `ActionResult | undefined` and loading-state conversion in page components.
- Use `useActionData` for initial or route-keyed application loading, not for
  every button click or lazy select.

For mutations, searches, lazy selects, and pagination, consume every action
result with `matchActionResult`:

```ts
const result = await props.deps.updateFeature(input)

matchActionResult({
  result,
  ok: (value) => {
    actionError.value = ''
    viewModel.value = value.FeaturePage
    invalidateData({ scope: 'structure' })
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

- Stateful components must not inspect `result.ok`, `result.value`, or
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
- Invalidate related data through `invalidateData({ scope, preserve })` only
  after a successful mutation. Use `invalidateDataKey(key)` for one exact key
  and `invalidateAllData()` only when ending or replacing the whole session.
  Preserve the owning component's key when its local state was already updated.
  Use `refreshDataKey(dataKeys...)` only when another active owner must update
  immediately. Do not call `clearNuxtData` or `refreshNuxtData` from components.
- Use `createLatestRequest` only for concurrent searches or other replaceable
  requests where an older response could overwrite a newer one. Normal mutations
  and lazy select loads do not need it.
- Keep operation loading/submitting state local to the owning stateful
  component.

## UI implementation

- `index.html` is the visual prototype and layout reference. Preserve its
  structure, placement, spacing, colors, and navigation unless the user requests
  a design change.
- Use existing CSS in `app/assets/css/main.css`; do not add Tailwind CSS unless
  explicitly requested.
- Domain colors for boards, columns, users, spaces, statuses, attributes, mocks,
  and fallbacks must come from `app/constants/colors.ts`. Do not put hex color
  literals in TypeScript, template expressions, application data, or tests.
  CSS-only colors inside stylesheets and `<style>` blocks are exempt.
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
