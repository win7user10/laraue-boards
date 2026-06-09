import {useOrganizationsOrganizationClient, useOrganizationsUserClient} from "~/composables/organizationsClient";

export interface OrganizationListDto {
    id: number;
    name: string;
    color: string;
    canUpdate: boolean;
    canDelete: boolean;
    isPersonal: boolean;
    canCreateSpaces: boolean;
    slug: string;
    slugPostfix: string;
}

export interface OrganizationDto {
    id: number;
    name: string;
    color: string;
    canCreateSpaces: boolean;
    canManage: boolean;
    canMassMove: boolean;
    slug: string;
    slugPostfix: string;
}

export interface CreateOrganizationRequest {
    name: string;
    color: string;
    slug: string;
}

export interface EditOrganizationRequest {
    name: string;
    color: string;
    slug: string;
}

export interface OrganizationMember {
    organizationUserId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    color: string;
    initials?: string;
    isOwner: boolean;
    adminAccessLevel: AdminAccessLevel;
}

export interface UserPermissions {
    admin: AdminAccessLevel
    global: GlobalAccessLevel
    direct: { [id: number]: DirectSpaceAccessLevel }
}

export interface GlobalAccessLevel {
    canRead: boolean
    canCreateSpaces: boolean
    canUpdateSpaces: boolean
    canDeleteSpaces: boolean
    canCreateEpics: boolean
    canUpdateEpics: boolean
    canDeleteEpics: boolean
    canCreateIssues: boolean
    canUpdateIssues: boolean
    canDeleteIssues: boolean
}

export interface DirectSpaceAccessLevel {
    canRead: boolean
    canUpdate: boolean
    canDelete: boolean
    canCreateEpics: boolean
    canUpdateEpics: boolean
    canDeleteEpics: boolean
    canCreateIssues: boolean
    canUpdateIssues: boolean
    canDeleteIssues: boolean
}

export interface PermittableSpace {
    id: number;
    name: string;
    color: string;
    epics: PermittableEpic[];
}

export interface PermittableEpic {
    id: number;
    name: string;
    color: string;
    isDefault: boolean;
}

export interface CreateOrganizationResponse {
    id: number;
    slug: string;
    slugPostfix: string;
}

export interface UpdateAttributeRequest {
    name: string;
    color: string;
    listValues: UpdateAttributeListValueDto[]
}

export interface NewAttributeListValueDto{
    name: string;
}

export interface UpdateAttributeListValueDto extends NewAttributeListValueDto {
    id?: number;
}

export interface AttributeDto {
    id: number;
    name: string;
    color: string;
    type: AttributeType;
    listValues: AttributeListValueDto[];
}

export interface AttributeListValueDto{
    id: number;
    name: string;
}

export enum AttributeType {
    Text,
    List,
}

export interface CreateAttributeRequest {
    name: string;
    color: string;
    type: AttributeType;
    listValues: NewAttributeListValueDto[];
}

export const useOrganizationsApi = () => {
    const client = useOrganizationsUserClient()

    const getOrganizations = () => {
        return client<OrganizationListDto[]>('/organizations', {
            method: 'GET'
        });
    }

    const createOrganization = (request: CreateOrganizationRequest) => {
        return client<CreateOrganizationResponse>('/organizations', {
            method: 'POST',
            body: request
        });
    }

    const editOrganization = (id: number, request: EditOrganizationRequest) => {
        return client('/organizations/' + id, {
            method: 'PUT',
            body: request
        });
    }

    const deleteOrganization = (id: number) => {
        return client('/organizations/' + id, {
            method: 'DELETE'
        });
    }

    const login = (organizationId: number) => {
        return client<string>('/organizations/login', {
            method: 'POST',
            body: {
                organizationId: organizationId
            }
        });
    }

    const getOrganization = () => {
        const organizationsClient = useOrganizationsOrganizationClient()
        return organizationsClient<OrganizationDto>('/organizations/current', {
            method: 'GET'
        });
    }

    const getOrganizationMembers = () => {
        const organizationsClient = useOrganizationsOrganizationClient()
        return organizationsClient<OrganizationMember[]>('/organizations/members', {
            method: 'GET'
        });
    }

    const getUserPermissions = (organizationUserId: number) => {
        const organizationsClient = useOrganizationsOrganizationClient()
        return organizationsClient<UserPermissions>('/organizations/permissions/' + organizationUserId, {
            method: 'GET'
        });
    }

    const setUserPermissions = (organizationUserId: number, permissions: UserPermissions) => {
        const organizationsClient = useOrganizationsOrganizationClient()
        return organizationsClient<UserPermissions>('/organizations/permissions/' + organizationUserId, {
            method: 'POST',
            body: {
                userPermissions: permissions
            }
        });
    }

    const getPermittableEntities = () => {
        const organizationsClient = useOrganizationsOrganizationClient()
        return organizationsClient<PermittableSpace[]>('/organizations/permittable-entities', {
            method: 'GET'
        });
    }

    const getJoinCode = () => {
        const organizationsClient = useOrganizationsOrganizationClient()
        return organizationsClient<string>('/organizations/join-code', {
            method: 'GET'
        });
    }

    const regenerateJoinCode = () => {
        const organizationsClient = useOrganizationsOrganizationClient()
        return organizationsClient<string>('/organizations/regenerate-join-code', {
            method: 'POST'
        });
    }

    const revokeAccess = (organizationUserId: number) => {
        const organizationsClient = useOrganizationsOrganizationClient()
        return organizationsClient<PermittableSpace[]>('/organizations/revoke-access/' + organizationUserId, {
            method: 'POST'
        });
    }

    const join = (code: string) => {
        return client('/organizations/join/' + code, {
            method: 'POST'
        });
    }

    const updateSelectedSpace = (spaceId: number) => {
        const organizationsClient = useOrganizationsOrganizationClient()
        return organizationsClient('/organizations/settings/selected-space/' + spaceId, {
            method: 'PUT'
        });
    }

    const getAttributes = () => {
        const organizationsClient = useOrganizationsOrganizationClient()
        return organizationsClient<AttributeDto[]>('/organizations/attributes', {
            method: 'GET'
        });
    }

    const createAttribute = (request: CreateAttributeRequest) => {
        const organizationsClient = useOrganizationsOrganizationClient()
        return organizationsClient('/organizations/attributes/', {
            method: 'POST',
            body: request,
        });
    }

    const updateAttribute = (id: number, request: UpdateAttributeRequest) => {
        const organizationsClient = useOrganizationsOrganizationClient()
        return organizationsClient('/organizations/attributes/' + id, {
            method: 'PUT',
            body: request,
        });
    }

    const deleteAttribute = (id: number) => {
        const organizationsClient = useOrganizationsOrganizationClient()
        return organizationsClient('/organizations/attributes/' + id, {
            method: 'DELETE'
        });
    }

    return {
        getOrganizations,
        createOrganization,
        editOrganization,
        deleteOrganization,
        login,
        getOrganization,
        getOrganizationMembers,
        getUserPermissions,
        getPermittableEntities,
        setUserPermissions,
        join,
        getJoinCode,
        regenerateJoinCode,
        revokeAccess,
        updateSelectedSpace,
        getAttributes,
        createAttribute,
        updateAttribute,
        deleteAttribute,
    }
}