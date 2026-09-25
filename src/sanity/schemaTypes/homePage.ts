import { defineType } from 'sanity'
import { sectionsField } from './fields'

// Singleton (_id "homePage"). The top of the home page is automatic: the show with the
// next performance, the agenda and the posters. These sections go below them.
export const homePage = defineType({
  name: 'homePage',
  title: 'Inicio',
  type: 'document',
  fields: [{ ...sectionsField, description: 'Se muestran debajo de la cartelera, antes de los cursos.' }],
  preview: { prepare: () => ({ title: 'Inicio' }) },
})
