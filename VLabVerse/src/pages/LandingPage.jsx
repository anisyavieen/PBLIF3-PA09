import './LandingPage.css'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import rocket from '../assets/roket.jpg'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />

      {/* Hero Section */}
      <section className="landing-hero" id="home">
        <div className="landing-hero-content">
          <h1>V-LabVerse</h1>

          <p>
            Platform lab virtual untuk simulasi sains
            dan laju bakar roket.
          </p>

          <div className="landing-hero-buttons">
            <a href="#cara-kerja" className="btn-outline">
              Lihat Cara Kerja
            </a>

            <a href="/login" className="btn-orange">
              Mulai Uji Coba
            </a>
          </div>
        </div>

        <div className="landing-hero-image">
          <img
            src={rocket}
            alt="Ilustrasi roket V-LabVerse"
          />
        </div>
      </section>

      {/* Fitur Utama */}
      <section className="landing-features" id="fitur">
        <div className="features-heading">
          <h2>Fitur Utama</h2>
          <p>
            Fitur yang membantu proses simulasi laju bakar roket
            menjadi lebih mudah dan terstruktur.
          </p>
        </div>

        <div className="features-grid">
          <article className="feature-card">
            <div className="feature-icon">🧮</div>
            <h3>Perhitungan Laju Bakar</h3>
            <p>
              Menghitung laju bakar berdasarkan parameter
              propelan dan kondisi pengujian.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Simulasi Pembakaran</h3>
            <p>
              Menampilkan simulasi proses pembakaran
              melalui animasi visual.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Hasil Perhitungan</h3>
            <p>
              Menampilkan hasil perhitungan secara
              terstruktur dalam bentuk tabel.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">📥</div>
            <h3>Ekspor Data CSV</h3>
            <p>
              Mengunduh hasil perhitungan untuk
              dokumentasi dan analisis lebih lanjut.
            </p>
          </article>
        </div>
      </section>

      {/* Bagian Cara Kerja */}
      <section className="landing-how-it-works" id="cara-kerja">
        <div className="how-heading">
          <h2>Bagaimana Cara Kerjanya?</h2>
          <p>
            Ikuti langkah sederhana untuk menjalankan simulasi
            laju bakar roket di V-LabVerse.
          </p>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <div className="step-number">01</div>
            <h3>Pilih Parameter</h3>
            <p>
              Tentukan jenis propelan dan masukkan parameter
              pengujian yang dibutuhkan.
            </p>
          </article>

          <article className="step-card">
            <div className="step-number">02</div>
            <h3>Jalankan Simulasi</h3>
            <p>
              Mulai simulasi untuk memproses parameter yang
              sudah dimasukkan.
            </p>
          </article>

          <article className="step-card">
            <div className="step-number">03</div>
            <h3>Lihat Hasil</h3>
            <p>
              Lihat hasil perhitungan laju bakar dan animasi
              pembakaran yang ditampilkan.
            </p>
          </article>

          <article className="step-card">
            <div className="step-number">04</div>
            <h3>Unduh Data</h3>
            <p>
              Unduh hasil perhitungan dalam format CSV untuk
              dokumentasi dan analisis.
            </p>
          </article>
        </div>
      </section>

      {/* Bagian Kontak */}
      <section className="landing-contact" id="kontak">
        <div className="contact-content">
          <h2>Siap Mencoba V-LabVerse?</h2>
          <p>
            Mulai eksplorasi simulasi laju bakar roket melalui
            platform lab virtual yang mudah digunakan.
          </p>
          <a href="/login" className="contact-button">
            Mulai Simulasi
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
