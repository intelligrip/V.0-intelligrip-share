
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

interface RideShareFormProps {
  onSubmit?: (formData: FormData) => Promise<void>
}

export function RideShareForm({ onSubmit }: RideShareFormProps) {
  const [media, setMedia] = useState<File[]>([])
  const [preview, setPreview] = useState<string[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setMedia(files)
      const previews = files.map(file => URL.createObjectURL(file))
      setPreview(previews)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      const formData = new FormData()
      media.forEach((file, index) => {
        formData.append(`media_${index}`, file)
      })
      await onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Add Photos/Videos
        </label>
        <Input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleImageUpload}
          className="w-full"
        />
      </div>

      {preview.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {preview.map((url, index) => (
            <div key={index} className="relative aspect-video">
              <div className="relative w-full h-full">
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  width={300}
                  height={200}
                  className="object-cover rounded-lg"
                  unoptimized
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Textarea
        placeholder="Share details about your ride..."
        className="w-full"
      />

      <Button type="submit" className="w-full">
        Post
      </Button>
    </form>
  )
}
