# Nuxt 4 Project Architecture

This document records the architectural decisions agreed upon for a project with a large number of
similar pages.

Core principles:

- actual application pages live in `app/sections`, while `app/pages` contains only Nuxt route
  wrappers;
- each actual page is represented by a smart `XxxPage.vue` component;
- external page operations are described by an explicit `XxxPageDeps` object;
- the production deps implementation adapts a concrete generated OpenAPI client to the page’s
  frontend contract;
- expected outcomes of external operations are returned as `Result`;
- every `Result` is handled through `matchResult`;
- frontend failure codes and UI text are separated;
- a working layout remains available when a specific page fails;
- global `error.vue` is used for application-level, layout-level, or genuinely fatal scenarios;
- `useAsyncData` is used directly, without a custom async composable;
- repeated state conversion is extracted into the pure `toAsyncResultState` helper;
- feature components own their structure; slots are not used to hide ordinary prop flow;
- shared abstractions are introduced only after repetition has been confirmed.

---

## 1. Final Page Structure

```text
app/
  pages/
    spaces/
      [id].vue

  sections/
    spaces/
      pages/
        SpaceItemsPage/
          SpaceItemsPage.vue
          SpaceItemsPage.deps.ts
          SpaceItemsPage.deps.impl.ts

          components/
            SpaceItemsView.vue
            SpaceItemsTable.vue
            SpaceItemRow.vue
            BulkActions.vue

  components/
    PageState.vue
    AppErrorState.vue

  infrastructure/
    api/
      client.ts
      generated.ts

  error.vue

shared/
  result/
    result.ts
    async-result-state.ts
```

### `app/pages/spaces/[id].vue`

A technical Nuxt route wrapper.

It:

- reads route parameters;
- gets the configured `ApiClient` through `useApiClient()`;
- assembles production `deps`;
- performs navigation through `navigateTo`;
- passes real dependencies and required callback functions to `SpaceItemsPage`.

It does not contain:

- page business logic;
- form state;
- frontend/API mapping;
- mutation handling;
- the page’s primary markup.

### `SpaceItemsPage.vue`

The actual smart application page.

It:

- receives identifiers, `deps`, and environment callbacks through props;
- calls `useAsyncData`;
- owns local page state and mutations;
- calls `deps` methods;
- handles every `Result` through `matchResult`;
- converts frontend failure codes into user-facing text;
- determines local UI behavior for specific failure variants;
- passes data and callback functions to child components;
- does not create the API client;
- may build declarative link destinations through `useOrganizationRoutes()`;
- does not call `navigateTo` or use the router imperatively.

### Other Feature Components

They:

- receive display data through props;
- receive required actions through callback props;
- may own local ephemeral UI state;
- do not receive `deps`;
- do not load remote data;
- do not coordinate page-level scenarios;
- do not know about the router.

### Nested Feature Containers

A child component may receive its own `deps` when it coordinates an independent asynchronous user
scenario, for example a lazily loaded dialog that loads, updates, moves, and deletes an entity.

The child container owns and declares its dependency contract:

```ts
// IssueDialog.deps.ts
export type IssueDialogDeps = {
  view: (input: ViewIssueInput) => Promise<Result<IssueData, ViewIssueFailure>>
  save: (input: SaveIssueInput) => Promise<Result<null, SaveIssueFailure>>
}
```

When the child adapts API calls itself, it also owns a colocated production factory. The parent
factory composes it rather than reimplementing its methods:

```ts
const issueDialog = createIssueDialogDeps(client)

return {
  issueDialog,
  moveBoardIssue: issueDialog.moveIssue,
}
```

The parent dependency contract only composes the child contract:

```ts
export type BoardPageDeps = {
  issueDialog: IssueDialogDeps
  view: (input: ViewBoardInput) => Promise<Result<BoardData, ViewBoardFailure>>
}
```

The parent passes the narrow dependency object without redefining or indexing the child operations:

```vue
<IssueDialog :deps="deps.issueDialog" />
```

This forms an explicit dependency tree matching feature-container ownership. It does not mean that
every component receives `deps`. Presentational forms, lists, buttons, and layout fragments continue
to receive only data and callbacks.

Local UI state includes:

- an open menu;
- expanded/collapsed state;
- hover/focus;
- a local field draft;
- animation state.

### Local Component State

A component’s own mutable local state is declared in one `reactive` object, not as multiple separate
`ref` values:

```ts
const state = reactive({
  error: null as null | string,
  saved: false,
  submitting: false,
})
```

`computed` values, template refs, and refs returned by Nuxt or other composables are not copied into
this object.

---

## 2. Route Wrapper

