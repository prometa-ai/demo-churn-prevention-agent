# Telekom Müşteri Kaybını Önleme Sistemi

Bu proje, telekom sektöründe müşteri kaybını önlemek için yapay zeka destekli bir çözüm sunar. Sistem, müşteri verilerini analiz eder, ayrılma riski yüksek olan müşterileri belirler ve kişiselleştirilmiş iletişim stratejileri uygular.

## Özellikler

- **Müşteri Gösterge Paneli**: Tüm müşterilerin genel bakışı, ayrılma riski skorları ve temel bilgiler
- **Detaylı Müşteri Profilleri**: Her müşteri için kapsamlı bilgiler, kullanım verileri ve destek geçmişi
- **Yapay Zeka Destekli Sohbet**: Müşterilerle doğal dil etkileşimi sağlayan akıllı sohbet arayüzü
  - **Kişiselleştirilmiş Başlangıç Mesajları**: Müşteri verilerine göre özelleştirilmiş proaktif mesajlar
  - **GPT-4o Bağlam Yönetimi**: Tutarlı ve kişiselleştirilmiş konuşma akışı sağlayan gelişmiş bağlam yönetimi
- **Çoklu Ajan Sistemi**: Farklı görevleri yerine getiren uzmanlaşmış AI ajanları
  - Orkestrasyon Ajanı: Müşteri ihtiyaçlarını değerlendirme ve yanıtları koordine etme
  - İletişim Ajanı: Proaktif müşteri iletişimi ve müşteri kaybını önleme stratejileri
  - Kişiselleştirme Ajanı: Müşteri verilerine dayalı kişiselleştirilmiş öneriler
  - Bilgi Erişim Ajanı (RAG): Müşteri sorularını yanıtlamak için Vodafone kampanyaları ve tarifeleri hakkında güncel bilgileri kullanma
- **Kullanım Analizi**: Müşteri kullanım eğilimlerinin görsel gösterimi
- **Türkçe Dil Desteği**: Tüm arayüz ve içerik Türkçe olarak sunulmaktadır
- **Vodafone Kampanyaları ve Tarifeleri**: Güncel Vodafone kampanyaları ve tarifeleri hakkında bilgi veren RAG (Retrieval-Augmented Generation) sistemi

## Teknolojiler

- **Frontend**: Next.js, React, TypeScript, Chakra UI
- **AI/ML**: OpenAI GPT-4o, LangChain, Vector Database (HNSWLib)
- **Veri**: 100 gerçekçi mock müşteri verisi, Vodafone kampanya ve tarife verileri

## GPT-4o Bağlam Yönetimi

Sistem, gelişmiş bir bağlam yönetimi mekanizması kullanarak müşteri ile tutarlı ve kişiselleştirilmiş konuşma akışı sağlar:

1. **GPT-4o Tabanlı Kişiselleştirilmiş Başlangıç Mesajları**:
   - GPT-4o ile müşteri verileri analiz edilerek tamamen otomatik ve derin kişiselleştirme
   - Tüm müşteri verilerinin (paket bilgileri, kullanım geçmişi, destek geçmişi, memnuniyet puanları) mesaj içeriğine entegrasyonu
   - Müşteri durumuna göre (churn riski, kullanım paterni, destek talepleri, fatura durumu) özelleştirilmiş teklifler
   - Çoklu faktör analizi ile müşterinin gerçek ihtiyaçlarını hedefleyen proaktif iletişim
   - **Destek Geçmişi Odaklı İletişim**: Yüksek ayrılma riskine sahip müşterilerde destek talep sayısı, memnuniyet puanları ve bekleyen destek talepleri özellikle vurgulanır

