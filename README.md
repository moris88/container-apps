# My Personal Apps

## Gestione link

- Apri **Gestisci link** per aggiungere label e URL HTTP/HTTPS. Ogni nuovo link riceve un ID casuale.
- Elimina i link con il cestino e modifica l'ordine con le frecce oppure trascinando le tab.
- Link, ordine e tab selezionata vengono salvati nel localStorage del browser. Il file `src/data/links.json` viene usato solo come configurazione iniziale, quando non esiste una lista salvata; una lista vuota resta vuota.
- **Esporta JSON** scarica tutti i link nell'ordine corrente. **Importa JSON** valida il file e, dopo conferma, sostituisce l'intera lista. Un file non valido non modifica i dati esistenti.
- I dati restano locali al browser e all'origine del sito: usa l'esportazione per backup o trasferimenti. Alcuni siti impediscono il caricamento in iframe; il loro URL resta apribile dal pannello di gestione.

Formato JSON (accettato anche come array senza l'oggetto esterno):

```json
{
  "links": [
    {
      "id": "example",
      "label": "Example",
      "url": "https://example.com/"
    }
  ]
}
```

Gli ID sono facoltativi in importazione: quelli mancanti vengono generati. Gli ID presenti devono essere stringhe non vuote e univoche. Per importare una lista vuota usa `{ "links": [] }`.

## Sviluppo

```sh
pnpm install
pnpm dev
pnpm build
```

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
