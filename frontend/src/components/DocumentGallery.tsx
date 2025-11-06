import React, { useState, useEffect } from 'react';
import { Document, StorageService } from '../utils/storage';
import { getTheme, Theme } from '../utils/theme';

interface DocumentGalleryProps {
  onSelectDocument: (doc: Document) => void;
  onCreateNew: () => void;
  onOpenFolderManager?: (doc: Document) => void;
  theme: Theme;
}

export const DocumentGallery: React.FC<DocumentGalleryProps> = ({
  onSelectDocument,
  onCreateNew,
  onOpenFolderManager,
  theme,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const themeColors = getTheme(theme);

  useEffect(() => {
    loadDocuments();
    const saved = localStorage.getItem('mdproject_favorites');
    if (saved) setFavorites(new Set(JSON.parse(saved)));

    const unsubscribe = StorageService.subscribe(() => {
      loadDocuments();
    });

    return unsubscribe;
  }, []);

  const loadDocuments = () => {
    const docs = StorageService.getAllDocuments();
    setDocuments(docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  };

  const handleDeleteDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja deletar este documento?')) {
      StorageService.deleteDocument(id);
      loadDocuments();
    }
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

  const favoriteDocuments = filteredDocuments.filter((doc) => favorites.has(doc.id));
  const regularDocuments = filteredDocuments.filter((doc) => !favorites.has(doc.id));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: themeColors.background,
        overflow: 'hidden',
      }}
    >

      {/* Search Section */}
      <div
        style={{
          padding: '16px 40px',
          backgroundColor: themeColors.background,
          borderBottom: `1px solid ${themeColors.border}`,
        }}
      >
        <input
          type="text"
          placeholder="🔍 Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '10px 14px',
            border: `2px solid ${themeColors.border}`,
            borderRadius: '6px',
            fontSize: '13px',
            backgroundColor: themeColors.surface,
            color: themeColors.text,
            boxSizing: 'border-box',
            transition: 'all 0.2s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = themeColors.primary;
            e.currentTarget.style.boxShadow = `0 0 0 2px ${themeColors.primary}30`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = themeColors.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Grid Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 40px',
          backgroundColor: themeColors.background,
        }}
      >
        {filteredDocuments.length > 0 ? (
          <>
            {/* Seção Favoritos */}
            {favoriteDocuments.length > 0 && (
              <>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: themeColors.text,
                    margin: '0 0 16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  ⭐ Favoritos ({favoriteDocuments.length})
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px',
                  }}
                >
                  {favoriteDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      isFavorite={favorites.has(doc.id)}
                      onSelect={() => onSelectDocument(doc)}
                      onDelete={(e) => handleDeleteDocument(doc.id, e)}
                      onToggleFavorite={(e) => toggleFavorite(doc.id, e)}
                      onMoveToFolder={onOpenFolderManager ? () => onOpenFolderManager(doc) : undefined}
                      formatDate={formatDate}
                      themeColors={themeColors}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Seção Documentos Recentes */}
            {regularDocuments.length > 0 && (
              <>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: themeColors.text,
                    margin: '0 0 16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  📄 Todos os Documentos ({regularDocuments.length})
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {regularDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      isFavorite={favorites.has(doc.id)}
                      onSelect={() => onSelectDocument(doc)}
                      onDelete={(e) => handleDeleteDocument(doc.id, e)}
                      onToggleFavorite={(e) => toggleFavorite(doc.id, e)}
                      onMoveToFolder={onOpenFolderManager ? () => onOpenFolderManager(doc) : undefined}
                      formatDate={formatDate}
                      themeColors={themeColors}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '400px',
              color: themeColors.textTertiary,
            }}
          >
            <div style={{ fontSize: '72px', marginBottom: '20px' }}>📭</div>
            <p style={{ fontSize: '18px', marginBottom: '10px', color: themeColors.textSecondary, fontWeight: 600 }}>
              {searchTerm ? 'Nenhuma documentação encontrada' : 'Nenhuma documentação criada'}
            </p>
            <p style={{ fontSize: '13px', marginBottom: '30px', color: themeColors.textTertiary }}>
              {searchTerm ? 'Tente uma outra busca' : 'Crie seu primeiro documento para começar'}
            </p>
            {!searchTerm && (
              <button
                onClick={onCreateNew}
                style={{
                  padding: '12px 28px',
                  backgroundColor: themeColors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${themeColors.shadow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                ➕ Criar Documento
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* Card de Documento Reutilizável */
const DocumentCard: React.FC<{
  doc: Document;
  isFavorite: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onMoveToFolder?: () => void;
  formatDate: (date: string) => string;
  themeColors: any;
}> = ({ doc, isFavorite, onSelect, onDelete, onToggleFavorite, onMoveToFolder, formatDate, themeColors }) => (
  <div
    onClick={onSelect}
    style={{
      backgroundColor: themeColors.surface,
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: `0 2px 8px ${themeColors.shadow}`,
      cursor: 'pointer',
      transition: 'all 0.25s',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      border: `1px solid ${themeColors.border}`,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = `0 8px 16px ${themeColors.shadow}`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = `0 2px 8px ${themeColors.shadow}`;
    }}
  >
    {/* Cover Image */}
    <div
      style={{
        width: '100%',
        height: '160px',
        backgroundColor: themeColors.hover,
        backgroundImage: doc.coverImage ? `url(${doc.coverImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '56px',
        color: themeColors.textTertiary,
        position: 'relative',
      }}
    >
      {!doc.coverImage && '📄'}
      <button
        onClick={onToggleFavorite}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: isFavorite ? '#FFB800' : 'rgba(255,255,255,0.7)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={isFavorite ? 'Remover de favoritos' : 'Adicionar aos favoritos'}
      >
        {isFavorite ? '⭐' : '☆'}
      </button>
    </div>

    {/* Content */}
    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h3
        style={{
          margin: '0 0 10px 0',
          color: themeColors.text,
          fontSize: '16px',
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {doc.title}
      </h3>

      <p
        style={{
          margin: '0 0 12px 0',
          color: themeColors.textSecondary,
          fontSize: '12px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.4',
        }}
      >
        {doc.content || 'Sem conteúdo'}
      </p>

      <div
        style={{
          marginTop: 'auto',
          paddingTop: '10px',
          borderTop: `1px solid ${themeColors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: themeColors.textTertiary,
          gap: '8px',
        }}
      >
        <span>📅 {formatDate(doc.updatedAt)}</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {onMoveToFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveToFolder();
              }}
              style={{
                padding: '4px 8px',
                backgroundColor: themeColors.hover,
                color: themeColors.text,
                border: `1px solid ${themeColors.border}`,
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 600,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.85';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              title="Mover para pasta"
            >
              📁
            </button>
          )}
          <button
            onClick={onDelete}
            style={{
              padding: '4px 8px',
              backgroundColor: '#E53935',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
);
