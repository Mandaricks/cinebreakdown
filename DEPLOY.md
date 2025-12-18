# 🚀 Guia de Deploy - CineBreakdown no Vercel

## ✅ Arquitetura Atual (v1.3)

### Como Funciona a API Key:

O CineBreakdown oferece **duas formas** de usar a API do Google Gemini:

1. **🔐 API Key do Usuário (Recomendado)**: 
   - O usuário insere sua própria API Key através do modal na interface
   - A chave é enviada via header `X-API-Key` para a API serverless
   - A chave é salva apenas no localStorage do navegador (privacidade)

2. **🔧 API Key do Servidor (Opcional)**:
   - Configure `GEMINI_API_KEY` nas variáveis de ambiente do Vercel
   - Usada como fallback se o usuário não fornecer uma chave
   - Útil para demos ou uso corporativo

---

## 📋 Pré-requisitos

### 1. Obter API Key do Google Gemini
- Acesse: https://aistudio.google.com/app/apikey
- Crie uma conta (ou faça login)
- Clique em "Create API Key"
- Copie a chave gerada

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

### Passo 3: Variáveis de Ambiente (Opcional)

Se quiser configurar uma API Key padrão no servidor:

1. Na página de configuração do projeto, vá em **"Environment Variables"**
2. Adicione:
   
   ```
   Name: GEMINI_API_KEY
   Value: [COLE SUA API KEY DO GEMINI AQUI]
   Environment: Production, Preview, Development
   ```

**Nota**: Isso é opcional! Os usuários podem fornecer sua própria API Key na interface.

### Passo 4: Deploy!

1. Clique em **"Deploy"**
2. Aguarde o build (leva ~2-3 minutos)
3. ✅ Seu app estará disponível em: `https://cinebreaker-[seu-hash].vercel.app`

---

## 🧪 Testar Localmente

```bash
cd /home/heinz/Apps/CineBreaker

# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev

# Acesse: http://localhost:5173

# 3. Na interface, insira sua API Key do Google Gemini
# 4. Cole um texto de roteiro e clique em "Iniciar Análise"
```

---

## 🔧 Estrutura da API Serverless

O projeto usa uma função serverless em `/api/gemini.ts` que:

- Aceita a API Key via header `X-API-Key` (do frontend)
- Usa `process.env.GEMINI_API_KEY` como fallback
- Processa 4 tipos de ações:
  - `analyzeStructure`: Análise inicial do roteiro
  - `generateSceneShots`: Geração de shot list por cena
  - `updateShotsWithNewCharacters`: Atualização de prompts visuais
  - `generateImage`: Geração de storyboards

---

## 🔧 Troubleshooting

### Erro: "API Key não configurada"

**Solução**: 
- Insira uma API Key válida no modal da interface
- Ou configure `GEMINI_API_KEY` nas variáveis de ambiente do Vercel

### Erro: "API error: 400" ou "API error: 403"

**Causas possíveis**:
1. API Key inválida ou expirada
2. API Key sem permissões para o modelo Gemini
3. Cota de requisições excedida

**Soluções**:
1. Gere uma nova API Key em https://aistudio.google.com/app/apikey
2. Verifique se a API Key tem acesso aos modelos Gemini 1.5 Flash

### Erro: "Failed to load resource: 404"

**Causa**: A rota `/api/gemini` não está sendo resolvida corretamente

**Solução**: Verifique se o `vercel.json` está correto:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

### Build local funciona, mas no Vercel não

**Solução**: Limpe o cache do Vercel
- Dashboard > Settings > General > Clear Cache
- Ou via CLI: `vercel --force`

---

## 📊 Arquivos Modificados para Deploy

| Arquivo | Mudança |
|---------|---------|
| `vercel.json` | Configurado rewrites para API serverless |
| `api/gemini.ts` | Aceita API Key via header + CORS |
| `services/geminiService.ts` | Detecta ambiente e usa API serverless em produção |
| `package.json` | Adicionado @types/node, @vercel/node |

---

## 🔄 Atualizações Futuras

Após o deploy inicial, qualquer novo `git push` no branch `main` irá:
1. Triggerar build automático no Vercel
2. Deploy automático se o build passar

---

## ✅ Checklist Final

- [ ] Repositório no GitHub está atualizado
- [ ] Projeto importado no Vercel
- [ ] Deploy executado com sucesso
- [ ] App acessível via URL do Vercel
- [ ] Teste com API Key válida funciona
- [ ] Análise de roteiro gera resultados

---

**Última atualização**: 18/12/2025
**Versão do App**: v1.3
**Status**: ✅ Pronto para produção
