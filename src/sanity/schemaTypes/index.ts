import type { SchemaTypeDefinition } from 'sanity'
import { course } from './course'
import { homePage } from './homePage'
import { page } from './page'
import { production } from './production'
import { siteSettings } from './siteSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [homePage, production, course, page, siteSettings],
}
