import React, { useRef, useState } from 'react';
import { getTheme, Theme } from '../utils/theme';
import { Icons } from '../utils/icons';

interface NewDocumentModalProps {
  onClose: () => void;
  onCreate: (title: string, coverImage?: string) => void;
  theme: Theme;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  onClose,
  onCreate,
  theme,
}) => {
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const themeColors = getTheme(theme);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    if (title.trim()) {
      onCreate(title, coverImage);
      setTitle('');
      setCoverImage(undefined);
      onClose();
    } else {
      alert('Por favor, insira um título');
    }
  };

  return (
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
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: themeColors.surface,
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: `0 10px 40px ${themeColors.shadow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: '20px', color: themeColors.text }}>
          <Icons.File /> Novo Documento
        </h2>

        {/* Preview da Capa */}
        {coverImage && (
          <div
            style={{
              width: '100%',
              height: '200px',
              borderRadius: '8px',
              marginBottom: '15px',
              backgroundImage: `url(${coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: `2px solid ${themeColors.border}`,
            }}
          />
        )}

        {/* Input de Título */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do documento"
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '15px',
            border: `1px solid ${themeColors.border}`,
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box',
            backgroundColor: themeColors.background,
            color: themeColors.text,
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
        />

        {/* Seletor de Imagem */}
        <div style={{ marginBottom: '20px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {coverImage ? 'Mudar Capa' : 'Escolher Capa'}
          </button>
          {coverImage && (
            <button
              onClick={() => setCoverImage(undefined)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: themeColors.hover,
                color: themeColors.text,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                marginTop: '8px',
              }}
            >
              Remover Capa
            </button>
          )}
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: themeColors.hover,
              color: themeColors.text,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
};
