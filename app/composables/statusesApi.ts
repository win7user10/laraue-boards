import {useStatusesClient} from "~/composables/statusesClient";

export interface CreateStatusRequest {
    name: string;
    color: string;
    epicId: number;
}

export interface EditStatusRequest {
    name: string;
    color: string;
}

export interface MessageStatusDto {
    name: string;
    color: string;
    id: number;
    count: number;
}

export const useStatusesApi = () => {
    const client = useStatusesClient()

    const createStatus = (request: CreateStatusRequest) => {
        return client<number>('/statuses', {
            method: 'POST',
            body: request
        });
    }

    const deleteStatus = (id: number) => {
        return client('/statuses/' + id, {
            method: 'DELETE'
        });
    }

    const editStatus = (id: number, request: EditStatusRequest) => {
        return client('/statuses/' + id, {
            method: 'PUT',
            body: request
        });
    }

    const getStatuses = (epicId: number) => {
        return client<MessageStatusDto[]>('/statuses', {
            method: 'GET',
            query: {
                epicId: epicId
            }
        });
    }

    return {
        createStatus,
        deleteStatus,
        editStatus,
        getStatuses,
    }
}