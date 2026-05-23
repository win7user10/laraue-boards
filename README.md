# Laraue Boards (Frontend)

The [repository](https://github.com/win7user10/Laraue.Apps.StructuredMessages) contains backend for the application.

## Repository setup
You should create `.env` file in repository with the following content to proxy FE requests to backend.
```
NUXT_PUBLIC_MESSAGES_BASE_ADDRESS=http://localhost:5200/api/
```

## Authorization
### Launch with preauthorized user
As soon as telegram authorization is not available local without additional setup, the easiest way to launch the app local
is to set variable `NUXT_PUBLIC_TEST_USER_TOKEN` in `.env` file. The value receiving is described in the backend repository.

### Launch with real authorisation logic
The path is harder, but allows to check the whole authorisation flow locally

#### Part 1 - launch ngrok
1. Install ngrok to make you localhost public for web. 
2. Create `ngrok.yml` config with the following content:
```yml
version: 3
agent:
  authtoken: Your Ngrok Token is Here
tunnels:
  back:
    addr: 5200 # Backend address
    proto: http
  front:
    addr: 3000 # Frontend address
    proto: http
```
3. Run ngrok with a command `ngrok start --all` when ngrok executable is in the same folder as config.
Or provide the config path using parameter: `ngrok start --all --config ngrok.yml`.

#### Part 2 - setup telegram bot
1. Write @BotFather in Telegram and open their Mini App to manage bots.
2. Open Mini Apps sections and setup Main App button. Use there ngrok Frontend url like `https://f9f3-194-154-26-10.ngrok-free.app/` 

#### Part 3 - launch services
1. Add forwarding frontend URL to the backend CORS. Modify `Laraue.Apps.StructuredMessages.WebApiHost/appsettings.Development.json`.
to the following format:
```json
{
  "Cors": {
    "Hosts": [
      "http://localhost:3000",
      "https://f9f3-194-154-26-10.ngrok-free.app"
    ]
  }
}
```
2. Change frontend `.env` to forward requests to the proxied backend URL:
```
NUXT_PUBLIC_MESSAGES_BASE_ADDRESS=https://f9f3-194-154-26-10.ngrok-free.app/api/
```

#### Part 4 - test the app
1. Open the Mini App in your bot.
2. If setup is correct you will see the empty screen. Actually page is loading now, but ngrok speed is limited.
You can check ngrok window for logs to ensure loading in progress.
3. If No Content is received for backend queries, check the CORS setup
4. Use the next script in `nuxt.config.ts` to add a button to bottom right corner that allow see browser console inside the Mini App:
```
app: {
  head: {
    script: [
      { src: 'https://cdn.jsdelivr.net/npm/eruda' },
      { innerHTML: 'eruda.init();' }
    ]
  }
}
```