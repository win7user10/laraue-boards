import {useMassMovementApiClient} from "~/composables/massMovementClient";

export interface DestinationSpace {
    id: number;
    name: string;
    color: string;
}

export const useMassMovementApi = () => {
    const client = useMassMovementApiClient()

    const moveSpace = (spaceId: number, organizationId: number) => {
        return client('/mass-movement/space/' + spaceId + '/to-organization/' + organizationId, {
            method: 'POST'
        });
    }

    const moveSpaceEpics = (spaceId: number, newSpaceId: number) => {
        return client('/mass-movement/space/' + spaceId + '/epics-to-space/' + newSpaceId, {
            method: 'POST'
        });
    }

    const getDestinationSpaces = (organizationId: number) => {
        return client<DestinationSpace[]>('/mass-movement/organization/' + organizationId + '/spaces', {
            method: 'GET'
        });
    }

    return {
        moveSpace,
        moveSpaceEpics,
        getDestinationSpaces,
    }
}