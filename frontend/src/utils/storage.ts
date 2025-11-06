export interface Document {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
  folderId?: string; // ID da pasta (opcional)
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}

export interface StorageData {
  documents: Document[];
  folders: Folder[];
}

const STORAGE_KEY = 'mdproject_documents';
const FOLDERS_KEY = 'mdproject_folders';

// Lista de listeners para observar mudanças
const listeners: ((documents: Document[]) => void)[] = [];

export const StorageService = {
  // Adicionar listener para mudanças
  subscribe: (callback: (documents: Document[]) => void) => {
    listeners.push(callback);
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  },

  // Notificar todos os listeners
  notifyListeners: () => {
    const documents = StorageService.getAllDocuments();
    listeners.forEach((callback) => callback(documents));
  },

  // Obter todos os documentos
  getAllDocuments: (): Document[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data).documents : [];
    } catch (error) {
      console.error('Erro ao obter documentos:', error);
      return [];
    }
  },

  // Obter um documento específico
  getDocument: (id: string): Document | undefined => {
    const documents = StorageService.getAllDocuments();
    return documents.find((doc) => doc.id === id);
  },

  // Salvar um documento
  saveDocument: (document: Document): void => {
    try {
      console.log(`💾 Salvando documento: ID=${document.id}, Title="${document.title}", Content length=${document.content.length}`);
      const documents = StorageService.getAllDocuments();
      const index = documents.findIndex((doc) => doc.id === document.id);

      if (index >= 0) {
        console.log(`   ✏️ Atualizando documento existente no índice ${index}`);
        documents[index] = document;
      } else {
        console.log(`   ➕ Adicionando novo documento`);
        documents.push(document);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify({ documents }));
      console.log('✅ Documento salvo no localStorage com sucesso');
      StorageService.notifyListeners();
    } catch (error) {
      console.error('❌ Erro ao salvar documento:', error);
    }
  },

  // Deletar um documento
  deleteDocument: (id: string): void => {
    try {
      const documents = StorageService.getAllDocuments();
      const filtered = documents.filter((doc) => doc.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ documents: filtered }));
      console.log('✅ Documento deletado');
      StorageService.notifyListeners();
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
    }
  },

  // Criar um novo documento
  createDocument: (title: string, coverImage?: string, folderId?: string): Document => {
    const now = new Date().toISOString();
    const document: Document = {
      id: Math.random().toString(36).substring(7),
      title,
      content: '',
      coverImage,
      folderId,
      createdAt: now,
      updatedAt: now,
    };
    StorageService.saveDocument(document);
    return document;
  },

  // ===== FUNÇÕES DE PASTAS =====

  // Obter todas as pastas
  getAllFolders: (): Folder[] => {
    try {
      const data = localStorage.getItem('mdproject_folders');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao obter pastas:', error);
      return [];
    }
  },

  // Criar uma nova pasta
  createFolder: (name: string): Folder => {
    const folder: Folder = {
      id: Math.random().toString(36).substring(7),
      name,
      createdAt: new Date().toISOString(),
    };
    const folders = StorageService.getAllFolders();
    folders.push(folder);
    localStorage.setItem('mdproject_folders', JSON.stringify(folders));
    StorageService.notifyListeners();
    return folder;
  },

  // Deletar uma pasta (move documentos para raiz)
  deleteFolder: (folderId: string): void => {
    try {
      const folders = StorageService.getAllFolders();
      const filtered = folders.filter((folder) => folder.id !== folderId);
      localStorage.setItem('mdproject_folders', JSON.stringify(filtered));

      // Remover folderId de todos os documentos nessa pasta
      const documents = StorageService.getAllDocuments();
      documents.forEach((doc) => {
        if (doc.folderId === folderId) {
          delete doc.folderId;
          StorageService.saveDocument(doc);
        }
      });

      StorageService.notifyListeners();
    } catch (error) {
      console.error('Erro ao deletar pasta:', error);
    }
  },

  // Renomear pasta
  renameFolder: (folderId: string, newName: string): void => {
    try {
      const folders = StorageService.getAllFolders();
      const folder = folders.find((f) => f.id === folderId);
      if (folder) {
        folder.name = newName;
        localStorage.setItem('mdproject_folders', JSON.stringify(folders));
        StorageService.notifyListeners();
      }
    } catch (error) {
      console.error('Erro ao renomear pasta:', error);
    }
  },

  // Obter documentos de uma pasta
  getDocumentsByFolder: (folderId: string): Document[] => {
    const documents = StorageService.getAllDocuments();
    return documents.filter((doc) => doc.folderId === folderId);
  },

  // Mover documento para uma pasta
  moveDocumentToFolder: (documentId: string, folderId: string | undefined): void => {
    try {
      const doc = StorageService.getDocument(documentId);
      if (doc) {
        doc.folderId = folderId;
        StorageService.saveDocument(doc);
      }
    } catch (error) {
      console.error('Erro ao mover documento:', error);
    }
  },

  // Remover documento de uma pasta (move para raiz)
  removeDocumentFromFolder: (documentId: string): void => {
    StorageService.moveDocumentToFolder(documentId, undefined);
  },
};
