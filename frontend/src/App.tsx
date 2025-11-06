import React, { useState, useEffect } from 'react';
import { MarkdownEditor } from './components/MarkdownEditor';
import { ContentEditor } from './components/ContentEditor';
import { Sidebar } from './components/Sidebar';
import { DocumentGallery } from './components/DocumentGallery';
import { NewDocumentModal } from './components/NewDocumentModal';
import { FolderManager } from './components/FolderManager';
import { DocumentFolderManager } from './components/DocumentFolderManager';
import { Document, StorageService, Folder } from './utils/storage';
import { getTheme, getThemePreference, saveThemePreference, Theme } from './utils/theme';

function App() {
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [isEditorMode, setIsEditorMode] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSplitView, setShowSplitView] = useState(window.innerWidth >= 1024);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [showDocumentFolderManager, setShowDocumentFolderManager] = useState(false);
  const [documentToMove, setDocumentToMove] = useState<Document | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [theme, setTheme] = useState<Theme>(getThemePreference());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showDocumentsMenu, setShowDocumentsMenu] = useState(false);
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout>();
  const themeColors = getTheme(theme);

  // Detectar tamanho de tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setShowSplitView(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      const updated: Document = {
        ...currentDocument,
        content,
        updatedAt: new Date().toISOString(),
      };
      StorageService.saveDocument(updated);
      setCurrentDocument(updated);
      setSaveStatus('✅ Salvo!');
      setTimeout(() => setSaveStatus(''), 2000);
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

      {showFolderManager && (
        <FolderManager
          onClose={() => setShowFolderManager(false)}
          onSelectFolder={() => {}}
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

      {/* Header Mobile */}
      {isMobile && (
        <div
          style={{
            padding: '12px 15px',
            backgroundColor: themeColors.surface,
            borderBottom: `1px solid ${themeColors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <button
            onClick={() => setIsEditorMode(!isEditorMode)}
            style={{
              padding: '8px 12px',
              backgroundColor: themeColors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
            title={isEditorMode ? 'Ver preview' : 'Editar'}
          >
            {isEditorMode ? '👁️' : '✏️'}
          </button>
          <h1 style={{ fontSize: '16px', color: themeColors.text, margin: 0, flex: 1, textAlign: 'center' }}>📝 MDProject</h1>
          <button
            onClick={handleToggleTheme}
            style={{
              padding: '8px 12px',
              backgroundColor: themeColors.hover,
              color: themeColors.text,
              border: `1px solid ${themeColors.border}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar Desktop - Sempre visível quando não colapsado */}
        {!isMobile && !sidebarCollapsed && (
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
              isMobile={isMobile}
              theme={theme}
              currentDocumentId={currentDocument?.id}
              onOpenFolderManager={() => setShowFolderManager(true)}
              onBackToGallery={() => setCurrentDocument(null)}
              onMoveDocumentToFolder={(doc) => {
                setDocumentToMove(doc);
                setShowDocumentFolderManager(true);
              }}
            />
          </div>
        )}

        {/* Main Content - Documento ou Galeria */}
        {currentDocument ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header Desktop - Responsivo */}
            {!isMobile && (
              <div
                style={{
                  padding: '10px 16px',
                  borderBottom: `1px solid ${themeColors.border}`,
                  backgroundColor: themeColors.surface,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  minHeight: '44px',
                }}
              >
                {/* Esquerda: Sidebar Toggle + Título Clicável */}
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
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    title={sidebarCollapsed ? 'Mostrar' : 'Ocultar'}
                  >
                    {sidebarCollapsed ? '→' : '←'}
                  </button>

                  <button
                    onClick={() => setCurrentDocument(null)}
                    style={{
                      fontSize: '16px',
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
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = themeColors.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Clique para voltar à galeria"
                  >
                    <span style={{ fontWeight: 600 }}>📚 {currentDocument.title}</span>
                  </button>
                </div>

                {/* Centro: Status */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {saveStatus && (
                    <span style={{ fontSize: '10px', color: themeColors.success, fontWeight: '600', whiteSpace: 'nowrap' }}>
                      {saveStatus}
                    </span>
                  )}
                </div>

                {/* Direita: Ações */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
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
                      whiteSpace: 'nowrap',
                    }}
                    title={isEditorMode ? 'Ver preview' : 'Editar'}
                  >
                    {isEditorMode ? '👁️ Preview' : '✏️ Editor'}
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
                      whiteSpace: 'nowrap',
                    }}
                    title={showSplitView ? 'Desativar split view' : 'Ativar split view'}
                  >
                    {showSplitView ? '🔀' : '📄'}
                  </button>

                  {/* Menu Flutuante */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowDocumentsMenu(!showDocumentsMenu)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: themeColors.hover,
                        color: themeColors.text,
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                      }}
                      title="Menu"
                    >
                      ☰
                    </button>

                    {showDocumentsMenu && (
                      <>
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '4px',
                            backgroundColor: themeColors.surface,
                            border: `1px solid ${themeColors.border}`,
                            borderRadius: '4px',
                            boxShadow: `0 4px 12px ${themeColors.shadow}`,
                            zIndex: 1000,
                            minWidth: '200px',
                            overflowY: 'auto',
                          }}
                        >
                          <div
                            onClick={() => {
                              setShowFolderManager(true);
                              setShowDocumentsMenu(false);
                            }}
                            style={{
                              padding: '10px 12px',
                              borderBottom: `1px solid ${themeColors.border}`,
                              cursor: 'pointer',
                              color: themeColors.text,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = themeColors.hover;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <span>📁</span>
                            <span>Gerenciar Pastas</span>
                          </div>

                          <div
                            onClick={() => {
                              setShowNewModal(true);
                              setShowDocumentsMenu(false);
                            }}
                            style={{
                              padding: '10px 12px',
                              borderBottom: `1px solid ${themeColors.border}`,
                              cursor: 'pointer',
                              color: themeColors.text,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = themeColors.hover;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <span>➕</span>
                            <span>Novo Documento</span>
                          </div>

                          <div
                            onClick={() => {
                              handleToggleTheme();
                              setShowDocumentsMenu(false);
                            }}
                            style={{
                              padding: '10px 12px',
                              borderBottom: `1px solid ${themeColors.border}`,
                              cursor: 'pointer',
                              color: themeColors.text,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = themeColors.hover;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <span>{theme === 'light' ? '🌙' : '☀️'}</span>
                            <span>Tema {theme === 'light' ? 'Escuro' : 'Claro'}</span>
                          </div>

                          <div
                            onClick={() => {
                              setCurrentDocument(null);
                              setShowDocumentsMenu(false);
                            }}
                            style={{
                              padding: '10px 12px',
                              cursor: 'pointer',
                              color: '#E53935',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = themeColors.hover;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <span>←</span>
                            <span>Voltar à Galeria</span>
                          </div>
                        </div>
                        <div
                          style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 999,
                          }}
                          onClick={() => setShowDocumentsMenu(false)}
                        />
                      </>
                    )}
                  </div>

                  {saveStatus && (
                    <span style={{ fontSize: '10px', color: themeColors.success, fontWeight: '600', whiteSpace: 'nowrap' }}>
                      {saveStatus}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Header */}
            {isMobile && currentDocument && (
              <div
                style={{
                  padding: '10px 15px',
                  borderBottom: `1px solid ${themeColors.border}`,
                  backgroundColor: themeColors.surface,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <button
                  onClick={() => setIsEditorMode(!isEditorMode)}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: themeColors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                  title={isEditorMode ? 'Ver preview' : 'Editar'}
                >
                  {isEditorMode ? '👁️' : '✏️'}
                </button>
                <button
                  onClick={() => setCurrentDocument(null)}
                  style={{
                    flex: 1,
                    fontSize: '13px',
                    color: themeColors.text,
                    margin: 0,
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
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeColors.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="Clique para voltar"
                >
                  <span style={{ fontWeight: 600 }}>📚 {currentDocument.title}</span>
                </button>
                <button
                  onClick={handleToggleTheme}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: themeColors.hover,
                    color: themeColors.text,
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </div>
            )}

            {/* Content */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
              {/* Editor Side */}
              <div 
                style={{ 
                  flex: showSplitView ? 1 : 1,
                  display: isEditorMode ? 'flex' : 'none',
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
                    padding: isMobile ? '16px 12px' : '20px 24px',
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
            {/* Header Desktop na Galeria */}
            {!isMobile && (
              <div
                style={{
                  padding: '10px 16px',
                  borderBottom: `1px solid ${themeColors.border}`,
                  backgroundColor: themeColors.surface,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
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
                    }}
                    title={sidebarCollapsed ? 'Mostrar Sidebar' : 'Ocultar Sidebar'}
                  >
                    {sidebarCollapsed ? '→' : '←'}
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: themeColors.text }}>
                    📚 MDProject
                  </span>
                </div>

                {/* Direita: Tema */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    onClick={handleToggleTheme}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: themeColors.hover,
                      color: themeColors.text,
                      border: `1px solid ${themeColors.border}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {theme === 'light' ? '🌙' : '☀️'}
                  </button>
                </div>
              </div>
            )}

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
      </div>
    </div>
  );
}

export default App;
