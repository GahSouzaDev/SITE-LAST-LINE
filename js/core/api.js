const KEY = 'lastline.token';
export const session = {
  get token() { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } },
  set token(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch { /* storage bloqueado */ } }
};

async function call(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && session.token) headers.Authorization = `Bearer ${session.token}`;
  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });   /* nada de resposta velha do navegador/CDN: prêmios e avisos aparecem na hora */
  } catch {
    throw new Error('Sem conexão com o servidor.');
  }
  let data = {};
  try { data = await res.json(); } catch { /* corpo vazio */ }
  if (!res.ok) { const e = new Error(data.error || `Erro ${res.status}`); e.status = res.status; throw e; }
  return data;
}

export const api = {
  setBirth: (date) => call('/me/birth', { method: 'POST', body: { date }, auth: true }),
  nick: (b) => call('/nick', { method: 'POST', body: b, auth: true }),
  market: (q = {}) => call('/market?' + new URLSearchParams({ kind: q.kind || '', q: q.q || '', sort: q.sort || 'new' }), { auth: true }),
  marketStore: () => call('/market/store', { auth: true }),
  marketStoreBuy: (b) => call('/market/store/buy', { method: 'POST', body: b, auth: true }),
  marketMine: () => call('/market/mine', { auth: true }),
  marketList: (b) => call('/market/list', { method: 'POST', body: b, auth: true }),
  marketCancel: (b) => call('/market/cancel', { method: 'POST', body: b, auth: true }),
  marketBuy: (b) => call('/market/buy', { method: 'POST', body: b, auth: true }),
  tourn: () => call('/tourn', { auth: true }),
  tournRanking: (p) => call(`/tourn/ranking?p=${encodeURIComponent(p)}`, { auth: true }),
  tournBracket: (id) => call(`/tourn/${id}/bracket`, { auth: true }),
  tournFlag: () => call('/tourn/flag', { auth: true }),
  feed: (k, before, sort) => call('/feed?' + new URLSearchParams({ k: k || '', before: before || 0, s: sort || 'new' }), { auth: true }),
  feedSave: (id) => call(`/feed/${id}/save`, { method: 'POST', body: {}, auth: true }),
  feedComments: (id) => call(`/feed/${id}/comments`, { auth: true }),
  feedComment: (id, body) => call(`/feed/${id}/comments`, { method: 'POST', body: { body }, auth: true }),
  feedCommentLike: (cid) => call(`/feed/comments/${cid}/like`, { method: 'POST', body: {}, auth: true }),
  feedNotifs: () => call('/feed/notifs', { auth: true }),
  feedNotifCount: () => call('/feed/notifs/count', { auth: true }),
  feedNotifSeen: () => call('/feed/notifs/seen', { method: 'POST', body: {}, auth: true }),
  feedCommentDel: (cid) => call(`/feed/comments/${cid}`, { method: 'DELETE', auth: true }),
  feedSide: () => call('/feed/side', { auth: true }),
  feedLike: (id) => call(`/feed/${id}/like`, { method: 'POST', body: {}, auth: true }),
  feedPost: (b) => call('/admin/feed', { method: 'POST', body: b, auth: true }),
  feedPin: (id, on) => call(`/admin/feed/${id}/pin`, { method: 'POST', body: { on }, auth: true }),
  feedDel: (id) => call(`/admin/feed/${id}`, { method: 'DELETE', auth: true }),
  tournPost: (path, body) => call('/tourn/' + path, { method: 'POST', body: body || {}, auth: true }),
  tournChat: (id) => call(`/tourn/${id}/chat`, { auth: true }),
  insignias: () => call('/insignias', { auth: true }),
  setInsignia: (id) => call('/insignias', { method: 'PUT', body: { id }, auth: true }),
  referral: () => call('/referral', { auth: true }),
  register: (b) => call('/register', { method: 'POST', body: b }),
  adsState: () => call('/ads/state', { auth: true }),
  adsNext: (kind) => call('/ads/next', { method: 'POST', body: { kind }, auth: true }),
  adsMine: () => call('/ads/mine', { auth: true }),
  adsComplete: (token) => call('/ads/complete', { method: 'POST', body: { token }, auth: true }),
  passwordRequest: (b) => call('/password-request', { method: 'POST', body: b }),
  login: (b) => call('/login', { method: 'POST', body: b }),
  me: () => call('/me', { auth: true }),
  logout: () => call('/logout', { method: 'POST', auth: true }),
  changePassword: (b) => call('/account/password', { method: 'POST', body: b, auth: true }),
  maps: () => call('/maps')
};

api.getSettings = () => call('/settings', { auth: true });
api.putSettings = (b) => call('/settings', { method: 'PUT', body: b, auth: true });

api.profile = () => call('/profile', { auth: true });
api.setAvatar = (id) => call('/profile/avatar', { method: 'PUT', body: { id }, auth: true });

api.getLook = () => call('/look', { auth: true });
api.render = () => call('/render');
api.saveLook = (look) => call('/look', { method: 'PUT', body: look, auth: true });
api.player = (id) => call('/player/' + id, { auth: true });
api.playerCompare = (id) => call('/player/' + id + '/compare', { auth: true });
api.chatUid = (uid) => call('/chat/' + uid, { auth: true });
api.titles = () => call('/titles', { auth: true });
api.quests = () => call('/quests', { auth: true });
api.questClaim = (id) => call('/quests/claim', { method: 'POST', body: { id }, auth: true });
api.setTitles = (equipped) => call('/titles', { method: 'PUT', body: { equipped }, auth: true });
api.history = () => call('/history', { auth: true });
api.chatOf = (id) => call('/history/' + id, { auth: true });
api.getArsenal = () => call('/arsenal', { auth: true });
api.slotSpin = () => call('/slot/spin', { auth: true, method: 'POST', body: {} });
api.premiere = () => call('/premiere', { auth: true });
api.openPremiere = () => call('/premiere/open', { method: 'POST', auth: true });
api.marks = () => call('/marks', { auth: true });
api.clearAllMarks = () => call('/marks/clear', { method: 'POST', body: { all: true }, auth: true });
api.clearMarks = (marks) => call('/marks/clear', { method: 'POST', body: { marks }, auth: true });
api.clearMark = (mark) => call('/marks/clear', { method: 'POST', body: { mark }, auth: true });
api.event = () => call('/event', { auth: true });
api.story = () => call('/story', { auth: true });
api.loyalty = () => call('/loyalty', { auth: true });
api.claimLoyalty = () => call('/loyalty/claim', { method: 'POST', body: {}, auth: true });
api.shop = () => call('/shop', { auth: true });
api.buy = (item, luck2) => call('/shop/buy', { auth: true, method: 'POST', body: { item, luck2 } });
api.saveArsenal = (b) => call('/arsenal', { method: 'PUT', body: b, auth: true });
