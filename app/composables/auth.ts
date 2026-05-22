import {useUserOrganizationPreferencesApi} from "~/composables/userOrganizationPreferencesApi";
import {useOrganizationsApi} from "~/composables/organizationsApi";

export const useAuth = () => {
    const { setUserToken, deleteUserToken, deleteOrganizationToken, setOrganizationToken } = useLocalStorageUtils()

    const isUserAuthenticated = () => {
        const { appState } = useAppState()
        return appState.value.user != null;
    }

    const isOrganizationSelected = () => {
        const { appState } = useAppState()
        return appState.value.organization != null;
    }

    const initUserWithBearer = async (bearerToken: string) => {
        await setUserToken(bearerToken)

        const { loadUser } = useUserApi();

        const user = await loadUser();
        await initUserWithUserData(user);
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
        const { setUser, setPreferences } = useAppState()
        setUser(user);

        const { loadPreferences } = useUserPreferencesApi()
        const preferences = await loadPreferences();
        setPreferences(preferences);

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
        const { setOrganization, setUserOrganizationPreferences } = useAppState()
        setOrganization(organization);

        const { loadPreferences } = useUserOrganizationPreferencesApi()
        const preferences = await loadPreferences();
        setUserOrganizationPreferences(preferences);
    }

    const logout = async () => {
        const { setUser } = useAppState()
        setUser(null);
        await deleteUserToken();
    }

    const logoutOrganization = async () => {
        const { setOrganization } = useAppState()
        setOrganization(null);
        await deleteOrganizationToken();
    }

    const redirectPath = useState('redirectPath', () => '/')
    const showLoginUserModal = useState('showLoginModal', () => false)
    const showLoginOrganizationModal = useState('showLoginModal', () => false)

    const requireUserAuth = (to: ReturnType<typeof useRoute>) => {
        const { appState } = useAppState()
        if (!appState.value.user) {
            redirectPath.value = to.fullPath
            showLoginUserModal.value = true
            return false
        }
        return true
    }

    const requireOrganizationAuth = (to: ReturnType<typeof useRoute>) => {
        const { appState } = useAppState()
        if (!appState.value.organization) {
            redirectPath.value = to.fullPath
            showLoginUserModal.value = true
            return false
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
        showLoginUserModal,
        showLoginOrganizationModal,
        isUserAuthenticated,
        isOrganizationSelected,
    }
}