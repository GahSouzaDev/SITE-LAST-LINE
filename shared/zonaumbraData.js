// DADOS DA ZONA UMBRA (mapa gerado por tools/genZonaUmbra.mjs): limites do mundo, onde fica a cidade, as zonas especiais e as trilhas. Usado pelo gerador, pelo servidor (carros nas trilhas) e pelos testes.
export const WORLD = { x0: -520, x1: 1271, z0: -520, z1: 1271 };      // 1791 m; a cidade (12..751) fica no centro; o jogável termina ~130 m antes (montanhas)
export const CITY = { x0: 0, x1: 763, z0: 0, z1: 763 };
export const ZONES = {
  pens: { x0: -400, x1: -140, z0: 40, z1: 300 },                      // reserva dos mamíferos (cercada, 4 portões)
  village: { cx: 985, cz: 385, r: 62 },                                // aldeia
  strip: { x0: 800, x1: 1170, z0: 884, z1: 916 }                       // pista de pouso (leste-oeste)
};
export const PATHS = [
  [[12, 380], [-40, 330], [-100, 220], [-140, 170]],                    // portão oeste da cidade → portão leste da reserva
  [[751, 380], [840, 372], [930, 380], [985, 385]],                     // portão leste → aldeia
  [[985, 385], [990, 520], [980, 700], [960, 880], [900, 900], [800, 900]],   // aldeia → pista
  [[380, 751], [385, 840], [520, 890], [680, 900], [800, 900]],         // portão norte → pista
  [[380, 12], [370, -90], [300, -200], [180, -260]],                    // portão sul → trilha da floresta
  [[-140, 170], [-200, -20], [-60, -150], [180, -260]]                  // volta da reserva ao sul
];

