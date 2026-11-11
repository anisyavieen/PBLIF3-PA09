
function ModalModul({
  open,
  onClose,
  onSubmit,
  editId,
  form,
  onChange,
  saving,
  error,
}) {
  if (!open) return null;

  return (
    <div
      className="modul-modal-backdrop"
      onClick={onClose}
    >
      <form
        className="modul-modal"
        onSubmit={onSubmit}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modul-modal-title"
      >
        <h2 id="modul-modal-title">
          {editId ? 'Edit Modul' : 'Tambah Modul'}
        </h2>

        {error && (
          <p className="modul-modal-error" role="alert">
            {error}
          </p>
        )}

        <label>
          Nama modul
          <input
            name="nama"
            value={form.nama}
            onChange={onChange}
            required
          />
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
          <select
            name="status"
            value={form.status}
            onChange={onChange}
          >
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

          <button
            type="submit"
            className="modul-modal-save"
            disabled={saving}
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ModalModul;
