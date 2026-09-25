import { defineField, defineType } from 'sanity'
import { imageWithAlt, sectionsField } from './fields'

export const page = defineType({
  name: 'page',
  title: 'Página',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Dirección',
      type: 'slug',
      options: { source: 'title' },
      description: 'Es el final de la URL (ej: gaston-breyer). No la cambies en páginas que ya están en el menú.',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'heroImage', title: 'Imagen principal', ...imageWithAlt }),
    sectionsField,
  ],
  preview: { select: { title: 'title', subtitle: 'slug.current', media: 'heroImage' } },
})
