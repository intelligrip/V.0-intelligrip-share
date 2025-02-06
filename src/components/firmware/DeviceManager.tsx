
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { firmwareService } from "@/services/firmware"

interface PowerConsumption {
  proximity: number
  lighting: number
  bluetooth: number
  processing: number
  total: number
}

interface DeviceData {
  deviceId: string
  batteryLevel: number
  sensors: {
    proximity: number
    light: number
    motion: number
  }
}

interface BluetoothDevice {
  id: string
  name?: string | null
}

const POWER_MODES = {
  normal: {
    proximityUpdateInterval: 100,
    lightUpdateInterval: 100,
    bluetoothTransmitPower: "high",
    backgroundProcessing: true
  },
  low: {
    proximityUpdateInterval: 500,
    lightUpdateInterval: 500,
    bluetoothTransmitPower: "medium",
    backgroundProcessing: false
  }
}

export function DeviceManager() {
  const [device, setDevice] = useState<BluetoothDevice | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [powerMode, setPowerMode] = useState<"normal" | "low">("normal")
  const [powerStats, setPowerStats] = useState<PowerConsumption | null>(null)

  const handlePowerModeChange = async (mode: "normal" | "low") => {
    if (!device) return
    
    try {
      await firmwareService.setPowerMode(device.id, mode)
      setPowerMode(mode)
      toast({
        title: "Power mode updated",
        description: `Power mode changed to ${mode}`
      })

      const batteryLevel = await firmwareService.getBatteryLevel(device.id)
      const consumption = calculatePowerConsumption(mode, batteryLevel)
      setPowerStats(consumption)
    } catch (error) {
      console.error("Error changing power mode:", error)
      toast({
        title: "Error",
        description: "Failed to change power mode",
        variant: "destructive"
      })
    }
  }

  const calculatePowerConsumption = (mode: "normal" | "low", batteryLevel: number): PowerConsumption => {
    const settings = POWER_MODES[mode]
    
    const proximityPower = (1000 / settings.proximityUpdateInterval) * 2
    const lightingPower = (1000 / settings.lightUpdateInterval) * 1.5
    const bluetoothPower = settings.bluetoothTransmitPower === "high" ? 40 : 25
    const processingPower = settings.backgroundProcessing ? 30 : 10

    return {
      proximity: proximityPower,
      lighting: lightingPower,
      bluetooth: bluetoothPower,
      processing: processingPower,
      total: proximityPower + lightingPower + bluetoothPower + processingPower
    }
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Power Mode</span>
            <Select
              value={powerMode}
              onValueChange={handlePowerModeChange}
              disabled={!device}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select power mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal Mode</SelectItem>
                <SelectItem value="low">Low Power</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {powerStats && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Estimated Runtime</span>
                <span>{(1000 / powerStats.total).toFixed(1)} hours</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Proximity Sensor</span>
                  <span>{powerStats.proximity.toFixed(1)} mA</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Lighting System</span>
                  <span>{powerStats.lighting.toFixed(1)} mA</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Bluetooth</span>
                  <span>{powerStats.bluetooth.toFixed(1)} mA</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Processing</span>
                  <span>{powerStats.processing.toFixed(1)} mA</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-2 border-t">
                  <span>Total Draw</span>
                  <span>{powerStats.total.toFixed(1)} mA</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
