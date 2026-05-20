export interface MessageListDto {
    id: number;
    time: string;
    sender?: string;
    senderInitial?: string;
    content?: string;
    epicId: number;
    statusId: number;
    color: string;
    senderColor: string;
    media: MediaInfo[];
}

export interface MediaInfo {
    previewFileId?: string;
    originalFileId?: string;
    type: MediaType
}

export enum MediaType {
    Image,
    Video,
}

export interface MessageDetailDto {
    id: number;
    time: string;
    sender?: string;
    senderInitial?: string;
    content: string;
    categoryName?: string;
    categoryColor?: string;
    statusName?: string;
    statusColor?: string;
    color: string;
    senderColor: string;
}

export interface CreateCardRequest {
    content: string;
    statusId: number;
}

export interface EditCardRequest {
    content: string;
}

export interface SearchRequest {
    searchString: string;
    page: number;
    perPage: number;
    epicId: number | null;
    spaceId: number | null;
}

export interface ColumnMessages {
    statusId: number;
    items: InitialBatchResult<MessageListDto>
}

export interface ColumnSummary{
    id: number;
    name: string;
    color: string;
    count: number;
    sortOrder: number;
}

export interface CategorySummary {
    id: number;
    name: string;
    color: string;
    columns: ColumnSummary[]
}

export const useMessagesApi = () => {
    const client = useMessagesClient()

    const loadIssuesByStatus = (
        statusId: number,
        skip: number,
        take: number,
        searchString: string) => {
        return client<BatchResult<MessageListDto>>('/issues/by-status/' + statusId, {
            method: 'GET',
            query: {
                statusId: statusId,
                skip: skip,
                take: take,
                searchString: searchString,
            }
        });
    }

    const loadBoard = (
        epicId: number,
        take: number,
        searchString: string) => {
        return client<ColumnMessages[]>('/issues/board', {
            method: 'GET',
            query: {
                epicId: epicId ?? undefined,
                take: take,
                searchString: searchString,
            }
        });
    }

    const deleteMessage = (id: number) => {
        return client('/issues/' + id, {
            method: 'DELETE'
        });
    }

    const createMessage = (request: CreateCardRequest) => {
        return client<number>('/issues', {
            method: 'POST',
            body: request
        });
    }

    const editMessage = (id: number, request: EditCardRequest) => {
        return client('/issues/' + id, {
            method: 'PUT',
            body: request
        });
    }

    const searchMessages = (request: SearchRequest) => {
        return client<FullPaginatedResult<MessageListDto>>('/issues/search', {
            method: 'GET',
            query: request
        });
    }

    const getMessage = (id: number) => {
        return client<MessageDetailDto>('/issues/' + id, {
            method: 'GET'
        });
    }

    const getBoardSummary = (spaceId: number) => {
        return client<CategorySummary[]>('/issues/summary', {
            method: 'GET',
            query: {
                spaceId: spaceId
            }
        });
    }

    return {
        loadIssuesByStatus,
        deleteMessage,
        createMessage,
        editMessage,
        searchMessages,
        loadBoard,
        getMessage,
        getBoardSummary,
    }
}