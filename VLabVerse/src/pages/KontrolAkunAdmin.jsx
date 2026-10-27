
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './KontrolAkunAdmin.css'

import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'

import ModalAkunAdmin from '../components/ModalAkunAdmin'
import ConfirmDelete from '../components/ConfirmDelete'
import Notification from '../components/Notification'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const ADMIN_ENDPOINT = `${API_URL}/api/admins`

function normalizeAdmin(item) {
  const rawStatus = item.status

  const isActive =
    rawStatus === true ||
    rawStatus === 1 ||
    ['aktif', 'active'].includes(String(rawStatus).toLowerCase())

  return {
    id: item.id ?? item._id,
    email: item.email ?? '',
    nama: item.nama ?? item.name ?? '',
    status: isActive ? 'aktif' : 'nonaktif',
  }
}

function KontrolAkunAdmin() {
  const navigate = useNavigate()

  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    status: 'aktif',
  })
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [notice, setNotice] = useState(null)

  const authFetch = useCallback(
    async (url, options = {}) => {
      const token = localStorage.getItem('token')

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      })

      if (response.status === 401) {
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
        throw new Error('Sesi berakhir. Silakan login kembali.')
      }

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Terjadi kesalahan.')
      }

      return data
    },
    [navigate]
  )

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError('')

      const data = await authFetch(ADMIN_ENDPOINT)
      const list = Array.isArray(data)
        ? data
        : data.admins ?? data.data ?? []

      setAdmins(list.map(normalizeAdmin))
    } catch (error) {
      setLoadError(error.message || 'Gagal memuat data admin.')
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    loadAdmins()
  }, [loadAdmins])

  const closeNotice = useCallback(() => {
    setNotice(null)
  }, [])

  const openAdd = () => {
    setForm({
      nama: '',
      email: '',
      password: '',
      status: 'aktif',
    })
    setModalError('')
    setModal({ mode: 'add', akun: null })
  }

  const openEdit = (akun) => {
    setForm({
      nama: akun.nama,
      email: akun.email,
      password: '',
      status: akun.status,
    })
    setModalError('')
    setModal({ mode: 'edit', akun })
  }

  const closeModal = () => {
    if (saving) return
    setModal(null)
    setModalError('')
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSave = async (event) => {
    event.preventDefault()

    if (!modal) return

    const isEdit = modal.mode === 'edit'
    const payload = {
      nama: form.nama,
      email: form.email,
      status: form.status,
    }

    if (form.password) {
      payload.password = form.password
    }

    try {
      setSaving(true)
      setModalError('')

      await authFetch(
        isEdit
          ? `${ADMIN_ENDPOINT}/${modal.akun.id}`
          : ADMIN_ENDPOINT,
        {
          method: isEdit ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      )

      setModal(null)

      await loadAdmins()

      setNotice({
        type: 'success',
        message: isEdit
          ? 'Akun admin berhasil diperbarui.'
          : 'Akun admin berhasil ditambahkan.',
      })
    } catch (error) {
      setModalError(error.message || 'Gagal menyimpan akun.')
    } finally {
      setSaving(false)
    }
  }

  const openDelete = (akun) => {
    setDeleteTarget(akun)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      setDeleting(true)

      await authFetch(`${ADMIN_ENDPOINT}/${deleteTarget.id}`, {
        method: 'DELETE',
      })

      setDeleteTarget(null)

      await loadAdmins()

      setNotice({
        type: 'success',
        message: 'Akun admin berhasil dihapus.',
      })
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message || 'Gagal menghapus akun.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const renderBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="5" style={{ textAlign: 'center', padding: 24 }}>
            Memuat data admin...
          </td>
        </tr>
      )
    }

    if (loadError) {
      return (
        <tr>
          <td colSpan="5" style={{ textAlign: 'center', padding: 24 }}>
            <p>{loadError}</p>
            <button type="button" onClick={loadAdmins}>
              Coba Lagi
            </button>
          </td>
        </tr>
      )
    }

    if (admins.length === 0) {
      return (
        <tr>
          <td colSpan="5" style={{ textAlign: 'center', padding: 24 }}>
            Belum ada data akun admin.
          </td>
        </tr>
      )
    }

    return admins.map((akun, index) => (
      <tr key={akun.id}>
        <td>{index + 1}</td>
        <td>{akun.email}</td>
        <td>{akun.nama}</td>
        <td>
          <span className={`status-badge ${akun.status}`}>
            {akun.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
          </span>
        </td>
        <td>
          <div className="aksi-buttons">
            <button
              type="button"
              className="btn-edit"
              onClick={() => openEdit(akun)}
              aria-label={`Edit akun ${akun.nama}`}
              title="Edit"
            >
              <EditOutlinedIcon />
            </button>

            <button
              type="button"
              className="btn-hapus"
              onClick={() => openDelete(akun)}
              aria-label={`Hapus akun ${akun.nama}`}
              title="Hapus"
            >
              <DeleteOutlineOutlinedIcon />
            </button>
          </div>
        </td>
      </tr>
    ))
  }

  return (
    <section className="akun-page">
      <h1>Dashboard Kontrol Akun Admin</h1>

      <div className="akun-toolbar">
        <button
          type="button"
          className="btn-tambah"
          onClick={openAdd}
        >
          <AddOutlinedIcon />
          <span>Tambah Akun Admin</span>
        </button>
      </div>

      <div className="akun-table-wrap">
        <table className="akun-table">
          <thead>
            <tr>
              <th className="col-no">No</th>
              <th>Email</th>
              <th>Nama</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>{renderBody()}</tbody>
        </table>
      </div>

      <ModalAkunAdmin
        open={Boolean(modal)}
        onClose={closeModal}
        onSubmit={handleSave}
        editId={modal?.mode === 'edit' ? modal.akun.id : null}
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

export default KontrolAkunAdmin