// Constantes compartilhadas entre cliente e servidor (ESM puro).
// Toda escala do jogo parte daqui: nada de números mágicos espalhados.
export const GAME_NAME = 'LASTLINE';

// Escala central do jogador (metros). Referência visual: pilha de pneus do mapa.
export const PLAYER_HEIGHT = 1.6;
export const PLAYER_CROUCH_HEIGHT = 0.92;
export const PLAYER_RADIUS = 0.32;
export const PLAYER_EYE_OFFSET = 0.11; // olhos ficam a (altura - offset)

export const MAX_TEAM_SIZE = 5;
export const MAX_PLAYERS_ROOM = 10;

export const VISION_LEVELS = { 1: 'Contorno + vida', 2: 'Somente vida', 3: 'Nada' };

export const TIME_OF_DAY = { MORNING: 'MANHÃ', NOON: 'MEIO-DIA', AFTERNOON: 'TARDE', NIGHT: 'NOITE' };

export const WS_PATH = '/ws';
export const USERNAME_RE = /^[a-zA-Z0-9_-]{3,16}$/;   // letras (sem acento), números, _ e -
export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 72; // limite do bcrypt

// Janelas dos mapas (já em escala real) têm só 0,5–0,8 m de altura e peitoril a 1,1–1,35 m: o jogador ESCALA o peitoril e passa se espremendo.
export const PLAYER_SQUEEZE_HEIGHT = 0.56;
export const PLAYER_SQUEEZE_RADIUS = 0.25;
