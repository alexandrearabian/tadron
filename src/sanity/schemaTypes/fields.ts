import { defineArrayMember, defineField } from 'sanity'

export const imageWithAlt = {
  type: 'image' as const,
  options: { hotspot: true },
  fields: [
    defineField({ name: 'alt', title: 'Texto alternativo', type: 'string', validation: (r) => r.required() }),
  ],
}

/** Links editors paste: web pages, WhatsApp (https://wa.me/…), mailto: or tel: */
export const linkField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'url',
    description: 'Una web, un link de WhatsApp (https://wa.me/…), mailto:correo@… o tel:…',
    validation: (r) => r.uri({ scheme: ['https', 'http', 'mailto', 'tel'] }),
  })

/** Ordered page sections, shared by "Inicio" and every "Página". */
export const sectionsField = defineField({
  name: 'sections',
  title: 'Secciones',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'object',
      name: 'textWithImage',
      title: 'Texto con imagen',
      fields: [
        defineField({ name: 'heading', title: 'Título', type: 'string' }),
        defineField({ name: 'body', title: 'Texto', type: 'array', of: [defineArrayMember({ type: 'block' })] }),
        defineField({ name: 'image', title: 'Imagen', ...imageWithAlt }),
        defineField({
          name: 'imagePosition',
          title: 'Posición de la imagen',
          type: 'string',
          options: {
            list: [
              { title: 'Izquierda', value: 'left' },
              { title: 'Derecha', value: 'right' },
            ],
            layout: 'radio',
          },
          initialValue: 'right',
        }),
      ],
      preview: {
        select: { title: 'heading', media: 'image' },
        prepare: ({ title, media }) => ({ title: title || 'Texto con imagen', media }),
      },
    }),
    defineArrayMember({
      type: 'object',
      name: 'callout',
      title: 'Destacado o cita',
      fields: [
        defineField({ name: 'text', title: 'Texto', type: 'text', rows: 3, validation: (r) => r.required() }),
        defineField({ name: 'attribution', title: 'Autor de la cita', type: 'string', description: 'Solo si es una cita' }),
      ],
      preview: { select: { title: 'text', subtitle: 'attribution' } },
    }),
    defineArrayMember({
      type: 'object',
      name: 'itemList',
      title: 'Lista (premios, jurado…)',
      fields: [
        defineField({ name: 'heading', title: 'Título', type: 'string' }),
        defineField({ name: 'intro', title: 'Introducción', type: 'text', rows: 2 }),
        defineField({
          name: 'items',
          title: 'Elementos',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'item',
              fields: [
                defineField({ name: 'title', title: 'Nombre', type: 'string', validation: (r) => r.required() }),
                defineField({ name: 'detail', title: 'Detalle', type: 'string', description: 'Ej: año, motivo' }),
              ],
              preview: { select: { title: 'title', subtitle: 'detail' } },
            }),
          ],
        }),
      ],
      preview: {
        select: { title: 'heading', items: 'items' },
        prepare: ({ title, items }) => ({ title: title || 'Lista', subtitle: `${items?.length ?? 0} elementos` }),
      },
    }),
    defineArrayMember({
      type: 'object',
      name: 'gallery',
      title: 'Galería',
      fields: [defineField({ name: 'images', title: 'Imágenes', type: 'array', of: [defineArrayMember(imageWithAlt)] })],
      preview: { prepare: () => ({ title: 'Galería' }) },
    }),
    defineArrayMember({
      type: 'object',
      name: 'columns',
      title: 'Columnas',
      fields: [
        defineField({
          name: 'items',
          title: 'Columnas',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'column',
              fields: [
                defineField({ name: 'heading', title: 'Título', type: 'string' }),
                defineField({ name: 'body', title: 'Texto', type: 'text' }),
              ],
            }),
          ],
        }),
      ],
      preview: { prepare: () => ({ title: 'Columnas' }) },
    }),
  ],
})
