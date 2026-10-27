import { useEffect, useState } from 'react'
import './LandingPage.css'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import rocket from '../assets/roket.jpg'
import WhatshotOutlinedIcon from '@mui/icons-material/WhatshotOutlined'
import AnimationOutlinedIcon from '@mui/icons-material/AnimationOutlined'
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'


const API_URL = 'http://localhost:3000/api/landing-page'

const defaultFeatures = [
  {
    judul: 'Perhitungan Laju Bakar',
    keterangan:
      'Menghitung laju bakar berdasarkan parameter propelan dan kondisi pengujian.',
  },
  {
    judul: 'Simulasi Pembakaran',
    keterangan:
      'Menampilkan simulasi proses pembakaran melalui animasi visual.',
  },
  {
    judul: 'Hasil Perhitungan',
    keterangan:
      'Menampilkan hasil perhitungan secara terstruktur dalam bentuk tabel.',
  },
  {
    judul: 'Ekspor Data CSV',
    keterangan:
      'Mengunduh hasil perhitungan untuk dokumentasi dan analisis lebih lanjut.',
  },
]

const defaultSteps = [
  {
    judul: 'Pilih Parameter',
    keterangan:
      'Tentukan jenis propelan dan masukkan parameter pengujian yang dibutuhkan.',
  },
  {
    judul: 'Jalankan Simulasi',
    keterangan:
      'Mulai simulasi untuk memproses parameter yang sudah dimasukkan.',
  },
  {
    judul: 'Lihat Hasil',
    keterangan:
      'Lihat hasil perhitungan laju bakar dan animasi pembakaran yang ditampilkan.',
  },
  {
    judul: 'Unduh Data',
    keterangan:
      'Unduh hasil perhitungan dalam format CSV untuk dokumentasi dan analisis.',
  },
]

export default function LandingPage() {
  const [konten, setKonten] = useState({
    hero: {
      judul: 'V-LabVerse',
      deskripsi:
        'Platform lab virtual untuk simulasi sains dan laju bakar roket.',
      gambar: '',
    },
    fitur: defaultFeatures,
    langkah: defaultSteps,
  })

  useEffect(() => {
    async function ambilKonten() {
      try {
        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Gagal mengambil konten landing page.')
        }

        const rows = await response.json()

        const hero = rows.find(
          (item) => item.section_key === 'hero'
        )

        const fitur = defaultFeatures.map((item, index) => {
          const row = rows.find(
            (data) => data.section_key === `fitur_${index + 1}`
          )

          return {
            judul: row?.title || item.judul,
            keterangan: row?.description || item.keterangan,
          }
        })

        const langkah = defaultSteps.map((item, index) => {
          const row = rows.find(
            (data) => data.section_key === `langkah_${index + 1}`
          )

          return {
            judul: row?.title || item.judul,
            keterangan: row?.description || item.keterangan,
          }
        })

        setKonten({
          hero: {
            judul: hero?.title || 'V-LabVerse',
            deskripsi:
              hero?.description ||
              'Platform lab virtual untuk simulasi sains dan laju bakar roket.',
            gambar: hero?.image_url || '',
          },
          fitur,
          langkah,
        })
      } catch (error) {
        console.error('Gagal mengambil konten:', error)
      }
    }

    ambilKonten()
  }, [])

  return (
    <div className="landing-page">
      <Navbar />

      {/* Bagian Hero */}
      <section className="landing-hero" id="home">
        <div className="landing-hero-content">
          <h1>{konten.hero.judul}</h1>

          <p>{konten.hero.deskripsi}</p>

          <div className="landing-hero-buttons">
            <a href="#cara-kerja" className="btn-outline">
              Lihat Cara Kerja
            </a>

            
            <a href="/uji-coba" className="btn-orange">
              Mulai Uji Coba
            </a>
          </div>
        </div>

      <div className="landing-hero-image">
        <img
          src={
            konten.hero.gambar
              ? konten.hero.gambar.startsWith('http')
                ? konten.hero.gambar
                : `http://localhost:3000${konten.hero.gambar}`
              : rocket
          }
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
          {konten.fitur.map((item, index) => (
            <article className="feature-card" key={index}>
              <div className={`feature-icon ${
                ['blue', 'orange', 'green', 'purple'][index]
              }`}>
                {index === 0 && <WhatshotOutlinedIcon />}
                {index === 1 && <AnimationOutlinedIcon />}
                {index === 2 && <TableChartOutlinedIcon />}
                {index === 3 && <FileDownloadOutlinedIcon />}
              </div>
              <h3>{item.judul}</h3>
              <p>{item.keterangan}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Cara Kerja */}
      <section
        className="landing-how-it-works"
        id="cara-kerja"
      >
        <div className="how-heading">
          <h2>Bagaimana Cara Kerjanya?</h2>
          <p>
            Ikuti langkah sederhana untuk menjalankan simulasi
            laju bakar roket di V-LabVerse.
          </p>
        </div>

        <div className="steps-grid">
          {konten.langkah.map((item, index) => (
            <article className="step-card" key={index}>
              <div className="step-number">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3>{item.judul}</h3>
              <p>{item.keterangan}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
