// SUAVIZAÇÃO INDEPENDENTE DO FPS. A forma antiga  x += (alvo - x) * Math.min(1, dt * k)  anda DIFERENTE conforme o tamanho do quadro (com FPS baixo o passo satura em 1 e o valor "pula" para o alvo, enquanto
// outras coisas (recuo da arma, balanço, mãos) seguem outra curva: dava o "pulinho"/fantasma entre a arma e a mão). dec(dt, k) devolve a MESMA fração a 60 FPS (k/60), mas decai de forma exponencial:
// dois quadros de 8 ms andam exatamente o mesmo que um de 16 ms — a animação fica igual em qualquer FPS, só amostrada menos vezes.
export const dec = (dt, k) => 1 - Math.pow(1 - Math.min(0.95, k / 60), Math.max(0, Math.min(0.25, dt)) * 60);