```vue
<script setup lang="ts">
import SpaceItemsPage from '~/sections/spaces/pages/SpaceItemsPage/SpaceItemsPage.vue'
import { createSpaceItemsPageDeps } from '~/sections/spaces/pages/SpaceItemsPage/SpaceItemsPage.deps.impl'

const route = useRoute()

const spaceId = computed(() => String(route.params.id))

const client = useApiClient()

const deps = createSpaceItemsPageDeps(client)

const onMoved = async (targetSpaceId: string): Promise<void> => {
  await navigateTo(`/spaces/${targetSpaceId}`)
}
</script>

<template>
  <SpaceItemsPage
    :space-id="spaceId"
    :deps="deps"
    :on-moved="onMoved" />
</template>
```

### Rules

- The route wrapper owns imperative Nuxt router navigation.
- `XxxPage.vue` may use `useOrganizationRoutes()` for declarative links.
- `XxxPage.vue` does not call `navigateTo` or use the router imperatively.
- Navigation is not part of data deps.
- A mutation does not perform a redirect inside the production implementation.
- After a successful mutation, `XxxPage` invokes the required callback passed by the route wrapper.

---

## 3. API Client

The client is created with `openapi-fetch` and generated `paths`.

Nuxt-specific request data is passed into the factory from outside, so `client.ts` remains a regular
TypeScript module and is easy to test:

```ts
import createFetchClient from 'openapi-fetch'

import type { paths } from '#infrastructure/api/generated'

export type CreateApiClientOptions = {
  baseUrl: string
  fetch?: typeof globalThis.fetch
  headers?: HeadersInit
}

export const createApiClient = ({
  baseUrl,
  fetch = globalThis.fetch,
  headers,
}: CreateApiClientOptions) =>
  createFetchClient<paths>({
    baseUrl,
    credentials: 'include',
    fetch,
    headers,
  })

export type ApiClient = ReturnType<typeof createApiClient>
```

Nuxt-specific configuration and SSR cookie forwarding are kept in a small composable:

```ts
// app/composables/useApiClient.ts
export const useApiClient = () => {
  const config = useRuntimeConfig()

  return createApiClient({
    baseUrl: config.public.boardsApiBaseUrl,
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  })
}
```

Route wrappers use it directly:

```ts
const client = useApiClient()
```

The infrastructure factory remains independent of Nuxt and accepts explicit options:

```ts
const client = createApiClient({
  baseUrl: 'https://api.test',
  fetch: fetchMock,
})
```

### What `ApiClient` Means

`ApiClient` is not an arbitrary generic client.

It is a concrete typed `openapi-fetch` client whose API is defined by generated `paths`:

```ts
client.GET(...)
client.POST(...)
client.PUT(...)
client.DELETE(...)
```

Production deps may depend on this concrete type:

```ts
export function createSpaceItemsPageDeps(client: ApiClient): SpaceItemsPageDeps
```

No additional abstraction over `ApiClient` is introduced until there is a second transport
implementation or another confirmed requirement.

### Dependency Boundary

```text
SpaceItemsPage.vue
  → depends on SpaceItemsPageDeps

SpaceItemsPage.deps.impl.ts
  → implements SpaceItemsPageDeps
  → depends on ApiClient

ApiClient
  → depends on openapi-fetch and generated paths
```

The UI does not know about URLs, HTTP methods, or generated DTOs.

---

## 4. `XxxPageDeps` Contract

Each actual page has one dedicated dependency object.

```ts
// SpaceItemsPage.deps.ts

export type SpaceItemsPageDeps = {
  view: (
    input: ViewSpaceItemsPageInput,
  ) => Promise<Result<SpaceItemsPageData, ViewSpaceItemsPageFailure>>

  moveItems: (input: MoveItemsInput) => Promise<Result<MoveItemsData, MoveItemsFailure>>

  deleteItem: (input: DeleteItemInput) => Promise<Result<void, DeleteItemFailure>>
}
```

### Rules

- One `XxxPageDeps` belongs to one `XxxPage.vue`.
- The contract describes only the dependencies of that specific page.
- The contract is colocated with the page component.
- The production implementation is colocated with the contract.
- A global `AppDeps` containing operations for the entire application is not introduced.
- `deps` is passed as an explicit prop.
- `provide/inject` is not used as a service locator.
- `deps` is not passed to child presentational components.
- A nested feature container with its own asynchronous scenario may declare and receive its own
  colocated `XxxDeps`.
- A nested container that adapts API operations owns `XxxDeps.impl.ts`; a parent factory composes
  `createXxxDeps(client)` instead of reimplementing the child methods.
- A parent deps contract composes a child container contract as `{ childName: ChildDeps }`; the
  child never types its dependencies through `ParentDeps['childName']`.
- Pages intentionally do not reuse each other’s complete page-level deps.
- A mock file is optional.
- Tests may use an inline mock or a test factory.

---

## 5. Production Deps Implementation

```ts
// SpaceItemsPage.deps.impl.ts

import type { ApiClient } from '#infrastructure/api/client'

export function createSpaceItemsPageDeps(client: ApiClient): SpaceItemsPageDeps {
  return {
    async view(input) {
      // OpenAPI request
      // DTO mapping
      // expected failure mapping
    },

    async moveItems(input) {
      // OpenAPI request
      // DTO mapping
      // expected failure mapping
    },

    async deleteItem(input) {
      // OpenAPI request
      // expected failure mapping
    },
  }
}
```

