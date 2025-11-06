import React, { useState, useEffect } from 'react';
import { Document, StorageService } from '../utils/storage';
import { getTheme, Theme } from '../utils/theme';

interface DocumentListProps {
  onSelectDocument: (doc: Document) => void;
  onCreateNew: () => void;
  isMobile: boolean;
  theme: Theme;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  onSelectDocument,
  onCreateNew,
  isMobile,
  theme,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const themeColors = getTheme(theme);

  useEffect(() => {
    loadDocuments();
    
    // Subscribe para mudanças nos documentos
    const unsubscribe = StorageService.subscribe(() => {
      loadDocuments();
    });

    return unsubscribe;
  }, []);

  const loadDocuments = () => {
    const docs = StorageService.getAllDocuments();
    setDocuments(docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  };

  const handleDeleteDocument = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este documento?')) {
      StorageService.deleteDocument(id);
      loadDocuments();
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  return (
    <div
      style={{
        padding: isMobile ? '15px' : '20px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: themeColors.background,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 15px 0', color: themeColors.text, fontSize: isMobile ? '20px' : '24px' }}>
          📚 Meus Documentos
        </h1>
        <button
          onClick={onCreateNew}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: themeColors.success,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          + Novo Documento
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Buscar documentos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          marginBottom: '20px',
          border: `1px solid ${themeColors.border}`,
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box',
          backgroundColor: themeColors.surface,
          color: themeColors.text,
        }}
      />

      {/* Documents Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '15px',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '5px',
        }}
      >
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              style={{
                backgroundColor: themeColors.surface,
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: `0 2px 8px ${themeColors.shadow}`,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 4px 16px ${themeColors.shadow}`;
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
                  height: '150px',
                  backgroundColor: themeColors.hover,
                  backgroundImage: doc.coverImage ? `url(${doc.coverImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  color: themeColors.textTertiary,
                }}
              >
                {!doc.coverImage && '📄'}
              </div>

              {/* Content */}
              <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3
                  style={{
                    margin: '0 0 8px 0',
                    color: themeColors.text,
                    fontSize: '16px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {doc.title}
                </h3>
                <p
                  style={{
                    margin: '0 0 10px 0',
                    color: themeColors.textSecondary,
                    fontSize: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {doc.content || 'Sem conteúdo'}
                </p>
                <div
                  style={{
                    marginTop: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                    color: themeColors.textTertiary,
                  }}
                >
                  <span>📅 {formatDate(doc.updatedAt)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(doc.id);
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: themeColors.danger,
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px 20px',
              color: themeColors.textTertiary,
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📭</div>
            <p>Nenhum documento encontrado</p>
            <button
              onClick={onCreateNew}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                backgroundColor: themeColors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Criar seu primeiro documento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
