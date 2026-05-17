import {useOrganizationAuthApi} from "~/composables/organizationAuthApi";

export const useMassMovementApiClient = () => {
    const configuration = useRuntimeConfig();
    const { createClient } = useOrganizationAuthApi();
    return createClient(configuration.public.messagesBaseAddress);
}