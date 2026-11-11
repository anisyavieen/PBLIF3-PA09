import { useEffect, useRef, useState } from 'react' // BARU: tambah useRef
import { MenuItem, Select } from '@mui/material'
import Navbar from '../components/Navbar.jsx'
import { simpanHasilSimulasi } from '../components/RiwayatSimulasi.jsx' // BARU
import './UjiCoba.css'
import PopUpHasilSimulasi from "../components/PopUpHasilSimulasi";


const DEFAULTS = {
  propellant: 'KNSB',
  coefficient: 5,
  exponent: 0.35,
  density: 1750,
  pressure: 6,
  area: 100,
  web: 12.5,
}

const STORAGE_KEY = 'vlab_laju_bakar'

// Membaca data propelan dari KelolaParameter

function bacaDataPropelan() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')

    if (!data || !Array.isArray(data.types)) {
      return { types: [], params: {}, batas: {} }
    }

    // Ambil keenam parameter dari seluruh grup
    const parameter = (data.groups || []).flatMap(
      (group) => group.params || []
    )

    const hasil = {}
    const batas = {}

    parameter.forEach((p) => {
      if (!p.kode) return

      batas[p.kode] = {
        min: Number(String(p.min).replace(',', '.')),
        max: Number(String(p.max).replace(',', '.')),
      }
    })

    data.types.forEach((jenis) => {
      const nilai = {}

      parameter.forEach((p) => {
        if (!p.kode) return

        const value = jenis.vals?.[p.id]
        const angka =
          value !== undefined && String(value).trim() !== ''
            ? value
            : p.def

        nilai[p.kode] = Number(String(angka).replace(',', '.'))
      })

      hasil[jenis.name] = nilai
    })

    return {
      types: data.types,
      params: hasil,
      batas,
    }
  } catch (error) {
    console.error('Gagal membaca data propelan:', error)
    return { types: [], params: {}, batas: {} }
  }
}