### Rules

- The factory is named `createXxxPageDeps(client)`.
- It accepts a concrete `ApiClient`, not “any client.”
- It is not a generic factory parameterized by transport type.
- It does not create an API client on every call.
- It does not call `useI18n`.
- It does not know about the router.
- It maps API DTOs to page frontend models.
- It maps only recognized expected errors to `Failure`.
- An unknown error is rethrown.

For one page, three primary files are used by default:

```text
SpaceItemsPage.vue
SpaceItemsPage.deps.ts
SpaceItemsPage.deps.impl.ts
```

A separate file is not created for every operation.

---

## 6. API Mapping

Frontend models do not have to mirror generated DTOs.

```ts
function mapMoveItemsInput(input: MoveItemsInput) {
  return {
    params: {
      path: {
        id: input.epicId,
        newSpaceId: input.targetSpaceId,
      },
    },
  }
}

function mapSpaceDto(dto: SpaceListDto): SpaceItem {
  return {
    id: String(dto.id),
    name: dto.name,
    color: dto.color,
  }
}
```

### Rules

- By default, a mapper is a private function inside `*.deps.impl.ts`.
- The mapper is tested through the public `deps` method.
- A separate file is not created solely for a few lines of conversion.
- A mapper is moved to a neighboring `*.mappers.ts` only when it:
  - becomes large;
  - contains independent rules;
  - is used by multiple methods;
  - requires a dedicated set of unit tests.

### Testing Production Deps

For production deps, prefer a real OpenAPI client with fake `fetch` over an invented method such as
`client.moveItems`.

```ts
const fetchMock = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
  new Response(null, {
    status: 200,
  }),
)

const client = createApiClient({
  baseUrl: 'https://api.test',
  fetch: fetchMock,
})

const deps = createSpaceItemsPageDeps(client)

const result = await deps.moveItems({
  epicId: 1,
  targetSpaceId: 2,
})

expect(fetchMock).toHaveBeenCalledWith(
  expect.stringContaining('/api/movement/epic/1/to-space/2'),
  expect.objectContaining({
    method: 'POST',
  }),
)

expect(result).toEqual(ok(undefined))
```

This test uses the real typed OpenAPI client while replacing only the transport with fake `fetch`.

---

## 7. `Result`

```ts
export type Result<Value, Failure> =
  | Readonly<{
      ok: true
      value: Value
    }>
  | Readonly<{
      ok: false
      error: Failure
    }>

export const ok = <Value>(value: Value): Result<Value, never> => ({
  ok: true,
  value,
})

export const err = <Failure>(error: Failure): Result<never, Failure> => ({
  ok: false,
  error,
})
```

`Result` is used for initial loading and user actions:

```ts
view(): Promise<
  Result<PageData, ViewFailure>
>

moveItems(): Promise<
  Result<MoveItemsData, MoveItemsFailure>
>
```

### What Is a `Failure`

A `Failure` is an expected outcome of a known external operation that the calling layer must
classify according to context.

Examples:

- resource not found;
- insufficient permissions;
- state conflict;
- backend validation;
- temporary unavailability;
- network failure;
- partial result.

The mere presence of a failure does not automatically imply switching to global `error.vue`.

The same failure may:

- be displayed locally within a working layout;
- be promoted to a fatal Nuxt error when the current application flow cannot continue without it.

### What Is Not a `Failure`

The following are not converted into `Result`:

- `TypeError`;
- mapper error;
- violation of an application invariant;
- unknown response shape;
- component bug;
- unknown third-party library error.

Such errors remain exceptions.

---

## 8. `matchResult`

`Result` remains a simple serializable object. Methods are not added to it.

```ts
export function matchResult<Value, Failure, OkOutput, ErrorOutput>(
  result: Result<Value, Failure>,
  handlers: {
    ok: (value: Value) => OkOutput
    err: (error: Failure) => ErrorOutput
  },
): OkOutput | ErrorOutput {
  return result.ok ? handlers.ok(result.value) : handlers.err(result.error)
}
```

### Mandatory Rule

Whenever a `Result` is interpreted or consumed, it is handled through `matchResult`.

A guard clause based on `result.ok` is not the application-code style:

```ts
// Do not use as the primary style.
if (!result.ok) {
  moveFailure.value = result.error
  return
}
```

Correct:

```ts
const result = await props.deps.moveItems(input)

await matchResult(result, {
  ok: handleMoveItemsSuccess,
  err: handleMoveItemsFailure,
})
```

This makes the success and failure branches equally visible and prevents either branch from being
accidentally ignored.

### Local Result Handlers

Complex branches are extracted into named functions within the same `XxxPage.vue`:

