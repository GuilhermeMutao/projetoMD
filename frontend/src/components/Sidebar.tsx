import React, { useState, useEffect } from 'react';
import { Document, StorageService, Folder } from '../utils/storage';
import { getTheme, Theme } from '../utils/theme';
import { Icons } from '../utils/icons';

interface SidebarProps {
  onSelectDocument: (doc: Document) => void;
  onCreateNew: () => void;
  isMobile: boolean;
  theme: Theme;
  currentDocumentId?: string;
  onOpenFolderManager?: () => void;
  onBackToGallery?: () => void;
  onMoveDocumentToFolder?: (doc: Document) => void;
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onSelectDocument,
  onCreateNew,
  isMobile,
  theme,
  currentDocumentId,
  onOpenFolderManager,
  onBackToGallery,
  onMoveDocumentToFolder,
  onToggleTheme,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({ favorites: true, all: true, folders: true });
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const themeColors = getTheme(theme);

  useEffect(() => {
    loadDocuments();
    loadFolders();
    const saved = localStorage.getItem('mdproject_favorites');
    if (saved) setFavorites(new Set(JSON.parse(saved)));

    const unsubscribe = StorageService.subscribe(() => {
      loadDocuments();
      loadFolders();
    });

    return unsubscribe;
  }, []);

