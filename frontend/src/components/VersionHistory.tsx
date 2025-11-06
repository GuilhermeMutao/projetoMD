import React, { useState, useEffect } from 'react';
import { VersioningService, DocumentVersion } from '../utils/versioning';
import { getTheme, Theme } from '../utils/theme';
import { Icons } from '../utils/icons';

interface VersionHistoryProps {
  documentId: string;
  currentTitle: string;
  currentContent: string;
  onRestore: (content: string, title: string) => void;
  theme: Theme;
  onClose: () => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  documentId,
  currentTitle,
  currentContent,
  onRestore,
  theme,
  onClose,
}) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const themeColors = getTheme(theme);

  useEffect(() => {
    const loadVersions = () => {
      const docs = VersioningService.getVersions(documentId);
      setVersions(docs);
    };
    loadVersions();
  }, [documentId]);

  const handleRestore = (version: DocumentVersion) => {
    if (window.confirm(`Restaurar versão v${version.versionNumber}?\n\nData: ${new Date(version.createdAt).toLocaleString('pt-BR')}\n\nIsso criará uma nova versão com o conteúdo restaurado.`)) {
      onRestore(version.content, version.title);
    }
  };

  const handleDeleteVersion = (versionId: string) => {
    if (window.confirm('Deletar esta versão permanentemente?')) {
      VersioningService.deleteVersion(versionId);
      setVersions(VersioningService.getVersions(documentId));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getContentPreview = (content: string, maxChars: number = 100) => {
    return content.substring(0, maxChars).replace(/\n/g, ' ') + (content.length > maxChars ? '...' : '');
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
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: `0 20px 60px ${themeColors.shadow}`,
          border: `1px solid ${themeColors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Icons.Clock size={18} />
            Histórico de Versões
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: themeColors.textTertiary,
              padding: 0,
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Fechar"
          >
            <Icons.Times size={18} />
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            padding: '12px',
            backgroundColor: themeColors.hover,
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '12px',
            color: themeColors.textSecondary,
          }}
        >
          <strong>Total de versões:</strong> {versions.length + 1} (incluindo versão atual)
        </div>

        {/* Versão Atual */}
        <div
          style={{
            padding: '12px',
            backgroundColor: '#4CAF50',
            borderRadius: '6px',
            marginBottom: '16px',
            color: 'white',
            fontSize: '12px',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            <Icons.Check size={12} /> VERSÃO ATUAL
          </div>
          <div style={{ fontSize: '11px', opacity: 0.9 }}>
            {currentTitle}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
            {getContentPreview(currentContent, 80)}
          </div>
        </div>

        {/* Lista de Versões */}
        <div>
          <h3
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: themeColors.textSecondary,
              marginBottom: '12px',
              margin: '0 0 12px 0',
            }}
          >
            Versões Anteriores
          </h3>

          {versions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {versions.map((version) => (
                <div
                  key={version.id}
                  style={{
                    padding: '12px',
                    backgroundColor: selectedVersion?.id === version.id ? themeColors.primary : themeColors.hover,
                    borderRadius: '6px',
                    border: `1px solid ${themeColors.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setSelectedVersion(version)}
                  onMouseEnter={(e) => {
                    if (selectedVersion?.id !== version.id) {
                      e.currentTarget.style.backgroundColor = themeColors.primary;
                      e.currentTarget.style.opacity = '0.7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedVersion?.id !== version.id) {
                      e.currentTarget.style.backgroundColor = themeColors.hover;
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '8px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '12px',
                          color: selectedVersion?.id === version.id ? 'white' : themeColors.text,
                        }}
                      >
                        v{version.versionNumber}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: selectedVersion?.id === version.id ? 'rgba(255,255,255,0.8)' : themeColors.textTertiary,
                          marginTop: '2px',
                        }}
                      >
                        <Icons.Calendar size={10} /> {formatDate(version.createdAt)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(version);
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.85';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        title="Restaurar esta versão"
                      >
                        <Icons.Download size={11} />
                        Restaurar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVersion(version.id);
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#E53935',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.85';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        title="Deletar versão"
                      >
                        <Icons.Trash size={11} />
                      </button>
                    </div>
                  </div>

                  {version.changelog && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: selectedVersion?.id === version.id ? 'rgba(255,255,255,0.9)' : themeColors.textSecondary,
                        fontStyle: 'italic',
                        marginBottom: '6px',
                      }}
                    >
                      <Icons.FileAlt size={10} style={{ marginRight: '4px' }} />
                      {version.changelog}
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: '11px',
                      color: selectedVersion?.id === version.id ? 'rgba(255,255,255,0.7)' : themeColors.textTertiary,
                      lineHeight: '1.4',
                    }}
                  >
                    {getContentPreview(version.content, 100)}
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
              Nenhuma versão anterior encontrada
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
