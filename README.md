# Sistema de Gestão Operacional de Colaboradores

Sistema web profissional completo para gestão operacional de colaboradores, escalas e programações, hospedado no GitHub Pages e sincronizado em tempo real com Supabase.

## 🚀 Características

- ✅ Interface moderna, responsiva e intuitiva
- ✅ Gestão completa de colaboradores
- ✅ Sistema de escalas com drag-and-drop
- ✅ Programações de férias, treinamentos e licenças
- ✅ Sincronização em tempo real com Supabase
- ✅ Relatórios e exportação (Excel, CSV, PDF)
- ✅ Importação em massa (CSV/XLSX)
- ✅ Sistema de auditoria e logs
- ✅ Controle de acesso e permissões
- ✅ Tema claro/escuro
- ✅ Totalmente responsivo (Desktop/Mobile)

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript Puro
- **Backend**: Supabase (PostgreSQL + Auth)
- **Hosting**: GitHub Pages
- **APIs**: Supabase RealTime, Auth, Storage

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Repositório GitHub criado
3. Git instalado localmente
4. Navegador moderno (Chrome, Firefox, Safari, Edge)

## ⚙️ Configuração

### 1. Configurar Supabase

#### A. Criar Tabelas

Execute o SQL em `sql/schema.sql` no editor SQL do Supabase:

```
Supabase Dashboard → SQL Editor → New Query → Cole o conteúdo de sql/schema.sql → Run
```

#### B. Configurar Políticas (RLS)

Execute o SQL em `sql/policies.sql` para habilitar Row Level Security.

#### C. Copiar Credenciais

No Supabase Dashboard:
- Vá em **Settings → API**
- Copie: `SUPABASE_URL` e `SUPABASE_ANON_KEY`

### 2. Configurar GitHub Pages

1. Vá em **Settings → Pages**
2. Em "Build and deployment":
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
3. Clique em Save

Seu site estará disponível em: `https://LordGabba.github.io/operational-management-system`

### 3. Configuração Local

Clone o repositório:

```bash
git clone https://github.com/LordGabba/operational-management-system.git
cd operational-management-system
```

Abra `index.html` em um navegador para testar localmente.

## 📁 Estrutura de Pastas

```
operational-management-system/
├── index.html              # Página principal
├── login.html              # Página de login
├── css/
│   ├── style.css           # Estilos globais
│   ├── components.css      # Componentes reutilizáveis
│   └── responsive.css      # Estilos responsivos
├── js/
│   ├── supabase.js         # Configuração Supabase
│   ├── auth.js             # Sistema de autenticação
│   ├── dashboard.js        # Dashboard principal
│   ├── colaboradores.js    # Gerenciamento de colaboradores
│   ├── staff.js            # Gerenciamento de staff
│   ├── escalas.js          # Sistema de escalas
│   ├── programacoes.js     # Programações operacionais
│   ├── relatorios.js       # Relatórios e exportação
│   ├── importacao.js       # Importação em massa
│   ├── utils.js            # Funções utilitárias
│   └── ui.js               # Componentes de UI
├── sql/
│   ├── schema.sql          # Estrutura do banco de dados
│   └── policies.sql        # Políticas de segurança RLS
├── assets/
│   ├── images/
│   └── icons/
└── README.md               # Este arquivo
```

## 🔐 Credenciais Supabase

As credenciais estão configuradas em `js/supabase.js`:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://pjeehaziodnxuakhacmc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

⚠️ **IMPORTANTE**: Em produção, use variáveis de ambiente via GitHub Secrets.

## 🚀 Deployment

### Deploy Automático (Recomendado)

1. Faça push para `main`:
```bash
git add .
git commit -m "Atualização do sistema"
git push origin main
```

2. O GitHub Pages será atualizado automaticamente em ~1 minuto
3. Acesse: `https://LordGabba.github.io/operational-management-system`

### Deploy Manual

Se necessário, forçar rebuild:
- Vá em **Settings → Pages**
- Clique em "Deploy from a branch"
- Selecione novamente a branch `main`

## 📚 Funcionalidades Principais

### Dashboard
- Visão geral do sistema
- Indicadores operacionais
- Gráficos e alertas
- Atalhos rápidos

### Colaboradores
- Cadastro, edição e exclusão
- Importação/Exportação
- Pesquisa e filtros avançados
- Validação automática de CPF
- Cálculo de idade e tempo de empresa

### Staff / Liderança
- Gestão de líderes
- Equipes e hierarquia
- Permissões de acesso
- Indicadores de liderança

### Escalas
- Edição visual com calendário
- Drag-and-drop
- Alterações em massa
- Histórico de mudanças
- Auditoria completa

### Programações
- Férias, treinamentos, home office
- Programações recorrentes
- Aprovação de mudanças
- Histórico e auditoria

### Relatórios
- Escalas, férias, liderança
- Exportação (Excel, CSV, PDF)
- Gráficos operacionais
- Banco de horas

### Importação em Massa
- Upload de XLSX/CSV
- Mapeamento de colunas
- Validação de dados
- Pré-visualização
- Tratamento de duplicados

### Configurações
- Temas (claro/escuro)
- Permissões de usuários
- Backup de dados
- Logs do sistema

## 🔑 Usuários Padrão

Após criar as tabelas, crie usuários no Supabase Auth:

| E-mail | Senha | Papel |
|--------|-------|-------|
| admin@company.com | Admin@123 | Admin |
| user@company.com | User@123 | Operador |

## 📊 Banco de Dados

### Tabelas Principais

- **colaboradores**: Dados dos colaboradores
- **staff**: Dados de líderes e staff
- **escalas**: Escalas de trabalho
- **programacoes**: Férias, treinamentos, etc
- **usuarios**: Usuários do sistema
- **auditoria**: Logs de alterações
- **configuracoes**: Configurações do sistema

Cada tabela possui:
- `id` (Primary Key)
- `created_at` (Data de criação)
- `updated_at` (Última atualização)
- `deleted_at` (Soft delete)

## 🔒 Segurança

- ✅ Autenticação via Supabase Auth
- ✅ Row Level Security (RLS) habilitado
- ✅ Validação de dados no frontend
- ✅ Proteção contra SQL Injection
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Logs de auditoria

## 🐛 Troubleshooting

### Erro: "CORS policy error"
- Verifique as URLs no `js/supabase.js`
- Confirme RLS está configurado corretamente

### Erro: "Unauthorized"
- Verifique credenciais do Supabase
- Confirme que a tabela existe
- Verifique políticas RLS

### Dados não sincronizam
- Verifique conexão com internet
- Confirme Supabase está online
- Limpe cache do navegador (Ctrl+Shift+Delete)

### GitHub Pages não atualiza
- Aguarde 1-2 minutos
- Force atualizar: Ctrl+Shift+R
- Verifique branch em Settings → Pages

## 📞 Suporte

Para reportar bugs ou sugerir melhorias, abra uma **Issue** no repositório.

## 📄 Licença

Todos os direitos reservados © 2025

---

**Versão**: 1.0.0  
**Última atualização**: 2025-05-19  
**Status**: ✅ Produção
