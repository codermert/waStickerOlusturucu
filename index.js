const https = require('https');
const fs = require('fs');
const sharp = require('sharp');
const archiver = require('archiver');

const stickerIndir = async (i) => {
    const url = `https://vkklub.ru/_data/stickers/ice/sticker_vk_ice_${i.toString().padStart(3, '0')}.png`;
    const dosyaAdi = `stickers/${i}.webp`;
  
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        const parcalar = [];
  
        response.on('data', (parca) => {
          parcalar.push(parca);
        });
  
        response.on('end', () => {
          const buffer = Buffer.concat(parcalar);
  
          if (i === 0) {
            fs.writeFileSync('stickers/unnamed.png', buffer);
          }
  
          sharp(buffer)
            .toFormat('webp')
            .toFile(dosyaAdi, (hata, bilgi) => {
              if (hata) {
                reject(hata);
              } else {
                resolve(bilgi);
              }
            });
        });
      }).on('error', (hata) => {
        reject(hata);
      });
    });
  };
  
  const stickersJSONOlustur = async (baslangicNumarasi, bitisNumarasi) => {
    const stickersBilgi = {
      link: "https://play.google.com/store/apps/details?id=com.marsvard.stickermakerforwhatsapp",
      name: "ВКонтакте",
      author: "codermert",
      thumbnail: "unnamed.png", // Set the thumbnail to "unnamed.png"
      stickers: [],
      info: "codermert tarafından geliştirilmiştir"
    };
  

  for (let i = baslangicNumarasi; i <= bitisNumarasi; i++) {
    const emoji = getEmojiForSticker(i);
    stickersBilgi.stickers.push({
      file: `${i}.webp`,
      emoji: emoji
    });
  }

  fs.writeFileSync('stickers/info.json', JSON.stringify(stickersBilgi, null, 2));
};

// Örnek bir getEmojiForSticker fonksiyonu, i'ye göre bir emoji döndürür.
const getEmojiForSticker = (i) => {
  const emojiListesi = [
    "👀", "😐", "😭", "☺", "😞", "☺", "😢", "💰", "😕", "☹",
    "😵", "😕", "🤤", "😠", "🤔", "😐", "😢", "😦", "😡", "💦",
    "😊", "😴", "😛", "😐", "😭", "🤗", "😱", "🙏", "❓", "❓"
  ];

  return emojiListesi[i] || "❓"; // Eğer indeks listede yoksa varsayılan olarak "❓" döndür
};

const wastickersOlustur = async () => {
  const baslangicNumarasi = 0;
  const bitisNumarasi = 29;

  if (!fs.existsSync('stickers')) {
    fs.mkdirSync('stickers');
  }

  await Promise.all(Array.from({ length: bitisNumarasi - baslangicNumarasi + 1 }, (_, i) => stickerIndir(i + baslangicNumarasi)));
  await stickersJSONOlustur(baslangicNumarasi, bitisNumarasi);

  // Diğer dosyaları oluştur
  fs.writeFileSync('stickers/author.txt', '@codermert');
  fs.writeFileSync('stickers/link.txt', 'https://github.com/codermert');
  fs.writeFileSync('stickers/title.txt', 'Вектор');

  // Zip dosyası oluştur
  const cikti = fs.createWriteStream('stickers.wastickers');
  const arsiv = archiver('zip');

  cikti.on('close', function () {
    console.log(arsiv.pointer() + ' toplam byte');
    console.log('Arşivleme tamamlandı ve çıkış dosyası tanımlayıcısı kapatıldı.');
  });

  arsiv.on('error', function (hata) {
    throw hata;
  });

  arsiv.pipe(cikti);

  arsiv.directory('stickers', false); // "stickers" klasörünü zip dosyasına ekle
  arsiv.file('stickers/info.json', { name: 'info.json' }); // info.json dosyasını zip dosyasına ekle

  // Diğer dosyaları da zip dosyasına ekle
  arsiv.file('stickers/author.txt', { name: 'author.txt' });
  arsiv.file('stickers/link.txt', { name: 'link.txt' });
  arsiv.file('stickers/title.txt', { name: 'title.txt' });

  arsiv.finalize();
};

wastickersOlustur();
