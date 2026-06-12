# Controle de Motoboys - Vue.js + Firebase

## Requisitos
- Node.js 20+ 
- npm 10+

## Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

## Configuração do Firebase

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Adicionar ao PATH (Windows - PowerShell)
```powershell
$env:Path += ";C:\Users\matsu\AppData\Local\npm"
```
Adicione permanentemente em: **Variáveis de Sistema > Path > Novo**

### 3. Login no Firebase
```bash
firebase login
```

### 4. Configurar Authentication
- No console, vá para **Authentication > Sign-in method**
- Ative o provedor **Email/Password**

### 5. Configurar Firestore
- Vá para **Firestore Database > Create database**
- Inicie no modo de teste
- Configure regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /deliveries/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /sales/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Funcionalidades

- **Autenticação**: Login/Cadastro com email/senha
- **Entregadores**: CRUD (nome, CPF, veículo, cidade, telefone)
- **Vendas**: Controle de vendas por entregador
  - Quantidade vendida
  - Quantidade devolvida  
  - Extravios
  - Valor da cartela
  - Total automático (vendido - devolvido - extravios)

## Estrutura

```
src/
├── views/
│   ├── HomeView.vue      # Página inicial centralizada
│   ├── LoginView.vue     # Login
│   ├── RegisterView.vue  # Cadastro
│   ├── DeliveriesView.vue # Cadastro de entregadores
│   └── SalesView.vue     # Controle de vendas
```

## Deploy

```bash
npm run build
firebase deploy --only hosting --project controle-rotas-607ea
```