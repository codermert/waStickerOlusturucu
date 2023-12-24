const https = require('https');
const fs = require('fs');
const sharp = require('sharp');
const archiver = require('archiver');

const pngIndirVeKaydet = (url, dosyaYolu) => {
  return new Promise((resolve, reject) => {
    const indirilenDosyaYolu = dosyaYolu.replace('.png', '_temp.png');

    const dosya = fs.createWriteStream(indirilenDosyaYolu);

    https.get(url, (response) => {
      response.pipe(dosya);

      dosya.on('finish', () => {
        dosya.close(() => {
          // Şimdi dosyayı 96x96 boyutuna boyutlandır ve orijinal dosya adına kaydet
          sharp(indirilenDosyaYolu)
            .resize(96, 96)
            .toFile(dosyaYolu, (hata, bilgi) => {
              // Geçici dosyayı silelim
              fs.unlink(indirilenDosyaYolu, () => {
                if (hata) {
                  reject(hata);
                } else {
                  resolve();
                }
              });
            });
        });
      });
    }).on('error', (hata) => {
      fs.unlink(indirilenDosyaYolu, () => reject(hata)); // Hata durumunda geçici dosyayı sil
    });
  });
};

const stickerIndir = async (i) => {
  const url = `https://vkklub.ru/_data/stickers/cottagermarina/sticker_vk_`+`cottagermarina`+`_${i.toString().padStart(3, '0')}.png`;
  const dosyaAdiWebp = `stickers/${i}.webp`;

  // İlk çıkartmayı "unnamed.png" olarak indir ve kaydet
  if (i === 1) {
    await pngIndirVeKaydet(url, 'stickers/unnamed.png');
  }

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const parcalar = [];

      response.on('data', (parca) => {
        parcalar.push(parca);
      });

      response.on('end', () => {
        const buffer = Buffer.concat(parcalar);

        sharp(buffer)
          .toFormat('webp')
          .toFile(dosyaAdiWebp, (hata, bilgi) => {
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
      thumbnail: "unnamed.png", 
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


const baslangicNumarasi = 0;
const bitisNumarasi = 29;
const wastickersOlustur = async () => {
  if (!fs.existsSync('stickers')) {
    fs.mkdirSync('stickers');
  } else {
    // Stickers klasörü varsa içeriğini temizle
    fs.readdirSync('stickers').forEach((dosya) => {
      const dosyaYolu = `stickers/${dosya}`;
      if (fs.lstatSync(dosyaYolu).isDirectory()) {
        // Alt klasörü temizle
        fs.rmdirSync(dosyaYolu, { recursive: true });
      } else {
        // Dosyayı sil
        fs.unlinkSync(dosyaYolu);
      }
    });
  }

  await Promise.all(Array.from({ length: bitisNumarasi - baslangicNumarasi + 1 }, (_, i) => stickerIndir(i + baslangicNumarasi)));
  await stickersJSONOlustur(baslangicNumarasi, bitisNumarasi);


  // Diğer dosyaları oluştur
  fs.writeFileSync('stickers/author.txt', '@codermert');
  fs.writeFileSync('stickers/link.txt', 'https://github.com/codermert');
  fs.writeFileSync('stickers/title.txt', 'ВКонтакте');

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
