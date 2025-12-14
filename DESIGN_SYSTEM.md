# 🎨 Design System - Gerenciando Comércio

## Visão Geral

Sistema de design completo implementado seguindo rigorosamente os princípios de **UI/UX minimalista**, **dark mode first** e **produtividade**, com foco em **baixo cansaço visual** e **fluxos rápidos**.

---

## 🎯 Princípios de Design

### Minimalismo
- Menos é mais: apenas elementos essenciais
- Hierarquia visual clara
- Espaçamentos generosos
- Zero poluição visual

### Produtividade
- Máximo 2-3 ações por tarefa
- Feedback visual imediato
- Formulários curtos e intuitivos
- Navegação óbvia

### Conforto Visual
- Dark mode otimizado
- Cores suaves (não agressivas)
- Tipografia confortável
- Microinterações discretas

---

## 🎨 Paleta de Cores

### Fundos (Dark Mode)
```css
--bg-primary: #0d0d0d;      /* Fundo principal */
--bg-secondary: #161616;    /* Fundo secundário */
--bg-tertiary: #1f1f1f;     /* Elementos terciários */
--bg-card: #1a1a1a;         /* Cards e containers */
--bg-hover: #272727;        /* Estado hover */
```

### Accent (Verde Neon Suave)
```css
--accent-primary: #00e676;   /* Verde principal - menos agressivo */
--accent-hover: #00c965;     /* Verde hover */
--accent-light: #00ff88;     /* Verde claro para destaques */
--accent-glow: rgba(0, 230, 118, 0.15);  /* Glow suave */
```

### Texto (Hierarquia Clara)
```css
--text-primary: #f5f5f5;     /* Texto principal */
--text-secondary: #b8b8b8;   /* Texto secundário */
--text-muted: #787878;       /* Texto menos importante */
--text-disabled: #505050;    /* Texto desabilitado */
```

### Status
```css
--success: #00e676;   /* Verde */
--warning: #ffa726;   /* Laranja suave */
--error: #ef5350;     /* Vermelho discreto */
--info: #29b6f6;      /* Azul claro */
```

---

## 📐 Espaçamentos

Sistema padronizado baseado em múltiplos de 4px:

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

---

## ✏️ Tipografia

### Fonte
**Inter** - Sans-serif moderna e legível
- Fallback: System fonts (Apple/Windows/Linux)
- Antialiasing otimizado para telas

### Tamanhos
```css
h1: 2.5rem (40px)
h2: 2rem (32px)
h3: 1.5rem (24px)
h4: 1.25rem (20px)
Body: 15px
Small: 0.875rem (14px)
```

### Pesos
- Regular: 400 (corpo de texto)
- Semibold: 600 (labels, subtítulos)
- Bold: 700 (títulos, destaque)

---

## 🧩 Componentes

### Cards
- Background: `var(--bg-card)`
- Border radius: `16px`
- Padding: `28px`
- Hover: Eleva 4px + sombra média
- Borda superior colorida no hover (4px gradient)

### Botões

#### Primário
- Background: `var(--accent-primary)`
- Hover: Eleva 2px + escala 1.02 + glow
- Min height: `48px`

#### Secundário
- Background: `var(--bg-tertiary)`
- Border: `1px solid var(--border-color)`
- Hover: Border verde

#### Outline
- Background: Transparente
- Border: `2px solid var(--accent-primary)`
- Hover: Preenche com verde

### Formulários

#### Inputs
- Height: `48px` (mínimo)
- Padding: `14px 16px`
- Border: `2px solid var(--border-color)`
- Focus: Border verde + glow + translação -1px
- Hover: Border mais clara

#### Labels
- Font weight: 600
- Margin bottom: 8px
- Cor: `var(--text-primary)`

---

## 📊 Dashboard & KPIs

### Stats Cards (KPIs)
```
Layout: Grid auto-fit (min 260px)
Gap: 24px
Card padding: 28px
```

**Estrutura:**
1. **Header** - Label + Ícone
   - Label: uppercase, 0.8rem, muted
   - Ícone: 48x48px, background suave

2. **Valor** - Número principal
   - Font size: 2.5rem
   - Font weight: 700
   - Letter spacing: -1px

3. **Change** - Variação
   - Badge inline com background
   - Ícone + porcentagem
   - Cores: verde (positivo) / vermelho (negativo)

**Microinterações:**
- Hover: Eleva 4px + borda superior colorida
- Ícone: Scale 1.1 + rotate -5deg

---

## 🎭 Microinterações

