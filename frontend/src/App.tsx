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
import { Icons } from './utils/icons';

function App() {
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [isEditorMode, setIsEditorMode] = useState(true);
  const [showSplitView, setShowSplitView] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [showDocumentFolderManager, setShowDocumentFolderManager] = useState(false);
  const [documentToMove, setDocumentToMove] = useState<Document | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [theme, setTheme] = useState<Theme>(getThemePreference());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout>();
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
                  onClick={() => setCurrentDocument(null)}
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
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeColors.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="Clique para voltar à galeria"
                >
                  {currentDocument.title}
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
      </div>
    </div>
  );
}

export default App;
