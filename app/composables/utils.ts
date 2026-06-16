export const useUtils = () => {
    const messagesFileApi = useRuntimeConfig().public.messagesBaseAddress + 'telegram-files/';
    const laraueUrl = useRuntimeConfig().public.laraueUrl;
    const documentationPath = useRuntimeConfig().public.documentationPath;

    const dateFormatter = new Intl.DateTimeFormat(undefined, {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
    });

    const timeFormatter = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: 'numeric'
    });

    const formatDate = (dateString?: string) => {
        if (!dateString)
            return '';
        const date = new Date(dateString);
        const today = new Date();

        if (date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear())
            return timeFormatter.format(date);
        return dateFormatter.format(date);
    }

    const now = () => {
        return new Date().toISOString()
    }

    const getImageUrl = (id: string) => messagesFileApi + id

    const getRoleKey = (member: OrganizationMember) => {
        if (member.isOwner)
            return 'owner'
        if (member.adminAccessLevel > AdminAccessLevel.None)
            return 'admin'
        return 'member'
    }

    const hasFlag = <T extends number>(currentValue: T, valueToCheck: T) => {
        return ((currentValue & valueToCheck) === valueToCheck);
    }

    const addFlag = <T extends number>(currentValue: T, valueToAdd: T) => {
        return (currentValue | valueToAdd) as T;
    }

    const deleteFlag = <T extends number>(currentValue: T, valueToAdd: T) => {
        return (currentValue & ~valueToAdd) as T;
    }

    const getDocumentationLink = (relativeUrl: string) => {
        const { locale } = useI18n();
        return `${laraueUrl}${locale.value === 'ru' ? '/ru' : ''}${documentationPath}${relativeUrl}`;
    }

    const getEmptyErrorsObject = () => {
        return {} as { [key: string]: string[] }
    }

    const getOrganizationKey = (organization: OrganizationDto) => {
        return `${organization.slug}-${organization.slugPostfix}`
    }

    const sortEpics = <T extends { isDefault: boolean, touchedAt: string, name: string }>(
        epics: T[],
        sortOrder?: EpicSortOrder) => {
        let data = [...epics];
        if (sortOrder === EpicSortOrder.Alphabetical)
            data.sort((a, b) => {
                if (a.isDefault)
                    return -1;
                if (b.isDefault)
                    return 1;
                return a.name.localeCompare(b.name)
            });
        else if (sortOrder === EpicSortOrder.LastUpdated)
            data.sort((a, b) => {
                if (a.isDefault)
                    return -1;
                if (b.isDefault)
                    return 1;
                return b.touchedAt.localeCompare(a.touchedAt)
            });

        return data
    }

    return {
        formatDate,
        getImageUrl,
        now,
        getRoleKey,
        hasFlag,
        addFlag,
        deleteFlag,
        getDocumentationLink,
        getEmptyErrorsObject,
        getOrganizationKey,
        sortEpics,
    }
}