### Princípios
- **Rápidas**: 0.15s - 0.25s
- **Suaves**: ease curves
- **Discretas**: sem exagero
- **Intuitivas**: feedback claro

### Exemplos
```css
/* Hover em cards */
transform: translateY(-4px);
box-shadow: var(--shadow-lg);

/* Focus em inputs */
transform: translateY(-1px);
box-shadow: 0 0 0 3px var(--accent-glow);

/* Botão primário hover */
transform: translateY(-2px) scale(1.02);
```

---

## 📱 Responsividade (Mobile First)

### Breakpoints
```css
/* Mobile */
max-width: 480px

/* Tablet */
max-width: 768px

/* Desktop */
max-width: 1024px
```

### Adaptações Mobile

#### Navigation
- Sidebar → Drawer lateral
- Hamburger menu (48x48px)
- Fixed position
- Overlay escuro com blur

#### Dashboard
- Stats grid: 1 coluna
- Padding reduzido: 16px
- Font sizes menores
- Botões full-width

#### Forms
- Inputs: 100% width
- Min height: 48px (touch-friendly)
- Single column layout

---

## 🎬 Animações

### Tipos
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Pulse (loading) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 🏗️ Estrutura de Páginas

### Layout Padrão
```
┌─────────────────────────────────┐
│  Sidebar (260px)   │  Main      │
│                    │  Content   │
│  - Logo            │            │
│  - Company Info    │  - Header  │
│  - Navigation      │  - Stats   │
│  - User Menu       │  - Content │
│                    │            │
└─────────────────────────────────┘
```

### Header Pattern
```html
<div class="page-header">
  <div>
    <h1 class="page-title">Título</h1>
    <p class="page-subtitle">Descrição</p>
  </div>
  <div class="page-actions">
    <button class="btn btn-primary">Ação</button>
  </div>
</div>
```

---

## ✅ Checklist de Implementação

### Obrigatório em Toda Tela:
- [ ] Dark mode consistente
- [ ] Espaçamentos padronizados (sistema 4px)
- [ ] Microinterações suaves
- [ ] Responsivo (mobile-first)
- [ ] Tipografia hierárquica
- [ ] Feedback visual em ações
- [ ] Estados hover/focus/active
- [ ] Loading states
- [ ] Error states

### Formulários:
- [ ] Labels claras
- [ ] Placeholders descritivos
- [ ] Validação inline
- [ ] Min height 48px
- [ ] Touch-friendly (mobile)
- [ ] Feedback visual imediato

### Dashboard:
- [ ] KPIs no topo
- [ ] Dados essenciais primeiro
- [ ] Gráficos minimalistas
- [ ] Cards bem definidos
- [ ] Hierarquia clara

---

## 🚀 Fluxos de Uso

### Cadastrar Produto (2 ações)
1. Clicar "Novo Produto"
2. Preencher formulário → Salvar

### Registrar Venda (3 ações)
1. Clicar "Nova Venda"
2. Selecionar produtos
3. Confirmar pagamento → Salvar

### Ver Relatório (2 ações)
1. Ir em "Relatórios"
2. Selecionar período

**Regra:** Máximo 3 ações para completar qualquer tarefa.

---

## 📦 Arquivos Principais

```
css/
  global.css        → Variáveis + componentes base
  dashboard.css     → Layout dashboard + KPIs

public/
  login.html        → Autenticação
  onboarding.html   → Setup inicial (3 steps)
  dashboard.html    → Dashboard principal
  products.html     → Gestão de produtos
  services.html     → Gestão de serviços
  sales.html        → Registro de vendas
  reports.html      → Relatórios e análises
```

---

## 🎯 Objetivos Atingidos

✅ Design minimalista e limpo  
✅ Dark mode otimizado (baixo cansaço visual)  
✅ Cores suaves (verde neon não agressivo)  
✅ Microinterações discretas  
✅ Formulários intuitivos (min 48px height)  
✅ Dashboard com KPIs claros  
✅ Responsivo mobile-first  
✅ Fluxos curtos (2-3 ações)  
✅ Tipografia confortável  
✅ Feedback visual imediato  
✅ Hierarquia visual clara  
✅ Profissional e moderno  
✅ Onboarding rápido (3 steps)  

---

## 💡 Princípio Fundamental

> **"Se o usuário precisa pensar para usar, o design está errado."**

Todo elemento deve ser:
- **Óbvio**: Posição esperada
- **Intuitivo**: Função clara
- **Rápido**: Mínimo de cliques
- **Confortável**: Uso prolongado sem fadiga

---

**Design implementado por: GitHub Copilot**  
**Data: Dezembro 2025**  
**Versão: 1.0**
