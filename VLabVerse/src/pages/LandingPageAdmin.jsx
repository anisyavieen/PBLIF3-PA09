
import { useEffect, useState } from 'react'
import './LandingPageAdmin.css'

const API_URL = 'http://localhost:3000/api/landing-page'

const defaultData = {
  hero: {
    judul: '',
    deskripsi: '',
    gambar: '',
  },
  fitur: [
    { judul: '', keterangan: '' },
    { judul: '', keterangan: '' },
    { judul: '', keterangan: '' },
    { judul: '', keterangan: '' },
  ],
  langkah: [
    { judul: '', keterangan: '' },
    { judul: '', keterangan: '' },
    { judul: '', keterangan: '' },
    { judul: '', keterangan: '' },
  ],
    kontak: {
    judul: 'Jelajahi Sains Melalui Simulasi',
    deskripsi:
      'Laboratorium virtual untuk simulasi laju bakar propelan. Pelajari parameter pengujian, jalankan simulasi, dan pahami hasilnya dengan lebih mudah melalui V-LabVerse.',
    email: '',
    whatsapp: '',
    instagram: '',
    youtube: '',
    facebook: '',
    alamat: '',
  },
}

async function requestAPI(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Permintaan gagal.')
  }

  return data
}

function parseContact(description) {
  try {
    return JSON.parse(description || '{}')
  } catch {
    return {}
  }
}

function mapRowsToForm(rows) {
  const hero = rows.find((row) => row.section_key === 'hero')
  const kontak = rows.find((row) => row.section_key === 'kontak')

  const fitur = [1, 2, 3, 4].map((number) => {
    const row = rows.find(
      (item) => item.section_key === `fitur_${number}`
    )

    return {
      judul: row?.title || '',
      keterangan: row?.description || '',
    }
  })

  const langkah = [1, 2, 3, 4].map((number) => {
    const row = rows.find(
      (item) => item.section_key === `langkah_${number}`
    )

    return {
      judul: row?.title || '',
      keterangan: row?.description || '',
    }
  })

  return {
    hero: {
      judul: hero?.title || '',
      deskripsi: hero?.description || '',
      gambar: hero?.image_url || '',
    },
    fitur,
    langkah,
    kontak: {
      ...defaultData.kontak,
      ...parseContact(kontak?.description),
    },
  }
}