```ts
async function handleMoveItemsSuccess(value: MoveItemsData): Promise<void> {
  clearSelection()
  await refresh()
  await props.onMoved(value.targetSpaceId)
}

function handleMoveItemsFailure(failure: MoveItemsFailure): void {
  switch (failure.type) {
    case 'forbidden':
    case 'network':
      moveFailure.value = failure
      return

    case 'partial':
      movedIds.value = failure.movedIds
      moveFailure.value = failure
      return

    default:
      return assertNever(failure)
  }
}
```

These functions remain near the component because they define page-specific UI side effects.

They are moved to a separate file only when they become:

- pure transformations;
- reusable;
- large enough to justify separate testing.

### Inline Handlers

A simple branch may remain inline:

```ts
await matchResult(result, {
  ok: async () => {
    await refresh()
  },
  err: (failure) => {
    moveFailure.value = failure
  },
})
```

---

## 9. Exhaustive Failure Handling

A failure is a tagged union with a `camelCase` `type` field.

```ts
export type MoveItemsFailure =
  | { type: 'network' }
  | { type: 'forbidden' }
  | { type: 'conflict' }
  | {
      type: 'invalidInput'
      message: string
    }
  | {
      type: 'partial'
      message: string
      movedIds: string[]
    }
```

Use an exhaustive `switch` for specific variants.

```ts
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`)
}
```

```ts
function getMoveFailureMessage(failure: MoveItemsFailure): string {
  switch (failure.type) {
    case 'network':
      return t('errors.network')

    case 'forbidden':
      return t('errors.forbidden')

    case 'conflict':
      return t('errors.conflict')

    case 'invalidInput':
    case 'partial':
      return failure.message

    default:
      return assertNever(failure)
  }
}
```

---

## 10. Failure Messages and i18n

`*.deps.impl.ts` does not know about i18n.

A standard frontend failure returns a code and structured payload:

```ts
{
  type: 'network'
}
{
  type: 'forbidden'
}
{
  type: 'notFound'
}
```

The UI determines user-facing text through `useI18n`.

A failure contains `message` only when the API contract guarantees ready-to-display human-readable
text:

```ts
{
  type: 'invalidInput',
  message: data.message,
}
```

Do not automatically display an arbitrary technical transport `error.message`.

### Separation of Responsibilities

```text
*.deps.impl.ts
  → recognizes an external failure
  → returns a frontend failure code/payload

XxxPage.vue
  → selects local text through i18n
  → selects UI behavior

app/error.vue
  → selects global fatal-error text and design
```

---

## 11. Error Handling in `*.deps.impl.ts`

```ts
async function moveItems(input: MoveItemsInput): Promise<Result<MoveItemsData, MoveItemsFailure>> {
  try {
    const response = await client.POST(
      '/api/movement/epic/{id}/to-space/{newSpaceId}',
      mapMoveItemsInput(input),
    )

    if ('data' in response) {
      return ok(mapMoveItemsResponse(response.data))
    }

    const failure = mapMoveItemsFailure(response)

    if (failure) {
      return err(failure)
    }

    throw new Error('Unrecognized API error response')
  } catch (cause) {
    const failure = mapThrownMoveItemsFailure(cause)

    if (failure) {
      return err(failure)
    }

    throw cause
  }
}
```

### Narrowing `openapi-fetch` Responses

An `openapi-fetch` result is narrowed through the top-level `data`/`error` union, not through the
nested native `Response`. Prefer the positive `'data' in response` success discriminator:

```ts
const response = await client.GET('/api/spaces')

if ('data' in response) {
  return ok(response.data)
}

const failure = mapViewFailure(response.response.status)
if (failure) {
  return err(failure)
}
throw new Error(`Unrecognized response: ${response.response.status}`)
```

Do not use `response.response.ok` as the TypeScript discriminator. It is a runtime property of the
nested Fetch `Response`, so TypeScript does not connect it to the outer `data`/`error` union.

Checking only `'error' in response` is insufficient for success responses with an intentionally
empty body. `openapi-fetch` represents them as `{ data: undefined, response }`, so the presence of
the top-level `data` key is the reliable success discriminator.

After the error branch terminates, trust the generated OpenAPI success type. If the declared
successful response has a required body, do not add a redundant `if (!response.data)` check. A
successful endpoint that intentionally has no body is represented as such by its generated response
type.

For several responses loaded through `Promise.all`, narrow each original response variable
explicitly before reading its `data`. Checking the responses only through a shared loop does not
preserve narrowing for those variables.

### Key Rule

```text
recognized expected error
→ err(failure)

