export interface MessageListDto {
    id: number;
    time: string;
    sender?: string;
    senderInitial?: string;
    content?: string;
    epicId: number;
    statusId: number;
    key: string;
    senderColor: string;
    media: MediaInfo[];
    attributes: IssueListAttributeDto[]
}

export interface IssueListAttributeDto {
    value: string;
    color: string;
}

export interface SearchIssueDto extends MessageListDto{
    status?: NameAndColor;
    epic: NameAndColor;
    space: NameAndColor;
}

export interface NameAndColor{
    name: string;
    color: string;
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
    epicName?: string;
    epicColor?: string;
    statusName?: string;
    statusColor?: string;
    spaceColor: string;
    color: string;
    senderColor: string;
    canEdit: string;
    key: string;
    attributeValues: DetailIssueAttributeDto[];
}

export interface DetailIssueAttributeDto {
    id: number;
    type: AttributeType;
    value: string;
    color: string;
    name: string;
    listValues?: IssueAttributeListValueDto[];
}

export interface IssueAttributeListValueDto {
    id: number;
    name: string;
}

export interface CreateCardRequest {
    content: string;
    statusId: number;
    attributeValues: { [key: number]: string };
}

export interface EditCardRequest {
    content: string;
    attributeValues: { [key: number]: string };
}

export interface SearchRequest {
    searchString: string;
    page: number;
    perPage: number;
    epicIds: Array<number>;
    spaceIds: Array<number>;
    filters: { [key: number]: any }
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
}

export interface CategorySummary {
    id: number;
    name: string;
    color: string;
    touchedAt: string;
    isDefault: boolean;
    columns: ColumnSummary[]
}

export const useMessagesApi = () => {
    const client = useMessagesClient()

    const loadIssuesByStatus = (
        statusId: number,
        skip: number,
        take: number,
        searchString: string,
        filters: {}) => {
        return client<BatchResult<MessageListDto>>('/issues/by-status/' + statusId, {
            method: 'GET',
            query: {
                statusId: statusId,
                skip: skip,
                take: take,
                searchString: searchString,
                filters: filters
            }
        });
    }

    const loadBoard = (
        epicId: number,
        take: number,
        searchString: string,
        filters: {}) => {
        return client<ColumnMessages[]>('/issues/board', {
            method: 'POST',
            body: {
                epicId: epicId ?? undefined,
                take: take,
                searchString: searchString,
                filters: filters,
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
        return client<ShortPaginatedResult<SearchIssueDto>>('/issues/search', {
            method: 'POST',
            body: request
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