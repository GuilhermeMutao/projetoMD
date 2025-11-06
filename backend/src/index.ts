import express, { Request, Response } from 'express';
import cors from 'cors';
import { DocumentStorage } from './storage';
import { ApiResponse, Document } from './types';

const app = express();
const storage = new DocumentStorage();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas - Documentos
app.get('/api/documents', (req: Request, res: Response) => {
  const documents = storage.getAllDocuments();
  const response: ApiResponse<Document[]> = {
    success: true,
    data: documents,
  };
  res.json(response);
});

app.get('/api/documents/:id', (req: Request, res: Response) => {
  const document = storage.getDocument(req.params.id);
  const response: ApiResponse<Document> = document
    ? { success: true, data: document }
    : { success: false, error: 'Documento não encontrado' };
  res.status(document ? 200 : 404).json(response);
});

app.post('/api/documents', (req: Request, res: Response) => {
  const { title, content, parentId } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: 'Título é obrigatório' });
  }
  const document = storage.createDocument(title, content || '', parentId);
  const response: ApiResponse<Document> = { success: true, data: document };
  res.status(201).json(response);
});

app.put('/api/documents/:id', (req: Request, res: Response) => {
  const { title, content } = req.body;
  const document = storage.updateDocument(req.params.id, title, content);
  const response: ApiResponse<Document> = document
    ? { success: true, data: document }
    : { success: false, error: 'Documento não encontrado' };
  res.status(document ? 200 : 404).json(response);
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const success = storage.deleteDocument(req.params.id);
  const response: ApiResponse<null> = success
    ? { success: true }
    : { success: false, error: 'Documento não encontrado' };
  res.status(success ? 200 : 404).json(response);
});

// Rotas - Pastas
app.get('/api/folders', (req: Request, res: Response) => {
  const folders = storage.getAllFolders();
  const response: ApiResponse<any[]> = { success: true, data: folders };
  res.json(response);
});

app.get('/api/folders/root', (req: Request, res: Response) => {
  const rootFolder = storage.getRootFolder();
  const response: ApiResponse<any> = { success: true, data: rootFolder };
  res.json(response);
});

app.post('/api/folders', (req: Request, res: Response) => {
  const { title, parentId } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: 'Título é obrigatório' });
  }
  const folder = storage.createFolder(title, parentId);
  const response: ApiResponse<any> = { success: true, data: folder };
  res.status(201).json(response);
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Backend está funcionando' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
