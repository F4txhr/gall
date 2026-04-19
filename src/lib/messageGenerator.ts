const templates = [
  'Di hari spesial ini, semoga setiap langkahmu selalu dipenuhi cinta dan keberanian.',
  'Terima kasih sudah menjadi rumah paling hangat dalam hidupku. Selamat merayakan hari bahagiamu.',
  'Semoga semua doa baikmu datang tepat waktu, satu per satu, dengan cara paling indah.',
  'Hari ini bukan sekadar ulang tahun, ini pengingat kalau kehadiranmu adalah hadiah untuk semesta kecilku.',
  'Aku doakan senyummu selalu panjang umur, dan hatimu selalu dikelilingi orang-orang yang tulus.',
];

export function generateCelebrationMessage(name: string): string {
  const idx = Math.floor(Math.random() * templates.length);
  return `${name}, ${templates[idx]}`;
}