unknown error
→ throw cause
```

An unknown error is not disguised as `network` or `server`.

Request abort is not a user-facing `Failure` and is not shown as a page error.

The following mandatory global abstractions are not introduced in v1:

- `TransportFailure`;
- `normalizeTransportFailure`;
- universal `request(...)`;
- global `MessageMap`;
- a single dictionary of all errors.

---

## 12. Initial Loading with `useAsyncData`

A separate `useAsyncResult` composable is not introduced.

```ts
const query = await useAsyncData(
  () => `space-items:${props.spaceId}`,
  (_nuxtApp, { signal }) =>
    props.deps.view({
      spaceId: props.spaceId,
      signal,
    }),
)
```

### Rules

- Use an explicit stable key.
- The key reflects the identity of the page data.
- The handler returns `Result`, not `undefined`.
- `AbortSignal` is passed to `deps.view` and then to the API client when supported by the transport.
- The signal allows Nuxt to abort the underlying request when `clear()` is called, a newer request
  replaces it with `dedupe: 'cancel'`, a timeout is reached, or a caller supplies an aborted signal
  to `refresh()`/`execute()`.
- `watch` is used for reactive server-side parameters.
- Free-form search text is debounced.
- Default options are not repeated. `lazy`, `server`, `deep`, and `dedupe` are specified only when
  page UX requires behavior different from Nuxt defaults.
- No wrapper is created that hides the Nuxt API.

Passing `Result` out of the handler is not considered handling it. Interpretation happens later
through `toAsyncResultState`, which uses `matchResult`.

---

## 13. Local and Global Errors

HTTP status alone does not determine whether `error.vue` should be opened.

The key question is:

> Can the application and current layout continue to work without the loaded resource?

### Local Page Error

When the layout works, an error for a specific resource is displayed inside the content area through
`PageState`.

Examples:

- a specific Space is not found;
- there is no access to a specific Board;
- page-load network failure;
- temporary unavailability of a specific endpoint;
- retryable server failure.

Benefits:

- the sidebar remains available;
- organization and profile remain available;
- the user can open another page;
- retry repeats only the required query.

For internal feature pages, this is the default policy even for frontend failure codes `notFound`
and `forbidden`.

### Global `error.vue`

Used when application flow cannot safely continue:

- `AppLayout` itself could not be built;
- required application context is missing;
- a standalone/public route does not exist;
- an unexpected application error occurred;
- the page context genuinely makes the error fatal;
- a full-screen Nuxt error page is required.

On the client side, a fatal Nuxt error is used for the full-screen error page:

```ts
throw createError({
  status: 500,
  fatal: true,
  cause,
})
```

### `401`

Default policy:

```text
401
→ centralized auth/session flow
→ logout/refresh session/redirect to login
→ preserve return URL when necessary
```

`401` should not be handled independently by twenty different pages.

### Action Errors

Mutation and form errors always remain local:

- validation;
- conflict;
- partial result;
- denial of a specific action;
- backend business rule.

They do not replace the entire page.

### Promoting an Expected Failure to Fatal

A rare page may promote a specific failure to a Nuxt error:

```ts
const result = await props.deps.view(input)

return matchResult(result, {
  ok,
  err: (failure) => {
    switch (failure.type) {
      case 'invalidRouteContext':
        throw createError({
          status: 404,
          fatal: true,
        })

      case 'network':
      case 'notFound':
      case 'forbidden':
        return err(failure)

      default:
        return assertNever(failure)
    }
  },
})
```

This is a contextual page decision, not an automatic transport-layer rule.

---

## 14. `AsyncResultState`

```ts
export type AsyncResultState<Value, Failure> =
  | { type: 'pending' }
  | {
      type: 'ready'
      data: Value
    }
  | {
      type: 'error'
      error: Failure
      message: string
    }
```

`error` represents only an expected `Failure` from the contract.

Unexpected exceptions are outside `AsyncResultState`.

### Empty State

A shared `empty` variant is not introduced into async state.

An empty list is successful data:

```ts
{
  type: 'ready',
  data: {
    items: [],
  },
}
```

The specific ready component decides how to display the absence of items.

---

## 15. `toAsyncResultState`

When many pages follow the same pattern, repeated conversion is extracted into a pure helper.

```ts
export type ToAsyncResultStateOptions<Value, Failure> = {
  result: Result<Value, Failure> | undefined

  status: 'idle' | 'pending' | 'success' | 'error'

  error: unknown

  getErrorMessage: (failure: Failure) => string
}

export function toAsyncResultState<Value, Failure>(
  options: ToAsyncResultStateOptions<Value, Failure>,
): AsyncResultState<Value, Failure> {
  const { result, status, error, getErrorMessage } = options

  if (status === 'idle' || status === 'pending') {
    return { type: 'pending' }
  }

  if (status === 'error') {
    throw error ?? new Error('Async data failed without an error')
  }

  if (!result) {
    throw new Error('Async data succeeded without a Result')
  }

  return matchResult(result, {
    ok: (data) => ({
      type: 'ready' as const,
      data,
    }),

    err: (failure) => ({
      type: 'error' as const,
      error: failure,
      message: getErrorMessage(failure),
    }),
  })
}
```

Usage:

```ts
const pageState = computed(() =>
  toAsyncResultState({
    result: query.data.value,
    status: query.status.value,
    error: query.error.value,
    getErrorMessage: getViewFailureMessage,
  }),
)
```

### Semantics

```text
deps.view → ok
→ ready

deps.view → err
→ local expected error

