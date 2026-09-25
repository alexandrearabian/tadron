import { defineArrayMember, defineField, defineType } from 'sanity'
import { imageWithAlt, linkField } from './fields'

export const production = defineType({
  name: 'production',
  title: 'Espectáculo',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'author', title: 'Autor', type: 'string' }),
    defineField({ name: 'director', title: 'Dirección', type: 'string' }),
    defineField({ name: 'poster', title: 'Afiche', ...imageWithAlt, validation: (r) => r.required() }),
    defineField({ name: 'synopsis', title: 'Sinopsis', type: 'array', of: [defineArrayMember({ type: 'block' })] }),
    linkField('ticketUrl', 'Link de reserva'),
    defineField({
      name: 'announcement',
      title: 'Aviso',
      type: 'string',
      description: 'Opcional. Ej: "Estreno en noviembre", "Últimas funciones"',
    }),
    defineField({
      name: 'weekly',
      title: 'Funciones semanales',
      description: 'Para obras que se dan todas las semanas. Las fechas se calculan solas.',
      type: 'object',
      options: { columns: 3 },
      fields: [
        defineField({
          name: 'day',
          title: 'Día',
          type: 'number',
          options: {
            list: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((title, value) => ({ title, value })),
          },
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'time',
          title: 'Hora',
          type: 'string',
          description: 'Ej: 21:00',
          validation: (r) => r.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: 'HH:MM' }),
        }),
        defineField({ name: 'until', title: 'Última función', type: 'date', description: 'Después de esta fecha sale de cartel' }),
      ],
    }),
    defineField({
      name: 'performances',
      title: 'Funciones con fecha',
      description: 'Funciones sueltas, o para marcar una función semanal como agotada.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'performance',
          fields: [
            defineField({ name: 'dateTime', title: 'Fecha y hora', type: 'datetime', validation: (r) => r.required() }),
            defineField({ name: 'soldOut', title: 'Agotado', type: 'boolean', initialValue: false }),
          ],
          preview: {
            select: { dateTime: 'dateTime', soldOut: 'soldOut' },
            prepare: ({ dateTime, soldOut }) => ({
              title: dateTime
                ? new Date(dateTime).toLocaleString('es-AR', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                    timeZone: 'America/Argentina/Buenos_Aires',
                  })
                : 'Sin fecha',
              subtitle: soldOut ? 'Agotado' : undefined,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'credits',
      title: 'Ficha técnica',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'credit',
          fields: [
            defineField({ name: 'role', title: 'Rol', type: 'string' }),
            defineField({ name: 'name', title: 'Nombre', type: 'string' }),
          ],
          preview: { select: { title: 'name', subtitle: 'role' } },
        }),
      ],
    }),
    defineField({ name: 'gallery', title: 'Galería', type: 'array', of: [defineArrayMember(imageWithAlt)] }),
  ],
  preview: { select: { title: 'title', subtitle: 'author', media: 'poster' } },
})
