import React, { useState, useEffect } from 'react';
import { Document, Folder, StorageService } from '../utils/storage';
import { getTheme, Theme } from '../utils/theme';

interface DocumentFolderManagerProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  folders: Folder[];
  theme: Theme;
  onUpdate: () => void;
}

export const DocumentFolderManager: React.FC<DocumentFolderManagerProps> = ({
  isOpen,
  onClose,
  document,
  folders,
  theme,
  onUpdate,
}) => {
  const themeColors = getTheme(theme);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(document?.folderId);

  useEffect(() => {
    setSelectedFolderId(document?.folderId);
  }, [document]);

  const handleMoveToFolder = (folderId: string | undefined) => {
    if (document) {
      StorageService.moveDocumentToFolder(document.id, folderId);
      setSelectedFolderId(folderId);
      onUpdate();
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
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
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: `0 8px 24px ${themeColors.shadow}`,
          border: `1px solid ${themeColors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            margin: '0 0 16px 0',
            color: themeColors.text,
            fontSize: '16px',
            fontWeight: 700,
          }}
        >
          📁 Mover Documento
        </h2>

        <p
          style={{
            margin: '0 0 16px 0',
            color: themeColors.textSecondary,
            fontSize: '13px',
          }}
        >
          Documento: <strong>{document.title}</strong>
        </p>

        <div
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            marginBottom: '16px',
            border: `1px solid ${themeColors.border}`,
            borderRadius: '6px',
          }}
        >
          {/* Opção: Sem pasta (raiz) */}
          <div
            onClick={() => handleMoveToFolder(undefined)}
            style={{
              padding: '12px',
              cursor: 'pointer',
              backgroundColor: !selectedFolderId ? themeColors.primary : 'transparent',
              color: !selectedFolderId ? 'white' : themeColors.text,
              borderBottom: `1px solid ${themeColors.border}`,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              if (selectedFolderId) {
                e.currentTarget.style.backgroundColor = themeColors.hover;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedFolderId) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span>📂</span>
            <span>Sem Pasta (Raiz)</span>
            {!selectedFolderId && <span style={{ marginLeft: 'auto' }}>✓</span>}
          </div>

          {/* Pastas */}
          {folders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => handleMoveToFolder(folder.id)}
              style={{
                padding: '12px',
                cursor: 'pointer',
                backgroundColor: selectedFolderId === folder.id ? themeColors.primary : 'transparent',
                color: selectedFolderId === folder.id ? 'white' : themeColors.text,
                borderBottom: `1px solid ${themeColors.border}`,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (selectedFolderId !== folder.id) {
                  e.currentTarget.style.backgroundColor = themeColors.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFolderId !== folder.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>📁</span>
              <span>{folder.name}</span>
              {selectedFolderId === folder.id && <span style={{ marginLeft: 'auto' }}>✓</span>}
            </div>
          ))}

          {folders.length === 0 && (
            <div
              style={{
                padding: '12px',
                color: themeColors.textTertiary,
                textAlign: 'center',
                fontSize: '12px',
              }}
            >
              Nenhuma pasta criada
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: themeColors.hover,
              color: themeColors.text,
              border: `1px solid ${themeColors.border}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
