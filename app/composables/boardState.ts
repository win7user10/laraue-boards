import {DefaultPagination} from "~/composables/pagination";
import {ref} from "vue";
import type {EditStatusRequest} from "~/composables/statusesApi";
import type {EpicListDto} from "~/composables/spacesApi";
import {useEpicsApi} from "~/composables/epicsApi";
import {type OrganizationDto, useOrganizationsApi} from "~/composables/organizationsApi";

const { showToast, appState, updateSpaceId } = useAppState()

export const useBoard = () => {
    const { t } = useI18n()
    const { now } = useUtils();

    const state = useState('boardState', () => ({
        messages: [] as ColumnMessages[],
        epics: [] as EpicListDto[],
        spaces: [] as SpaceListDto[],
        noSpaceEpicsCount: 0,
        epicId: null as number | null,
        currentEpic: undefined as EpicDto | undefined,
        searchString: '',
        openedMedia: [] as MediaInfo[],
        openedMediaIndex: 0,
        organizations: [] as OrganizationListDto[],
    }))

    const spaces = computed(() => {
        return state.value.spaces.sort((a, b) => a.name.localeCompare(b.name));
    })

    const spaceId = computed(() => {
        let val = appState.value.userOrganizationPreferences?.selectedSpaceId;
        const spaces = state.value.spaces;
        const space = spaces.find((space) => space.id === val);
        if (space)
            return space.id;

        const firstSpace = spaces[0];
        if (!firstSpace)
            return null;

        return firstSpace.id;
    })

    const getOrganizations = async () => {
        if (state.value.organizations?.length > 0)
            return state.value.organizations;

        const { getOrganizations } = useOrganizationsApi()
        state.value.organizations = await getOrganizations()

        return state.value.organizations;
    }

    const currentSpace = computed(() => {
        return spaces.value.find(x => x.id === spaceId.value) ?? spaces.value[0]
    })

    const setCategory = (id: number) => {
        state.value.searchString = ''
        state.value.epicId = id
    }

    const search = async(searchString: string) => {
        state.value.searchString = searchString;
        await reloadBoard(false);
    }

    const reloadBoard = async (clearPreviousImmediately: boolean) => {
        const messagesApi = useMessagesApi()
        if (clearPreviousImmediately)
            state.value.messages = [];

        if (!state.value.epicId)
            return;

        if (!state.value.currentEpic?.canViewIssues)
            return;

        state.value.messages = await messagesApi.loadBoard(
            state.value.epicId,
            DefaultPagination.perPage,
            state.value.searchString)
    }

    const openMedia = (media: MediaInfo[], index: number) => {
        state.value.openedMediaIndex = index;
        state.value.openedMedia = media;
    }

    const closeMedia = () => {
        state.value.openedMedia = [];
    }

    const changeOpenedMediaIndex = (index: number) => {
        state.value.openedMediaIndex = index;
    }

    const reloadColumn = async (statusId: number, initialItemsCount: number) => {
        const messages = getMessagesByStatusId(statusId)!;

        // reload all already loaded
        const messagesApi = useMessagesApi()
        const result = await messagesApi.loadIssuesByStatus(
            statusId,
            0,
            initialItemsCount,
            state.value.searchString)

        messages.items.data = result.data;
        messages.items.offset = result.offset;
        messages.items.hasNext = result.hasNext;
    }

    const reloadEpics = async () => {
        state.value.epics = [];
        if (!spaceId.value)
            return
        const spacesApi = useSpacesApi()
        state.value.epics = await spacesApi.loadSpaceEpics(spaceId.value);
        const firstEpic = epics.value[0];
        if (firstEpic)
            state.value.epicId = firstEpic.id;
    }

    const epics = computed(() => {
        const categoryOrder = appState.value.userPreferences!.epicSortOrder
        let data = [...state.value.epics];
        if (categoryOrder === EpicSortOrder.Alphabetical)
            data.sort((a, b) => {
                if (a.isDefault)
                    return -1;
                if (b.isDefault)
                    return 1;
                return a.name.localeCompare(b.name)
            });
        else if (categoryOrder === EpicSortOrder.LastUpdated)
            data.sort((a, b) => {
                if (a.isDefault)
                    return -1;
                if (b.isDefault)
                    return 1;
                return b.touchedAt.localeCompare(a.touchedAt)
            });

        return data
    })

    const createCard = async (value: CreateCardRequest) => {
        const messagesApi = useMessagesApi()
        await messagesApi.createMessage(value);

        // Create from the global creation modal
        if (!value.statusId)
            value.statusId = getDefaultStatus()?.id ?? 0

        const messagesByCategory = getMessagesByStatusId(value.statusId);

        // Create category should reload the column. Request the same count that was opened + 1
        const offset = messagesByCategory?.items?.offset;
        await reloadColumn(value.statusId, offset ? offset + 1 : DefaultPagination.perPage);

        // Update top menu counters
        const messageCategory = state.value.epics.find(c => c.id === state.value.epicId)
        if (messageCategory)
            messageCategory.touchedAt = now();

        // Update status counters
        if (messagesByCategory)
            messagesByCategory.items.totalCount++;

        const status = statuses.value.find(x => x.id === value.statusId);
        const subTitle = status ? `${state.value.currentEpic?.name} · ${status?.name}` : undefined;
        showToast(t('cardCreated'), 'success', subTitle);
    }

    const getDefaultStatus = () => {
        return statuses.value[0]
    }

    const loadingCols = ref<number[]>([]);
    const loadNextCards = async (statusId: number) => {
        if (loadingCols.value.includes(statusId))
            return;

        try {
            loadingCols.value.push(statusId);
            const item = getMessagesByStatusId(statusId)!.items;
            const messagesApi = useMessagesApi()
            const newMessages = await messagesApi.loadIssuesByStatus(
                statusId,
                item.offset,
                DefaultPagination.perPage,
                state.value.searchString);

            item.data.push(...newMessages.data);
            item.offset = newMessages.offset;
            item.hasNext = newMessages.hasNext;
        } finally {
            const index = loadingCols.value.indexOf(statusId);
            loadingCols.value.splice(index, 1);
        }
    }

    const getMessagesByStatusId = (statusId: number) => {
        return state.value.messages.find(s => s.statusId === statusId)
    }

    const isColumnLoading = (statusId: number) => {
        return loadingCols.value.includes(statusId);
    }

    const isLoading = computed(() => {
        return loadingCols.value.length > 0;
    })

    const createCategory = async (value: CreateCategoryRequest) => {
        const epicsApi = useEpicsApi()
        const id = await epicsApi.createCategory(value);
        state.value.epics.push({
            id: id,
            name: value.name,
            color: value.color,
            touchedAt: now(),
            isDefault: false
        })
        showToast(t('boardCreated'), 'success', value.name);
        return id;
    }

    const editCard = async (id: number, value: EditCardRequest) => {
        const messagesApi = useMessagesApi()
        await messagesApi.editMessage(id, value);
        const card = allCards.value.find(x => x.id === id)
        if (card)
            card.content = value.content;

        const category = state.value.epics.find(c => c.id === card?.epicId)
        if (category)
            category.touchedAt = now();

        showToast(t('cardEdited'), 'success');
    }

    const deleteCard = async (id: number) => {
        const messagesApi = useMessagesApi()
        await messagesApi.deleteMessage(id)

        const card = allCards.value.find(c => c.id === id)

        // Drop from the board
        const columnMessages = getMessagesByStatusId(card!.statusId)!
        const cardIndex = columnMessages.items.data.indexOf(card!)
        columnMessages.items.data.splice(cardIndex, 1)

        // Decrease offset for correct future loading
        columnMessages.items.offset -= 1;
        columnMessages.items.totalCount -= 1;

        showToast(t('cardDeleted'), 'danger');
    }

    const editCategory = async (request: EditCategoryRequest) => {
        const epicsApi = useEpicsApi()
        await epicsApi.editCategory(state.value.epicId!, request)
        const category = state.value.epics.find(c => c.id === state.value.epicId)!
        category.color = request.color;
        category.name = request.name;
        category.touchedAt = now();

        state.value.currentEpic!.color = request.color;
        state.value.currentEpic!.name = request.name;
        state.value.currentEpic!.name = request.name;

        showToast(t('boardUpdated'), 'success', request.name);
    }

    const deleteCategory = async () => {
        const epicsApi = useEpicsApi()
        await epicsApi.deleteCategory(state.value.epicId!)
        const index = state.value.epics.findIndex(c => c.id === state.value.epicId)
        state.value.epics.splice(index, 1);
        state.value.currentEpic = undefined;
        state.value.epicId = 0;

        showToast(t('boardDeleted'), 'danger');
    }

    const deleteStatus = async (id: number) => {
        const statusApi = useStatusesApi()
        await statusApi.deleteStatus(id);

        const removingStatus = statuses.value.find(c => c.id === id)!;
        const removingStatusName = removingStatus.name;

        // Drop status and save how many items were opened in dropped column
        const removingIndex = state.value.messages.findIndex(c => c.statusId == id)
        const { offset, totalCount } = state.value.messages[removingIndex]!.items;
        state.value.messages.splice(removingIndex, 1)

        // Remove column
        const removeIndex = state.value.currentEpic!.statuses.findIndex(c => c.id === id);
        state.value.currentEpic!.statuses.splice(removeIndex, 1)

        // Reload first column, calculate new offset + total
        const firstStatus = statuses.value[0]!
        console.log(firstStatus)
        const firstColumnMessages = state.value.messages.find(s => s.statusId == firstStatus.id)!;
        firstColumnMessages.items.totalCount += totalCount;
        await reloadColumn(firstColumnMessages.statusId, firstColumnMessages.items.offset + offset);

        showToast(t('columnDeleted'), 'danger', removingStatusName);
    }

    const createStatus = async (value: CreateStatusRequest) => {
        const statusApi = useStatusesApi()
        const id = await statusApi.createStatus(value);
        const statuses = state.value.currentEpic?.statuses;
        if (!statuses)
            return;

        const lastOrder = Math.max(...statuses.map(x => x.sortOrder))
        state.value.currentEpic!.statuses.push({
            id: id,
            name: value.name,
            color: value.color,
            sortOrder: lastOrder + 1,
        })

        state.value.messages.push({
            statusId: id,
            items: {
                totalCount: 0,
                offset: 0,
                hasNext: false,
                data: []
            }
        });

        showToast(t('columnCreated'), 'success', value.name);
    }

    const editStatus = async (id: number, request: EditStatusRequest) => {
        const statusApi = useStatusesApi()
        await statusApi.editStatus(id, request);
        const status = statuses.value.find(c => c.id === id)!;
        status.color = request.color;
        status.name = request.name;
        showToast(t('columnEdited'), 'success', request.name);
    }

    const reloadCategory = async () => {
        state.value.currentEpic = undefined;
        const epicsApi = useEpicsApi()
        if (state.value.epicId)
            state.value.currentEpic = await epicsApi.loadCategory(state.value.epicId)
    }

    const statuses = computed(() => {
        return state.value.currentEpic?.statuses
            .sort((a, b) => a.sortOrder - b.sortOrder) ?? [];
    })

    const allCards = computed(() => {
        return state.value.messages.flatMap(x => x.items.data)
    })

    const dbMessagesCount = computed(() => {
        return state.value.messages
            .flatMap(x => x.items.totalCount)
            .reduce((acc, x) => acc + x, 0)
    })

    const moveCard = async (cardId: number, statusId: number) => {
        const card = allCards.value.find(m => m.id === cardId);
        if (!card) return;

        const messagesApi = useMessagesApi()
        await messagesApi.move(card.id, statusId);

        // update old column data
        const oldColumnMessages = getMessagesByStatusId(card!.statusId)!
        oldColumnMessages.items.data.splice(oldColumnMessages.items.data.indexOf(card), 1)
        oldColumnMessages.items.offset -= 1;
        oldColumnMessages.items.totalCount -= 1;

        // update new column data
        const newColumnMessages = getMessagesByStatusId(statusId)
        if (newColumnMessages) {
            newColumnMessages.items.data.push(card)
            newColumnMessages.items.totalCount += 1;
            await reloadColumn(statusId, newColumnMessages.items.offset + 1)
        }

        // As soon as card is found, card is moving to currently opened epic
        const newCategory = state.value.epics.find(c => c.id === state.value.epicId)
        if (newCategory)
            newCategory.touchedAt = now();

        // update card properties
        card.epicId = state.value.epicId!;
        card.statusId = statusId;

        // raise notification
        showToast(t('cardMoved'), 'default')
    };

    const changeColumnOrder = async (statusId: number, newSortOrder: number) => {
        const cat = state.value.currentEpic;
        if (!cat) return;

        const idx = cat.statuses.findIndex(s => s.id === statusId);
        if (idx < 0) return;

        if (idx == newSortOrder)
            return;

        const newStatuses = [...cat.statuses];
        const [removed] = newStatuses.splice(idx, 1);
        newStatuses.splice(newSortOrder, 0, removed!);
        newStatuses.forEach((status, i) => {
            status.sortOrder = i;
        })

        const epicsApi = useEpicsApi()
        await epicsApi.reorderStatuses(
            state.value.epicId!,
            Object.fromEntries(newStatuses.map(item => [item.id, item.sortOrder])))

        cat.statuses = newStatuses;
        showToast(t('columnReordered'), 'default')
    };

    const reloadSpaces = async () => {
        const spacesApi = useSpacesApi()
        state.value.spaces = await spacesApi.getSpaces()
    }

    const fullReload = async () => {
        await reloadSpaces();
        await reloadEpics();
        await reloadBoard(true);
    }

    const createSpace = async (request: CreateSpaceRequest) => {
        const spacesApi = useSpacesApi()
        const spaceId = await spacesApi.createSpace(request)
        const spaceInfo = await spacesApi.getSpace(spaceId)
        state.value.spaces.push({
            id: spaceId,
            name: request.name,
            color: request.color,
            canDelete: spaceInfo.canDelete,
            canUpdate: spaceInfo.canUpdate,
        })
        showToast(t('spaceCreated'), 'success', request.name)
    }

    const editSpace = async (id: number, request: EditSpaceRequest) => {
        const api = useSpacesApi()
        await api.editSpace(id, request)
        const space = state.value.spaces.find(c => c.id === id)
        if (space) {
            space.color = request.color;
            space.name = request.name;
        }

        showToast(t('spaceEdited'), 'success', request.name);
    }

    const deleteSpace = async (id: number) => {
        const api = useSpacesApi()
        await api.deleteSpace(id)
        const index = state.value.spaces.findIndex(c => c.id === id)
        state.value.spaces.splice(index, 1);

        // Update views if that space was opened
        if (id === currentSpace.value!.id)
        {
            const selectedSpace = state.value.spaces[0]
            if (selectedSpace) {
                updateSpaceId(selectedSpace.id)
                state.value.epicId = selectedSpace.id;
                await reloadBoard(false)
                await reloadEpics()

                // Update preferences
                const { updateSpace } = useUserOrganizationPreferencesApi()
                await updateSpace(selectedSpace.id)
            }
        }

        showToast(t('spaceDeleted'), 'danger');
    }

    const anySpaceAvailable = computed(() => {
        return spaces.value.length > 0
    })

    return {
        state: readonly(state),
        reloadBoard,
        reloadEpics,
        reloadCategory,
        createCategory,
        setCategory,
        editCategory,
        deleteCategory,
        epics,
        createCard,
        editCard,
        deleteCard,
        loadNextCards,
        isColumnLoading,
        createStatus,
        deleteStatus,
        statuses,
        moveCard,
        changeColumnOrder,
        dbMessagesCount,
        editStatus,
        openMedia,
        closeMedia,
        changeOpenedMediaIndex,
        search,
        isLoading,
        spaces,
        currentSpace,
        reloadSpaces,
        createSpace,
        editSpace,
        deleteSpace,
        anySpaceAvailable,
        getOrganizations,
        fullReload,
    }
}