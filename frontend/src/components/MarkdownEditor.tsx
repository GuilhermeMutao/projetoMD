import React, { useState, useEffect, useRef } from 'react';
import { getTheme, Theme } from '../utils/theme';
import { Icons } from '../utils/icons';

interface MarkdownEditorProps {
  value: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  theme: Theme;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onSave,
  theme,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showTableModal, setShowTableModal] = useState(false);
  const historyRef = useRef<string[]>([value]);
  const historyIndexRef = useRef<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const themeColors = getTheme(theme);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Atualizar história quando valor muda (não de undo/redo)
  useEffect(() => {
    if (value !== historyRef.current[historyIndexRef.current]) {
      // Remover histórico futuro se estávamos em ponto intermediário
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push(value);
      historyIndexRef.current = historyRef.current.length - 1;
    }
  }, [value]);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || 'texto';
    const newValue = value.substring(0, start) + before + selected + after + value.substring(end);
    
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selected.length;
    }, 0);
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      onChange(historyRef.current[historyIndexRef.current]);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      onChange(historyRef.current[historyIndexRef.current]);
    }
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const textarea = textareaRef.current;
      if (!textarea || e.target !== textarea) return;

      // Ctrl+Z ou Cmd+Z para Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      // Ctrl+Y ou Cmd+Shift+Z para Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
        return;
      }
      // Ctrl+B para Bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        insertText('**', '**');
        return;
      }
      // Ctrl+I para Italic
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertText('_', '_');
        return;
      }
      // Ctrl+E para Code inline
      if ((e.ctrlKey || e.metaKey) && (e.key === '`' || e.code === 'Backquote' || e.key === 'e')) {
        e.preventDefault();
        insertText('`', '`');
        return;
      }
      // Ctrl+S para Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        console.log('⌨️ Ctrl+S detectado - chamando onSave()');
        onSave?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSave]);

  const insertTable = (rows: number, cols: number) => {
    let table = '\n| ';
    for (let i = 0; i < cols; i++) {
      table += `Coluna ${i + 1} | `;
    }
    table += '\n| ';
    for (let i = 0; i < cols; i++) {
      table += '--- | ';
    }
    
    for (let i = 0; i < rows; i++) {
      table += '\n| ';
      for (let j = 0; j < cols; j++) {
        table += `Dados | `;
      }
    }
    table += '\n';

    onChange(value + table);
    setShowTableModal(false);
  };

  const ToolbarButton = ({ icon, label, onClick, disabled = false, title }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      style={{
        padding: '6px 10px',
        backgroundColor: disabled ? themeColors.border : themeColors.hover,
        color: disabled ? themeColors.textTertiary : themeColors.text,
        border: `1px solid ${themeColors.border}`,
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = themeColors.primary;
          e.currentTarget.style.color = 'white';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = themeColors.hover;
          e.currentTarget.style.color = themeColors.text;
        }
      }}
    >
      {icon} {!isMobile && label}
    </button>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: themeColors.background,
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: `1px solid ${themeColors.border}`,
          backgroundColor: themeColors.surface,
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center',
          overflowX: 'auto',
        }}
      >
        <ToolbarButton
          icon={<Icons.Download size={14} />}
          label="Salvar"
          title="Salvar (Ctrl+S)"
          onClick={onSave}
        />
        <ToolbarButton
          icon={<Icons.ArrowLeft size={14} />}
          label="Desfazer"
          title="Desfazer (Ctrl+Z)"
          onClick={handleUndo}
          disabled={historyIndexRef.current === 0}
        />
        <ToolbarButton
          icon={<Icons.ArrowRight size={14} />}
          label="Refazer"
          title="Refazer (Ctrl+Y)"
          onClick={handleRedo}
          disabled={historyIndexRef.current === historyRef.current.length - 1}
        />
        <div style={{ width: '1px', height: '24px', backgroundColor: themeColors.border }} />
        
        <ToolbarButton icon={<Icons.Heading size={14} />} label="H1" title="Título 1 (#)" onClick={() => insertText('# ', '')} />
        <ToolbarButton icon={<Icons.Heading2 size={14} />} label="H2" title="Título 2 (##)" onClick={() => insertText('## ', '')} />
        <ToolbarButton icon={<Icons.Heading3 size={14} />} label="H3" title="Título 3 (###)" onClick={() => insertText('### ', '')} />
        
        <div style={{ width: '1px', height: '24px', backgroundColor: themeColors.border }} />
        
        <ToolbarButton icon={<Icons.Bold size={14} />} label="Negrito" title="Negrito (Ctrl+B)" onClick={() => insertText('**', '**')} />
        <ToolbarButton icon={<Icons.Italic size={14} />} label="Itálico" title="Itálico (Ctrl+I)" onClick={() => insertText('_', '_')} />
        <ToolbarButton icon={<Icons.Code size={14} />} label="Código" title="Código inline (Ctrl+E ou Ctrl+`)" onClick={() => insertText('`', '`')} />
        
        <div style={{ width: '1px', height: '24px', backgroundColor: themeColors.border }} />
        
        <ToolbarButton icon={<Icons.FileCode size={14} />} label="Bloco" title="Bloco de Código" onClick={() => insertText('```\n', '\n```')} />
        <ToolbarButton icon={<Icons.Table size={14} />} label="Tabela" title="Inserir Tabela" onClick={() => setShowTableModal(true)} />
        <ToolbarButton icon={<Icons.List size={14} />} label="Lista" title="Inserir Lista" onClick={() => insertText('- ', '')} />
        <ToolbarButton icon={<Icons.Link size={14} />} label="Link" title="Inserir Link" onClick={() => insertText('[', '](url)')} />
      </div>

      {/* Table Modal */}
      {showTableModal && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: themeColors.surface,
            border: `2px solid ${themeColors.primary}`,
            borderRadius: '8px',
            padding: '20px',
            zIndex: 2000,
            boxShadow: `0 8px 32px ${themeColors.shadow}`,
            minWidth: '300px',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', color: themeColors.text }}>Criar Tabela</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: themeColors.text, marginBottom: '4px', fontSize: '12px' }}>
              Linhas:
            </label>
            <input
              id="table-rows"
              type="number"
              min="1"
              max="10"
              defaultValue="3"
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '4px',
                boxSizing: 'border-box',
                backgroundColor: themeColors.background,
                color: themeColors.text,
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: themeColors.text, marginBottom: '4px', fontSize: '12px' }}>
              Colunas:
            </label>
            <input
              id="table-cols"
              type="number"
              min="1"
              max="10"
              defaultValue="3"
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '4px',
                boxSizing: 'border-box',
                backgroundColor: themeColors.background,
                color: themeColors.text,
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowTableModal(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: themeColors.hover,
                color: themeColors.text,
                border: `1px solid ${themeColors.border}`,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                const rows = parseInt((document.getElementById('table-rows') as HTMLInputElement).value);
                const cols = parseInt((document.getElementById('table-cols') as HTMLInputElement).value);
                insertTable(rows, cols);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: themeColors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Criar
            </button>
          </div>
        </div>
      )}

      {showTableModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1999,
          }}
          onClick={() => setShowTableModal(false)}
        />
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          padding: '16px',
          border: 'none',
          fontFamily: `'Courier New', Courier, monospace`,
          fontSize: '14px',
          lineHeight: '1.6',
          resize: 'none',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          backgroundColor: themeColors.background,
          color: themeColors.text,
        }}
        placeholder="# Seu Título&#10;&#10;Comece a escrever aqui..."
      />
    </div>
  );
};
