import React from 'react';
import { getTheme, Theme } from '../utils/theme';
import { MarkdownPreview } from './MarkdownPreview';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  theme: Theme;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onChange,
  theme,
}) => {
  const themeColors = getTheme(theme);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        backgroundColor: themeColors.surface,
        padding: '20px',
      }}
    >
      {content ? (
        <MarkdownPreview content={content} theme={theme} />
      ) : (
        <div
          style={{
            color: themeColors.textTertiary,
            textAlign: 'center',
            marginTop: '50px',
            fontSize: '16px',
          }}
        >
          👀 Nenhum conteúdo ainda
        </div>
      )}
    </div>
  );
};
