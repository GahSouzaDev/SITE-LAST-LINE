// >>> CONFIGURAÇÃO DO SITE — é o ÚNICO arquivo que você precisa mexer quando mudar de endereço. <<<
// GAME_URL: onde o jogo está hospedado (domínio oficial: https://lastlinegame.gahsouza.com.br/; se o domínio ainda não responder, use o Railway: https://last-line-production.up.railway.app/)
window.LASTLINE_GAME_URL = 'https://lastlinegame.gahsouza.com.br/';
// API_URL: de onde o site lê status do servidor, temporada e ranking (normalmente o mesmo endereço do jogo)
window.LASTLINE_API_URL = window.LASTLINE_GAME_URL;
// Estreia (horário de Brasília, UTC-3): o baú da estreia vale para contas criadas nesta janela
window.LASTLINE_PREMIERE = { start: '2026-10-16T18:00:00-03:00', end: '2026-10-18T23:45:00-03:00' };
// Dados do criador (aparecem na seção SOBRE)
window.LASTLINE_AUTHOR = { name: 'Gah Souza', site: 'https://gahsouza.com.br', siteLabel: 'gahsouza.com.br' };
