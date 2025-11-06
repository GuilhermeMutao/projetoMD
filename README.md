# 📚 MDProject - Documentação em Markdown

Um projeto full-stack para criar documentação interativa em Markdown, similar ao Notion, construído com **TypeScript**, **Node.js** e **React**.

## 🎯 Características

- ✏️ **Editor Profissional** - Toolbar com formatação, tabelas e atalhos
- 📋 **Editor Visual de Tabelas** - Crie tabelas Markdown facilmente
- 🔀 **Split View** - Editor e preview lado a lado em tempo real
- ️ **Preview em Tempo Real** - Visualize enquanto digita
- 📸 **Capas Personalizadas** - Adicione imagens como capas
- 📚 **Galeria de Documentos** - Grid responsivo com cards profissionais
- ⭐ **Sistema de Favoritos** - Marque documentos favoritos com persistência
- 📁 **Gerenciamento de Pastas** - Crie pastas e organize seus documentos
- 💾 **Auto-save** - Salva automaticamente a cada 2 segundos
- 🎨 **Tema Claro/Escuro** - Interface adaptável
- 📱 **Totalmente Responsivo** - Mobile, tablet e desktop otimizado
- ⌨️ **Atalhos de Formatação** - Toolbar intuitiva para Markdown

## 🛠️ Tecnologias

### Backend
- **Express.js** - Framework web para Node.js
- **TypeScript** - Tipagem estática
- **CORS** - Compartilhamento de recursos entre origens
- **UUID** - Geração de IDs únicos

### Frontend
- **React 18** - UI com hooks modernos
- **TypeScript** - Tipagem segura
- **CSS-in-JS** - Estilos inline com tema dinâmico

## 📦 Estrutura do Projeto

```
mdproject/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── storage.ts
│   │   └── types.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MarkdownEditor.tsx      (✨ Editor com toolbar)
│   │   │   ├── MarkdownPreview.tsx     (Preview renderizado)
│   │   │   ├── ContentEditor.tsx       (Visualizador)
│   │   │   ├── DocumentGallery.tsx     (Galeria de docs + favoritos)
│   │   │   ├── Sidebar.tsx             (Navegação + pastas)
│   │   │   ├── FolderManager.tsx       (Gerenciar pastas)
│   │   │   └── NewDocumentModal.tsx    (Criar doc)
│   │   ├── utils/
│   │   │   ├── storage.ts              (LocalStorage + pastas)
│   │   │   └── theme.ts                (Temas light/dark)
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
└── package.json
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js v16+
- npm v7+

### 1. Instalar Dependências

```bash
cd /path/to/mdproject
npm run install-all
```

### 2. Executar em Desenvolvimento

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm start
```

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

### 3. Build para Produção

```bash
npm run build
```

## 📚 Como Usar

### Criar um Documento
1. Clique em **"Criar Nova Documentação"** na galeria
2. Escolha um título e (opcional) uma imagem de capa
3. Comece a digitar em Markdown

### Editar com Toolbar
- **H1, H2, H3**: Crie títulos
- **Bold, Italic, Code**: Formatação básica
- **Código**: Bloco de código com syntax highlighting
- **Tabela**: Abre modal para criar tabela
- **Lista**: Cria lista com bullet points
- **Link**: Insira links Markdown

### Split View (Novo!)
- **Desktop**: Automático - editor + preview lado a lado
- **Toggle**: Clique em "🔀 Split" para ativar/desativar
- **Desktop <1024px**: Desativado por padrão

### Organizar com Pastas
1. Clique em **"📁 Pastas"** na sidebar
2. Clique em **⚙️** para gerenciar pastas
3. **Criar Nova**: Digite o nome e clique em ➕
4. **Organizar**: Mova documentos para pastas (clique na pasta na sidebar)
5. **Renomear/Deletar**: Use os botões ✏️ e 🗑️

### Adicionar a Favoritos
- Clique na estrela (☆) em um documento para adicionar aos favoritos
- Favoritos aparecem em uma seção separada na sidebar e galeria
- Clique novamente (⭐) para remover

### Visualizar Preview
- **Desktop com Split**: Preview aparece automaticamente ao lado
- **Desktop sem Split**: Clique em "👁️ Preview" para ver full screen
- **Mobile**: Use o botão **✏️/👁️** no header para alternar

### Salvar
- **Auto-save**: Cada 2 segundos de inatividade
- **Manual**: Clique em "💾" na toolbar

## 📝 Markdown Suportado

```markdown
# Título H1
## Título H2  
### Título H3

**Negrito** ou __Negrito__
*Itálico* ou _Itálico_
`Código inline`

\`\`\`javascript
// Bloco de código
console.log('Hello');
\`\`\`

| Coluna 1 | Coluna 2 |
|----------|----------|
| Dado A   | Dado B   |

- Lista item 1
- Lista item 2

[Link](https://exemplo.com)
```

## 🎨 Temas

- **Light**: Cores claras, ótimo para o dia
- **Dark**: Cores escuras, melhor para noite
- Clique em 🌙/☀️ para alternar

## 📱 Responsividade

- **Desktop (>768px)**: Layout com sidebar + editor lado a lado
- **Tablet (768px-1024px)**: Sidebar colapsável
- **Mobile (<768px)**: Interface otimizada com toggle de abas

## 🔄 Próximas Melhorias

- [ ] Banco de dados (MongoDB/PostgreSQL)
- [ ] Autenticação de usuários
- [ ] Subcategorias em pastas
- [ ] Histórico de versões
- [ ] Exportar para PDF
- [ ] Colaboração em tempo real
- [ ] Formatação avançada (cores, fontes)
- [ ] Undo/Redo
- [ ] Compartilhamento de documentos
- [ ] Sincronização na nuvem

## 🎯 Dicas

### Performance
- Auto-save economiza 2s de debounce
- Preview renderizado eficientemente
- LocalStorage permite uso offline

### Organização
- Use a sidebar para navegar rápido
- Busque documentos pelo título
- Veja a data da última atualização

### Formatação
- Use a toolbar para inserir elementos
- Combine atalhos: `**_Negrito Itálico_**`
- Tabelas markdown são criadas facilmente pelo modal

## 📄 Licença

MIT

---

Desenvolvido com ❤️ usando TypeScript, Node.js e React
