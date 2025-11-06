import React from 'react';
import { getTheme, Theme } from '../utils/theme';

interface MarkdownPreviewProps {
  content: string;
  theme: Theme;
}

const convertMarkdownToHtml = (markdown: string, themeColors: any, theme: Theme): string => {
  let html = markdown;

  // Blocos de código (```...```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
    const lang = language || 'text';
    const highlightedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const codeBackground = theme === 'dark' ? '#0d0d0d' : '#f5f5f5';
    const codeColor = theme === 'dark' ? '#e8e8e8' : '#1a1a1a';
    return `<pre style="background:${codeBackground};color:${codeColor};padding:15px;border-radius:5px;overflow-x:auto;margin:10px 0;word-wrap:break-word;white-space:pre-wrap;border:1px solid ${themeColors.border};"><code class="language-${lang}">${highlightedCode}</code></pre>`;
  });

  // Tabelas Markdown - melhorada
  html = html.replace(
    /\|(.+)\n\|[\s:|-]+\n((?:\|.+\n?)*)/g,
    (match) => {
      const lines = match.trim().split('\n').filter(line => line.trim());
      
      if (lines.length < 2) return match;
      
      // Verificar se é de fato uma tabela (segunda linha deve ser separador)
      const separatorLine = lines[1];
      if (!/^\|[\s\-|:]+\|?$/.test(separatorLine)) return match;
      
      // Extrair headers
      const headerCells = lines[0]
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0);
      
      // Extrair linhas de corpo
      const bodyLines = lines.slice(2).filter(line => /^\|.+\|?$/.test(line));

      const tableHeaderBg = theme === 'dark' ? '#1a4d7f' : '#e3f2fd';
      const tableHeaderColor = theme === 'dark' ? '#ffffff' : '#0d47a1';
      const tableRowBg = theme === 'dark' ? '#252525' : '#fafafa';
      const tableRowColor = theme === 'dark' ? '#ffffff' : '#333333';
      
      let table = `<table style="border-collapse:collapse;width:100%;margin:15px 0;border:2px solid ${themeColors.border};font-size:0.95em;"><thead><tr style="background:${tableHeaderBg};">`;

      headerCells.forEach((cell) => {
        table += `<th style="border:1px solid ${themeColors.border};padding:12px;font-weight:700;text-align:left;color:${tableHeaderColor};">${cell}</th>`;
      });

      table += '</tr></thead><tbody>';

      bodyLines.forEach((line, idx) => {
        const cells = line
          .split('|')
          .map((cell) => cell.trim())
          .filter((cell) => cell.length > 0);
        
        if (cells.length > 0) {
          const rowBg = idx % 2 === 0 ? tableRowBg : 'transparent';
          table += `<tr style="background:${rowBg};">`;
          cells.forEach((cell) => {
            table += `<td style="border:1px solid ${themeColors.border};padding:10px 12px;word-break:break-word;color:${tableRowColor};">${cell}</td>`;
          });
          table += '</tr>';
        }
      });
      
      table += '</tbody></table>';
      return table;
    }
  );  // Código inline
  const inlineCodeBg = theme === 'dark' ? '#2a2a2a' : '#f0f0f0';
  const inlineCodeColor = theme === 'dark' ? '#e8e8e8' : '#333';
  html = html.replace(/`([^`]+)`/g, `<code style="background:${inlineCodeBg};color:${inlineCodeColor};padding:4px 8px;border-radius:3px;font-family:monospace;font-size:0.9em;word-break:break-word;border:1px solid ${themeColors.border};">$1</code>`);

  // Títulos
  html = html.replace(/^### (.*?)$/gm, `<h3 style="margin:15px 0 10px 0;font-size:18px;color:${themeColors.text};font-weight:600;">$1</h3>`);
  html = html.replace(/^## (.*?)$/gm, `<h2 style="margin:20px 0 10px 0;font-size:24px;color:${themeColors.text};font-weight:600;border-bottom:2px solid ${themeColors.border};padding-bottom:8px;">$1</h2>`);
  html = html.replace(/^# (.*?)$/gm, `<h1 style="margin:25px 0 15px 0;font-size:32px;color:${themeColors.text};font-weight:700;border-bottom:3px solid ${themeColors.primary};padding-bottom:12px;">$1</h1>`);

  // Linha horizontal (---, ***, ___)
  html = html.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, `<hr style="margin:20px 0;border:none;border-top:2px solid ${themeColors.border};opacity:0.5;" />`);




  // Negrito e itálico
  html = html.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${themeColors.text};font-weight:700;">$1</strong>`);
  html = html.replace(/__(.*?)__/g, `<strong style="color:${themeColors.text};font-weight:700;">$1</strong>`);
  html = html.replace(/\*(.*?)\*/g, `<em style="color:${themeColors.text};">$1</em>`);
  html = html.replace(/_(.*?)_/g, `<em style="color:${themeColors.text};">$1</em>`);

  // Links - Converter para spans com data-link para tratamento via event listener
  const linkColor = theme === 'dark' ? '#64B5F6' : '#2196F3';
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    return `<span data-link="${url}" style="color:${linkColor};text-decoration:underline;font-weight:500;cursor:pointer;word-break:break-word;" class="markdown-link">${text}</span>`;
  });

  // Quebras de linha e parágrafos PRIMEIRO
  html = html.replace(/\n\n+/g, '</p><p>');
  html = `<p>${html}</p>`;
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-3])/g, '$1');
  html = html.replace(/(<\/h[1-3]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<table)/g, '$1');
  html = html.replace(/(<\/table>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr)/g, '$1');
  html = html.replace(/(<hr[^>]*>)<\/p>/g, '$1');

  // Listas melhoradas - DEPOIS dos parágrafos
  // Processa todos os itens de lista dentro de parágrafos
  const listItemStyle = `color:${themeColors.text};margin:8px 0;font-size:15px;`;
  const ulStyle = `margin:12px 0;padding-left:22px;color:${themeColors.text};list-style-type:disc;`;
  
  // Transforma parágrafos com listas em listas de verdade
  html = html.replace(/<p>([\s\S]*?)<\/p>/g, (match) => {
    // Se não contém itens de lista, retorna como está
    if (!/[-*+] /.test(match)) return match;
    
    let content = match.replace(/<p>/g, '').replace(/<\/p>/g, ''); // Remove tags <p>
    
    // Transforma linhas de lista em itens
    content = content.replace(/^[\s]*[-*+] (.*?)$/gm, `<li style="${listItemStyle}">$1</li>`);
    
    // Agrupa itens consecutivos em <ul>
    if (content.includes('<li')) {
      content = `<ul style="${ulStyle}">${content}</ul>`;
    }
    
    return content;
  });
  
  // Remove <ul> duplicadas
  html = html.replace(/<\/ul>\s*<ul[^>]*>/g, '');

  // Adiciona CSS global no início
  html = `<style>ul{list-style-position:outside}li{line-height:1.6}</style>${html}`;

  return html;
};

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ 
  content, 
  theme, 
}) => {
  const themeColors = getTheme(theme);
  const html = convertMarkdownToHtml(content, themeColors, theme);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Adicionar event listener para links
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('markdown-link')) {
        e.preventDefault();
        e.stopPropagation();
        const url = target.getAttribute('data-link');
        
        if (url) {
          
          // Verifica se é URL externa (começa com http://, https://, ftp://, www., etc)
          const isExternalUrl = /^(https?|ftp):\/\/|^www\./.test(url);
          
          if (isExternalUrl) {
            // URL externa: abre em nova aba
            let fullUrl = url;
            
            // Se começar com www., adiciona https://
            if (url.startsWith('www.')) {
              fullUrl = 'https://' + url;
            }
            
            window.open(fullUrl, '_blank', 'noopener,noreferrer');
          } else {
            // URL interna ou relativa: navega no mesmo site
            window.open(url, '_self');
          }
        }
      }
    };

    container.addEventListener('click', handleLinkClick);
    return () => {
      container.removeEventListener('click', handleLinkClick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        padding: '0',
        lineHeight: '1.8',
        color: themeColors.text,
        fontSize: '15px',
        maxWidth: '100%',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
      }}
      className="markdown-preview"
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
};
