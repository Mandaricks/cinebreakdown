# 🚀 Guia de Deploy - CineBreakdown no Vercel

## ✅ Problemas Resolvidos

### Correções Implementadas:
1. ✅ **Removido o `importmap`** do `index.html` que causava conflitos
2. ✅ **Corrigido HTML quebrado** no arquivo index
3. ✅ **Build testado localmente** com sucesso (1.37MB bundle)
4. ✅ **Configurações do Vite** otimizadas

---

## 📋 Pré-requisitos

### 1. Obter API Key do Google Gemini
- Acesse: https://ai.google.dev/
- Crie uma conta (ou faça login)
- Vá em "Get API Key"
- **IMPORTANTE**: Configure restrições de segurança na sua API Key:
  - Limite por domínio (adicione seu domínio Vercel)
  - Limite de requisições
  - Ative apenas os modelos necessários (Gemini 1.5 Flash)

### 2. Conta no Vercel
- Acesse: https://vercel.com
- Conecte com GitHub

---

## 🎯 Deploy via GitHub + Vercel (RECOMENDADO)

### Passo 1: Preparar o Repositório

```bash
cd /home/heinz/Apps/CineBreaker

# Se ainda não é um repositório git:
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "feat: Initial commit"

# Se você já tem um repositório remoto:
git push origin main

# Se você ainda NÃO tem repositório remoto no GitHub:
# 1. Vá ao GitHub e crie um novo repositório chamado "CineBreaker"
# 2. Execute:
git remote add origin https://github.com/SEU_USUARIO/CineBreaker.git
git branch -M main
git push -u origin main
```

### Passo 2: Conectar ao Vercel

1. **Acesse o Dashboard do Vercel**: https://vercel.com/dashboard
2. **Clique em "Add New Project"**
3. **Importe seu repositório GitHub** "CineBreaker"
4. **Configure o projeto**:

   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **NÃO clique em Deploy ainda!** Continue no próximo passo.

### Passo 3: Adicionar Variáveis de Ambiente

**ANTES** de fazer o deploy, adicione suas variáveis de ambiente:

1. Na página de configuração do projeto, vá em **"Environment Variables"**
2. Adicione a seguinte variável:
   
   ```
   Name: VITE_GEMINI_API_KEY
   Value: [COLE SUA API KEY DO GEMINI AQUI]
   Environment: Production, Preview, Development (selecione todos)
   ```

3. Clique em **"Add"**

### Passo 4: Deploy!

1. Clique em **"Deploy"**
2. Aguarde o build (leva ~2-3 minutos)
3. ✅ Seu app estará disponível em: `https://cinebreaker-[seu-hash].vercel.app`

---

## 🔄 Deploy Direto (Sem GitHub)

Se preferir deploy direto via Vercel CLI:

### Instalar Vercel CLI
```bash
npm install -g vercel
```

### Deploy
```bash
cd /home/heinz/Apps/CineBreaker

# Login (abrirá o navegador)
vercel login

# Primeiro deploy (configuração interativa)
vercel

# Seguir prompts:
# - Set up and deploy? [Y/n] Y
# - Which scope? [selecione sua conta]
# - Link to existing project? [N]
# - What's your project's name? cinebreakdown
# - In which directory is your code located? ./
# - Want to override settings? [n]

# Deploy para produção
vercel --prod
```

### Adicionar Variáveis de Ambiente via CLI
```bash
vercel env add VITE_GEMINI_API_KEY
# Cole sua API Key quando solicitado
# Selecione: Production, Preview, Development
```

---

## 🧪 Testar Localmente Antes do Deploy

```bash
# 1. Criar arquivo de ambiente local
cp .env.local.example .env.local

# 2. Editar .env.local e adicionar sua API Key
nano .env.local
# ou
code .env.local

# 3. Adicionar:
VITE_GEMINI_API_KEY=sua_chave_aqui

# 4. Rodar em desenvolvimento
npm run dev

# Acesse: http://localhost:5173

# 5. Testar build de produção
npm run build
npm run preview

# Acesse: http://localhost:4173
```

---

## 🔧 Troubleshooting

### Erro: "Cannot find module" no Vercel

**Solução**: Limpe o cache do Vercel
```bash
vercel --force
```

Ou no Dashboard:
1. Settings > General
2. Clique em "Clear Cache"
3. Redeploy

### Erro: "Failed to load module script"

**Causa**: Restos do importmap antigo no cache do navegador

**Solução**:
1. Limpe o cache do navegador (Ctrl+Shift+R)
2. Teste em aba anônima
3. Se persistir, redeploye no Vercel

### Erro: "API Key inválida" ou "403 Forbidden"

**Soluções**:
1. Verifique se a variável está correta: `VITE_GEMINI_API_KEY` (com prefixo VITE_)
2. Confirme que a API Key está ativa no Google AI Studio
3. Verifique as restrições da API Key (domínio, quotas)
4. Certifique-se de ter selecionado todos os ambientes (Production, Preview, Development)

### Build muito grande (>1.5MB)

Isso é **NORMAL** para este projeto. O bundle inclui:
- React + React DOM (~150KB)
- Recharts (gráficos) (~200KB)
- jsPDF + autoTable (~150KB)
- html2canvas (~200KB)
- Google Gemini SDK (~150KB)
- Lodash + Core-js (~400KB)

**Otimizações já aplicadas:**
- Code splitting automático pelo Vite
- Tree shaking
- Minificação

---

## 📊 Monitoramento Pós-Deploy

### Verificar Status
```bash
vercel ls
```

### Ver Logs
```bash
vercel logs [url-do-deploy]
```

### Analytics
- Acesse o Dashboard > seu projeto > Analytics
- Monitore uso de banda, requests, erros

---

## 🔄 Atualizações Futuras

Após o deploy inicial, qualquer novo `git push` no branch `main` irá:
1. Triggerar build automático no Vercel
2. Deploy automático se o build passar
3. URL permanece a mesma

### Deploy Manual de uma Branch Específica
```bash
git checkout feature/nova-funcionalidade
vercel
```

---

## 🎨 Domínio Customizado (Opcional)

1. Vá em: Settings > Domains
2. Adicione seu domínio (ex: `cinebreakdown.com`)
3. Configure DNS conforme instruções
4. Vercel configura HTTPS automaticamente

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Build local passa sem erros (`npm run build`)
- [ ] App funciona em modo preview (`npm run preview`)
- [ ] API Key do Gemini está ativa
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy executado com sucesso
- [ ] App acessível via URL do Vercel
- [ ] Teste de upload de roteiro funciona
- [ ] Geração de imagens funciona
- [ ] Export PDF/ZIP funciona

---

## 📞 Suporte

Se continuar com problemas:

1. **Vercel Logs**: 
   - Dashboard > seu projeto > Deployments > (clique no deploy) > View Function Logs

2. **Console do Navegador**:
   - F12 > Console (procure erros em vermelho)

3. **Build Logs**:
   - Dashboard > seu projeto > Deployments > (clique no deploy) > Building

---

**Última atualização**: 17/12/2025
**Versão do App**: v1.2 Fixed
**Status**: ✅ Pronto para produção
