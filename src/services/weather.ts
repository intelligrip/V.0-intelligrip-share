
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: string
  precipitation: number
  location: {
    latitude: number
    longitude: number
  }
  timestamp: number
}

export const weatherService = {
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`
      )
      
      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }

      const data = await response.json()
      
      const weatherData: WeatherData = {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windDirection: this.getWindDirection(data.wind.deg),
        precipitation: data.rain?.["1h"] || 0,
        location: {
          latitude,
          longitude
        },
        timestamp: Date.now()
      }

      await this.logWeatherData(weatherData)
      return weatherData
    } catch (error) {
      console.error("Error fetching weather data:", error)
      throw error
    }
  },

  getWindDirection(degrees: number): string {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  },

  async logWeatherData(data: WeatherData): Promise<void> {
    try {
      await addDoc(collection(db, "weatherLogs"), {
        ...data,
        createdAt: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error logging weather data:", error)
    }
  }
}
