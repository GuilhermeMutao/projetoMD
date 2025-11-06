"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const storage_1 = require("./storage");
const app = (0, express_1.default)();
const storage = new storage_1.DocumentStorage();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rotas - Documentos
app.get('/api/documents', (req, res) => {
    const documents = storage.getAllDocuments();
    const response = {
        success: true,
        data: documents,
    };
    res.json(response);
});
app.get('/api/documents/:id', (req, res) => {
    const document = storage.getDocument(req.params.id);
    const response = document
        ? { success: true, data: document }
        : { success: false, error: 'Documento não encontrado' };
    res.status(document ? 200 : 404).json(response);
});
app.post('/api/documents', (req, res) => {
    const { title, content, parentId } = req.body;
    if (!title) {
        return res.status(400).json({ success: false, error: 'Título é obrigatório' });
    }
    const document = storage.createDocument(title, content || '', parentId);
    const response = { success: true, data: document };
    res.status(201).json(response);
});
app.put('/api/documents/:id', (req, res) => {
    const { title, content } = req.body;
    const document = storage.updateDocument(req.params.id, title, content);
    const response = document
        ? { success: true, data: document }
        : { success: false, error: 'Documento não encontrado' };
    res.status(document ? 200 : 404).json(response);
});
app.delete('/api/documents/:id', (req, res) => {
    const success = storage.deleteDocument(req.params.id);
    const response = success
        ? { success: true }
        : { success: false, error: 'Documento não encontrado' };
    res.status(success ? 200 : 404).json(response);
});
// Rotas - Pastas
app.get('/api/folders', (req, res) => {
    const folders = storage.getAllFolders();
    const response = { success: true, data: folders };
    res.json(response);
});
app.get('/api/folders/root', (req, res) => {
    const rootFolder = storage.getRootFolder();
    const response = { success: true, data: rootFolder };
    res.json(response);
});
app.post('/api/folders', (req, res) => {
    const { title, parentId } = req.body;
    if (!title) {
        return res.status(400).json({ success: false, error: 'Título é obrigatório' });
    }
    const folder = storage.createFolder(title, parentId);
    const response = { success: true, data: folder };
    res.status(201).json(response);
});
// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Backend está funcionando' });
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map