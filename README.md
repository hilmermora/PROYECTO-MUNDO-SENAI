# Factory Quest — SENAI

Jogo 2D top-down feito com **Phaser.js** (puro HTML/CSS/JS, sem build tools).
O jogador anda pela fábrica, coleta missões (notas amarelas), vai até a
máquina indicada e responde uma pergunta técnica sobre aquele setor da
indústria para ganhar pontos.

**Recursos incluídos:**
- Personagem em pixel art (desenhado em código, com animação de caminhada) e ícones por tipo de máquina (engrenagem, faísca, raio, braço robótico, monitor, esteira)
- Paredes/corredores entre os setores — a fábrica tem "salas" de verdade, com portas ligando ao corredor central
- Efeitos sonoros sintetizados via Web Audio API (pegar missão, acerto, erro, fim de jogo) — nenhum arquivo de áudio externo necessário
- Ranking salvo no navegador (`localStorage`), com tela própria acessível pelo menu e pela tela de resultado

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
├── index.html      → estrutura das telas (menu, HUD, quiz, resultado, ranking)
├── style.css        → tema visual (dark industrial + cores por setor)
├── js/
│   ├── data.js        → setores, máquinas, notas/missões, perguntas e config geral
│   ├── sound.js         → efeitos sonoros sintetizados (Web Audio API)
│   ├── game.js           → mundo do jogo em Phaser (movimento, colisão, paredes, sprite, ícones)
│   └── app.js              → menu, timer, pontuação, quiz, ranking (localStorage), tela final
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

- Trocar o personagem/ícones em código por **sprites de verdade** (PNG
  ou spritesheet) se quiser um visual mais elaborado — basta carregar
  as imagens no `preload()` da cena em `js/game.js`.
- Trocar as portas fixas por **múltiplas entradas** por setor, para
  permitir caminhos alternativos.
- Criar uma penalidade por resposta errada (perder pontos ou tempo).
- Adicionar **música de fundo** em loop (também dá pra sintetizar ou
  usar um arquivo `.mp3` leve).
- Exportar/importar o ranking como JSON, ou migrar pra um backend
  simples se quiser ranking compartilhado entre computadores.

Qualquer uma dessas eu ajudo a implementar — é só pedir.

## Sobre o ranking

O ranking usa `localStorage`, ou seja, fica salvo **só no navegador de
cada computador** — não é compartilhado entre jogadores em máquinas
diferentes. Pra um evento com várias estações, cada PC vai ter seu
próprio ranking local. Se quiser um ranking único entre todos os
computadores do evento, é necessário um backend (banco de dados) — aí
já é um projeto mais avançado, mas posso ajudar se for esse o caminho.
