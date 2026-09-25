import { defineArrayMember, defineField, defineType } from 'sanity'
import { imageWithAlt, linkField } from './fields'

export const course = defineType({
  name: 'course',
  title: 'Curso o taller',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'image', title: 'Imagen', ...imageWithAlt }),
    defineField({ name: 'description', title: 'Descripción', type: 'array', of: [defineArrayMember({ type: 'block' })] }),
    defineField({
      name: 'groups',
      title: 'Grupos',
      description: 'Un curso puede dictarse en varios días, cada uno con su docente.',
      type: 'array',
      validation: (r) => r.min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'group',
          fields: [
            defineField({ name: 'schedule', title: 'Día y horario', type: 'string', description: 'Ej: Lunes de 19:30 a 21:30 h', validation: (r) => r.required() }),
            defineField({ name: 'teacher', title: 'Docente', type: 'string' }),
          ],
          preview: { select: { title: 'schedule', subtitle: 'teacher' } },
        }),
      ],
    }),
    defineField({ name: 'startDate', title: 'Fecha de inicio', type: 'date' }),
    linkField('enrollUrl', 'Link de inscripción'),
  ],
  preview: {
    select: { title: 'title', media: 'image', groups: 'groups' },
    prepare: ({ title, media, groups }) => ({ title, media, subtitle: `${groups?.length ?? 0} grupos` }),
  },
})
