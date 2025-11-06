import { Document, DocumentFolder } from './types';
export declare class DocumentStorage {
    private documents;
    private folders;
    private rootFolder;
    constructor();
    createDocument(title: string, content: string, parentId?: string): Document;
    getDocument(id: string): Document | undefined;
    getAllDocuments(): Document[];
    updateDocument(id: string, title: string, content: string): Document | undefined;
    deleteDocument(id: string): boolean;
    createFolder(title: string, parentId?: string): DocumentFolder;
    getFolder(id: string): DocumentFolder | undefined;
    getRootFolder(): DocumentFolder;
    getAllFolders(): DocumentFolder[];
    updateFolder(id: string, title: string): DocumentFolder | undefined;
    deleteFolder(id: string): boolean;
}
//# sourceMappingURL=storage.d.ts.map