2. **Destek Kaynaklı Churn Riski Analizi**:
   - Yüksek destek talep sayısı (3'ten fazla) olan müşterilerin belirlenmesi
   - Düşük memnuniyet puanına (<3.5) sahip müşterilerin tespit edilmesi
   - Beklemede olan talepleri bulunan müşterilerin önceliklendirilmesi
   - Destek kaynaklı ayrılma riskinin otomatik hesaplanması
   - Destek sorunları olan müşterilere özel, öncelikli destek hizmeti sunulması

3. **Diyalog Bağlam Yönetimi**:
   - GPT-4o için yapılandırılmış bağlam bilgisi oluşturma
   - Konuşma konusunun (tarife, kampanya, ödeme, vb.) sürekli takibi
   - Önceki konuşma geçmişinin kaydedilmesi ve analizi
   - Müşteri yanıtlarına göre dinamik bağlam güncelleme
   - Destek sorunları olan yüksek riskli müşteriler için özel etkileşim yönergeleri

4. **Akıllı Ajan Seçimi ve Etkileşim Yönetimi**:
   - Destek sorunu olan yüksek riskli müşteriler için otomatik olarak İletişim Ajanına yönlendirme
   - Takip mesajlarında selam ifadesi kullanmama
   - Konuşma konusu devamlılığını sağlama
   - İlgisiz konuların tanıtılmasını önleme
   - Ajan tipi sürekliliğinin korunması
   - Gereksiz tekliflerden kaçınma

Bu sistem, müşteri devamlılığını artırmak ve müşteri memnuniyetini yükseltmek için her müşteriye özel, tutarlı ve bağlama uygun etkileşimler sunar. GPT-4o'nun kapsamlı müşteri veri analizi sayesinde, sistemimiz müşteri ihtiyaçlarını daha derinlemesine anlayarak, müşteri kaybını önlemeye odaklanan proaktif ve kişiselleştirilmiş çözümler sunabilmektedir. Özellikle destek sorunları yaşayan yüksek riskli müşterilere öncelik vererek, ayrılma riskini en aza indirmeyi hedeflemektedir.

## Başlangıç

### Gereksinimler

- Node.js 18.0.0 veya üzeri
- npm veya yarn
- OpenAI API anahtarı

### Kurulum

1. Repoyu klonlayın:
   ```
   git clone https://github.com/prometa-ai/churn-prevention-agent.git
   cd telecommunication_churn_prevention_v1
   ```

2. Kurulum scriptini çalıştırın:
   ```
   chmod +x setup.sh
   ./setup.sh
   ```
   
   Bu script aşağıdaki işlemleri gerçekleştirecektir:
   - Gerekli bağımlılıkları yükleme
   - Gerekli dizinleri oluşturma
   - .env.local dosyasını kontrol etme ve gerekirse oluşturma
   - Vodafone kampanya ve tarife verilerini çekme
   - Vektör veritabanı oluşturma

3. `.env.local` dosyasını düzenleyin:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Geliştirme sunucusunu başlatın:
   ```
   npm run dev
   ```

5. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin

## RAG Sistemi Hakkında

Sistem, Vodafone'un kampanyaları ve tarifeleri hakkında güncel bilgileri içeren bir RAG (Retrieval-Augmented Generation) sistemi kullanmaktadır. Bu sistem, aşağıdaki kaynaklardan bilgi toplar:

- [Vodafone Kampanyalar](https://www.vodafone.com.tr/kampanyalar)
- [Vodafone Faturalı Tarifeler](https://www.vodafone.com.tr/tarifeler/faturali-tarifeler)
- [Vodafone Faturasız Tarifeler](https://www.vodafone.com.tr/tarifeler/faturasiz-kolay-paketler)

Bu bilgiler, müşterilere en uygun kampanyaları ve tarifeleri önermek için kullanılır. Sistem, müşterinin kullanım alışkanlıklarına, mevcut paketine ve ihtiyaçlarına göre kişiselleştirilmiş öneriler sunar.

## Kullanım

- Ana sayfada müşteri listesini görüntüleyin
- Ayrılma riskine, isme veya fatura tutarına göre sıralayın
- Detayları görüntülemek için bir müşteri seçin
- Müşteri detay sayfasında genel bakış, faturalama, kullanım, destek geçmişi ve sohbet sekmelerini kullanın
- Sohbet arayüzünü kullanarak müşteri ile etkileşime geçin
- Kampanyalar ve tarifeler hakkında sorular sorarak RAG sistemini test edin

## Demo Kullanıcıları

- Kullanıcı adı: `admin` / Şifre: `prometa2023`
- Kullanıcı adı: `demo` / Şifre: `demo1234`

## Lisans

MIT 