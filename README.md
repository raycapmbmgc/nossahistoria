# 1 ano da nossa história — livro digital

Um site em HTML, CSS e JavaScript puro (sem instalar nada) que funciona como um livro:
capa → playlist → prólogo → 12 meses → presente → final.

## Estrutura

```
nossa-historia/
├── index.html        ← página principal (não precisa mexer)
├── css/style.css     ← visual (cores no topo, em :root)
├── js/data.js        ← ★ TODO O CONTEÚDO: nomes, datas, textos, fotos, Spotify, vale
├── js/app.js         ← funcionamento do livro (não precisa mexer)
└── fotos/            ← coloque suas fotos aqui
```

## Como personalizar (tudo em `js/data.js`)

| O quê | Onde |
|---|---|
| Nomes do casal | `casal.nome1`, `casal.nome2` |
| Data do namoro | `casal.dataInicio` — formato `"2025-10-01"` |
| Link do Spotify | `spotify` |
| Foto da capa | `capa.foto.src` |
| Prólogo (antes do mês 1) | `inicio` |
| Cada mês | `meses[0]` … `meses[11]` → `titulo`, `data`, `texto`, `fotos`, `layout`, `memorias` |
| Último capítulo (mês 12) | `meses[11]` → `mensagem`, `assinatura`, `fotos` |
| Momentos especiais | `momentosEspeciais` → `depoisDoMes` define onde aparece |
| Texto do presente | `presente` |
| Vale 3 pedidos e regras | `vale` → `titulo`, `subtitulo`, `regras`, `regrasExtras`, `validade`, `quantidade` |
| Mensagem final | `final` |

**Espaços reservados:** todo texto entre `[colchetes]` aparece destacado em azul no site.
Quando você trocar pelo texto real (sem colchetes), o destaque some.

### Fotos
1. Coloque as fotos na pasta `fotos/` (ex.: `fotos/mes-01-a.jpg`).
2. No `data.js`, escreva o caminho: `{ src: "fotos/mes-01-a.jpg", legenda: "..." }`.
3. Para carregar rápido, exporte as fotos com no máximo ~1600 px no lado maior (JPG ou WebP).
   Se um caminho estiver errado, o site mostra "Foto não encontrada" com o nome do arquivo.

### Layouts de fotos
- `"single"` — uma foto grande (várias fotos ficam uma embaixo da outra)
- `"duo"` — duas fotos lado a lado
- `"caption"` — foto com a legenda em destaque ao lado
- `"collage"` — colagem com 3 ou 4 fotos

## Testar
Abra o `index.html` no navegador (duplo clique). Funciona sem servidor.
Dica para editar: adicione `#p7` no fim do endereço para abrir direto na página 7.

## Navegação
- Botões **← Voltar** e **Próxima página →**
- Setas ← e → do teclado
- Deslizar para os lados no celular
- A música nunca toca sozinha: o botão apenas abre a playlist no Spotify.

## Publicar
Qualquer hospedagem de site estático serve. As mais simples:
- **Netlify Drop** (app.netlify.com/drop): arraste a pasta inteira.
- **GitHub Pages** ou **Vercel**: envie a pasta como está.