export default function LandingPageAdmin() {
  const [form, setForm] = useState(defaultData)
  const [pesan, setPesan] = useState('')
  const [dataDatabase, setDataDatabase] = useState([])
  const [memuat, setMemuat] = useState(true)
  const [menyimpan, setMenyimpan] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const rows = await requestAPI(API_URL)

        setDataDatabase(rows)
        setForm(mapRowsToForm(rows))
      } catch (error) {
        setPesan(`Gagal mengambil data: ${error.message}`)
      } finally {
        setMemuat(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!pesan) return

    const timer = setTimeout(() => setPesan(''), 5000)

    return () => clearTimeout(timer)
  }, [pesan])

  const handleHeroChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value,
      },
    }))
  }
  const handleHeroImageUpload = async (file) => {
  if (!file) return

  if (!file.type.startsWith('image/')) {
    setPesan('File harus berupa gambar.')
    return
  }

  const formData = new FormData()
  formData.append('gambar', file)

  try {
    setPesan('Mengunggah foto...')

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengunggah foto.')
    }

    handleHeroChange('gambar', data.image_url)
    setPesan('Foto berhasil diunggah.')
  } catch (error) {
    setPesan(`Gagal mengunggah foto: ${error.message}`)
  }
}

  const handleCardChange = (section, index, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const handleContactChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      kontak: {
        ...prev.kontak,
        [field]: value,
      },
    }))
  }

  const handleSave = async (event) => {
    event.preventDefault()

    if (menyimpan || memuat) return

    if (!form.hero.judul.trim()) {
      setPesan('Judul Hero wajib diisi.')
      return
    }

    if (form.hero.gambar && form.hero.gambar.length > 255) {
      setPesan('Path gambar maksimal 255 karakter.')
      return
    }
    setMenyimpan(true)
    setPesan('')

    try {
      const konten = [
        {
          section_key: 'hero',
          title: form.hero.judul.trim(),
          description: form.hero.deskripsi,
          image_url: form.hero.gambar || null,
        },
        ...form.fitur.map((item, index) => ({
          section_key: `fitur_${index + 1}`,
          title: item.judul.trim(),
          description: item.keterangan,
        })),
        ...form.langkah.map((item, index) => ({
          section_key: `langkah_${index + 1}`,
          title: item.judul.trim(),
          description: item.keterangan,
        })),
        {
          section_key: 'kontak',
          title: 'Kontak',
          description: JSON.stringify(form.kontak),
        },
      ]

      for (const item of konten) {
        const lama = dataDatabase.find(
          (row) => row.section_key === item.section_key
        )

        const payload = {
          section_key: item.section_key,
          title: item.title,
          description: item.description || null,
          image_url:
            item.image_url !== undefined
              ? item.image_url
              : lama?.image_url || null,
          button_text: lama?.button_text || null,
          button_link: lama?.button_link || null,
        }

        if (lama) {
          await requestAPI(`${API_URL}/${lama.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          })
        } else {
          await requestAPI(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
          })
        }
      }

      const rowsTerbaru = await requestAPI(API_URL)

      setDataDatabase(rowsTerbaru)
      setForm(mapRowsToForm(rowsTerbaru))
      setPesan('Data berhasil diubah!')
    } catch (error) {
      setPesan(`Gagal menyimpan: ${error.message}`)
    } finally {
      setMenyimpan(false)
    }
  }

  const handleCancel = () => {
    setForm(mapRowsToForm(dataDatabase))
    setPesan('')
  }

  return (
    <main className="landing-admin">
      <header className="landing-admin-header">
        <h1>LANDING PAGE</h1>
        <p>
          Edit konten utama, fitur, langkah penggunaan, dan informasi
          kontak landing page V-LabVerse.
        </p>
        <p className="landing-admin-note">
          Perubahan disimpan ke database dan dapat ditampilkan di
          landing page pengguna setelah halaman publik dihubungkan ke API.
        </p>
      </header>

      {memuat && (
        <p role="status">Sedang mengambil data dari database...</p>
      )}

      <form onSubmit={handleSave}>
        {/* HERO */}
        <section className="landing-section">
          <h2>Hero</h2>

          <div className="landing-field">
            <label htmlFor="hero-judul">Judul</label>
            <input
              id="hero-judul"
              type="text"
              maxLength={200}
              value={form.hero.judul}
              onChange={(e) =>
                handleHeroChange('judul', e.target.value)
              }
              required
            />
          </div>

          <div className="landing-field">
            <label htmlFor="hero-deskripsi">Deskripsi Singkat</label>
            <textarea
              id="hero-deskripsi"
              rows="3"
              value={form.hero.deskripsi}
              onChange={(e) =>
                handleHeroChange('deskripsi', e.target.value)
              }
            />
          </div>

          <div className="landing-field">
            <label htmlFor="hero-gambar">Foto Hero</label>

            <input
              id="hero-gambar"
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleHeroImageUpload(e.target.files[0])
              }
            />

            {form.hero.gambar && (
              <div className="landing-image-preview">
                <img
                  src={
                    form.hero.gambar.startsWith('http')
                      ? form.hero.gambar
                      : `http://localhost:3000${form.hero.gambar}`
                  }
                  alt="Preview gambar Hero"
                />

                <button
                  type="button"
                  className="landing-remove-image"
                  onClick={() => handleHeroChange('gambar', '')}
                >
                  Hapus gambar
                </button>
              </div>
            )}
          </div>
        </section>

        {/* FITUR */}
        <section className="landing-section">
          <h2>Fitur Utama</h2>

          <div className="landing-card-grid">
            {form.fitur.map((item, index) => (
              <article
                className="landing-edit-card"
                key={`fitur-${index}`}
              >
                <h3>Kartu {index + 1}</h3>

                <div className="landing-field">
                  <label htmlFor={`fitur-judul-${index}`}>
                    Judul
                  </label>
                  <input
                    id={`fitur-judul-${index}`}
                    type="text"
                    maxLength={200}
                    value={item.judul}
                    onChange={(e) =>
                      handleCardChange(
                        'fitur',
                        index,
                        'judul',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="landing-field">
                  <label htmlFor={`fitur-keterangan-${index}`}>
                    Keterangan
                  </label>
                  <textarea
                    id={`fitur-keterangan-${index}`}
                    rows="2"
                    value={item.keterangan}
                    onChange={(e) =>
                      handleCardChange(
                        'fitur',
                        index,
                        'keterangan',
                        e.target.value
                      )
                    }
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* LANGKAH PENGGUNAAN */}
        <section className="landing-section">
          <h2>Langkah Penggunaan</h2>

          <div className="landing-card-grid">
            {form.langkah.map((item, index) => (
              <article
                className="landing-edit-card"
                key={`langkah-${index}`}
              >
                <h3>
                  {String(index + 1).padStart(2, '0')}
                </h3>

                <div className="landing-field">
                  <label htmlFor={`langkah-judul-${index}`}>
                    Judul
                  </label>
                  <input
                    id={`langkah-judul-${index}`}
                    type="text"
                    maxLength={200}
                    value={item.judul}
                    onChange={(e) =>
                      handleCardChange(
                        'langkah',
                        index,
                        'judul',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="landing-field">
                  <label htmlFor={`langkah-keterangan-${index}`}>
                    Keterangan
                  </label>
                  <textarea
                    id={`langkah-keterangan-${index}`}
                    rows="2"
                    value={item.keterangan}
                    onChange={(e) =>
                      handleCardChange(
                        'langkah',
                        index,
                        'keterangan',
                        e.target.value
                      )
                    }
                  />
                </div>
              </article>
            ))}
          </div>
        </section>


        {/* KONTAK */}
        <section className="landing-section">
          <h2>Footer dan Kontak</h2>

          <div className="landing-field">
            <label htmlFor="footer-judul">Judul Footer</label>
            <input
              id="footer-judul"
              type="text"
              value={form.kontak.judul || ''}
              onChange={(e) =>
                handleContactChange('judul', e.target.value)
              }
            />
          </div>

          <div className="landing-field">
            <label htmlFor="footer-deskripsi">Deskripsi Footer</label>
            <textarea
              id="footer-deskripsi"
              rows={3}
              value={form.kontak.deskripsi || ''}
              onChange={(e) =>
                handleContactChange('deskripsi', e.target.value)
              }
            />
          </div>

          <div className="landing-contact-grid">
            <div className="landing-field">
              <label htmlFor="kontak-email">Email</label>
              <input
                id="kontak-email"
                type="email"
                value={form.kontak.email || ''}
                onChange={(e) =>
                  handleContactChange('email', e.target.value)
                }
              />
            </div>

            <div className="landing-field">
              <label htmlFor="kontak-instagram">Instagram</label>
              <input
                id="kontak-instagram"
                type="text"
                value={form.kontak.instagram || ''}
                onChange={(e) =>
                  handleContactChange('instagram', e.target.value)
                }
              />
            </div>

            <div className="landing-field">
              <label htmlFor="kontak-whatsapp">
                Telepon / WhatsApp
              </label>
              <input
                id="kontak-whatsapp"
                type="text"
                value={form.kontak.whatsapp || ''}
                onChange={(e) =>
                  handleContactChange('whatsapp', e.target.value)
                }
              />
            </div>

            <div className="landing-field">
              <label htmlFor="kontak-youtube">YouTube</label>
              <input
                id="kontak-youtube"
                type="text"
                value={form.kontak.youtube || ''}
                onChange={(e) =>
                  handleContactChange('youtube', e.target.value)
                }
              />
            </div>

            <div className="landing-field">
              <label htmlFor="kontak-alamat">Alamat</label>
              <textarea
                id="kontak-alamat"
                rows={3}
                value={form.kontak.alamat || ''}
                onChange={(e) =>
                  handleContactChange('alamat', e.target.value)
                }
              />
            </div>

            <div className="landing-field">
              <label htmlFor="kontak-facebook">Facebook</label>
              <input
                id="kontak-facebook"
                type="text"
                value={form.kontak.facebook || ''}
                onChange={(e) =>
                  handleContactChange('facebook', e.target.value)
                }
              />
            </div>
          </div>
        </section>

        {pesan && (
          <p className="landing-feedback" role="status">
            {pesan}
          </p>
        )}

        <div className="landing-actions">
          <button
            type="button"
            className="landing-btn landing-btn-cancel"
            onClick={handleCancel}
            disabled={menyimpan}
          >
            Batal
          </button>

          <button
            type="submit"
            className="landing-btn landing-btn-save"
            disabled={memuat || menyimpan}
          >
            {memuat
              ? 'Memuat data...'
              : menyimpan
                ? 'Menyimpan...'
                : 'Simpan perubahan'}
          </button>
        </div>
      </form>
    </main>
  )
}
