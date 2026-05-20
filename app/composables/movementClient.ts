import {useOrganizationAuthApi} from "~/composables/organizationAuthApi";

export const useMovementApiClient = () => {
    const configuration = useRuntimeConfig();
    const { createClient } = useOrganizationAuthApi();
    return createClient(configuration.public.messagesBaseAddress);
}