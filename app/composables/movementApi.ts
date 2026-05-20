import {useMovementApiClient} from "~/composables/movementClient";

export interface DestinationSpace {
    id: number;
    name: string;
    color: string;
}

export const useMovementApi = () => {
    const client = useMovementApiClient()

    const moveSpace = (spaceId: number, organizationId: number) => {
        return client('/movement/space/' + spaceId + '/to-organization/' + organizationId, {
            method: 'POST'
        });
    }

    const moveSpaceEpics = (spaceId: number, newSpaceId: number) => {
        return client('/movement/space/' + spaceId + '/epics-to-space/' + newSpaceId, {
            method: 'POST'
        });
    }

    const moveEpic = (epicId: number, newSpaceId: number) => {
        return client('/movement/epic/' + epicId + '/to-space/' + newSpaceId, {
            method: 'POST'
        });
    }

    const getDestinationSpaces = (organizationId: number) => {
        return client<DestinationSpace[]>('/movement/organization/' + organizationId + '/spaces', {
            method: 'GET'
        });
    }

    const moveIssue = (messageId: number, statusId: number) => {
        return client('/movement/issue/' + messageId + '/move-to-status/' + statusId, {
            method: 'POST'
        });
    }

    return {
        moveSpace,
        moveSpaceEpics,
        moveEpic,
        getDestinationSpaces,
        moveIssue,
    }
}