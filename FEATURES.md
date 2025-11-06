# 🎯 Guia de Funcionalidades - MDProject

## Split View (Novo!)

### O que é?
Visualizar editor e preview lado a lado em tempo real.

### Como Ativar?
1. **Desktop (>1024px)**: Automático - aparece lado a lado
2. Clique em **"🔀 Split"** no header para toggle
   - Verde = Ativado
   - Cinza = Desativado

### Estados

#### Desktop Padrão (Split ON)
```
┌─────────────────────────────────────────┐
│ Header com toolbar                      │
├────────────────┬────────────────────────┤
│                │                        │
│    EDITOR      │     PREVIEW (Live)     │
│  (Markdown)    │   (Renderizado)        │
│                │                        │
├────────────────┴────────────────────────┤
```

#### Desktop com Toggle OFF
```
┌──────────────────────────────────────────┐
│ Header                                   │
├──────────────────────────────────────────┤
│                                          │
│             EDITOR FULL WIDTH            │
│           (ou PREVIEW FULL WIDTH)        │
│                                          │
└──────────────────────────────────────────┘
```

#### Mobile
```
┌──────────────────────────────────────┐
│  ✏️ Preview  |   MDProject  |  🌙    │
├──────────────────────────────────────┤
│                                      │
│      EDITOR ou PREVIEW               │
│     (Nunca ambos simultaneamente)    │
│                                      │
└──────────────────────────────────────┘
```

## Toolbar do Editor

### Seção 1: Salvamento
| Botão | Função |
|-------|--------|
| 💾 | Salvar documento manualmente |

### Seção 2: Títulos
| Botão | Resultado |
|-------|-----------|
| 📝 H1 | `# Título` |
| 📄 H2 | `## Subtítulo` |
| 📋 H3 | `### Subsubtítulo` |

### Seção 3: Formatação
| Botão | Resultado |
|-------|-----------|
| **B** | `**Negrito**` |
| *I* | `*Itálico*` |
| `C` | `` `código inline` `` |

### Seção 4: Blocos
| Botão | Função |
|-------|--------|
| 📋 Código | ``` ```javascript\ncode\n``` ``` |
| 📊 Tabela | Abre modal para criar tabela |
| • Lista | `- item` |
| 🔗 Link | `[texto](url)` |

## Auto-Save

- ⏱️ **Aguarda 2 segundos** após você parar de digitar
- 💾 **Salva automaticamente** no localStorage
- ✅ Mostra status "Salvo"
- 📱 Funciona em todos os dispositivos

## Tema

- **🌙 Claro**: Fundo branco, texto escuro
- **☀️ Escuro**: Fundo preto, texto claro
- **Toggle**: Clique no ícone no header
- **Persistente**: Lembrança de última escolha

## Gerenciamento de Documentos

### Criar
1. Na galeria, clique "➕ Criar Nova Documentação"
2. Preencha título e imagem (opcional)
3. Clique "Criar"

### Acessar
- **Sidebar**: Lista à esquerda com todos docs
- **Dropdown**: Botão "📂 N" no header (lista dropdown)
- **Buscar**: Use o campo de busca na sidebar

### Voltar à Galeria
- Clique "← Voltar" no header

## Responsividade

### Desktop (>1024px)
- ✅ Split view por padrão
- ✅ Sidebar fixa à esquerda
- ✅ Editor + Preview lado a lado
- ✅ Todos botões visíveis

### Tablet (768px - 1024px)
- ⚠️ Split view desativado
- ✅ Sidebar colapsável
- ✅ Editor ou Preview alternados
- ✅ Toolbar compacta

### Mobile (<768px)
- ❌ Sem split view
- ✅ Header compacto
- ✅ Toggle entre ✏️ e 👁️
- ✅ Tela cheia

## Atalhos de Teclado

| Tecla | Função |
|-------|--------|
| Enter | Salvar (quando em modal de tabela) |
| Esc | Cancelar (quando em modal de tabela) |

## Dicas Pro

### Formatação Avançada
```markdown
**_Negrito Itálico_**
***Ainda mais negrito e itálico***
```

### Tabelas
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Código com Syntax Highlighting
````markdown
```javascript
function hello() {
  console.log('World');
}
```

```python
def hello():
    print('World')
```
````

### Listas Aninhadas
```markdown
- Item 1
  - Subitem 1.1
  - Subitem 1.2
- Item 2
  - Subitem 2.1
```

## Troubleshooting

### Preview não aparece
- ✅ Verifique se Split View está ativado (🔀)
- ✅ Em desktop, deve estar verde
- ✅ Escreva algo no editor para trigger preview

### Documento não salva
- ✅ Aguarde 2 segundos após digitar
- ✅ Ou clique 💾 para salvar manualmente
- ✅ Verifique no dropdown de docs

### Sidebar desapareceu (Desktop)
- ✅ Clique em "←" no header para mostrar
- ✅ Ou maximize a janela

### Modo mobile difícil de usar
- ✅ Use o botão ✏️/👁️ para alternar
- ✅ Mobile é para edição rápida
- ✅ Para work melhor, use desktop!

## Performance

- ⚡ **Auto-save não bloqueia**: Salva em background
- 🎨 **Preview renderiza em tempo real**: Sem lag
- 💾 **LocalStorage**: Sem latência de rede
- 📱 **Mobile otimizado**: Consome menos recurso

---

**MDProject v1.0** - Editor de Markdown profissional
