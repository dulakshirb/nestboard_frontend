import {
  Search,
  SlidersHorizontal,
  Home,
  Building2,
  Warehouse,
  Hotel,
  ArrowUpDown,
  MapPin,
  type LucideIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Property } from "@/types/property"
import { useSearchParams } from "react-router"
import { useCallback, useRef, useEffect, useState } from "react"

interface Category {
  label: Property["type"] | "All"
  icon: LucideIcon | null
}

const categories: Category[] = [
  { label: "All", icon: null },
  { label: "House", icon: Home },
  { label: "Villa", icon: Warehouse },
  { label: "Apartment", icon: Building2 },
  { label: "Hotel", icon: Hotel },
]

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "rating", label: "Top Rated" },
]

export function SearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get("search") ?? ""
  const city = searchParams.get("city") ?? ""
  const activeCategory = searchParams.get("type") ?? "All"
  const sort = searchParams.get("sort") ?? "newest"

  const [searchDraft, setSearchDraft] = useState(search)
  const [cityDraft, setCityDraft] = useState(city)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setCityDraft(city)
  }, [city])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const debouncedUpdate = useCallback(
    (key: string, value: string, draftSetter: (v: string) => void) => {
      draftSetter(value)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          if (value) {
            next.set(key, value)
          } else {
            next.delete(key)
          }
          if (key !== "page") next.delete("page")
          return next
        })
      }, 300)
    },
    [setSearchParams],
  )

  const updateParam = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
        }
        if (key !== "page") next.delete("page")
        return next
      })
    },
    [setSearchParams],
  )

  return (
    <div className="relative z-20 -mt-7 px-4">
      <div className="rounded-2xl bg-white p-5 shadow-xl sm:p-8">
        {/* Search row */}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchDraft}
              placeholder="Search by property name..."
              className="h-10 rounded-xl border-gray-200 pl-9"
              onChange={(e) => debouncedUpdate("search", e.target.value, setSearchDraft)}
            />
          </div>
          <div className="relative w-full sm:w-44">
            <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={cityDraft}
              placeholder="City..."
              className="h-10 rounded-xl border-gray-200 pl-9"
              onChange={(e) => debouncedUpdate("city", e.target.value, setCityDraft)}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 px-3 text-sm text-gray-600"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              size="sm"
              variant={activeCategory === label ? "default" : "outline"}
              className="gap-1.5 rounded-full"
              onClick={() => updateParam("type", label === "All" ? "" : label)}
            >
              {Icon && <Icon />}
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
