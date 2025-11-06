/**
 * Funções auxiliares para normalização de URLs e busca de documentos
 */

export const normalizeDocumentId = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .substring(0, 100); // Limita tamanho da URL
};

export const findDocumentByUrl = (urlId: string, documents: any[]) => {
  if (!urlId || !documents) {
    return null;
  }

  // Tenta ID exato primeiro
  let found = documents.find((d) => d.id === urlId);

  if (!found) {
    // Tenta por título normalizado
    const normalizedUrl = normalizeDocumentId(urlId);
    found = documents.find((d) => normalizeDocumentId(d.title) === normalizedUrl);
  }

  return found || null;
};

export const generateDocumentUrl = (docId: string): string => {
  return `/${normalizeDocumentId(docId)}`;
};
