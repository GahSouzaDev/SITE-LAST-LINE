SITE LASTLINE — como usar
=========================
1) Copie TODO o conteúdo desta pasta para a pasta do repositório (C:\PROJETOS\SITE-LAST-LINE) e faça o push no GitHub.
   O site abre direto em index.html (GitHub Pages).

2) ENDEREÇOS: tudo que muda fica em config.js
   - LASTLINE_GAME_URL: onde o jogo está (hoje o Railway; depois, o domínio do jogo)
   - LASTLINE_API_URL : de onde vêm status/temporada/ranking (normalmente o mesmo do jogo)
   - LASTLINE_AUTHOR  : seu nome e link (seção SOBRE)

3) BANNERS POR MÊS (img/banners/)
   estreia.jpg  -> aparece de 16/10 18:00 até 18/10 23:45 (horário de Brasília)
   2026-10.jpg ... 2027-09.jpg -> o banner do mês atual aparece sozinho na seção "Campanha do momento".
   Para trocar um banner, substitua o arquivo mantendo o nome (retrato, ~1024x1536). O jogo usa os mesmos nomes em client/assets/events/.
   Banners de temporada: img/seasons/season-1.jpg ... season-5.jpg

4) TESTAR DATAS: abra o site com ?now=2026-10-17T12:00:00-03:00 (qualquer data) para ver o banner daquele dia.

5) Ranking/status: o site lê /api/public/status e /api/public/ranking do jogo. Só apelido, elo, RP, nível e vitórias são públicos.
