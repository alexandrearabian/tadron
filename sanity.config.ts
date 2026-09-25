'use client'

// Mounted by src/app/studio/[[...tool]]/page.tsx at /studio
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { schema } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'

const singletons = ['siteSettings', 'homePage']

export default defineConfig({
  basePath: '/studio',
  title: 'Tadrón Teatro',
  projectId,
  dataset,
  schema,
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  document: {
    // Singletons: no "new" button, no delete/duplicate
    newDocumentOptions: (prev) => prev.filter((item) => !singletons.includes(item.templateId)),
    actions: (prev, { schemaType }) =>
      singletons.includes(schemaType)
        ? prev.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : prev,
  },
})
