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
          sharp(indirilenDosyaYolu)
            .resize(96, 96)
            .toFile(dosyaYolu, (hata) => {
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
      fs.unlink(indirilenDosyaYolu, () => reject(hata));
    });
  });
};

const stickerIndir = async (i, stickerAdi, klasorAdi) => {
  const url = `https://vkklub.ru/_data/stickers/` + stickerAdi + `/sticker_vk_` + stickerAdi + `_${i.toString().padStart(3, '0')}.png`;
  const dosyaAdiWebp = `${klasorAdi}/${i}.webp`;

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
          .toFile(dosyaAdiWebp, (hata) => {
            if (hata) {
              reject(hata);
            } else {
              resolve();
            }
          });
      });
    }).on('error', (hata) => {
      reject(hata);
    });
  });
};

const stickersJSONOlustur = async (baslangicNumarasi, bitisNumarasi, klasorAdi, unnamedIndex) => {
  const stickersBilgi = {
    link: "https://play.google.com/store/apps/details?id=com.marsvard.stickermakerforwhatsapp",
    name: "ВКонтакте",
    author: "codermert",
    thumbnail: `${unnamedIndex}.webp`,
    stickers: [],
    info: "codermert tarafından geliştirilmiştir"
  };

  for (let i = baslangicNumarasi; i <= bitisNumarasi; i++) {
    const emoji = getEmojiForSticker(i - baslangicNumarasi);
    stickersBilgi.stickers.push({
      file: `${i}.webp`,
      emoji: emoji
    });
  }

  fs.writeFileSync(`${klasorAdi}/info.json`, JSON.stringify(stickersBilgi, null, 2));
};

const getEmojiForSticker = (i) => {
  const emojiListesi = [
    "👀", "😐", "😭", "☺", "😞", "☺", "😢", "💰", "😕", "☹",
    "😵", "😕", "🤤", "😠", "🤔", "😐", "😢", "😦", "😡", "💦",
    "😊", "😴", "😛", "😐", "😭", "🤗", "😱", "🙏", "❓", "❓"
  ];

  return emojiListesi[i % emojiListesi.length] || "❓"; 
};

const wastickersOlustur = async (toplamStickerSayisi, stickerAdi) => {
  const batchSize = 30;

  for (let batch = 0; batch * batchSize < toplamStickerSayisi; batch++) {
    const baslangicNumarasi = batch * batchSize;
    const bitisNumarasi = Math.min(baslangicNumarasi + batchSize - 1, toplamStickerSayisi - 1);
    const klasorAdi = `stickers_batch_${batch + 1}`;
    const zipAdi = `stickers${batch > 0 ? batch + 1 : ''}.wastickers`;

    if (!fs.existsSync(klasorAdi)) {
      fs.mkdirSync(klasorAdi);
    }

    // unnamed.png dosyasını ayarla
    const unnamedIndex = batch === 0 ? 1 : 30;
    const unnamedUrl = `https://vkklub.ru/_data/stickers/${stickerAdi}/sticker_vk_${stickerAdi}_${unnamedIndex.toString().padStart(3, '0')}.png`;
    await pngIndirVeKaydet(unnamedUrl, `${klasorAdi}/unnamed.png`);

    await Promise.all(Array.from({ length: bitisNumarasi - baslangicNumarasi + 1 }, (_, i) => stickerIndir(i + baslangicNumarasi, stickerAdi, klasorAdi)));
    await stickersJSONOlustur(baslangicNumarasi, bitisNumarasi, klasorAdi, unnamedIndex);

    fs.writeFileSync(`${klasorAdi}/author.txt`, '@codermert');
    fs.writeFileSync(`${klasorAdi}/link.txt`, 'https://github.com/codermert');
    fs.writeFileSync(`${klasorAdi}/title.txt`, 'ВКонтакте');

    const cikti = fs.createWriteStream(zipAdi);
    const arsiv = archiver('zip');

    cikti.on('close', function () {
      console.log(arsiv.pointer() + ' toplam byte');
      console.log(`Arşivleme tamamlandı: ${zipAdi}`);
    });

    arsiv.on('error', function (hata) {
      throw hata;
    });

    arsiv.pipe(cikti);

    arsiv.directory(klasorAdi, false);
    arsiv.file(`${klasorAdi}/info.json`, { name: 'info.json' });
    arsiv.file(`${klasorAdi}/author.txt`, { name: 'author.txt' });
    arsiv.file(`${klasorAdi}/link.txt`, { name: 'link.txt' });
    arsiv.file(`${klasorAdi}/title.txt`, { name: 'title.txt' });

    await arsiv.finalize();

    fs.rmdirSync(klasorAdi, { recursive: true });
  }
};

// Kullanım
const toplamStickerSayisi = 48; // Sticker sayısını burada belirleyin
const stickerAdi = "its_cat"; // Sticker adını burada belirleyin

wastickersOlustur(toplamStickerSayisi, stickerAdi)
  .then(() => {
    console.log('İşlem tamamlandı.');
  })
  .catch((hata) => {
    console.error('Bir hata oluştu:', hata);
  });
