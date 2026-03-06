// src/pages/Rooms.tsx
import RoomsSection from '../components/rooms/RoomsSection'
import RoomDetailCard from '../components/rooms/RoomDetailCard'
import PageHeader from '../components/common/PageHeader'
import SelectionToolbar from '../components/common/SelectionToolbar'
import RoomsToolbar from '../components/rooms/RoomsToolbar'
import { useRoomsData } from '../hooks/rooms/useRoomsData'
import { useRoomsFilters } from '../hooks/rooms/useRoomsFilters'
import { useSelectionState } from '../hooks/common/useSelectionState'
import { useToolbarFilters } from '../hooks/common/useToolbarFilters'
import { DEFAULT_ROOMS_FILTERS } from '../models/RoomFilters'

export default function Rooms() {
    const {
        rooms,
        selectedRoom,
        pendingNewRoomId,
        setSelectedRoom,
        addRoom,
        updateRoom,
        closeDetail,
        deleteRoomsByIds,
        deleteSingleRoom,
    } = useRoomsData()

    const {
        filters,
        visibleRoomIds,
        roomsByFloor,
        handleSearchChange,
        handleTypeFilterChange,
        handleCapacityOperatorChange,
        handleCapacityValueChange,
        handleAvailabilityFilterChange,
        resetFilters,
    } = useRoomsFilters(rooms)

    const {
        selectionMode,
        selectedIds: selectedRoomIds,
        selectedIdsSet: selectedRoomIdsSet,
        selectedCount: selectedRoomCount,
        toggleSelectionMode,
        toggleSelection: toggleRoomSelection,
        selectAll: selectAllRooms,
        clearSelection,
        disableSelectionMode,
        pruneSelection,
    } = useSelectionState({
        onEnterSelectionMode: () => {
            setSelectedRoom(null)
        },
    })

    const {
        hasActiveFilters,
        resetFilters: handleResetFilters,
    } = useToolbarFilters({
        values: filters,
        defaults: DEFAULT_ROOMS_FILTERS,
        onReset: resetFilters,
    })

    const handleToggleSelectionMode = () => {
        toggleSelectionMode()
    }

    const handleDeleteSingleRoom = (roomId: string) => {
        deleteSingleRoom(roomId)
        pruneSelection([roomId])
    }

    const handleSelectAllVisible = () => {
        selectAllRooms(visibleRoomIds)
    }

    const handleClearSelection = () => {
        clearSelection()
    }

    const handleDeleteSelected = () => {
        deleteRoomsByIds(selectedRoomIds)
        disableSelectionMode()
    }

    const floors = Array.from(
        new Set(rooms.map((room) => room.floor)),
    ).sort((a, b) => a - b)

    const hasVisibleRooms = visibleRoomIds.length > 0

    const isCreatingSelectedRoom = !!selectedRoom && pendingNewRoomId === selectedRoom.id
    
    const handleCreateRequested = () => {
        const floor = floors[0] ?? 0
        addRoom(floor)
    }

    return (
        <>
            <PageHeader
                title="Salles"
                subtitle="Liste des salles par étage avec types et commentaires."
            />

            <div className="rooms-page">
                <RoomsToolbar
                    searchValue={filters.searchValue}
                    onSearchChange={handleSearchChange}
                    typeFilter={filters.typeFilter}
                    onTypeFilterChange={handleTypeFilterChange}
                    capacityOperator={filters.capacityOperator}
                    onCapacityOperatorChange={handleCapacityOperatorChange}
                    capacityValue={filters.capacityValue}
                    onCapacityValueChange={handleCapacityValueChange}
                    availabilityFilter={filters.availabilityFilter}
                    onAvailabilityFilterChange={handleAvailabilityFilterChange}
                    selectionMode={selectionMode}
                    selectedCount={selectedRoomCount}
                    onToggleSelectionMode={handleToggleSelectionMode}
                    onCreateRequested={handleCreateRequested}
                    onResetFilters={handleResetFilters}
                    hasActiveFilters={hasActiveFilters}
                />

                {selectionMode && (
                    <SelectionToolbar
                        totalCount={visibleRoomIds.length}
                        selectedCount={selectedRoomCount}
                        onSelectAll={handleSelectAllVisible}
                        onClearSelection={handleClearSelection}
                        onDeleteSelected={handleDeleteSelected}
                        confirmTitle="Supprimer les salles sélectionnées"
                        confirmMessage={`Vous allez supprimer ${selectedRoomIds.length} salle${selectedRoomIds.length > 1 ? 's' : ''}.`}
                    />
                )}

                <div className="rooms-sections">
                    {hasVisibleRooms ? (
                        floors.map((floor) => (
                            <RoomsSection
                                key={floor}
                                floor={floor}
                                rooms={roomsByFloor[floor] || []}
                                onSelectRoom={setSelectedRoom}
                                selectionMode={selectionMode}
                                selectedRoomIds={selectedRoomIdsSet}
                                onToggleRoomSelection={toggleRoomSelection}
                            />
                        ))
                    ) : (
                        <div className="rooms-empty-state">
                            Aucune salle ne correspond aux filtres selectionnes.
                        </div>
                    )}
                </div>
            </div>

            {selectedRoom && (
                <RoomDetailCard
                    room={selectedRoom}
                    onClose={closeDetail}
                    onChange={updateRoom}
                    onDelete={() => handleDeleteSingleRoom(selectedRoom.id)}
                    isCreate={isCreatingSelectedRoom}
                />
            )}
        </>
    )
}
