import { useEffect, useRef, useState } from 'react' // BARU: tambah useRef
import { MenuItem, Select } from '@mui/material'
import Navbar from '../components/Navbar.jsx'
import { simpanHasilSimulasi } from '../components/RiwayatSimulasi.jsx' // BARU
import './UjiCoba.css'

const DEFAULTS = {
  propellant: 'KNSB',
  coefficient: 5,
  exponent: 0.35,
  density: 1750,
  pressure: 6,
  area: 100,
  web: 12.5,
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
  const [showResult, setShowResult] = useState(false)

  // BARU: penanda supaya satu simulasi hanya tersimpan satu kali ke riwayat
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

  // BARU: simpan ke riwayat (dibaca halaman admin "Hasil Simulasi")
  // begitu pembakaran selesai sampai propelan habis.
  useEffect(() => {
    const selesai = !running && elapsed > 0 && progress >= 0.999
    if (!selesai || sudahDisimpan.current) return

    sudahDisimpan.current = true
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
    })
  }, [running, elapsed, progress, params, burnRate])

  function updateParam(name, value) {
    setParams((previous) => ({
      ...previous,
      [name]: Number(value),
    }))
  }

  function startSimulation() {
    if (remaining <= 0) return
    sudahDisimpan.current = false // BARU
    setShowResult(false)
    setRunning(true)
  }

  function resetSimulation() {
    sudahDisimpan.current = false // BARU
    setRunning(false)
    setElapsed(0)
    setShowResult(false)
  }

  return (
    <div className="uji-page">
      <Navbar />

      <main className="uji-main">
        <div className="module-select-wrap">
          <Select
            size="small"
            value="laju-bakar"
            className="module-select"
            aria-label="Pilih modul simulasi"
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '8px',
                  mt: 0.5,
                  boxShadow: '0 4px 14px rgba(23, 32, 51, 0.12)',
                  '& .MuiMenuItem-root': {
                    fontSize: '13px',
                    minHeight: '38px',
                  },
                },
              },
            }}
          >
            <MenuItem value="laju-bakar">
              Modul Laju Bakar
            </MenuItem>
          </Select>
        </div>

        <section className="parameter-section">
          <h2><span>⚙</span> PARAMETER PROPELAN</h2>
          <p className="section-subtitle">Jenis propelan</p>

          <div className="propellant-options">
            {['KNSB', 'APCP', 'Lainnya'].map((item) => (
              <button
                key={item}
                className={`propellant-chip ${
                  params.propellant === item ? 'active' : ''
                }`}
                onClick={() =>
                  setParams((previous) => ({
                    ...previous,
                    propellant: item,
                  }))
                }
                disabled={running}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="parameter-list">
            <Parameter
              label="Koefisien laju bakar (a)"
              value={params.coefficient}
              display={format(params.coefficient)}
              description="Koefisien dalam model laju bakar."
              min="0.1"
              max="10"
              step="0.1"
              onChange={(value) => updateParam('coefficient', value)}
              disabled={running}
            />

            <Parameter
              label="Eksponen tekanan (n)"
              value={params.exponent}
              display={format(params.exponent, 3)}
              description="Menentukan pengaruh tekanan pada model."
              min="0.1"
              max="1"
              step="0.01"
              onChange={(value) => updateParam('exponent', value)}
              disabled={running}
            />

            <Parameter
              label="Massa jenis (ρ)"
              value={params.density}
              display={`${format(params.density, 0)} kg/m³`}
              description="Massa jenis propelan yang digunakan."
              min="500"
              max="2500"
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
              min="0.5"
              max="10"
              step="0.1"
              onChange={(value) => updateParam('pressure', value)}
              disabled={running}
            />

            <Parameter
              label="Luas permukaan bakar (Ab)"
              value={params.area}
              display={`${format(params.area, 0)} cm²`}
              description="Luas permukaan pembakaran propelan."
              min="10"
              max="500"
              step="10"
              onChange={(value) => updateParam('area', value)}
              disabled={running}
            />

            <Parameter
              label="Tebal propelan (Wb)"
              value={params.web}
              display={`${format(params.web, 1)} mm`}
              description="Jarak pembakaran yang dimodelkan."
              min="1"
              max="30"
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
            onClick={() => setShowResult((previous) => !previous)}
          >
            {showResult ? 'Tutup hasil' : 'Lihat hasil'}
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