export default defineNuxtPlugin((nuxtApp) => {
    // non-async plugin, runs and returns immediately ✅
    // app.vue renders right away showing the loader

    nuxtApp.hook('app:mounted', async () => {
        const { setIsAppInitialized, setIsInMiniApp, appState } = useAppState();
        const { initUserWithBearer, tryAuthWithStoredBearer, tryAuthOrganizationWithStoredBearer } = useAuth();
        const configuration = useRuntimeConfig();
        const testUserToken = configuration.public.testUserToken;

        try {
            const WebApp = (await import('@twa-dev/sdk')).default;
            const isInMiniApp = WebApp.initData !== '';
            if (isInMiniApp) setIsInMiniApp(true);

            if (await tryAuthWithStoredBearer()) {
                await tryAuthOrganizationWithStoredBearer();
            } else if (isInMiniApp || testUserToken) {
                const token = isInMiniApp ? WebApp.initData : testUserToken;
                const { authViaMiniApp } = useTelegramUserApi();
                const bearer = await authViaMiniApp(token);
                await initUserWithBearer(bearer);
            }
        } catch (err) {
            const { setInitError } = useAppState();
            setInitError(err);
        } finally {
            console.log('App initialized. User is', appState.value.user)
            setIsAppInitialized(true);
        }
    });
});