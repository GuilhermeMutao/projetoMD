import { Document, DocumentFolder } from './types';
import { v4 as uuidv4 } from 'uuid';

export class DocumentStorage {
  private documents: Map<string, Document> = new Map();
  private folders: Map<string, DocumentFolder> = new Map();
  private rootFolder: DocumentFolder;

  constructor() {
    this.rootFolder = {
      id: 'root',
      title: 'Documentos',
      createdAt: new Date(),
      updatedAt: new Date(),
      documents: [],
      subFolders: [],
    };
  }

  // Documento
  createDocument(title: string, content: string, parentId?: string): Document {
    const doc: Document = {
      id: uuidv4(),
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId,
      order: this.documents.size,
    };
    this.documents.set(doc.id, doc);
    return doc;
  }

  getDocument(id: string): Document | undefined {
    return this.documents.get(id);
  }

  getAllDocuments(): Document[] {
    return Array.from(this.documents.values());
  }

  updateDocument(id: string, title: string, content: string): Document | undefined {
    const doc = this.documents.get(id);
    if (doc) {
      doc.title = title;
      doc.content = content;
      doc.updatedAt = new Date();
    }
    return doc;
  }

  deleteDocument(id: string): boolean {
    return this.documents.delete(id);
  }

  // Pasta
  createFolder(title: string, parentId?: string): DocumentFolder {
    const folder: DocumentFolder = {
      id: uuidv4(),
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      documents: [],
      subFolders: [],
    };
    this.folders.set(folder.id, folder);
    return folder;
  }

  getFolder(id: string): DocumentFolder | undefined {
    if (id === 'root') {
      return this.rootFolder;
    }
    return this.folders.get(id);
  }

  getRootFolder(): DocumentFolder {
    return this.rootFolder;
  }

  getAllFolders(): DocumentFolder[] {
    return Array.from(this.folders.values());
  }

  updateFolder(id: string, title: string): DocumentFolder | undefined {
    const folder = this.folders.get(id);
    if (folder) {
      folder.title = title;
      folder.updatedAt = new Date();
    }
    return folder;
  }

  deleteFolder(id: string): boolean {
    return this.folders.delete(id);
  }
}