  const loadDocuments = () => {
    const docs = StorageService.getAllDocuments();
    setDocuments(docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  };

  const loadFolders = () => {
    const allFolders = StorageService.getAllFolders();
    setFolders(allFolders);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    localStorage.setItem('mdproject_favorites', JSON.stringify(Array.from(newFavorites)));
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rootDocuments = filteredDocuments.filter((doc) => !doc.folderId);
  const favoriteDocuments = filteredDocuments.filter((doc) => favorites.has(doc.id));
  const regularDocuments = rootDocuments.filter((doc) => !favorites.has(doc.id));

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const DocumentItem = ({ doc, isActive }: { doc: Document; isActive: boolean }) => (
    <div
      onClick={() => onSelectDocument(doc)}
      style={{
        padding: '8px 10px',
        marginBottom: '4px',
        borderRadius: '6px',
        backgroundColor: isActive ? themeColors.primary : themeColors.hover,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = themeColors.hover;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = themeColors.hover;
        }
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Icons.File size={12} color={isActive ? 'white' : themeColors.text} />
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: isActive ? 'white' : themeColors.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {doc.title}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {onMoveDocumentToFolder && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDocumentToFolder(doc);
            }}
            style={{
              padding: '2px 4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              opacity: 0.6,
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
              color: isActive ? 'white' : themeColors.text,
            }}
            title="Mover para pasta"
          >
            <Icons.Folder size={10} />
          </button>
        )}
        <button
          onClick={(e) => toggleFavorite(doc.id, e)}
          style={{
            padding: '2px 6px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            opacity: favorites.has(doc.id) ? 1 : 0.5,
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            color: isActive ? 'white' : themeColors.text,
          }}
          title={favorites.has(doc.id) ? 'Remover de favoritos' : 'Adicionar aos favoritos'}
        >
          {favorites.has(doc.id) ? (
            <Icons.Star size={11} />
          ) : (
            <Icons.StarOutline size={11} />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: themeColors.surface,
        borderRight: `1px solid ${themeColors.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Header da Sidebar */}
      <div
        style={{
          padding: '12px',
          borderBottom: `2px solid ${themeColors.border}`,
          backgroundColor: themeColors.background,
        }}
      >
        <button
          onClick={onBackToGallery}
          style={{
            width: '100%',
            padding: '0',
            fontSize: '14px',
            fontWeight: 700,
            color: themeColors.text,
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          title="Voltar à galeria"
        >
          <Icons.Book size={16} />
          <span>MDProject</span>
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '10px', borderBottom: `1px solid ${themeColors.border}` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: themeColors.background,
            border: `1px solid ${themeColors.border}`,
            borderRadius: '4px',
            padding: '6px 8px',
          }}
        >
          <Icons.Search size={12} color={themeColors.textSecondary} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              fontSize: '12px',
              backgroundColor: 'transparent',
              color: themeColors.text,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Documents List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Seção Favoritos */}
        {favoriteDocuments.length > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={() => toggleSection('favorites')}
              style={{
                width: '100%',
                padding: '6px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: themeColors.text,
                fontWeight: 600,
                fontSize: '11px',
                marginBottom: '4px',
              }}
            >
              <Icons.ChevronDown
                size={10}
                style={{
                  transform: expandedSections.favorites ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.2s',
                }}
              />
              <Icons.Star size={12} />
              <span>Favoritos</span>
              <span style={{ fontSize: '9px', opacity: 0.6, marginLeft: 'auto' }}>
                ({favoriteDocuments.length})
              </span>
            </button>
            {expandedSections.favorites && (
              <div>
                {favoriteDocuments.map((doc) => (
                  <DocumentItem key={doc.id} doc={doc} isActive={doc.id === currentDocumentId} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seção Pastas */}
        {folders.length > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px',
              }}
            >
              <button
                onClick={() => toggleSection('folders')}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: themeColors.text,
                  fontWeight: 600,
                  fontSize: '11px',
                  justifyContent: 'flex-start',
                }}
              >
                <Icons.ChevronDown
                  size={10}
                  style={{
                    transform: expandedSections.folders ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s',
                  }}
                />
                <Icons.Folder size={12} />
                <span>Pastas</span>
                <span style={{ fontSize: '9px', opacity: 0.6 }}>({folders.length})</span>
              </button>
              {expandedSections.folders && onOpenFolderManager && (
                <button
                  onClick={onOpenFolderManager}
                  style={{
                    padding: '4px 6px',
                    backgroundColor: 'transparent',
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    color: themeColors.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Gerenciar pastas"
                >
                  <Icons.Settings size={11} />
                </button>
              )}
            </div>
            {expandedSections.folders && (
              <div>
                {folders.map((folder) => {
                  const folderDocs = filteredDocuments.filter((doc) => doc.folderId === folder.id);
                  const isExpanded = expandedFolders.has(folder.id);
                  return (
                    <div key={folder.id} style={{ marginBottom: '4px' }}>
                      <button
                        onClick={() => toggleFolder(folder.id)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          backgroundColor: themeColors.hover,
                          border: `1px solid ${themeColors.border}`,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: themeColors.text,
                          fontWeight: '500',
                          fontSize: '11px',
                          marginBottom: '2px',
                        }}
                      >
                        <Icons.ChevronDown
                          size={10}
                          style={{
                            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                            transition: 'transform 0.2s',
                          }}
                        />
                        {isExpanded ? <Icons.FolderOpen size={12} /> : <Icons.Folder size={12} />}
                        <span
                          style={{
                            flex: 1,
                            textAlign: 'left',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {folder.name}
                        </span>
                        <span style={{ fontSize: '9px', opacity: 0.6 }}>({folderDocs.length})</span>
                      </button>
                      {isExpanded && (
                        <div style={{ marginLeft: '8px', marginTop: '2px' }}>
                          {folderDocs.length > 0 ? (
                            folderDocs.map((doc) => (
                              <DocumentItem key={doc.id} doc={doc} isActive={doc.id === currentDocumentId} />
                            ))
                          ) : (
                            <div
                              style={{
                                padding: '6px 8px',
                                fontSize: '11px',
                                color: themeColors.textTertiary,
                                fontStyle: 'italic',
                              }}
                            >
                              Vazio
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Seção Documentos na Raiz */}
        {regularDocuments.length > 0 && (
          <div style={{ marginBottom: '10px', flex: 1, minHeight: 0 }}>
            <button
              onClick={() => toggleSection('all')}
              style={{
                width: '100%',
                padding: '6px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: themeColors.text,
                fontWeight: 600,
                fontSize: '11px',
                marginBottom: '4px',
              }}
            >
              <Icons.ChevronDown
                size={10}
                style={{
                  transform: expandedSections.all ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.2s',
                }}
              />
              <Icons.FileAlt size={12} />
              <span>Todos</span>
              <span style={{ fontSize: '9px', opacity: 0.6, marginLeft: 'auto' }}>
                ({regularDocuments.length})
              </span>
            </button>
            {expandedSections.all && (
              <div style={{ overflowY: 'auto' }}>
                {regularDocuments.length > 0 ? (
                  regularDocuments.map((doc) => (
                    <DocumentItem key={doc.id} doc={doc} isActive={doc.id === currentDocumentId} />
                  ))
                ) : (
                  <div
                    style={{
                      padding: '8px',
                      textAlign: 'center',
                      color: themeColors.textTertiary,
                      fontSize: '11px',
                    }}
                  >
                    Nenhum documento
                  </div>
                )}
              </div>
            )}
            <button
              onClick={onCreateNew}
              style={{
                width: '100%',
                padding: '8px 10px',
                backgroundColor: themeColors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Icons.Plus size={12} />
              <span>Novo</span>
            </button>
          </div>
        )}

        {/* Mensagem vazia */}
        {filteredDocuments.length === 0 && folders.length === 0 && (
          <div
            style={{
              padding: '12px 8px',
              textAlign: 'center',
              color: themeColors.textTertiary,
              fontSize: '11px',
            }}
          >
            Nenhum documento encontrado
          </div>
        )}
      </div>

      {/* Footer - Novo Documento Button */}
      <div
        style={{
          padding: '10px',
          borderTop: `1px solid ${themeColors.border}`,
          backgroundColor: themeColors.background,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {onOpenFolderManager && (
          <button
            onClick={onOpenFolderManager}
            style={{
              width: '100%',
              padding: '8px 10px',
              backgroundColor: themeColors.hover,
              color: themeColors.text,
              border: `1px solid ${themeColors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Icons.Folder size={12} />
            <span>Pastas</span>
          </button>
        )}
        <button
          onClick={onToggleTheme}
          style={{
            width: '100%',
            padding: '8px 10px',
            backgroundColor: themeColors.hover,
            color: themeColors.text,
            border: `1px solid ${themeColors.border}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginBottom: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          title={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
        >
          {theme === 'light' ? (
            <>
              <Icons.Moon size={12} />
              <span>Escuro</span>
            </>
          ) : (
            <>
              <Icons.Sun size={12} />
              <span>Claro</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
