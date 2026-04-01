import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type Delivery = {
  id: number;
  name: string;
  phone: string;
  regNo: string;
  pin: string;
  active: boolean;
  idProof?: string;
  idProofName?: string;
};

const AUTO_DELETE_MS = 60 * 1000;
const PAGE_SIZE = 5;

export default function App() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const pinRefs = useRef<HTMLInputElement[]>([]);
  const autoDeleteRef = useRef<number | null>(null);

  const [showPinMap, setShowPinMap] = useState<Record<number, boolean>>({});
  const [showPhoneMap, setShowPhoneMap] = useState<Record<number, boolean>>({});

  const [form, setForm] = useState({
    name: '',
    phone: '',
    regNo: '',
    pin: ['', '', '', ''],
    active: true,
    idProof: '',
    idProofName: '',
  });

  /* ================= FILTER ================= */
  const filtered = deliveries.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /* ================= HELPERS ================= */
  const maskPhone = (p: string) => (p.length > 6 ? `${p.slice(0, 3)}****${p.slice(-3)}` : p);

  const handlePinChange = (i: number, v: string) => {
    const newPin = [...form.pin];
    newPin[i] = v.replace(/[^0-9]/g, '').slice(-1);
    setForm({ ...form, pin: newPin });
    if (v && pinRefs.current[i + 1]) pinRefs.current[i + 1].focus();
  };

  const handleImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setForm({
        ...form,
        idProof: reader.result as string,
        idProofName: file.name,
      });

      if (autoDeleteRef.current) clearTimeout(autoDeleteRef.current);

      autoDeleteRef.current = window.setTimeout(() => {
        setForm((prev) => ({ ...prev, idProof: '', idProofName: '' }));
      }, AUTO_DELETE_MS);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm({
      name: '',
      phone: '',
      regNo: '',
      pin: ['', '', '', ''],
      active: true,
      idProof: '',
      idProofName: '',
    });
    setEditId(null);
  };

  /* ================= SAVE ================= */
  const saveDelivery = () => {
    if (!form.name || !form.phone || form.pin.join('').length !== 4)
      return toast.error('Fill all required fields');

    if (editId) {
      setDeliveries(
        deliveries.map((d) => (d.id === editId ? { ...d, ...form, pin: form.pin.join('') } : d)),
      );
    } else {
      setDeliveries([
        {
          id: Date.now(),
          name: form.name,
          phone: form.phone,
          regNo: form.regNo,
          pin: form.pin.join(''),
          active: form.active,
          idProof: form.idProof,
          idProofName: form.idProofName,
        },
        ...deliveries,
      ]);
    }

    resetForm();
    setShowModal(false);
  };

  const editDelivery = (d: Delivery) => {
    setShowModal(true);
    setEditId(d.id);
    setForm({
      name: d.name,
      phone: d.phone,
      regNo: d.regNo,
      pin: d.pin.split(''),
      active: d.active,
      idProof: d.idProof || '',
      idProofName: d.idProofName || '',
    });
  };

  const deleteDelivery = (id: number) => setDeliveries(deliveries.filter((d) => d.id !== id));

  useEffect(() => {
    return () => {
      if (autoDeleteRef.current) clearTimeout(autoDeleteRef.current);
    };
  }, []);

  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
            Delivery Management
          </h1>

          <div className="flex gap-4">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
              placeholder="Search delivery..."
            />

            <button
              onClick={() => setShowModal(true)}
              className="text-white px-6 py-2 rounded-lg transition hover:opacity-90 shadow-sm"
              style={{ backgroundColor: 'var(--highlight-color)' }}
            >
              + Add Delivery
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div
          className="rounded-xl shadow-lg overflow-hidden border"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-soft)' }}
        >
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'var(--border-soft)', color: 'var(--text-color)' }}>
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Phone</th>
                <th className="px-6 py-4 text-left">PIN</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10"
                    style={{ color: 'var(--text-color)', opacity: 0.6 }}
                  >
                    No Records Found
                  </td>
                </tr>
              )}

              {paginated.map((d) => (
                <tr
                  key={d.id}
                  className="border-t transition"
                  style={{ borderColor: 'var(--border-soft)', color: 'var(--text-color)' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = 'rgba(150, 150, 150, 0.05)')
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td className="px-6 py-4 font-medium">{d.name}</td>

                  <td className="px-6 py-4" style={{ opacity: 0.9 }}>
                    {showPhoneMap[d.id] ? d.phone : maskPhone(d.phone)}
                    <button
                      onClick={() =>
                        setShowPhoneMap((p) => ({
                          ...p,
                          [d.id]: !p[d.id],
                        }))
                      }
                      className="ml-2 transition hover:opacity-75"
                      style={{ color: 'var(--highlight-color)' }}
                    >
                      👁
                    </button>
                  </td>

                  <td className="px-6 py-4 font-mono">
                    {showPinMap[d.id] ? d.pin : '****'}
                    <button
                      onClick={() =>
                        setShowPinMap((p) => ({
                          ...p,
                          [d.id]: !p[d.id],
                        }))
                      }
                      className="ml-2 transition hover:opacity-75"
                      style={{ color: 'var(--highlight-color)' }}
                    >
                      👁
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    {d.active ? (
                      <span className="text-green-500 font-medium">Active</span>
                    ) : (
                      <span className="text-red-500 font-medium">Inactive</span>
                    )}
                  </td>

                  <td className="px-6 py-4 space-x-3">
                    <button
                      onClick={() => editDelivery(d)}
                      className="transition hover:opacity-75 font-medium"
                      style={{ color: 'var(--highlight-color)' }}
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteDelivery(d.id)} className="text-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="px-3 py-1 border rounded disabled:opacity-50 transition hover:opacity-80"
                style={{ borderColor: 'var(--border-soft)', color: 'var(--text-color)' }}
              >
                {'<<'}
              </button>

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50 transition hover:opacity-80"
                style={{ borderColor: 'var(--border-soft)', color: 'var(--text-color)' }}
              >
                {'<'}
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded transition`}
                  style={{
                    borderColor: 'var(--border-soft)',
                    backgroundColor:
                      currentPage === i + 1 ? 'var(--highlight-color)' : 'transparent',
                    color: currentPage === i + 1 ? '#fff' : 'var(--text-color)',
                  }}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border rounded disabled:opacity-50 transition hover:opacity-80"
                style={{ borderColor: 'var(--border-soft)', color: 'var(--text-color)' }}
              >
                {'>'}
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="px-3 py-1 border rounded disabled:opacity-50 transition hover:opacity-80"
                style={{ borderColor: 'var(--border-soft)', color: 'var(--text-color)' }}
              >
                {'>>'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div
            className="w-[600px] rounded-xl shadow-2xl p-8 relative border"
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              borderColor: 'var(--border-soft)',
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 transition hover:opacity-75"
              style={{ color: 'var(--text-color)' }}
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-6">
              {editId ? 'Edit Delivery' : 'Add Delivery'}
            </h2>

            <div className="space-y-4">
              <input
                placeholder="Full Name *"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  borderColor: 'var(--border-soft)',
                }}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                placeholder="Phone Number *"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  borderColor: 'var(--border-soft)',
                }}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <input
                placeholder="Registration No"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  borderColor: 'var(--border-soft)',
                }}
                value={form.regNo}
                onChange={(e) => setForm({ ...form, regNo: e.target.value })}
              />

              <div className="flex gap-3">
                {form.pin.map((p, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      if (el) pinRefs.current[i] = el;
                    }}
                    maxLength={1}
                    value={p}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    className="w-14 h-14 text-center text-xl border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{
                      backgroundColor: 'var(--bg-color)',
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-soft)',
                    }}
                  />
                ))}
              </div>

              <label
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:opacity-80 transition block mt-2"
                style={{ borderColor: 'var(--highlight-color)' }}
              >
                <input
                  type="file"
                  hidden
                  onChange={(e) => e.target.files && handleImage(e.target.files[0])}
                />
                <p className="font-medium" style={{ color: 'var(--highlight-color)' }}>
                  Click to Upload ID Proof
                </p>
              </label>

              {form.idProof && (
                <div className="mt-4">
                  <img
                    src={form.idProof}
                    className="w-24 h-24 rounded-lg border object-cover"
                    style={{ borderColor: 'var(--border-soft)' }}
                  />
                  <p className="text-sm mt-2" style={{ opacity: 0.8 }}>
                    {form.idProofName}
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4 justify-end">
                <button
                  onClick={saveDelivery}
                  className="text-white px-6 py-2 rounded-lg font-medium shadow-sm transition hover:opacity-90"
                  style={{ backgroundColor: 'var(--highlight-color)' }}
                >
                  {editId ? 'Update' : 'Save'}
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="border px-6 py-2 rounded-lg font-medium transition hover:opacity-80"
                  style={{ borderColor: 'var(--border-soft)', color: 'var(--text-color)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
