import React, { useState, useEffect } from 'react';
import { Document, StorageService } from '../utils/storage';
import { getTheme, Theme } from '../utils/theme';
import { Icons } from '../utils/icons';

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
  const [filterTab, setFilterTab] = useState<'all' | 'favorites' | 'recent'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetic' | 'oldest'>('recent');
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

  // Aplicar filtro
  let displayDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterTab === 'favorites') {
    displayDocuments = displayDocuments.filter((doc) => favorites.has(doc.id));
  }

  // Aplicar ordenação
  if (sortBy === 'alphabetic') {
    displayDocuments.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'oldest') {
    displayDocuments.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
  }
  // 'recent' é o padrão (já ordenado ao carregar)

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

      {/* Header com Estatísticas */}
      <div
        style={{
          padding: '20px 40px',
          backgroundColor: themeColors.surface,
          borderBottom: `1px solid ${themeColors.border}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 700, color: themeColors.text }}>
              Meus Documentos
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: themeColors.textSecondary }}>
              <Icons.File size={12} style={{ display: 'inline-block', marginRight: '4px' }} />
              {documents.length} documento{documents.length !== 1 ? 's' : ''} • 
              <Icons.Star size={12} style={{ display: 'inline-block', margin: '0 4px' }} />
              {favorites.size} favorito{favorites.size !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onCreateNew}
            style={{
              padding: '10px 20px',
              backgroundColor: themeColors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
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
            <Icons.Plus size={16} />
            <span>Novo Documento</span>
          </button>
        </div>

        {/* Search e Filtros */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: themeColors.background, borderRadius: '6px', padding: '8px 12px', border: `1px solid ${themeColors.border}` }}>
            <Icons.Search size={14} color={themeColors.textSecondary} />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                color: themeColors.text,
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          {/* Filtro */}
          <select
            value={filterTab}
            onChange={(e) => setFilterTab(e.target.value as any)}
            style={{
              padding: '6px 12px',
              backgroundColor: themeColors.background,
              color: themeColors.text,
              border: `1px solid ${themeColors.border}`,
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <option value="all">Todos</option>
            <option value="favorites">Favoritos</option>
            <option value="recent">Recentes</option>
          </select>

          {/* Ordenação */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '6px 12px',
              backgroundColor: themeColors.background,
              color: themeColors.text,
              border: `1px solid ${themeColors.border}`,
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <option value="recent">Mais Recentes</option>
            <option value="alphabetic">A-Z</option>
            <option value="oldest">Mais Antigos</option>
          </select>
        </div>
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
        {displayDocuments.length > 0 ? (
          <>
            {/* Cabeçalho de resultados */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontSize: '12px', color: themeColors.textSecondary, fontWeight: 600 }}>
                {displayDocuments.length} documento{displayDocuments.length !== 1 ? 's' : ''} encontrado{displayDocuments.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Grid de Documentos */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {displayDocuments.map((doc) => (
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
            <div style={{ fontSize: '72px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.FileAlt size={72} />
            </div>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
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
                <Icons.Plus size={14} />
                <span>Criar Documento</span>
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
      {!doc.coverImage && <Icons.File size={56} />}
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
          color: isFavorite ? 'white' : themeColors.text,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={isFavorite ? 'Remover de favoritos' : 'Adicionar aos favoritos'}
      >
        {isFavorite ? (
          <Icons.Star size={16} />
        ) : (
          <Icons.StarOutline size={16} />
        )}
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
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Icons.Calendar size={10} />
          {formatDate(doc.updatedAt)}
        </span>
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
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.85';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              title="Mover para pasta"
            >
              <Icons.Folder size={9} />
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
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            title="Deletar"
          >
            <Icons.Trash size={9} />
          </button>
        </div>
      </div>
    </div>
  </div>
);
