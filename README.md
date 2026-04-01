# neverline

Este projeto pode ser executado de **duas formas**:

1. **Modo local (script):** roda diretamente com `node nome-do-arquivo`.
2. **Modo servidor (Express):** sobe uma API HTTP com o `server.js`.

## Pré-requisitos

- Node.js 18+ instalado
- npm (já vem com o Node.js)

## 1) Instalação do projeto (`npm install`)

No terminal, dentro da pasta do projeto, execute:

```bash
npm install
```

Esse comando instala todas as dependências do `package.json`.

## 2) Instalação do Playwright

Depois do `npm install`, instale os navegadores usados pelo Playwright:

```bash
npx playwright install
```

Se quiser instalar também dependências do sistema (mais comum em Linux/CI), use:

```bash
npx playwright install --with-deps
```

## Rodar localmente (modo script)

> Esta é a forma de execução **local**, direta pelo Node.

Para rodar um arquivo específico com Node, use:

```bash
node nome-do-arquivo.js
```

Exemplo neste projeto:

```bash
node neverline.js
```

### Não esqueça de entrar em neverline.js e alterar a linha de execução, é a chamada da função no fim da página.

## Rodar como servidor (Express)

Se você quiser usar como API/servidor, deve iniciar o Express (`server.js`).

### Passo a passo

1. Instale as dependências:

    ```bash
    npm install
    ```

2. Garanta o Playwright instalado:

    ```bash
    npx playwright install
    ```

3. Inicie o servidor Express:

    ```bash
    npm start
    ```

    ou

    ```bash
    node server.js
    ```

4. Teste se está de pé:
    - `GET /` → mensagem de servidor online
    - `GET /health` → status de saúde

Por padrão, o servidor roda na porta `3001` (ou na porta definida em `PORT`).

5. Rode ele de maneira local e lembre-se de verificar pois as vezes o bot irá freezar, basta reinicia-lo, caso o freeze aconteça em "Review and Self-Evaluation — Vocabulary Flashcards" basta apertar o btn next abaixo da página!!


## OBSERVAÇÃO

- Atente-se em não mudar o headless no código pois caso ocorra, você não conseguirá saber se está travado. no futuro esse código irá rodar em um VPS então não se preocupe, é temporário.

## OBSERVAÇÃO 2

- Atenção alunos do 4 ciclo, existe 1 exercicio em cada subunidade que geralmente não é feito, por enquanto é algo em que estou trabalhando, favor atenção a isso.