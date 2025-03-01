# Guia: Renderização Estática vs. Dinâmica no Next.js

## Problema: Mudanças não aparecem na interface

Se você fez alterações no código mas não consegue vê-las refletidas na interface, uma possibilidade é que sua página esteja sendo renderizada como **conteúdo estático** em vez de dinâmico.

## Como o Next.js renderiza páginas

O Next.js oferece múltiplos métodos de renderização:

### 1. Renderização Estática (SSG - Static Site Generation)

O HTML é gerado em **tempo de build** e reutilizado para cada requisição.

```jsx
// Este componente será renderizado estaticamente
export default function StaticPage() {
  return <div>Conteúdo Estático</div>
}

// Com dados estáticos
export async function getStaticProps() {
  return { props: { data: "..." } }
}
```

### 2. Renderização no Servidor (SSR - Server-Side Rendering)

O HTML é gerado em **cada requisição** no servidor.

```jsx
// Este componente será renderizado a cada requisição
export default function DynamicPage({ data }) {
  return <div>{data}</div>
}

export async function getServerSideProps() {
  return { props: { data: "..." } }
}
```

### 3. Renderização no Cliente (CSR - Client-Side Rendering)

O componente é montado/atualizado no navegador usando JavaScript.

```jsx
import { useState, useEffect } from 'react'

export default function ClientSidePage() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    // Este código roda no navegador
    setData("Dados carregados")
  }, [])
  
  return <div>{data || "Carregando..."}</div>
}
```

## Como diagnosticar o problema

### Executar o verificador de renderização

```bash
cd src/frontend
node static-check.js
```

### Teste com a página de diagnóstico

Visite `http://localhost:3000/client-test` para verificar se o código client-side está funcionando.

## Soluções para o problema

### 1. Se você estiver usando export estático:

Verifique seu `next.config.js` e remova estas linhas se presentes:
```js
output: 'export',
```

### 2. Se precisar de interatividade:

Adicione hooks React para garantir que a página seja interativa:

```jsx
// Adicione useState para estado
const [state, setState] = useState(initialValue)

// Adicione useEffect para efeitos colaterais
useEffect(() => {
  // Código para executar no navegador
}, [])
```

### 3. Se estiver fazendo fetch de dados:

Escolha o método apropriado:

- `getServerSideProps` - Para dados que precisam ser buscados a cada requisição
- `getStaticProps` + revalidate - Para dados que podem ser cached com revalidação
- `useEffect` + fetch - Para dados carregados pelo cliente

### 4. Para forçar reconstrução limpa:

```bash
npm run clean
npm run dev
```

## Verificação final

Sempre teste sua aplicação com cache desabilitado:
1. Abra o DevTools (F12)
2. Vá para a aba Network
3. Marque "Disable cache"
4. Mantenha o DevTools aberto e recarregue a página (Ctrl+F5)
