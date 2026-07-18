# Laraue Boards (Frontend)

The backend for this application lives in the
[Laraue.Apps.StructuredMessages repository](https://github.com/win7user10/Laraue.Apps.StructuredMessages).

## Interface examples

<img width="250" height="540" alt="All issues view" src="https://github.com/user-attachments/assets/91e01273-a8fd-49e6-99be-3466db41b60d" />
<img width="250" height="540" alt="Board view" src="https://github.com/user-attachments/assets/eda748c6-8595-4555-b9a4-533027c6e2df" />

## Local setup

Install dependencies:

```bash
pnpm install
```

Create `.env` in the repository root:

```env
NUXT_PUBLIC_BOARDS_API_BASE_URL=http://localhost:5200
NUXT_PUBLIC_BOT_NAME=msgboard_bot
NUXT_PUBLIC_TEST_USER_TOKEN=
```

The browser calls the backend directly. The API base URL must therefore be the
backend origin without a trailing `/api` path.

Start the backend on port `5200`, then start the frontend:

```bash
pnpm dev
```

The frontend is available at `http://localhost:3000`.

## Authorization

### Local development with test Mini App data

For local development, set `NUXT_PUBLIC_TEST_USER_TOKEN` to valid Telegram Mini
App `initData` for a test user:

```env
NUXT_PUBLIC_TEST_USER_TOKEN=<telegram-mini-app-init-data>
```

Despite its name, this value is not a bearer token. In development mode the
frontend sends it to the backend Mini App authentication endpoint and stores the
bearer token returned by the backend. See the backend repository for how to
obtain valid test `initData`.

### Authorization through a real Telegram Mini App

#### 1. Expose the backend and frontend through ngrok

Create `ngrok.yml`:

```yaml
version: 3
agent:
  authtoken: <your-ngrok-token>
tunnels:
  back:
    addr: 5200
    proto: http
  front:
    addr: 3000
    proto: http
```

Start both tunnels:

```bash
ngrok start --all --config ngrok.yml
```

ngrok displays a separate public URL for each tunnel. Keep both values:

- Frontend URL: the URL of the `front` tunnel.
- Backend URL: the URL of the `back` tunnel.

#### 2. Configure the application

Allow the frontend URL in the backend development CORS configuration. For
example:

```json
{
  "Cors": {
    "Hosts": [
      "http://localhost:3000",
      "https://<frontend-tunnel>.ngrok-free.app"
    ]
  }
}
```

Point the frontend directly to the backend tunnel and clear the test `initData`:

```env
NUXT_PUBLIC_BOARDS_API_BASE_URL=https://<backend-tunnel>.ngrok-free.app
NUXT_PUBLIC_TEST_USER_TOKEN=
```

Restart the frontend after changing `.env`.

#### 3. Configure the Telegram bot

In @BotFather, open the bot's Mini App settings and set the Main App URL to the
frontend tunnel URL, for example: `https://<frontend-tunnel>.ngrok-free.app/`.

Open the Mini App from Telegram. After successful authentication, the app opens
the organization selection page. Check the browser console, the backend logs,
and the ngrok request log if authentication fails.

#### Optional: browser console inside Telegram

For temporary debugging, add these entries to the existing `app.head.script`
array in `nuxt.config.ts`:

```ts
{ src: 'https://cdn.jsdelivr.net/npm/eruda' },
{ innerHTML: 'eruda.init();' },
```

Remove them after debugging.

### Authorization through the Telegram Login Widget

1. Start the frontend and backend ngrok tunnels as described above.
2. Allow the frontend tunnel URL in backend CORS.
3. Set `NUXT_PUBLIC_BOARDS_API_BASE_URL` to the backend tunnel URL and clear
   `NUXT_PUBLIC_TEST_USER_TOKEN`.
4. Send `/setdomain` to @BotFather, select the bot, and send the frontend tunnel
   hostname without the protocol, for example
   `<frontend-tunnel>.ngrok-free.app`.
5. Set the bot name without `@` in `.env`:

   ```env
   NUXT_PUBLIC_BOT_NAME=msgboard_bot
   ```

6. Restart the frontend and open the frontend tunnel URL in a browser.
