"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentStorage = void 0;
const uuid_1 = require("uuid");
class DocumentStorage {
    constructor() {
        this.documents = new Map();
        this.folders = new Map();
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
    createDocument(title, content, parentId) {
        const doc = {
            id: (0, uuid_1.v4)(),
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
    getDocument(id) {
        return this.documents.get(id);
    }
    getAllDocuments() {
        return Array.from(this.documents.values());
    }
    updateDocument(id, title, content) {
        const doc = this.documents.get(id);
        if (doc) {
            doc.title = title;
            doc.content = content;
            doc.updatedAt = new Date();
        }
        return doc;
    }
    deleteDocument(id) {
        return this.documents.delete(id);
    }
    // Pasta
    createFolder(title, parentId) {
        const folder = {
            id: (0, uuid_1.v4)(),
            title,
            createdAt: new Date(),
            updatedAt: new Date(),
            documents: [],
            subFolders: [],
        };
        this.folders.set(folder.id, folder);
        return folder;
    }
    getFolder(id) {
        if (id === 'root') {
            return this.rootFolder;
        }
        return this.folders.get(id);
    }
    getRootFolder() {
        return this.rootFolder;
    }
    getAllFolders() {
        return Array.from(this.folders.values());
    }
    updateFolder(id, title) {
        const folder = this.folders.get(id);
        if (folder) {
            folder.title = title;
            folder.updatedAt = new Date();
        }
        return folder;
    }
    deleteFolder(id) {
        return this.folders.delete(id);
    }
}
exports.DocumentStorage = DocumentStorage;
//# sourceMappingURL=storage.js.map