useAsyncData handler → thrown exception
→ outside AsyncResultState
→ global Nuxt/application error policy
```

`unexpectedError` is not added to the union.

---

## 16. `PageState.vue`

The current `PageLoadState.vue` should be renamed to `PageState.vue` because it handles more than
loading.

`PageState` is used inside an already working layout and displays:

```text
pending
recoverable page error
ready content
```

It is not the global branded error page.

### Contract

```vue
<script setup lang="ts" generic="Value, Failure">
import type { AsyncResultState } from '~/shared/result/async-result-state'

const props = withDefaults(
  defineProps<{
    state: AsyncResultState<Value, Failure>

    loadingText?: string
    errorTitle?: string
    retryText?: string

    onRetry?: () => void | Promise<void>
  }>(),
  {
    loadingText: 'Loading…',
    errorTitle: 'Could not load page',
    retryText: 'Try again',
  },
)

defineSlots<{
  default(props: { data: Value }): unknown

  'error-actions'?(props: { error: Failure }): unknown
}>()
</script>
```

### Behavior

- `pending` → compact loader inside the content area;
- `error` → compact error state with a message and retry;
- `ready` → default slot with typed `data`;
- `#error-actions` is used only for special local actions;
- the component does not show the application logo;
- the component does not show an HTTP status code;
- the component does not use full-screen `min-height: 100dvh` inside a normal page.

Example:

```vue
<PageState
  :state="pageState"
  loading-text="Loading board…"
  error-title="Could not load board"
  :on-retry="query.refresh">
  <template #default="{ data }">
    <SpaceItemsView
      :view-model="data" />
  </template>
</PageState>
```

`PageState` renders local error UI itself. It does not delegate an ordinary page-level error to
`AppErrorState`.

---

## 17. `AppErrorState.vue`

`AppErrorState` remains a full-screen presentational component for application-level or
layout-bootstrap errors.

It is used:

- in `app/error.vue`;
- when `AppLayout` cannot be built;
- when required application context is missing;
- for full-screen branded error UI.

It may contain:

- a logo;
- an error code;
- a large heading;
- global actions;
- `min-height: 100vh`.

```ts
defineProps<{
  code: string
  message: string
  title: string
}>()
```

### Component Separation

```text
PageState.vue
→ error for a specific page
→ layout remains available
→ compact loader/error/ready

AppErrorState.vue
→ application/layout cannot be shown
→ full-screen branded error

app/error.vue
→ selects status-specific title/message/actions
→ uses AppErrorState
```

`PageState` and `AppErrorState` display errors of different scope and must not be used
interchangeably.

---

## 18. `AppLayout` Bootstrap

Loading `AppLayout` itself is a separate bootstrap flow.

```text
layout ready
→ AppLayoutContent + page slot

layout pending
→ full-screen loader

organization switch in progress
→ normalized to pending

layout cannot be built
→ AppErrorState
```

`AppLayout` may use its own small orchestration layer. Its failure cannot automatically be treated
like an error on an ordinary internal page because without the layout it is impossible to preserve
the sidebar and application shell.

---

## 19. Global `app/error.vue`

`app/error.vue` is the single view for fatal Nuxt errors.

It handles:

- `401`;
- `403`;
- `404`;
- other `4xx`;
- `5xx`;
- unexpected fatal errors;
- global title/message;
- retry;
- navigation to a safe route;
- shared design through `AppErrorState`.

Pages do not duplicate global fatal-error text.

Nuxt 4 uses the `status` field; `statusCode` remains a legacy-compatible field on the error object.

```ts
const status = computed(() => Number(props.error.status ?? props.error.statusCode) || 500)
```

---

## 20. Props, Callbacks, and Emits

### Required Action

Use a required callback prop with `onXxx` naming.

```ts
defineProps<{
  items: readonly Item[]

  onToggle: (itemId: string) => void

  onDelete: (itemId: string) => void | Promise<void>
}>()
```

Benefits:

- TypeScript forces the parent to provide the handler;
- the callback can be passed through the feature tree;
- the same emit does not need to be declared and retransmitted at every level.

### Optional Notification

Use `emit` for:

- hover;
- visible;
- analytics notification;
- an event the parent may ignore.

### Editable Value

Use `v-model` and standard Vue conventions.

### Flat Callbacks

Callback props are flat by default:

```ts
onToggle
onOpen
onDelete
```

They are grouped into an object only when they form a stable logical contract and are always passed
together.

---

## 21. Feature Composition, Props, and Slots

Slots are not used as a general mechanism to eliminate prop drilling.

The primary approach for feature components is explicit passing of required data and callbacks
through the tree.

```vue
<ItemsView
  :items="items"
  :search="search"
  :selected-count="selectedCount"
  :on-update-search="onUpdateSearch"
  :on-toggle="onToggle"
  :on-move="onMove" />
```

`ItemsView` owns the fixed feature structure:

```vue
<template>
  <ItemsFilters
    :search="search"
    :on-update-search="onUpdateSearch" />

  <ItemsTable
    :items="items"
    :on-toggle="onToggle" />

  <BulkActions
    :selected-count="selectedCount"
    :on-move="onMove" />
</template>
```

