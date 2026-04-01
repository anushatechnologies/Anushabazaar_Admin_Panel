import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus, Pencil, Trash2, X, Eye } from 'lucide-react';
import ReusableTable from '../../../components/common/ReusableTable';
import ConfirmDialog from '../../../components/ConfirmDialog';

type DiscountType = 'Amount' | 'Percent';

type Discount = {
  id: number;
  title: string;
  category: string;
  discountType: DiscountType;
  amount: number;
  maxAmount?: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: boolean;
  images: string[];
  videos: string[];
  products: string[];
};

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Meat and Fish', 'Dessert'];

const productOptions = [
  'Chicken Burger',
  'Veg Burger',
  'Pizza',
  'Pasta',
  'Fried Rice',
  'Noodles',
  'Coffee',
  'Ice Cream',
];

export default function DiscountPage() {
  const [viewer, setViewer] = useState<Discount | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [search, setSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategory, setShowCategory] = useState(false);
  const [error, setError] = useState('');
  const [productInput, setProductInput] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const emptyForm: Discount = {
    id: 0,
    title: '',
    category: '',
    discountType: 'Percent',
    amount: 0,
    maxAmount: undefined,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    status: true,
    images: [],
    videos: [],
    products: [],
  };

  const [form, setForm] = useState<Discount>(emptyForm);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  const filtered = useMemo(
    () => discounts.filter((d) => d.title.toLowerCase().includes(search.toLowerCase())),
    [search, discounts],
  );

  const categorySuggestions = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categorySearch]);

  const filteredProducts = useMemo(() => {
    if (!productInput) return productOptions;
    return productOptions.filter((p) => p.toLowerCase().includes(productInput.toLowerCase()));
  }, [productInput]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
    setCategorySearch('');
    setError('');
  };

  const validateDates = () => {
    if (!form.startDate || !form.endDate) return true;
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('Expire date must be after start date');
      return false;
    }
    setError('');
    return true;
  };

  const handleFiles = (files: FileList | null, type: 'images' | 'videos') => {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, [type]: [...prev[type], ...urls] }));
  };

  const removeMedia = (type: 'images' | 'videos', index: number) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const submit = () => {
    if (!form.title || !form.category || !form.amount) {
      toast.error('Required fields missing');
      return;
    }

    if (!validateDates()) return;

    if (editing) {
      setDiscounts((prev) => prev.map((d) => (d.id === editing.id ? { ...form } : d)));
    } else {
      setDiscounts((prev) => [...prev, { ...form, id: Date.now() }]);
    }

    resetForm();
  };

  const startEdit = (d: Discount) => {
    setEditing(d);
    setForm({ ...d });
    setShowForm(true);
  };

  const remove = (id: number) => {
    setDiscounts((p) => p.filter((d) => d.id !== id));
  };

  const toggleStatus = (id: number) => {
    setDiscounts((p) => p.map((d) => (d.id === id ? { ...d, status: !d.status } : d)));
  };

  return (
    <div className="min-h-screen p-10 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Discount</h1>

        <button
          onClick={() => {
            setEditing(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={18} /> Add New Discount
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-[var(--card-bg)] rounded-2xl shadow">
        <div className="p-4 flex justify-between items-center border-b border-[var(--border-soft)]">
          <h2 className="font-semibold text-indigo-500">Discount List</h2>

          <div className="flex items-center border border-[var(--border-soft)] rounded-lg px-2 bg-transparent">
            <Search size={16} />
            <input
              placeholder="Search by title"
              className="p-1 outline-none bg-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

<ReusableTable
          columns={[
            { header: 'SL', key: 'sl', render: (_: Discount, idx?: number) => (idx ?? 0) + 1 },
            { header: 'Title', key: 'title' },
            { header: 'Type', key: 'discountType' },
            { header: 'Category', key: 'category' },
            { header: 'Amount', key: 'amount' },
            {
              header: 'Status',
              key: 'status',
              render: (d: Discount) => (
                <button
                  onClick={() => toggleStatus(d.id)}
                  className={`px-3 py-1 rounded-full text-white text-xs ${
                    d.status ? 'bg-green-600' : 'bg-gray-400'
                  }`}
                >
                  {d.status ? 'Active' : 'Inactive'}
                </button>
              ),
            },
            {
              header: 'Media',
              key: 'images',
              render: (d: Discount) =>
                d.images[0] ? (
                  <img src={d.images[0]} className="w-10 h-10 object-cover rounded" />
                ) : (
                  '-'
                ),
            },
            {
              header: 'Action',
              key: 'action',
              render: (d: Discount) => (
                <div className="flex gap-2">
                  <button onClick={() => startEdit(d)}>
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setConfirmId(d.id)}>
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => setViewer(d)}>
                    <Eye size={16} />
                  </button>
                </div>
              ),
            },
          ]}
          data={filtered}
          loading={false}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
        />
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-[var(--bg-color)] w-[720px] rounded-2xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto border border-[var(--border-soft)]">
            <button
              className="absolute top-4 right-4 text-[var(--text-color)] opacity-70 hover:opacity-100"
              onClick={resetForm}
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-6">
              {editing ? 'Edit Discount' : 'Add Discount'}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Title"
                className="border border-[var(--border-soft)] p-2 rounded bg-transparent outline-none focus:border-[var(--highlight-color)]"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <input
                placeholder="Category"
                className="border border-[var(--border-soft)] p-2 rounded bg-transparent outline-none focus:border-[var(--highlight-color)]"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />

              <input
                type="number"
                placeholder="Amount"
                className="border border-[var(--border-soft)] p-2 rounded bg-transparent outline-none focus:border-[var(--highlight-color)]"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              />

              <div className="col-span-2 flex justify-end gap-4 mt-4">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-[var(--border-soft)] rounded hover:bg-[var(--card-bg)] transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={submit}
                  className="px-4 py-2 bg-[var(--primary-btn)] text-white rounded hover:bg-[var(--primary-btn-hover)] transition-colors shadow-[var(--btn-shadow)]"
                >
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete Discount"
        message="Are you sure you want to delete this discount?"
        onConfirm={() => {
          if (confirmId !== null) remove(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
