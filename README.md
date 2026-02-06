# 🚗 EloMob - Sistema para Motoristas

Sistema completo de gestão de caronas para motoristas autônomos com integração Firebase.

## 🎯 O que é o EloMob?

Sistema que permite motoristas autônomos gerenciar caronas apenas para contatos conhecidos via WhatsApp, com:
- ✅ Gestão de disponibilidade
- ✅ Rastreamento GPS em tempo real  
- ✅ Cálculo automático de preços
- ✅ Relatórios financeiros
- ✅ Dados salvos na nuvem (Firebase)

## 📦 Arquivos do Projeto

```
elomob-project/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── index.css
    └── App.jsx (VOCÊ PRECISA CRIAR ESTE!)
```

## ⚠️ IMPORTANTE - App.jsx

O arquivo `src/App.jsx` é muito grande (~1400 linhas) para incluir aqui.

**VOCÊ TEM 2 OPÇÕES:**

### OPÇÃO 1: Usar o código original com modificações manuais
1. Pegue o arquivo `elomob.jsx` que criei anteriormente
2. Adicione as importações do Firebase no topo
3. Adicione as funções de Firebase que vou te passar

### OPÇÃO 2: Eu crio uma versão modular (RECOMENDO!)
1. Divido o código em múltiplos arquivos menores
2. Fica mais fácil de manter
3. Mais profissional

## 🔥 Configuração do Firebase

### 1. Criar Projeto no Firebase

1. Acesse: https://firebase.google.com/
2. Clique em "Go to Console"
3. "Adicionar projeto"
4. Nome: `elomob`
5. Desative Google Analytics (opcional)
6. Criar projeto

### 2. Configurar Firestore Database

1. Menu lateral → "Firestore Database"
2. "Criar banco de dados"
3. Modo: "Produção"
4. Local: `southamerica-east1`
5. Ativar

### 3. Configurar Realtime Database

1. Menu lateral → "Realtime Database"
2. "Criar banco de dados"
3. Local: United States (único disponível)
4. Modo: "Bloqueado"
5. Ativar

### 4. Configurar Regras de Segurança

**Firestore (Aba "Regras"):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /drivers/{driverId} {
      allow read, write: if true;
    }
    match /priceQueries/{queryId} {
      allow read, write: if true;
    }
  }
}
```

**Realtime Database (Aba "Regras"):**
```json
{
  "rules": {
    "drivers": {
      "$driverId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

### 5. Pegar Credenciais

1. ⚙️ Configurações do projeto
2. Role até "Seus aplicativos"
3. Clique em `</> Web`
4. Nome: `EloMob Web`
5. Registrar app
6. **COPIE** o firebaseConfig

Vai parecer com isso:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "elomob-xxxxx.firebaseapp.com",
  projectId: "elomob-xxxxx",
  storageBucket: "elomob-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  databaseURL: "https://elomob-xxxxx-default-rtdb.firebaseio.com"
};
```

### 6. Adicionar no Código

Cole suas credenciais no arquivo `src/App.jsx` onde está escrito:
```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  // ... resto das credenciais
};
```

## 🚀 Deploy no Vercel

### 1. Criar Conta

1. Acesse: https://vercel.com/
2. "Sign Up" com GitHub
3. Autorize o Vercel

### 2. Preparar Repositório GitHub

1. Crie repositório: https://github.com/new
2. Nome: `elomob`
3. Público ou Privado (tanto faz)
4. Criar

### 3. Subir Código

**Opção A - GitHub Desktop:**
1. Baixe: https://desktop.github.com/
2. "Add existing repository"
3. Escolha a pasta `elomob-project`
4. "Publish repository"

**Opção B - Linha de Comando:**
```bash
cd elomob-project
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/elomob.git
git push -u origin main
```

### 4. Deploy

1. Acesse https://vercel.com/dashboard
2. "Add New" → "Project"
3. "Import" seu repositório `elomob`
4. Configurações:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. "Deploy"
6. Aguarde 2-3 minutos
7. **PRONTO!** 🎉

Seu site estará em: `elomob.vercel.app`

## 👥 Usuários de Teste

| Usuário     | Senha    | Nome              |
|-------------|----------|-------------------|
| motorista1  | senha123 | João Silva        |
| motorista2  | senha123 | Maria Santos      |
| motorista3  | senha123 | Pedro Costa       |
| motorista4  | senha123 | Ana Lima          |
| motorista5  | senha123 | Carlos Souza      |
| motorista6  | senha123 | Juliana Alves     |
| motorista7  | senha123 | Roberto Dias      |
| motorista8  | senha123 | Fernanda Rocha    |
| motorista9  | senha123 | Paulo Martins     |
| motorista10 | senha123 | Luciana Ferreira  |

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Acessar: http://localhost:5173
```

## 💰 Custos

**TUDO GRÁTIS!** (até certo ponto)

### Firebase (Plano Spark - Grátis):
- 50.000 leituras/dia
- 20.000 escritas/dia  
- 1 GB armazenamento
- 10 GB transferência/mês

**Para 10-50 motoristas: MUITO tranquilo!**

### Vercel (Hobby - Grátis):
- 100 GB largura de banda/mês
- Deploy ilimitados
- Domínio .vercel.app

## 📱 Como os Motoristas Usam

1. Acessar `elomob.vercel.app`
2. Login (ex: motorista1 / senha123)
3. Configurar serviço e trajeto
4. Clicar "DISPONÍVEL"
5. Copiar texto → Status do WhatsApp
6. Passageiros acessam o link
7. Dados salvos automaticamente na nuvem!

## ⚠️ Próximos Passos Após MVP

- [ ] Domínio próprio (elomob.com) - ~R$ 40/ano
- [ ] Autenticação própria (não hardcoded)
- [ ] Painel admin
- [ ] App nativo iOS/Android
- [ ] Sistema de pagamentos
- [ ] Assinatura R$ 10/mês

## 🆘 Precisa de Ajuda?

Se travar em algum passo, me avisa!

---

**Feito com ❤️ para revolucionar transporte entre conhecidos!**
