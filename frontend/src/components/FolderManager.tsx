import React, { useState, useEffect } from 'react';
import { Folder, StorageService } from '../utils/storage';
import { getTheme, Theme } from '../utils/theme';

interface FolderManagerProps {
  onClose: () => void;
  onSelectFolder: (folder: Folder | null) => void;
  theme: Theme;
  selectedFolderId?: string;
}

export const FolderManager: React.FC<FolderManagerProps> = ({
  onClose,
  onSelectFolder,
  theme,
  selectedFolderId,
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const themeColors = getTheme(theme);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = () => {
    const allFolders = StorageService.getAllFolders();
    setFolders(allFolders);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      StorageService.createFolder(newFolderName);
      setNewFolderName('');
      loadFolders();
    }
  };

  const handleDeleteFolder = (id: string) => {
    if (window.confirm('Deletar esta pasta? Os documentos voltarão para a raiz.')) {
      StorageService.deleteFolder(id);
      loadFolders();
      if (selectedFolderId === id) {
        onSelectFolder(null);
      }
    }
  };

  const handleRenameFolder = (id: string) => {
    if (editingName.trim()) {
      StorageService.renameFolder(id, editingName);
      setEditingId(null);
      setEditingName('');
      loadFolders();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: themeColors.surface,
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: `0 20px 60px ${themeColors.shadow}`,
          border: `1px solid ${themeColors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: themeColors.text,
            }}
          >
            📁 Gerenciar Pastas
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: themeColors.textTertiary,
              padding: 0,
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Criar Nova Pasta */}
        <div
          style={{
            marginBottom: '20px',
            paddingBottom: '20px',
            borderBottom: `1px solid ${themeColors.border}`,
          }}
        >
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: themeColors.textSecondary,
              marginBottom: '8px',
            }}
          >
            Nova Pasta
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Nome da pasta..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
              }}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '6px',
                backgroundColor: themeColors.background,
                color: themeColors.text,
                fontSize: '13px',
              }}
            />
            <button
              onClick={handleCreateFolder}
              style={{
                padding: '10px 16px',
                backgroundColor: themeColors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              ➕
            </button>
          </div>
        </div>

        {/* Lista de Pastas */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: themeColors.textSecondary,
              marginBottom: '12px',
            }}
          >
            Pastas ({folders.length})
          </label>

          {folders.length > 0 ? (
            <div>
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: themeColors.hover,
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                    border: `1px solid ${themeColors.border}`,
                  }}
                >
                  {editingId === folder.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleRenameFolder(folder.id)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleRenameFolder(folder.id);
                      }}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        border: `1px solid ${themeColors.primary}`,
                        borderRadius: '4px',
                        backgroundColor: themeColors.surface,
                        color: themeColors.text,
                        fontSize: '13px',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>📁</span>
                      <div>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: themeColors.text,
                          }}
                        >
                          {folder.name}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: themeColors.textTertiary,
                          }}
                        >
                          {StorageService.getDocumentsByFolder(folder.id).length} documentos
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {editingId !== folder.id && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(folder.id);
                            setEditingName(folder.name);
                          }}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: 'transparent',
                            border: `1px solid ${themeColors.border}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: themeColors.textSecondary,
                          }}
                          title="Renomear"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteFolder(folder.id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#E53935',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                          title="Deletar"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: themeColors.textTertiary,
                fontSize: '13px',
              }}
            >
              Nenhuma pasta criada ainda
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