const format = (number, digits = 2) =>
  number.toLocaleString('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

export default function UjiCoba() {
  const [params, setParams] = useState(DEFAULTS)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [dataPropelan, setDataPropelan] = useState(bacaDataPropelan)
  const [modules, setModules] = useState([])
  const [selectedModule, setSelectedModule] = useState('')
  const [showResult, setShowResult] = useState(false)

  const [showPopup, setShowPopup] = useState(false)

  // penanda supaya satu simulasi hanya tersimpan satu kali ke riwayat
  const sudahDisimpan = useRef(false)

  // Model sederhana: r = a × P^n.
  // Koefisien harus sesuai satuan dan model propelan yang digunakan.
  const burnRate =
    params.coefficient * Math.pow(params.pressure, params.exponent)

  // Faktor perlambatan visual agar pembakaran mudah diamati.
  const visualTime = elapsed / 6.8
  const consumed = Math.min(params.web, burnRate * visualTime)
  const remaining = Math.max(0, params.web - consumed)
  const progress = params.web > 0 ? consumed / params.web : 0
  const batas = dataPropelan.batas

  const ambilBatas = (kode, jenis) =>
    batas[kode]?.[jenis] ?? DEFAULTS[
      { a: 'coefficient', n: 'exponent', rho: 'density',
        pc: 'pressure', ab: 'area', wb: 'web' }[kode]
    ]

  useEffect(() => {
    if (!running) return undefined

    const timer = window.setInterval(() => {
      setElapsed((previous) => {
        const next = previous + 0.1
        if (next / 6.8 * burnRate >= params.web) {
          window.clearInterval(timer)
          setRunning(false)
          return (params.web / burnRate) * 6.8
        }
        return next
      })
    }, 100)

    return () => window.clearInterval(timer)
  }, [running, burnRate, params.web])

  useEffect(() => {
    async function loadModules() {
      try {
        const response = await fetch('http://localhost:3000/api/modul')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Gagal mengambil data modul.')
        }

        const activeModules = data.filter((item) => {
          const status = item.status

          return (
            status === true ||
            status === 1 ||
            ['aktif', 'active'].includes(String(status).toLowerCase())
          )
        })

        setModules(activeModules)

        const defaultModule =
          activeModules.find(
            (item) =>
              (item.nama ?? item.name ?? '').toLowerCase() === 'laju bakar'
          ) || activeModules[0]

        setSelectedModule(
          defaultModule ? String(defaultModule.id ?? defaultModule._id) : ''
        )
      } catch (error) {
        console.error('Gagal memuat modul:', error)
      }
    }

    loadModules()
  }, [])      

  useEffect(() => {
    const perbaruiData = () => {
      setDataPropelan(bacaDataPropelan())
    }

    window.addEventListener('storage', perbaruiData)
    window.addEventListener('focus', perbaruiData)
    window.addEventListener('vlab-propelan-updated', perbaruiData)

    return () => {
      window.removeEventListener('storage', perbaruiData)
      window.removeEventListener('focus', perbaruiData)
      window.removeEventListener('vlab-propelan-updated', perbaruiData)
    }
  }, [])


  useEffect(() => {
    const nilai = dataPropelan.params[params.propellant]

    if (!nilai) return

    setParams((previous) => ({
      ...previous,
      coefficient: nilai.a ?? previous.coefficient,
      exponent: nilai.n ?? previous.exponent,
      density: nilai.rho ?? previous.density,
      pressure: nilai.pc ?? previous.pressure,
      area: nilai.ab ?? previous.area,
      web: nilai.wb ?? previous.web,
    }))
  }, [dataPropelan])

  // simpan ke riwayat (dibaca halaman admin "Hasil Simulasi")
  // begitu pembakaran selesai sampai propelan habis.
  useEffect(() => {
  const selesai = !running && elapsed > 0 && progress >= 0.999;

  if (!selesai) return;

  // Tampilkan popup secara otomatis
  setShowPopup(true);

  // Simpan hasil hanya satu kali
  if (sudahDisimpan.current) return;

  sudahDisimpan.current = true;

  simpanHasilSimulasi({
    modul: 'Laju Bakar',
    jenis: params.propellant,
    a: params.coefficient,
    n: params.exponent,
    rho: params.density,
    pc: params.pressure,
    ab: params.area,
    wb: params.web,
    hasil: burnRate,
  });
}, [running, elapsed, progress, params, burnRate]);
  function updateParam(name, value) {
    setParams((previous) => ({
      ...previous,
      [name]: Number(value),
    }))
  }

  function startSimulation() {
    if (remaining <= 0) return

    sudahDisimpan.current = false
    setShowResult(false)
    setShowPopup(false)
    setRunning(true)
  }

  function resetSimulation() {
    sudahDisimpan.current = false // BARU
    setRunning(false)
    setElapsed(0)
    setShowResult(false)
    setShowPopup(false);
  }

  const dataHasilSimulasi = {
    jenisPropelan: params.propellant,
    koefisien: params.coefficient,
    eksponenTekanan: params.exponent,
    massaJenis: `${format(params.density, 0)} kg/m³`,
    tekanan: `${format(params.pressure, 1)} MPa`,
    luasPermukaanBakar: `${format(params.area, 0)} cm²`,
    tebalPropelan: `${format(params.web, 1)} mm`,
    waktuPembakaran: `${format(elapsed, 3)} s`,
    lajuBakar: `${format(burnRate, 2)} mm/s`,
    progresPembakaran: `${format(progress * 100, 1)}%`
  }

  return (
    <div className="uji-page">
      <Navbar />

      <main className="uji-main">
        <div className="module-select-wrap">
        <Select
          size="small"
          value={selectedModule}
          onChange={(event) => setSelectedModule(event.target.value)}
          className="module-select"
          aria-label="Pilih modul simulasi"
          displayEmpty
          MenuProps={{
            PaperProps: {
              className: 'module-menu-paper',
            },
          }}
        >
          {modules.length > 0 ? (
            modules.map((item) => (
              <MenuItem
                key={item.id ?? item._id}
                value={String(item.id ?? item._id)}
              >
                Modul {item.nama ?? item.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="" disabled>
              Belum ada modul aktif
            </MenuItem>
          )}
        </Select>
      </div>

        <section className="parameter-section">
          <h2><span>⚙</span> PARAMETER PROPELAN</h2>
          <p className="section-subtitle">Jenis propelan</p>

          <div className="propellant-options">
          {dataPropelan.types.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`propellant-chip ${
                params.propellant === item.name ? 'active' : ''
              }`}
              onClick={() => {
                const nilai = dataPropelan.params[item.name] || {}

                setParams((previous) => ({
                  ...previous,
                  propellant: item.name,
                  coefficient: nilai.a ?? previous.coefficient,
                  exponent: nilai.n ?? previous.exponent,
                  density: nilai.rho ?? previous.density,
                  pressure: nilai.pc ?? previous.pressure,
                  area: nilai.ab ?? previous.area,
                  web: nilai.wb ?? previous.web,
                }))
              }}
              disabled={running}
              aria-pressed={params.propellant === item.name}
            >
              {item.name}
            </button>
          ))}
        </div>

          <div className="parameter-list">
        <Parameter
          label="Koefisien laju bakar (a)"
          value={params.coefficient}
          display={format(params.coefficient)}
          description="Koefisien dalam model laju bakar."
          min={ambilBatas('a', 'min')}
          max={ambilBatas('a', 'max')}
          step="0.1"
          onChange={(value) => updateParam('coefficient', value)}
          disabled={running}
        />

        <Parameter
          label="Eksponen tekanan (n)"
          value={params.exponent}
          display={format(params.exponent, 3)}
          description="Menentukan pengaruh tekanan pada model."
          min={ambilBatas('n', 'min')}
          max={ambilBatas('n', 'max')}
          step="0.01"
          onChange={(value) => updateParam('exponent', value)}
          disabled={running}
        />

        <Parameter
          label="Massa jenis (ρ)"
          value={params.density}
          display={`${format(params.density, 0)} kg/m³`}
          description="Massa jenis propelan yang digunakan."
          min={ambilBatas('rho', 'min')}
          max={ambilBatas('rho', 'max')}
          step="50"
          onChange={(value) => updateParam('density', value)}
          disabled={running}
        />
      </div>
      </section>

      <section className="condition-section">
        <h2>Kondisi Pembakaran</h2>

        <div className="parameter-list">
          <Parameter
            label="Tekanan ruang bakar (Pc)"
            value={params.pressure}
            display={`${format(params.pressure, 1)} MPa`}
            description="Tekanan yang digunakan dalam model."
            min={ambilBatas('pc', 'min')}
            max={ambilBatas('pc', 'max')}
            step="0.1"
            onChange={(value) => updateParam('pressure', value)}
            disabled={running}
          />

          <Parameter
            label="Luas permukaan bakar (Ab)"
            value={params.area}
            display={`${format(params.area, 0)} cm²`}
            description="Luas permukaan pembakaran propelan."
            min={ambilBatas('ab', 'min')}
            max={ambilBatas('ab', 'max')}
            step="10"
            onChange={(value) => updateParam('area', value)}
            disabled={running}
          />

          <Parameter
            label="Tebal propelan (Wb)"
            value={params.web}
            display={`${format(params.web, 1)} mm`}
            description="Jarak pembakaran yang dimodelkan."
            min={ambilBatas('wb', 'min')}
            max={ambilBatas('wb', 'max')}
            step="0.5"
            onChange={(value) => updateParam('web', value)}
            disabled={running}
          />
          </div>
        </section>

        <div className="simulation-actions">
          <button
            className="btn-start"
            onClick={startSimulation}
            disabled={running || remaining <= 0}
          >
            {running ? 'Simulasi berjalan...' : 'Jalankan simulasi'}
          </button>
          <button className="btn-reset" onClick={resetSimulation}>
            Reset
          </button>
          <button
            className="btn-result"
            onClick={() => {
              if (!running && elapsed > 0 && progress >= 0.999) {
                setShowPopup(true)
              }
            }}
            disabled={running || progress < 0.999}
          >
            Lihat hasil
          </button>
        </div>

        <section className="burn-section">
          <h2><span>✦</span> ANIMASI PEMBAKARAN</h2>

          <div className="burn-stage">
            <div className="burn-label">
              {running
                ? 'Simulasi sedang berjalan'
                : remaining <= 0
                  ? 'Simulasi selesai'
                  : elapsed > 0
                    ? 'Simulasi dijeda'
                    : 'Propelan siap disimulasikan'}
            </div>

            <div
              className={`propellant-visual ${running ? 'is-burning' : ''}`}
              style={{
                '--burn-progress': progress,
                '--burn-percent': `${progress * 100}%`,
                '--burn-offset': `${progress * 130}px`,
              }}
              aria-label={`Visualisasi pembakaran propelan, ${format(remaining)} mm tersisa`}
              role="img"
            >
              <div className="propellant-body">
                <div className="propellant-core" />
                <div className="burned-section" />
                <div className="burn-front" />

                <div className="ember ember-one" />
                <div className="ember ember-two" />
                <div className="ember ember-three" />
              </div>

              <div className="burn-glow" />
              <div className="burn-ash ash-one" />
              <div className="burn-ash ash-two" />
            </div>

            <div className="burn-caption">
              <span>0%</span>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span>{format(progress * 100, 0)}%</span>
            </div>
          </div>

          <div className="simulation-stats">
            <div className="stat-card">
              <h3>Waktu</h3>
              <p>{format(elapsed, 3)} s</p>
            </div>
            <div className="stat-card">
              <h3>Propelan tersisa</h3>
              <p className="remaining-value">
                {format(remaining, 2)} mm
              </p>
            </div>
            <div className="stat-card">
              <h3>Laju bakar</h3>
              <p>{format(burnRate, 2)} mm/s</p>
            </div>
          </div>

          <p className="simulation-note">
            Visualisasi diperlambat agar proses pembakaran mudah diamati.
            Waktu animasi berbeda dari waktu fisik sebenarnya.
          </p>
        </section>

        {showResult && (
          <section className="result-panel">
            <h2>Hasil Simulasi</h2>
            <p>Jenis propelan: <strong>{params.propellant}</strong></p>
            <p>Waktu simulasi: <strong>{format(elapsed, 3)} s</strong></p>
            <p>Propelan tersisa: <strong>{format(remaining, 2)} mm</strong></p>
            <p>Laju bakar model: <strong>{format(burnRate, 2)} mm/s</strong></p>
            <p>Progres pembakaran: <strong>{format(progress * 100, 1)}%</strong></p>
            <button
              className="btn-result"
              onClick={() => {
                const text = [
                  'HASIL SIMULASI V-LABVERSE',
                  `Propelan: ${params.propellant}`,
                  `Waktu: ${format(elapsed, 3)} s`,
                  `Propelan tersisa: ${format(remaining, 2)} mm`,
                  `Laju bakar model: ${format(burnRate, 2)} mm/s`,
                  `Progres: ${format(progress * 100, 1)}%`,
                ].join('\n')
                const blob = new Blob([text], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = 'hasil-simulasi.txt'
                link.click()
                URL.revokeObjectURL(url)
              }}
            >
              Unduh hasil
            </button>
          </section>
        )}
        <PopUpHasilSimulasi
          open={showPopup}
          onClose={() => setShowPopup(false)}
          hasilSimulasi={dataHasilSimulasi}
        />
      </main>
    </div>
  )
}

  function Parameter({
    label,
    value,
    display,
    description,
    min,
    max,
    step,
    onChange,
    disabled,
  }) {
    return (
      <div className="parameter-item">
        <div className="parameter-heading">
          <label>{label}</label>
          <span>{display}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-label={label}
        />
        <p>{description}</p>
      </div>
    )
  }