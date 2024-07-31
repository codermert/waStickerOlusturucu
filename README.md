# WhatsApp Sticker Paket Oluşturucu

Bu Node.js scripti, stickerları indirip boyutlandırarak `.wastickers` dosyaları halinde paketlemek için kullanılan bir otomasyon aracıdır. 30'dan fazla sticker içeren paketleri, birden fazla `.wastickers` dosyasına bölerek yönetir.

## Özellikler

- Belirtilen URL'den sticker indirir.
- Stickerları gerekli 96x96 boyutuna küçültür.
- Stickerları WhatsApp'a kolayca aktarılabilecek `.wastickers` dosyalarına paketler.
- 30'dan fazla sticker olması durumunda, stickerları birden fazla `.wastickers` dosyasına böler.

## Kurulum

1. **Depoyu Klonlayın:**

    ```bash
    git clone https://github.com/codermert/waStickerOlusturucu
    cd waStickerOlusturucu
    ```

2. **Bağımlılıkları Yükleyin:**

    ```bash
    npm install
    ```

## Kullanım

1. **Scriptte Toplam Sticker Sayısını ve Sticker Adını Ayarlayın:**

    `wastickersOlustur` fonksiyonunda, `toplamStickerSayisi` ve `stickerAdi` değişkenlerini ayarlayın.

    ```javascript
    const toplamStickerSayisi = 48; // Toplam sticker sayısı
    const stickerAdi = "its_cat";   // Sticker setinin adı
    ```

2. **Scripti Çalıştırın:**

    ```bash
    node sticker_creator.js
    ```

3. **Çıktı:**

   Script, kök dizinde `.wastickers` dosyaları oluşturur ve gerekirse stickerları birden fazla dosyaya böler. Örneğin:
   - `stickers.wastickers`
   - `stickers2.wastickers`

   Bu dosyalar daha sonra WhatsApp'a aktarılabilir.

## Notlar

- Script, ilk sticker'ı (`1.png`) ilk paket için `unnamed.png` simgesi olarak ve ikinci paket için 30. sticker'ı (`30.png`) simge olarak seçer.
- Her sticker paketi, sticker paketi hakkında meta veriler içeren bir `info.json` dosyası içerir.

## Lisans

Bu proje, [MIT Lisansı](LICENSE) ile lisanslanmıştır.
