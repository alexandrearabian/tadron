import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem().title('Inicio').id('homePage').child(S.document().schemaType('homePage').documentId('homePage')),
      S.documentTypeListItem('production').title('Cartelera'),
      S.documentTypeListItem('course').title('Cursos y talleres'),
      S.documentTypeListItem('page').title('Páginas'),
      S.divider(),
      S.listItem()
        .title('Ajustes del sitio')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
