import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

type Notification = {
  id: number;
  title: string;
  message: string;
  date: string;
  image?: string;
};

const ITEMS_PER_PAGE = 5;

export default function App() {
  const [data, setData] = useState<Notification[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [editId, setEditId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');

  // ✅ Filtered Data (Search Working)
  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.message.toLowerCase().includes(search.toLowerCase()),
    );
  }, [data, search]);

  // ✅ Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]); // 🔥 FIXED

  // ✅ Add / Update
  const addOrUpdate = () => {
    if (!title.trim() || !message.trim() || !image) {
      toast.error('All fields are required!');
      return;
    }

    if (editId) {
      setData((prev) =>
        prev.map((item) => (item.id === editId ? { ...item, title, message, image } : item)),
      );
    } else {
      setData((prev) => [
        {
          id: Date.now(),
          title,
          message,
          date: new Date().toLocaleString(),
          image,
        },
        ...prev,
      ]);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowModal(false);
    setTitle('');
    setMessage('');
    setImage(undefined);
    setEditId(null);
  };

  const editItem = (item: Notification) => {
    setTitle(item.title);
    setMessage(item.message);
    setImage(item.image);
    setEditId(item.id);
    setShowModal(true);
  };

  const deleteItem = (id: number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div
      className="min-h-screen p-10"
      style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
            Notifications
          </h1>

          <div className="flex gap-3">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
              className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
            />

            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + Add Notification
            </button>
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-xl shadow-lg overflow-hidden"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-soft)' }}
        >
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'var(--border-soft)', color: 'var(--text-color)' }}>
              <tr>
                <th className="px-6 py-4 text-left">Title</th>
                <th className="px-6 py-4 text-left">Message</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Image</th>
                <th className="px-6 py-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentData.length === 0 && (
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

              {currentData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b"
                  style={{ borderColor: 'var(--border-soft)', color: 'var(--text-color)' }}
                >
                  <td className="px-6 py-4 font-medium">{item.title}</td>
                  <td className="px-6 py-4" style={{ opacity: 0.8 }}>
                    {item.message}
                  </td>
                  <td className="px-6 py-4" style={{ opacity: 0.6 }}>
                    {item.date}
                  </td>
                  <td className="px-6 py-4">
                    {item.image ? (
                      <img src={item.image} className="w-12 h-12 object-cover rounded-lg border" />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => editItem(item)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:opacity-80 transition"
                style={{ borderColor: 'var(--border-soft)', color: 'var(--text-color)' }}
              >
                Prev
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
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:opacity-80 transition"
                style={{ borderColor: 'var(--border-soft)', color: 'var(--text-color)' }}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
            <div
              className="p-8 rounded-xl w-[500px] shadow-2xl"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-soft)',
              }}
            >
              <h2 className="text-xl font-semibold mb-6">
                {editId ? 'Edit Notification' : 'Add Notification'}
              </h2>

              <input
                required
                placeholder="Title"
                className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  borderColor: 'var(--border-soft)',
                }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <textarea
                required
                rows={4}
                placeholder="Message"
                className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  borderColor: 'var(--border-soft)',
                }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              {/* File Upload */}
              <label
                className="block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:opacity-80 transition mb-4"
                style={{ borderColor: 'var(--highlight-color)' }}
              >
                <input
                  type="file"
                  hidden
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setImage(URL.createObjectURL(file));
                  }}
                />
                <p className="font-medium" style={{ color: 'var(--highlight-color)' }}>
                  Click to Upload Image
                </p>
              </label>

              {image && (
                <img src={image} className="w-24 h-24 object-cover rounded-lg border mb-4" />
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={addOrUpdate}
                  className="px-5 py-2 rounded-lg font-medium shadow-sm transition"
                  style={{ backgroundColor: 'var(--highlight-color)', color: '#fff' }}
                >
                  Save
                </button>
                <button
                  onClick={resetForm}
                  className="border px-5 py-2 rounded-lg transition hover:opacity-75"
                  style={{ borderColor: 'var(--border-soft)', color: 'var(--text-color)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
