export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string;
  order: number;
}

export interface DocumentFolder {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  documents: Document[];
  subFolders: DocumentFolder[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
