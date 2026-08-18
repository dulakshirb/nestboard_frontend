import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Loader2, Pencil, Plus, Trash2, X, Check } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Link, useParams } from "react-router"
import {
  createRoom,
  createRoomType,
  deleteRoom,
  deleteRoomType,
  fetchRoomTypeDetail,
  fetchRoomTypes,
  updateRoom,
  updateRoomType,
} from "@/api/properties"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMyProperties } from "@/hooks/useMyProperties"
import type { CreateRoomTypeInput } from "@/types/property"

const emptyRoomTypeForm: CreateRoomTypeInput = {
  name: "",
  pricePerMonth: 0,
  hasAC: false,
}

export function AdminPropertyManage() {
  const { id: propertyId } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: _properties } = useMyProperties()

  const { data: roomTypes, isLoading } = useQuery({
    queryKey: ["roomTypes", propertyId],
    queryFn: () => fetchRoomTypes(propertyId!),
    enabled: !!propertyId,
  })

  const roomTypeIds = roomTypes?.map((rt) => rt.id) ?? []
  const detailQueries = useQueries({
    queries: roomTypeIds.map((rtId) => ({
      queryKey: ["roomTypeDetail", propertyId, rtId],
      queryFn: () => fetchRoomTypeDetail(propertyId!, rtId),
      enabled: !!propertyId,
    })),
  })

  const [rtModalOpen, setRtModalOpen] = useState(false)
  const [editingRt, setEditingRt] = useState<string | null>(null)
  const [rtForm, setRtForm] = useState<CreateRoomTypeInput>(emptyRoomTypeForm)
  const [rtError, setRtError] = useState("")

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["roomTypes", propertyId] })
    void queryClient.invalidateQueries({ queryKey: ["adminRoomTypes"] })
    void queryClient.invalidateQueries({ queryKey: ["myProperties"] })
  }

  const invalidateDetail = (rtId: string) => {
    void queryClient.invalidateQueries({
      queryKey: ["roomTypeDetail", propertyId, rtId],
    })
  }

  const rtMutation = useMutation({
    mutationFn: () =>
      editingRt
        ? updateRoomType(propertyId!, editingRt, rtForm)
        : createRoomType(propertyId!, rtForm),
    onSuccess: () => {
      setRtModalOpen(false)
      setEditingRt(null)
      setRtForm(emptyRoomTypeForm)
      invalidateAll()
    },
    onError: (err) =>
      setRtError(err instanceof Error ? err.message : "Could not save room type"),
  })

  const deleteRtMutation = useMutation({
    mutationFn: (rtId: string) => deleteRoomType(propertyId!, rtId),
    onSuccess: invalidateAll,
    onError: (err) => alert(err instanceof Error ? err.message : "Could not delete room type"),
  })

  const addRoomMutation = useMutation({
    mutationFn: ({ rtId, label, seats }: { rtId: string; label: string; seats: number }) =>
      createRoom(propertyId!, rtId, { roomLabel: label, seatCapacity: seats }),
    onSuccess: (_data, vars) => {
      setAddRoomRtId(null)
      setRoomLabel("")
      setRoomSeats(1)
      invalidateDetail(vars.rtId)
      invalidateAll()
    },
    onError: (err) => alert(err instanceof Error ? err.message : "Could not add room"),
  })

  const deleteRoomMutation = useMutation({
    mutationFn: ({ rtId, roomId }: { rtId: string; roomId: string }) =>
      deleteRoom(propertyId!, rtId, roomId),
    onSuccess: (_data, vars) => {
      invalidateDetail(vars.rtId)
      invalidateAll()
    },
    onError: (err) => alert(err instanceof Error ? err.message : "Could not delete room"),
  })

  const [addRoomRtId, setAddRoomRtId] = useState<string | null>(null)
  const [roomLabel, setRoomLabel] = useState("")
  const [roomSeats, setRoomSeats] = useState(1)

  const [editingRoom, setEditingRoom] = useState<{ rtId: string; roomId: string; currentLabel: string; currentSeats: number } | null>(null)
  const [editRoomLabel, setEditRoomLabel] = useState("")
  const [editRoomSeats, setEditRoomSeats] = useState(1)

  const updateRoomMutation = useMutation({
    mutationFn: ({ rtId, roomId, roomLabel, seatCapacity }: { rtId: string; roomId: string; roomLabel: string; seatCapacity: number }) =>
      updateRoom(propertyId!, rtId, roomId, { roomLabel, seatCapacity }),
    onSuccess: (_data, vars) => {
      setEditingRoom(null)
      setEditRoomLabel("")
      setEditRoomSeats(1)
      invalidateDetail(vars.rtId)
      invalidateAll()
    },
    onError: (err) => alert(err instanceof Error ? err.message : "Could not update room"),
  })

  function openAddRt() {
    setEditingRt(null)
    setRtForm(emptyRoomTypeForm)
    setRtError("")
    setRtModalOpen(true)
  }

  function openEditRt(rtId: string) {
    const rt = roomTypes?.find((r) => r.id === rtId)
    if (!rt) return
    setEditingRt(rtId)
    setRtForm({
      name: rt.name,
      pricePerMonth: Number(rt.pricePerMonth),
      hasAC: rt.hasAC,
    })
    setRtError("")
    setRtModalOpen(true)
  }

  function handleRtSubmit(e: FormEvent) {
    e.preventDefault()
    setRtError("")
    rtMutation.mutate()
  }

  function handleAddRoom(e: FormEvent) {
    e.preventDefault()
    if (!roomLabel.trim() || !addRoomRtId) return
    addRoomMutation.mutate({ rtId: addRoomRtId, label: roomLabel.trim(), seats: roomSeats })
  }

  function handleEditRoom(e: FormEvent) {
    e.preventDefault()
    if (!editingRoom || !editRoomLabel.trim()) return
    updateRoomMutation.mutate({
      rtId: editingRoom.rtId,
      roomId: editingRoom.roomId,
      roomLabel: editRoomLabel.trim(),
      seatCapacity: editRoomSeats,
    })
  }

  return (
    <div className="p-7">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/properties">
            <ArrowLeft className="mr-1 size-4" /> Back
          </Link>
        </Button>
        <div>
          <p className="text-sm text-gray-500">
            {roomTypes?.length ?? 0} room types · {roomTypes?.reduce((s, r) => s + r.roomsCount, 0) ?? 0} rooms
          </p>
        </div>
        <div className="ml-auto">
          <Button onClick={openAddRt}>
            <Plus className="mr-1 size-4" /> Add Room Type
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="h-4 w-2/3 rounded bg-gray-100" />
              <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
              <div className="mt-4 h-2 rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && roomTypes && roomTypes.length === 0 && (
        <p className="mt-12 text-center text-gray-400">
          No room types yet. Click "Add Room Type" to create your first.
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {roomTypes?.map((rt, i) => {
          const detail = detailQueries[i]?.data
          const occupancy =
            rt.seatCapacity > 0
              ? Math.round(((rt.seatCapacity - rt.freeSeats) / rt.seatCapacity) * 100)
              : 0
          return (
            <div
              key={rt.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{rt.name}</h3>
                  <div className="flex gap-1">
                    <Badge variant="secondary">LKR {rt.pricePerMonth}</Badge>
                    {rt.hasAC && <Badge variant="secondary">AC</Badge>}
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  {rt.roomsCount} rooms · {rt.seatCapacity} seats ·{" "}
                  <span className={rt.freeSeats === 0 ? "text-red-600 font-medium" : "text-green-600"}>
                    {rt.freeSeats} free
                  </span>
                </div>

                <div className="mt-3 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${occupancy}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">{occupancy}% occupied</p>

                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditRt(rt.id)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={deleteRtMutation.isPending}
                    onClick={() => {
                      if (confirm("Delete this room type? This cannot be undone."))
                        deleteRtMutation.mutate(rt.id)
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {detail && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                  <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Rooms</h4>
                  <div className="space-y-1.5">
                    {detail.rooms.map((rm) => {
                      const free = rm.booking.filter((s) => !s.tenant).length
                      const isEditing = editingRoom?.roomId === rm.roomId

                      if (isEditing) {
                        return (
                          <form
                            key={rm.roomId}
                            onSubmit={handleEditRoom}
                            className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-xs"
                          >
                            <Input
                              required
                              value={editRoomLabel}
                              onChange={(e) => setEditRoomLabel(e.target.value)}
                              className="h-7 flex-1 text-sm"
                              autoFocus
                            />
                            <Input
                              required
                              type="number"
                              min={1}
                              max={20}
                              value={editRoomSeats}
                              onChange={(e) => setEditRoomSeats(Math.min(20, Math.max(1, Number(e.target.value))))}
                              className="h-7 w-16 text-sm"
                              title="Seat capacity"
                            />
                            <button
                              type="submit"
                              title="Save"
                              className="rounded p-0.5 text-green-600 hover:bg-green-50"
                              disabled={updateRoomMutation.isPending}
                            >
                              {updateRoomMutation.isPending ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Check className="size-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              title="Cancel"
                              className="rounded p-0.5 text-gray-400 hover:bg-gray-100"
                              onClick={() => {
                                setEditingRoom(null)
                                setEditRoomLabel("")
                                setEditRoomSeats(1)
                              }}
                            >
                              <X className="size-3.5" />
                            </button>
                          </form>
                        )
                      }

                      return (
                        <div
                          key={rm.roomId}
                          className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-xs"
                        >
                          <span className="font-medium text-gray-800">{rm.roomName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {free}/{rm.booking.length} free
                            </span>
                            <button
                              title="Rename room"
                              className="rounded p-0.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => {
                                setEditingRoom({
                                  rtId: rt.id,
                                  roomId: rm.roomId,
                                  currentLabel: rm.roomName,
                                  currentSeats: rm.booking.length,
                                })
                                setEditRoomLabel(rm.roomName)
                                setEditRoomSeats(rm.booking.length)
                              }}
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              title="Delete room"
                              className="rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                              disabled={deleteRoomMutation.isPending}
                              onClick={() => {
                                if (confirm(`Delete ${rm.roomName}?`))
                                  deleteRoomMutation.mutate({ rtId: rt.id, roomId: rm.roomId })
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {addRoomRtId === rt.id ? (
                    <form onSubmit={handleAddRoom} className="mt-2 flex gap-2">
                      <Input
                        required
                        value={roomLabel}
                        onChange={(e) => setRoomLabel(e.target.value)}
                        placeholder="Room label"
                        className="flex-1"
                      />
                      <Input
                        required
                        type="number"
                        min={1}
                        max={20}
                        value={roomSeats}
                        onChange={(e) => setRoomSeats(Math.min(20, Math.max(1, Number(e.target.value))))}
                        className="w-16"
                        title="Seats"
                      />
                      <Button type="submit" size="sm" disabled={addRoomMutation.isPending}>
                        {addRoomMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Add"
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAddRoomRtId(null)
                          setRoomLabel("")
                        }}
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <button
                      className="mt-2 flex items-center gap-1 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-primary hover:text-primary"
                      onClick={() => {
                        setAddRoomRtId(rt.id)
                        setRoomLabel("")
                        setRoomSeats(1)
                      }}
                    >
                      <Plus className="size-3" /> Add Room
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {rtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingRt ? "Edit Room Type" : "Add Room Type"}
            </h2>

            <form onSubmit={handleRtSubmit} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Name
                <Input
                  required
                  value={rtForm.name}
                  onChange={(e) => setRtForm({ ...rtForm, name: e.target.value })}
                  className="mt-1"
                  placeholder="e.g. Shared Room"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  Price per month (LKR)
                  <Input
                    required
                    type="number"
                    min={1}
                    step="any"
                    value={rtForm.pricePerMonth || ""}
                    onChange={(e) =>
                      setRtForm({ ...rtForm, pricePerMonth: Number(e.target.value) })
                    }
                    className="mt-1"
                    placeholder="e.g. 15000"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={rtForm.hasAC ?? false}
                  onChange={(e) => setRtForm({ ...rtForm, hasAC: e.target.checked })}
                  className="size-4 rounded border-gray-300"
                />
                Has Air Conditioning
              </label>

              {rtError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{rtError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={rtMutation.isPending} className="flex-1">
                  {rtMutation.isPending && <Loader2 className="mr-1 size-4 animate-spin" />}
                  {editingRt ? "Save Changes" : "Create Room Type"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setRtModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}