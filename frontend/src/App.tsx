import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { findDocumentByUrl } from './utils/urlHelper';
import { MarkdownEditor } from './components/MarkdownEditor';
import { ContentEditor } from './components/ContentEditor';
import { Sidebar } from './components/Sidebar';
import { DocumentGallery } from './components/DocumentGallery';
import { NewDocumentModal } from './components/NewDocumentModal';
import { FolderManager } from './components/FolderManager';
import { DocumentFolderManager } from './components/DocumentFolderManager';
import { VersionHistory } from './components/VersionHistory';
import { Document, StorageService, Folder } from './utils/storage';
import { VersioningService } from './utils/versioning';
import { getTheme, getThemePreference, saveThemePreference, Theme } from './utils/theme';
import { Icons } from './utils/icons';

// Componente para lidar com rotas dinâmicas de documentos
function DocumentRoute() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) {
      navigate('/');
      return;
    }

    setLoading(true);

    try {
      const docs = StorageService.getAllDocuments();
      const foundDoc = findDocumentByUrl(docId, docs);

      if (foundDoc) {
        console.log('✅ Documento encontrado:', foundDoc.title);
        setDocument(foundDoc);
      } else {
        console.warn(`❌ Documento não encontrado: ${docId}`);
        // Redireciona para galeria após 300ms
        const timer = setTimeout(() => navigate('/'), 300);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [docId, navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#666',
        }}
      >
        ⏳ Carregando documento...
      </div>
    );
  }

  return <AppContent initialDocument={document} />;
}

interface AppContentProps {
  initialDocument?: Document | null;
}

