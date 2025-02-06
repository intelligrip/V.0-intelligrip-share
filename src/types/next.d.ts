
declare module "next/image" {
  import { DetailedHTMLProps, ImgHTMLAttributes } from "react"

  type StaticImageData = {
    src: string
    height: number
    width: number
    blurDataURL?: string
  }

  interface StaticRequire {
    default: StaticImageData
  }

  type StaticImport = StaticImageData | StaticRequire

  type ImageProps = Omit<DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, "src" | "alt"> & {
    src: string | StaticImport
    alt: string
    width?: number
    height?: number
    layout?: "fixed" | "intrinsic" | "responsive" | "fill"
    loader?: (resolverProps: ImageLoaderProps) => string
    quality?: number | string
    priority?: boolean
    loading?: LoadingValue
    lazyRoot?: React.RefObject<HTMLElement>
    lazyBoundary?: string
    className?: string
    blurDataURL?: string
    placeholder?: "blur" | "empty"
    objectFit?: "fill" | "contain" | "cover" | "none" | "scale-down"
    objectPosition?: string
    unoptimized?: boolean
  }

  interface ImageLoaderProps {
    src: string
    width: number
    quality?: number
  }

  type LoadingValue = "lazy" | "eager" | undefined

  declare function Image(props: ImageProps): JSX.Element
  export { Image as default, type ImageProps, type StaticImageData }
}
