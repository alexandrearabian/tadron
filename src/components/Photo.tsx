import Image, { type ImageProps } from 'next/image'
import type { Img } from '@/lib/content'

/** next/image for Sanity images: shows the blurred preview (lqip) until the real image has loaded. */
export function Photo({ image, ...props }: { image: Img } & Omit<ImageProps, 'src' | 'alt'>) {
  return (
    <Image
      src={image.url}
      alt={image.alt}
      placeholder={image.lqip ? 'blur' : 'empty'}
      blurDataURL={image.lqip ?? undefined}
      {...props}
    />
  )
}
