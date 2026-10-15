import { useCallback, useEffect, useState } from 'react'
import './ModulLab.css'

import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined'
import BubbleChartOutlinedIcon from '@mui/icons-material/BubbleChartOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'

import ConfirmDelete from '../components/ConfirmDelete'
import Notification from '../components/Notification'

const API_URL = "http://localhost:3000/api/modul";

async function requestModul(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal memproses modul.");
  }

  return data;
}

async function getModul() {
  return requestModul(API_URL);
}

async function createModul(payload) {
  return requestModul(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateModul(id, payload) {
  return requestModul(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

async function deleteModul(id) {
  return requestModul(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}


const ICON_BY_NAME = {
  'laju bakar': <RocketLaunchOutlinedIcon />,
  ftir: <ShowChartOutlinedIcon />,
  'sem-eds': <BubbleChartOutlinedIcon />,
}

function normalizeModul(item) {
  const rawStatus = item.status

  const isActive =
    rawStatus === true ||
    rawStatus === 1 ||
    ['aktif', 'active'].includes(String(rawStatus).toLowerCase())

  const nama = item.nama ?? item.name ?? ''

  return {
    id: item.id ?? item._id,
    nama,
    deskripsi: item.deskripsi ?? item.description ?? '',
    aktif: isActive,
    // sesuaikan nama field ini dengan respons backend nanti
    parameter: Number(item.jumlah_parameter ?? item.parameter ?? 0),
    grup: Number(item.jumlah_grup ?? item.grup ?? 0),
    icon: ICON_BY_NAME[nama.toLowerCase()] ?? <ScienceOutlinedIcon />,
  }
}

/* ---------- Kartu satu modul ---------- */
function ModuleCard({ modul, onKelola, onEdit, onDelete }) {
  const { nama, deskripsi, icon, aktif, parameter, grup } = modul

  const info =
    parameter > 0 ? `${parameter} Parameter • ${grup} Grup` : 'Belum ada parameter'

  return (
    <article className="module-card">
      <div className="module-main">
        <h2 className="module-title">
          {icon}
          <span>{nama}</span>
        </h2>
        <p className="module-desc">{deskripsi}</p>
      </div>

      <div className="module-meta">
        <span className={`module-badge ${aktif ? 'is-active' : 'is-inactive'}`}>
          • {aktif ? 'Aktif' : 'Nonaktif'}
        </span>

        <span className="module-info">{info}</span>

        <button type="button" className="module-manage" onClick={() => onKelola(modul)}>
          Kelola
        </button>

        <button
          type="button"
          className="icon-btn icon-btn--edit"
          onClick={() => onEdit(modul)}
          aria-label={`Edit modul ${nama}`}
        >
          <EditOutlinedIcon fontSize="small" />
        </button>

        <button
          type="button"
          className="icon-btn icon-btn--delete"
          onClick={() => onDelete(modul)}
          aria-label={`Hapus modul ${nama}`}
        >
          <DeleteOutlineIcon fontSize="small" />
        </button>
      </div>
    </article>
  )
}

/* ---------- Modal tambah / edit modul ---------- */
function ModalModul({ open, onClose, onSubmit, editId, form, onChange, saving, error }) {
  if (!open) return null

  return (
    <div className="modul-modal-backdrop" onClick={onClose}>
      <form
        className="modul-modal"
        onSubmit={onSubmit}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modul-modal-title"
      >
        <h2 id="modul-modal-title">{editId ? 'Edit Modul' : 'Tambah Modul'}</h2>

        {error && (
          <p className="modul-modal-error" role="alert">
            {error}
          </p>
        )}

        <label>
          Nama modul
          <input name="nama" value={form.nama} onChange={onChange} required />
        </label>

        <label>
          Deskripsi
          <textarea
            name="deskripsi"
            rows="3"
            value={form.deskripsi}
            onChange={onChange}
          />
        </label>

        <label>
          Status
          <select name="status" value={form.status} onChange={onChange}>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </label>

        <div className="modul-modal-actions">
          <button
            type="button"
            className="modul-modal-cancel"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </button>
          <button type="submit" className="modul-modal-save" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ---------- Halaman Daftar Modul ---------- */
function DaftarModul() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ nama: '', deskripsi: '', status: 'aktif' })
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [notice, setNotice] = useState(null)

  const loadModules = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError('')

      const list = await getModul()

      setModules(list.map(normalizeModul))
    } catch (error) {
      setLoadError(error.message || 'Gagal memuat data modul.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadModules()
  }, [loadModules])

  const closeNotice = useCallback(() => {
    setNotice(null)
  }, [])

  const openAdd = () => {
    setForm({ nama: '', deskripsi: '', status: 'aktif' })
    setModalError('')
    setModal({ mode: 'add', modul: null })
  }

  const openEdit = (modul) => {
    setForm({
      nama: modul.nama,
      deskripsi: modul.deskripsi,
      status: modul.aktif ? 'aktif' : 'nonaktif',
    })
    setModalError('')
    setModal({ mode: 'edit', modul })
  }

  const closeModal = () => {
    if (saving) return
    setModal(null)
    setModalError('')
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()

    if (!modal) return

    const isEdit = modal.mode === 'edit'

    try {
      setSaving(true)
      setModalError('')

      if (isEdit) {
        await updateModul(modal.modul.id, form)
      } else {
        await createModul(form)
      }

      setModal(null)
      await loadModules()

      setNotice({
        type: 'success',
        message: isEdit
          ? 'Modul berhasil diperbarui.'
          : 'Modul berhasil ditambahkan.',
      })
    } catch (error) {
      setModalError(error.message || 'Gagal menyimpan modul.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      setDeleting(true)

      await deleteModul(deleteTarget.id)

      setDeleteTarget(null)
      await loadModules()

      setNotice({ type: 'success', message: 'Modul berhasil dihapus.' })
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message || 'Gagal menghapus modul.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleKelola = (modul) => {
    // TODO: navigate(`/modul/${modul.id}`) ke halaman kelola parameter
    console.log('Kelola', modul.nama)
  }

  const renderList = () => {
    if (loading) {
      return <p className="modul-state">Memuat data modul...</p>
    }

    if (loadError) {
      return (
        <div className="modul-state">
          <p>{loadError}</p>
          <button type="button" onClick={loadModules}>
            Coba Lagi
          </button>
        </div>
      )
    }

    if (modules.length === 0) {
      return (
        <p className="modul-state">
          Belum ada modul. Klik "Tambah modul baru" untuk membuat modul pertama.
        </p>
      )
    }

    return modules.map((modul) => (
      <ModuleCard
        key={modul.id}
        modul={modul}
        onKelola={handleKelola}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />
    ))
  }

  return (
    <section className="modul-page">
      <header className="modul-header">
        <h1>Daftar Modul</h1>
        <p>
          Modul laboratorium yang tersedia di simulator. Setiap modul punya parameter
          dan model tersendiri. Pilih "Kelola" untuk mengaturnya.
        </p>
      </header>

      <div className="modul-list">{renderList()}</div>

      <button type="button" className="modul-add" onClick={openAdd}>
        <AddIcon fontSize="small" />
        <span>Tambah modul baru</span>
      </button>

      <ModalModul
        open={Boolean(modal)}
        onClose={closeModal}
        onSubmit={handleSave}
        editId={modal?.mode === 'edit' ? modal.modul.id : null}
        form={form}
        onChange={handleFormChange}
        saving={saving}
        error={modalError}
      />

      <ConfirmDelete
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        nama={deleteTarget?.nama || ''}
        deleting={deleting}
      />

      <Notification
        open={Boolean(notice)}
        message={notice?.message || ''}
        severity={notice?.type || 'success'}
        onClose={closeNotice}
      />
    </section>
  )
}

export default DaftarModul