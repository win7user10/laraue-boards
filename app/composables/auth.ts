import {useOrganizationsApi} from "~/composables/organizationsApi";

export const useAuth = () => {
    const { setUserToken, deleteUserToken, deleteOrganizationToken, setOrganizationToken } = useLocalStorageUtils()
    const { getOrganizationKey } = useUtils()

    const isUserAuthenticated = () => {
        const { appState } = useAppState()
        return appState.value.user != null;
    }

    const isOrganizationSelected = () => {
        const { appState } = useAppState()
        return appState.value.organization != null;
    }

    const loginOrganization = async (id: number) => {
        const { login } = useOrganizationsApi();
        const token = await login(id)
        await setOrganizationToken(token)

        const { getOrganization } = useOrganizationsApi()
        const organization = await getOrganization()
        await initOrganizationWithOrganizationData(organization)

        const key = getOrganizationKey(organization)
        return navigateTo(`/organizations/${key}`);
    }

    const initUserWithBearer = async (bearerToken: string) => {
        await setUserToken(bearerToken)

        const { loadUser } = useUserApi();

        const user = await loadUser();
        await initUserWithUserData(user);

        if (redirectPath.value)
            return navigateTo(redirectPath.value)
    }

    const tryAuthWithStoredBearer = async () => {
        const { getUserToken } = useLocalStorageUtils()
        const bearer = getUserToken()
        if (!bearer)
            return false

        const { loadUser } = useUserApi();
        try {
            const user = await loadUser();
            await initUserWithUserData(user);
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }

    const tryAuthOrganizationWithStoredBearer = async () => {
        const { getOrganizationToken } = useLocalStorageUtils()
        const bearer = getOrganizationToken()
        if (!bearer)
            return false

        const { getOrganization } = useOrganizationsApi();
        try {
            const organization = await getOrganization();
            await initOrganizationWithOrganizationData(organization);
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }

    const initUserWithUserData = async (user: UserDto) => {
        const { setUser } = useAppState()
        setUser(user);

        // @ts-ignore
        const { $i18n } = useNuxtApp();
        return $i18n.setLocale(user.languageCode as any);
    }

    const initOrganizationWithBearer = async (bearer: string) => {
        await setOrganizationToken(bearer)

        const { getOrganization } = useOrganizationsApi()
        const organization = await getOrganization()
        await initOrganizationWithOrganizationData(organization)
    }

    const initOrganizationWithOrganizationData = async (organization: OrganizationDto) => {
        const { setOrganization } = useAppState()
        setOrganization(organization);
    }

    const logout = async () => {
        const { setUser } = useAppState()
        setUser(null);
        await deleteUserToken();
        return navigateTo('/organizations');
    }

    const logoutOrganization = async () => {
        const { setOrganization } = useAppState()
        setOrganization(null);
        await deleteOrganizationToken();
        return navigateTo(`/`)
    }

    const redirectPath = useState('redirectPath', () => '/')

    const requireUserAuth = (to: ReturnType<typeof useRoute>) => {
        const { appState } = useAppState()
        if (!appState.value.user) {
            redirectPath.value = to.fullPath
            console.log('Save redirect path', redirectPath.value)
            return navigateTo(`/`)
        }
        return true
    }

    const requireOrganizationAuth = (to: ReturnType<typeof useRoute>) => {
        const { appState } = useAppState()
        if (!appState.value.organization) {
            return navigateTo(`/organizations`);
        }
        return true
    }

    return {
        initUserWithBearer,
        tryAuthWithStoredBearer,
        tryAuthOrganizationWithStoredBearer,
        initOrganizationWithOrganizationData,
        logout,
        logoutOrganization,
        initOrganizationWithBearer,
        requireUserAuth,
        requireOrganizationAuth,
        isUserAuthenticated,
        isOrganizationSelected,
        loginOrganization,
    }
}