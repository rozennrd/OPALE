// src/pages/Rooms.tsx
import React from 'react'
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
        console.log('[ROOMS] Toggle selection mode (mock)', { next: !selectionMode })
        toggleSelectionMode()
    }

    const handleDeleteSingleRoom = (roomId: string) => {
        deleteSingleRoom(roomId)
        pruneSelection([roomId])
    }

    const handleSelectAllVisible = () => {
        console.log('[ROOMS] Select all visible rooms (mock)', { count: visibleRoomIds.length })
        selectAllRooms(visibleRoomIds)
    }

    const handleClearSelection = () => {
        console.log('[ROOMS] Clear selection (mock)')
        clearSelection()
    }

    const handleDeleteSelected = () => {
        console.log('[ROOMS] Delete selected rooms (mock)', { ids: selectedRoomIds })
        deleteRoomsByIds(selectedRoomIds)
        disableSelectionMode()
    }

    return (
        <>
            <PageHeader
                title="Salles"
                subtitle="Liste des salles par etage avec types et commentaires (mock front uniquement)."
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
                        confirmTitle="Supprimer les salles selectionnees"
                        confirmMessage={`Vous allez supprimer ${selectedRoomIds.length} salle${selectedRoomIds.length > 1 ? 's' : ''}. Cette action est locale (front).`}
                    />
                )}

                <div className="rooms-sections">
                    {[0, 1, 2].map((floor) => (
                        <RoomsSection
                            key={floor}
                            floor={floor as 0 | 1 | 2}
                            rooms={roomsByFloor[floor] || []}
                            onSelectRoom={setSelectedRoom}
                            onAddRoom={addRoom}
                            selectionMode={selectionMode}
                            selectedRoomIds={selectedRoomIdsSet}
                            onToggleRoomSelection={toggleRoomSelection}
                        />
                    ))}
                </div>
            </div>

            {selectedRoom && (
                <RoomDetailCard
                    room={selectedRoom}
                    onClose={closeDetail}
                    onChange={updateRoom}
                    onDelete={() => handleDeleteSingleRoom(selectedRoom.id)}
                />
            )}
        </>
    )
}
