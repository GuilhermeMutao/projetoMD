import React, { useState, useEffect } from 'react';

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentTreeProps {
  onSelectDocument: (doc: Document) => void;
  onCreateDocument: (title: string, parentId?: string) => void;
}

export const DocumentTree: React.FC<DocumentTreeProps> = ({
  onSelectDocument,
  onCreateDocument,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      style={{
        padding: isMobile ? '10px' : '15px',
        height: '100%',
        overflowY: 'auto',
        borderRight: !isMobile ? '1px solid #e0e0e0' : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h2
        style={{
          fontSize: isMobile ? '14px' : '16px',
          marginBottom: '12px',
          color: '#333',
          margin: 0,
        }}
      >
        📚 Documentos
      </h2>
      <div
        style={{
          display: 'flex',
          gap: '5px',
          marginBottom: '15px',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <button
          onClick={() => {
            const title = prompt('Nome do novo documento:');
            if (title) onCreateDocument(title);
          }}
          style={{
            flex: 1,
            padding: isMobile ? '10px' : '8px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: isMobile ? '13px' : '12px',
            fontWeight: 'bold',
          }}
        >
          + Novo Documento
        </button>
      </div>

      <div
        style={{
          fontSize: isMobile ? '12px' : '13px',
          color: '#666',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '5px',
        }}
      >
        <div
          style={{
            padding: isMobile ? '10px' : '8px',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          📄 Comece criando um novo documento
        </div>
      </div>

      <div
        style={{
          fontSize: '11px',
          color: '#999',
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center',
        }}
      >
        {isMobile ? 'MDProject' : 'Documentação em Markdown'}
      </div>
    </div>
  );
};
