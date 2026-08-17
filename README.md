# Factory Quest — SENAI

Jogo 2D top-down feito com **Phaser.js** (puro HTML/CSS/JS, sem build tools).
O jogador anda pela fábrica, coleta missões (notas amarelas), vai até a
máquina indicada e responde uma pergunta técnica sobre aquele setor da
indústria para ganhar pontos.

## Rodando no VSCode

1. Instale a extensão **Live Server** (Ritwick Dey) no VSCode.
2. Abra a pasta `factory-quest` no VSCode (`Arquivo > Abrir Pasta`).
3. Clique com o botão direito em `index.html` → **Open with Live Server**.
4. O jogo abre no navegador em `http://127.0.0.1:5500` (ou porta similar).

Não precisa de `npm install`, `node` nem build — é só HTML/CSS/JS puro
carregando o Phaser via CDN. Isso facilita entregar e rodar em qualquer
computador do evento.

## Subindo para o GitHub

```bash
cd factory-quest
git init
git add .
git commit -m "Primeira versão do Factory Quest"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/factory-quest.git
git push -u origin main
```

## Publicando de graça (GitHub Pages)

1. No repositório no GitHub, vá em **Settings → Pages**.
2. Em "Source", selecione a branch `main` e a pasta `/ (root)`.
3. Salve. Em alguns minutos o jogo estará em:
   `https://SEU-USUARIO.github.io/factory-quest/`

Isso é ótimo pro evento: você manda o link e qualquer um joga direto do
celular ou notebook, sem instalar nada.

## Estrutura do projeto

```
factory-quest/
├── index.html      → estrutura das telas (menu, HUD, quiz, resultado)
├── style.css        → tema visual (dark industrial + cores por setor)
├── js/
│   ├── data.js       → setores, máquinas, notas/missões e perguntas
│   ├── game.js        → mundo do jogo em Phaser (movimento, colisão, interação)
│   └── app.js          → menu, timer, pontuação, modal de quiz, tela final
└── README.md
```

## Como customizar para o seu curso

Tudo que você provavelmente vai querer mudar está em **`js/data.js`**,
sem tocar na lógica do jogo:

- **Trocar os setores**: edite o array `SECTORS`. Cada setor tem `id`,
  `name`, `color` (hex) e uma lista de `machines`. Por exemplo, troque
  "Informática" por "Análise e Desenvolvimento de Sistemas", ou adicione
  um setor novo de "Logística".
- **Adicionar/trocar perguntas**: edite `QUESTIONS[sectorId]`. Cada
  pergunta tem `q` (enunciado), `options` (4 alternativas) e `correct`
  (índice da alternativa certa, 0 a 3). Coloque quantas quiser — o jogo
  sorteia uma pergunta diferente a cada missão daquele setor.
- **Ajustar tempo/pontuação**: no objeto `GAME_CONFIG`, mude
  `totalTimeSeconds` (tempo total de partida), `questionTimeSeconds`
  (tempo por pergunta) e `pointsCorrect` (pontos por acerto).

## Ideias para evoluir (próximos passos)

- Trocar os círculos/retângulos por **sprites** (personagem e máquinas
  com imagens/pixel art) — o Phaser já está pronto pra isso, basta
  carregar imagens no `preload()` da cena.
- Adicionar **sons** (pegar missão, acertar, errar, fim de jogo).
- Salvar o **ranking** em `localStorage` para mostrar os melhores
  jogadores do dia direto no navegador (sem precisar de servidor).
- Adicionar **colisão com paredes/corredores** para dar mais sensação
  de "fábrica" em vez de um mapa aberto.
- Criar uma penalidade por resposta errada (perder pontos ou tempo).

Qualquer uma dessas eu ajudo a implementar — é só pedir.