### Prop Forwarding

Explicitly passing props and callbacks through two or three feature levels is considered normal.

It shows:

- who owns the data;
- who can perform an action;
- which components the dependency passes through.

There is no requirement to eliminate all forwarding merely to reduce the number of props.

### When Slots Are Appropriate

Slots are used when:

- the component is a generic layout/UI primitive;
- the content is inherently supplied by the caller;
- a feature component provides a narrow optional extension point.

Generic layout primitive:

```vue
<SplitPane>
  <template #sidebar>
    <Navigation />
  </template>

  <template #default>
    <PageContent />
  </template>
</SplitPane>
```

Narrow extension point:

```vue
<ItemsView :items="items" :on-toggle="onToggle">
  <template #toolbar-extra>
    <ExportButton />
  </template>
</ItemsView>
```

### When Slots Are Unnecessary

Required feature parts are not passed through slots when their structure is known in advance.

Not recommended:

```vue
<ItemsView>
  <template #filters>
    <ItemsFilters />
  </template>

  <template #table>
    <ItemsTable />
  </template>

  <template #actions>
    <BulkActions />
  </template>
</ItemsView>
```

Such a component has weak control over its structure and becomes a collection of arbitrary regions.

### Rule

> Feature components own their structure and expose an explicit props/callback contract. Slots are
> used for generic composition or limited extension points, not to hide ordinary data flow.

---

## 22. Navigation After an Action

Navigation is an environment dependency, but it is not part of data deps.

```vue
<SpaceItemsPage :deps="deps" :on-moved="onMoved" />
```

```ts
const props = defineProps<{
  deps: SpaceItemsPageDeps

  onMoved: (targetSpaceId: string) => void | Promise<void>
}>()
```

```ts
const result = await props.deps.moveItems(input)

await matchResult(result, {
  ok: handleMoveItemsSuccess,
  err: handleMoveItemsFailure,
})
```

### Forbidden

```ts
async function moveItems(...) {
  await client.POST(...)
  await navigateTo(...)
}
```

The API operation and the navigation decision are separated.

---

## 23. Concurrency Policy

### Queries

For one query identity, the rule is **latest wins**.

- A new request cancels the previous one when the transport supports abort.
- Otherwise, a stale result must not overwrite a newer one.
- Abort is not displayed to the user as a failure.
- Search uses debounce.

### Mutations

Repeated execution of the same mutation is blocked while it is pending.

```ts
if (savePending.value) {
  return
}
```

Mutations for different entities may run in parallel with pending state tracked by identifier:

```ts
const deletingIds = ref(new Set<string>())
```

UI concurrency state is not added to domain `Failure`.

---

## 24. Updating Data After a Mutation

Default policy:

1. The backend returned an up-to-date entity/data → update local state.
2. The backend returned `void` or insufficient data → call `refresh()` on the primary query.
3. Optimistic update → only as a separate UX decision.

Optimistic updates are useful for fast actions such as toggle, drag-and-drop, or like, but a shared
optimistic framework is not introduced in advance.

---

## 25. Runtime Validation

Global runtime validation of API responses is not introduced.

The project trusts the generated API client types.

If a specific endpoint requires additional validation, it is added locally in its `*.deps.impl.ts`.

A violation of required response structure:

- is not hidden with a fallback value;
- is not converted into an expected `Failure`;
- is treated as an unexpected error.

A fallback is allowed only for fields that are genuinely optional/nullable according to the
contract.

---

## 26. Logging and Monitoring

The architectural boundary is fixed; the concrete library is deferred.

- `deps` does not automatically log every expected error.
- Expected failures are not reported as exceptions by default.
- Business events and analytics are not mixed with exception logging.
- Unexpected exceptions must reach global monitoring.
- `app:error`, Vue error hooks, and a monitoring SDK are connected through a separate decision.
- The same error must not be logged repeatedly at multiple layers.

---

## 27. `NuxtErrorBoundary`

Not used by default.

It may be added selectively around an independent client-side subtree:

- third-party editor;
- complex chart;
- optional widget;
- a component whose crash must not destroy the entire page.

It is not used for:

- expected API failures;
- `Result.err`;
- validation;
- ordinary page retry;
- errors already modeled through `PageState`.

---

## 28. Testing

### Route Wrapper

Unit tests are usually unnecessary.

Integration tests are acceptable for critical scenarios:

- correct route param;
- production deps wiring;
- navigation callback;
- SSR fatal error.

### `XxxPage.vue`

The primary testable unit.

Verify:

- `deps.view` is called with the correct arguments;
- pending/error/ready rendering;
- retry;
- mutation calls;
- `matchResult` branches;
- exhaustive failure behavior;
- navigation callback after success;
- no callback on failure;
- prevention of repeated mutation execution.

### Inline Deps Stub

```ts
const deps: SpaceItemsPageDeps = {
  view: vi.fn().mockResolvedValue(ok(pageFixture)),

  moveItems: vi.fn(),
  deleteItem: vi.fn(),
}
```

