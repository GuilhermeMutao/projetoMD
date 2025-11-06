import React, { useState, useEffect, useRef } from 'react';
import { getTheme, Theme } from '../utils/theme';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const themeColors = getTheme(theme);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const ToolbarButton = ({ icon, label, onClick }: any) => (
    <button
      onClick={onClick}
      title={label}
      style={{
        padding: '6px 10px',
        backgroundColor: themeColors.hover,
        color: themeColors.text,
        border: `1px solid ${themeColors.border}`,
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = themeColors.primary;
        e.currentTarget.style.color = 'white';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = themeColors.hover;
        e.currentTarget.style.color = themeColors.text;
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
          icon="💾"
          label="Salvar"
          onClick={onSave}
        />
        <div style={{ width: '1px', height: '24px', backgroundColor: themeColors.border }} />
        
        <ToolbarButton icon="📝" label="H1" onClick={() => insertText('# ', '')} />
        <ToolbarButton icon="📄" label="H2" onClick={() => insertText('## ', '')} />
        <ToolbarButton icon="📋" label="H3" onClick={() => insertText('### ', '')} />
        
        <div style={{ width: '1px', height: '24px', backgroundColor: themeColors.border }} />
        
        <ToolbarButton icon="**B**" label="Bold" onClick={() => insertText('**', '**')} />
        <ToolbarButton icon="*I*" label="Italic" onClick={() => insertText('*', '*')} />
        <ToolbarButton icon="`C`" label="Code" onClick={() => insertText('`', '`')} />
        
        <div style={{ width: '1px', height: '24px', backgroundColor: themeColors.border }} />
        
        <ToolbarButton icon="📋" label="Código" onClick={() => insertText('```\n', '\n```')} />
        <ToolbarButton icon="📊" label="Tabela" onClick={() => setShowTableModal(true)} />
        <ToolbarButton icon="• " label="Lista" onClick={() => insertText('- ', '')} />
        <ToolbarButton icon="🔗" label="Link" onClick={() => insertText('[', '](url)')} />
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