function AppContent({ initialDocument = null }: AppContentProps) {
  const [currentDocument, setCurrentDocument] = useState<Document | null>(initialDocument || null);
  const [content, setContent] = useState('');
  const [isEditorMode, setIsEditorMode] = useState(true);
  const [showSplitView, setShowSplitView] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [showDocumentFolderManager, setShowDocumentFolderManager] = useState(false);
  const [documentToMove, setDocumentToMove] = useState<Document | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showEditTitle, setShowEditTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [theme, setTheme] = useState<Theme>(getThemePreference());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout>();
  const clickTimeoutRef = React.useRef<NodeJS.Timeout>();
  const themeColors = getTheme(theme);

  // Carregar documentos e pastas
  useEffect(() => {
    const loadFolders = () => {
      const allFolders = StorageService.getAllFolders();
      setFolders(allFolders);
    };
    loadFolders();
    const unsubscribe = StorageService.subscribe(() => {
      loadFolders();
    });
    return unsubscribe;
  }, []);

  // Carregar documento
  useEffect(() => {
    if (currentDocument) {
      setContent(currentDocument.content);
      setSaveStatus('✅ Salvo');
    }
  }, [currentDocument]);

  // Auto-save
  useEffect(() => {
    if (currentDocument && content !== currentDocument.content) {
      setSaveStatus('💾 Salvando...');
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);

      autoSaveTimeoutRef.current = setTimeout(() => {
        const updated: Document = {
          ...currentDocument,
          content,
          updatedAt: new Date().toISOString(),
        };
        StorageService.saveDocument(updated);
        setCurrentDocument(updated);
        setSaveStatus('✅ Salvo');
        setTimeout(() => setSaveStatus(''), 2000);
      }, 2000);
    }
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [content, currentDocument]);

  const handleCreateDocument = (title: string, coverImage?: string) => {
    const newDoc = StorageService.createDocument(title, coverImage);
    setCurrentDocument(newDoc);
    setContent('');
    setShowNewModal(false);
    setIsEditorMode(true);
  };

  const handleSave = () => {
    if (currentDocument) {
      console.log('📝 Salvando documento:', currentDocument.id, currentDocument.title);
      const updated: Document = {
        ...currentDocument,
        content,
        updatedAt: new Date().toISOString(),
      };
      StorageService.saveDocument(updated);
      
      // Criar versão
      VersioningService.createVersion(
        updated.id,
        content,
        updated.title,
        'Manual save'
      );
      
      setCurrentDocument(updated);
      setSaveStatus('✅ Salvo!');
      setTimeout(() => setSaveStatus(''), 2000);
      
      console.log('✅ Documento salvo com sucesso');
    } else {
      console.warn('⚠️ Nenhum documento selecionado para salvar');
    }
  };

  const handleSelectDocument = (doc: Document) => {
    setCurrentDocument(doc);
    setIsEditorMode(true);
  };

  const handleToggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveThemePreference(newTheme);
  };

  const handleEditTitle = (newTitle: string) => {
    if (!currentDocument || !newTitle.trim()) return;

    const updated: Document = {
      ...currentDocument,
      title: newTitle.trim(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveDocument(updated);
    
    // Criar versão com novo título
    VersioningService.createVersion(
      updated.id,
      updated.content,
      updated.title,
      `Título alterado de "${currentDocument.title}"`
    );

    setCurrentDocument(updated);
    setShowEditTitle(false);
    setSaveStatus('✅ Título atualizado!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleTitleClick = () => {
    // Limpa timeout anterior se existir
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      // Se chegou aqui, é um duplo clique
      if (currentDocument) {
        setEditingTitle(currentDocument.title);
        setShowEditTitle(true);
      }
      clickTimeoutRef.current = undefined;
      return;
    }

    // Define timeout para possível duplo clique
    clickTimeoutRef.current = setTimeout(() => {
      // Se chegou aqui após 300ms, foi apenas um clique simples
      // Não faz nada
      clickTimeoutRef.current = undefined;
    }, 300);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: themeColors.background,
        flexDirection: 'column',
      }}
    >
      {showNewModal && (
        <NewDocumentModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreateDocument}
          theme={theme}
        />
      )}

      {showEditTitle && currentDocument && (
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
            zIndex: 1000,
          }}
          onClick={() => setShowEditTitle(false)}
        >
          <div
            style={{
              backgroundColor: themeColors.surface,
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              maxWidth: '500px',
              width: '90%',
              border: `1px solid ${themeColors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                margin: '0 0 16px 0',
                color: themeColors.text,
                fontSize: '18px',
              }}
            >
              Editar Título
            </h2>

            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEditTitle(editingTitle);
                }
                if (e.key === 'Escape') {
                  setShowEditTitle(false);
                }
              }}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '16px',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '4px',
                backgroundColor: themeColors.background,
                color: themeColors.text,
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              autoFocus
            />

            <div
              style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setShowEditTitle(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: themeColors.hover,
                  color: themeColors.text,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancelar
              </button>

              <button
                onClick={() => handleEditTitle(editingTitle)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: themeColors.primary || '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {showFolderManager && (
        <FolderManager
          onClose={() => setShowFolderManager(false)}
          onSelectFolder={() => { }}
          theme={theme}
        />
      )}

      {showDocumentFolderManager && documentToMove && (
        <DocumentFolderManager
          isOpen={showDocumentFolderManager}
          onClose={() => {
            setShowDocumentFolderManager(false);
            setDocumentToMove(null);
          }}
          document={documentToMove}
          folders={folders}
          theme={theme}
          onUpdate={() => {
            setShowDocumentFolderManager(false);
            setDocumentToMove(null);
          }}
        />
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        {!sidebarCollapsed && (
          <div
            style={{
              width: '320px',
              backgroundColor: themeColors.surface,
              borderRight: `1px solid ${themeColors.border}`,
              overflow: 'hidden',
            }}
          >
            <Sidebar
              onSelectDocument={handleSelectDocument}
              onCreateNew={() => setShowNewModal(true)}
              isMobile={false}
              theme={theme}
              currentDocumentId={currentDocument?.id}
              onOpenFolderManager={() => setShowFolderManager(true)}
              onBackToGallery={() => setCurrentDocument(null)}
              onMoveDocumentToFolder={(doc) => {
                setDocumentToMove(doc);
                setShowDocumentFolderManager(true);
              }}
              onToggleTheme={handleToggleTheme}
            />
          </div>
        )}

        {/* Main Content */}
        {currentDocument ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header - Limpo e Organizado */}
            <div
              style={{
                padding: '10px 16px',
                borderBottom: `1px solid ${themeColors.border}`,
                backgroundColor: themeColors.surface,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                minHeight: '44px',
              }}
            >
              {/* Esquerda: Toggle Sidebar + Título */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: themeColors.hover,
                    color: themeColors.text,
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={sidebarCollapsed ? 'Mostrar' : 'Ocultar'}
                >
                  {sidebarCollapsed ? <Icons.ChevronRight size={12} /> : <Icons.ChevronLeft size={12} />}
                </button>

                <button
                  style={{
                    fontSize: '14px',
                    color: themeColors.text,
                    margin: 0,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeColors.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={handleTitleClick}
                  title="Duplo clique para editar título"
                >
                  {currentDocument.title}
                  <span style={{ fontSize: '12px', opacity: 0.6 }}>✎</span>
                </button>
              </div>

              {/* Direita: Status + Modo Editor + Split View */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                {saveStatus && (
                  <span style={{ fontSize: '11px', color: themeColors.success, fontWeight: '600', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {saveStatus.includes('Salvo') && <Icons.Check size={12} />}
                    {saveStatus.includes('Salvando') && <Icons.FileAlt size={12} />}
                    {saveStatus.split(' ')[1]}
                  </span>
                )}

                {isEditorMode && (
                  <>
                    <button
                      onClick={() => setShowVersionHistory(true)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: themeColors.hover,
                        color: themeColors.text,
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Histórico de versões (Notion-like)"
                    >
                      <Icons.Clock size={11} />
                      <span>Histórico</span>
                    </button>

                    <button
                      onClick={() => setShowSplitView(!showSplitView)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: showSplitView ? '#4CAF50' : themeColors.hover,
                        color: showSplitView ? 'white' : themeColors.text,
                        border: showSplitView ? 'none' : `1px solid ${themeColors.border}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title={showSplitView ? 'Desativar split view' : 'Ativar split view'}
                    >
                      {showSplitView ? (
                        <>
                          <Icons.Edit size={11} />
                          <span>Único</span>
                        </>
                      ) : (
                        <>
                          <Icons.ChevronRight size={11} />
                          <span>Split</span>
                        </>
                      )}
                    </button>
                  </>
                )}

                {!isEditorMode && (
                  <button
                    onClick={() => setShowVersionHistory(true)}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: themeColors.hover,
                      color: themeColors.text,
                      border: `1px solid ${themeColors.border}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Histórico de versões"
                  >
                    <Icons.Clock size={11} />
                    <span>Histórico</span>
                  </button>
                )}

                {!showSplitView && (
                  <button
                    onClick={() => setIsEditorMode(!isEditorMode)}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: '#9C27B0',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title={isEditorMode ? 'Visualizar' : 'Editar'}
                  >
                    {isEditorMode ? (
                      <>
                        <Icons.Eye size={11} />
                        <span>Visualizar</span>
                      </>
                    ) : (
                      <>
                        <Icons.Edit size={11} />
                        <span>Editor</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
              {/* Editor Side */}
              <div
                style={{
                  flex: showSplitView ? 1 : 1,
                  display: isEditorMode || showSplitView ? 'flex' : 'none',
                  flexDirection: 'column',
                  minWidth: 0,
                }}
              >
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  onSave={handleSave}
                  theme={theme}
                />
              </div>

              {/* Divider */}
              {showSplitView && (
                <div
                  style={{
                    width: '1px',
                    backgroundColor: themeColors.border,
                    cursor: 'col-resize',
                  }}
                />
              )}

              {/* Preview Side */}
              {showSplitView && (
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    backgroundColor: themeColors.surface,
                    padding: '20px 24px',
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      maxWidth: '900px',
                      margin: '0 auto',
                    }}
                  >
                    <ContentEditor content={content} onChange={setContent} theme={theme} />
                  </div>
                </div>
              )}

              {/* Full Preview Mode */}
              {!showSplitView && !isEditorMode && (
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    backgroundColor: themeColors.surface,
                    padding: '20px 24px',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '900px',
                      margin: '0 auto',
                    }}
                  >
                    <ContentEditor content={content} onChange={setContent} theme={theme} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header - Galeria */}
            <div
              style={{
                padding: '10px 16px',
                borderBottom: `1px solid ${themeColors.border}`,
                backgroundColor: themeColors.surface,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                minHeight: '44px',
              }}
            >
              {/* Esquerda: Sidebar Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: themeColors.hover,
                    color: themeColors.text,
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={sidebarCollapsed ? 'Mostrar Sidebar' : 'Ocultar Sidebar'}
                >
                  {sidebarCollapsed ? (
                    <Icons.ChevronRight size={12} />
                  ) : (
                    <Icons.ChevronLeft size={12} />
                  )}
                </button>
                <span style={{ fontSize: '14px', fontWeight: 600, color: themeColors.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icons.Book size={14} />
                  <span>MDProject</span>
                </span>
              </div>
            </div>

            {/* Galeria */}
            <DocumentGallery
              onSelectDocument={handleSelectDocument}
              onCreateNew={() => setShowNewModal(true)}
              onOpenFolderManager={(doc) => {
                setDocumentToMove(doc);
                setShowDocumentFolderManager(true);
              }}
              theme={theme}
            />
          </div>
        )}

        {/* Version History Modal */}
        {showVersionHistory && currentDocument && (
          <VersionHistory
            documentId={currentDocument.id}
            currentTitle={currentDocument.title}
            currentContent={content}
            onRestore={(restoredContent, restoredTitle) => {
              // Restaurar conteúdo
              setContent(restoredContent);
              
              // Atualizar documento com novo conteúdo
              const restoredDoc: Document = {
                ...currentDocument,
                content: restoredContent,
                title: restoredTitle || currentDocument.title,
                updatedAt: new Date().toISOString(),
              };
              
              // Salvar documento restaurado
              StorageService.saveDocument(restoredDoc);
              setCurrentDocument(restoredDoc);
              
              // Criar versão da restauração
              VersioningService.createVersion(
                restoredDoc.id,
                restoredContent,
                restoredTitle || currentDocument.title,
                `Restaurado de v${VersioningService.getVersions(currentDocument.id).length - 1}`
              );
              
              setSaveStatus('✅ Versão restaurada e salva!');
              setTimeout(() => setSaveStatus(''), 2000);
              
              // Fechar modal
              setShowVersionHistory(false);
            }}
            theme={theme}
            onClose={() => setShowVersionHistory(false)}
          />
        )}
      </div>
    </div>
  );
}

// Componente raiz que configura as rotas
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/:docId" element={<DocumentRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
