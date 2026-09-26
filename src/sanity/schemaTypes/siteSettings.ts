import { defineField, defineType } from 'sanity'
import { imageWithAlt } from './fields'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Ajustes del sitio',
  type: 'document',
  fields: [
    defineField({ name: 'address', title: 'Dirección', type: 'string' }),
    defineField({ name: 'phone', title: 'Teléfono', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (r) => r.email() }),
    defineField({ name: 'instagram', type: 'url' }),
    defineField({ name: 'facebook', type: 'url' }),
    defineField({ name: 'youtube', type: 'url' }),
    defineField({ name: 'mapEmbedUrl', title: 'URL del mapa (embed de Google Maps)', type: 'url' }),
    defineField({
      name: 'description',
      title: 'Descripción para buscadores',
      type: 'text',
      rows: 3,
      validation: (r) => r.max(160),
    }),
    defineField({ name: 'ogImage', title: 'Imagen para redes sociales', type: 'image' }),
    defineField({ name: 'facade', title: 'Foto de la fachada', description: 'Se muestra en Contacto', ...imageWithAlt }),
  ],
  preview: { prepare: () => ({ title: 'Ajustes del sitio' }) },
})
