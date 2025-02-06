
import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Phone, Globe, Clock } from "lucide-react"
import { locationService, type BikeShop } from "@/services/location"

interface MapComponentProps {
  className?: string
}

declare global {
  interface Window {
    google: any
  }
}

export function MapComponent({ className }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)

  useEffect(() => {
    if (mapRef.current && !map && window.google) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 13
      })
      setMap(newMap)
    }
  }, [map])

  return (
    <div className={className}>
      <div ref={mapRef} style={{ width: "100%", height: "400px" }} />
    </div>
  )
}
