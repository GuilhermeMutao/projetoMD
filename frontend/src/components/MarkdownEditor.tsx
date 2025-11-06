import React from 'react';
import SimpleMdeReact from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { Theme } from '../utils/theme';
import './MarkdownEditor.css';

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
  const editorOptions: EasyMDE.Options = {
    autofocus: true,
    spellChecker: false,
    toolbar: [
      'bold',
      'italic',
      'heading',
      '|',
      'strikethrough',
      'code',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'image',
      'table',
      '|',
      'preview',
      'side-by-side',
      'fullscreen',
      '|',
      {
        name: 'save',
        action: onSave || (() => {}),
        className: 'fa fa-save',
        title: 'Save (Cmd/Ctrl+S)',
      },
    ],
    shortcuts: {
      "save": "Cmd-S",
    },
  };

  return (
    <div className={`markdown-editor-container ${theme}`}>
      <SimpleMdeReact
        value={value}
        onChange={onChange}
        options={editorOptions}
      />
    </div>
  );
};