When there are many tests, a factory is acceptable:

```ts
createSpaceItemsPageDepsStub(overrides)
```

Unexpected calls to stub methods should throw an exception rather than add a production failure code
such as `unexpectedCall`.

### `*.deps.impl.ts`

Verify:

- OpenAPI request mapping;
- response mapping;
- expected error mapping;
- rethrowing unknown errors;
- abort is not converted into a UI failure.

### Presentational Components

Test separately through props/callbacks and display in Storybook when useful.

### Shared Infrastructure

Test separately:

- `matchResult`;
- `assertNever` when necessary;
- `toAsyncResultState`;
- `PageState` for pending/error/ready;
- `app/error.vue` for primary global statuses.

---

## 29. What We Intentionally Do Not Introduce in v2

- mandatory `useXxxController`;
- `XxxView.vue` as a second smart component next to `XxxPage.vue`;
- a `useAsyncResult` wrapper over `useAsyncData`;
- `keyedComposables` for a custom async wrapper;
- global `AppDeps`;
- service locator through `provide/inject`;
- a generic client abstraction over `ApiClient` without a real need;
- one file per deps method;
- mandatory mock file for every deps object;
- universal `request(...)`;
- global `TransportFailure`;
- complex `MessageMap`;
- i18n inside deps implementation;
- `empty` inside shared async state;
- mandatory `NuxtErrorBoundary`;
- shared optimistic-update framework;
- global runtime validation of every API response;
- a view model mirroring the component tree;
- slots as a replacement for normal props/callback flow;
- guard clauses as the primary way to consume `Result`.

---

## 30. New Page Checklist

1. Create a Nuxt route wrapper in `app/pages`.
2. Create `app/sections/<area>/pages/XxxPage/`.
3. Create `XxxPage.vue`.
4. Create `XxxPage.deps.ts` with one page deps type.
5. Define operation failures as tagged unions using `camelCase`.
6. Create `XxxPage.deps.impl.ts` and the `createXxxPageDeps(client)` factory.
7. Type the client as the concrete `ApiClient`.
8. Keep a mapper private inside the implementation while it is small.
9. Create `ApiClient` in the route wrapper and pass it to the deps factory.
10. Pass `deps` to `XxxPage.vue` as one prop.
11. Load page data through `useAsyncData` with an explicit key.
12. Pass `AbortSignal` to `deps.view` when the transport supports abort.
13. Convert query refs through `toAsyncResultState`.
14. Translate failure codes through a local exhaustive function and i18n.
15. Render pending/error/ready through `PageState`.
16. Keep `notFound`/`forbidden` local when the layout can continue working.
17. Use `createError` only for contextual fatal scenarios.
18. Handle every mutation `Result` through `matchResult`.
19. Extract complex ok/err branches into local named page functions.
20. Pass only data and required `onXxx` callbacks downward.
21. A feature component must own its fixed structure.
22. Use slots only for UI primitives or narrow extension points.
23. Pass imperative navigation as a callback from the route wrapper; build declarative links through
    `useOrganizationRoutes()` in the page.
24. Add a pending guard for each mutation.
25. After success, update local data or call `refresh()`.
26. Write an `XxxPage.vue` test with mock deps.
27. Write a production deps test with a typed/fake OpenAPI client.

---

## 31. Final Data Flow

```text
app/pages/<route>.vue
  ├─ route params
  ├─ useApiClient
  ├─ createXxxPageDeps
  └─ navigation callbacks
           │
           ▼
XxxPage.vue
  ├─ useAsyncData
  ├─ deps.view / mutations
  ├─ matchResult
  ├─ local exhaustive handlers
  ├─ failure code → i18n message
  ├─ local page error or contextual fatal decision
  ├─ toAsyncResultState
  └─ required callbacks
           │
           ▼
PageState.vue
  ├─ pending UI
  ├─ local recoverable error UI
  └─ ready slot
           │
           ▼
feature components
  ├─ explicit data props
  ├─ onXxx callbacks
  ├─ emits for optional notifications
  ├─ v-model for editable values
  ├─ fixed owned structure
  └─ narrow slots only when justified
```

Global error flow:

```text
unexpected/fatal application error
  │
  ▼
Nuxt error flow
  │
  ▼
app/error.vue
  │
  ▼
AppErrorState.vue
```

Layout bootstrap:

```text
AppLayout loading
  ├─ pending → full-screen loader
  ├─ ready → AppLayoutContent
  └─ fatal layout failure → AppErrorState
```

---

## 32. Criterion for Future Abstractions

A new shared abstraction is introduced only when at least one of the following conditions is met:

- identical code already repeats across multiple pages;
- the abstraction has a clear independent responsibility;
- it reduces the number of states the calling code must understand;
- it improves testability;
- it does not hide important Nuxt behavior;
- its contract is simpler than the repeated code.

Moving code into a composable or helper solely to reduce the size of a `.vue` file is not considered
an architectural improvement.
