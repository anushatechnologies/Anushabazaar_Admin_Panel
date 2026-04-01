import { useState, useEffect } from 'react';
import { toast } from '../../../components/toast/ToastContainer';
import { fetchSubStores as fetchMainStores, SubStore as MainStore } from '../../store/api/subStoreApi';

type Props = {
  initialData?: any;
  onSave: (data: any, imageFile?: File) => void;
  onClose: () => void;
};

export default function AddStoreType({ initialData, onSave, onClose }: Props) {
  const [name, setName] = useState(initialData?.name || '');
  const [label, setLabel] = useState(initialData?.label || '');
  const [displayOrder, setDisplayOrder] = useState(initialData?.displayOrder || 1);
  const [active, setActive] = useState(initialData?.active ?? true);
  const [store1Id, setStore1Id] = useState<number>(initialData?.store1Id || '');
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialData?.image);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [mainStores, setMainStores] = useState<MainStore[]>([]);
  const [loadingMainStores, setLoadingMainStores] = useState(false);

  useEffect(() => {
    const loadMainStores = async () => {
      setLoadingMainStores(true);
      try {
        const data: any = await fetchMainStores(undefined, 0, 100);
        console.log('Main stores API response:', data); // 👈 Check this in console
        
        const storesArray = Array.isArray(data) ? data : data.content || [];
        if (storesArray.length > 0) {
          setMainStores(storesArray);
        } else {
          console.error('Main stores API did not return an array or content:', data);
          setMainStores([]);
        }
      } catch (error: any) {
        toast.error('Failed to load main stores: ' + error.message);
        setMainStores([]);
      } finally {
        setLoadingMainStores(false);
      }
    };
    loadMainStores();
  }, []);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!store1Id) {
      toast.error('Please select a main store');
      return;
    }
    onSave(
      {
        name,
        label,
        displayOrder,
        active,
        store1Id,
      },
      imageFile || undefined,
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="rounded-2xl shadow-2xl w-[650px] p-8 border"
        style={{
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-color)',
          borderColor: 'var(--border-soft)',
        }}
      >
        <h2
          className="text-2xl font-semibold mb-6 border-b pb-4"
          style={{ borderColor: 'var(--border-soft)' }}
        >
          {initialData ? 'Edit Store Type' : 'Add Store Type'}
        </h2>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <input
            placeholder="Name*"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            style={{
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              borderColor: 'var(--border-soft)',
            }}
          />

          <input
            placeholder="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            style={{
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              borderColor: 'var(--border-soft)',
            }}
          />

          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className="border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            style={{
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              borderColor: 'var(--border-soft)',
            }}
          />

          <div className="flex items-center justify-between pl-2">
            <span className="opacity-80 font-medium">Active</span>
            <button
              onClick={() => setActive(!active)}
              className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors`}
              style={{ backgroundColor: active ? 'var(--highlight-color)' : 'var(--border-soft)' }}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${active ? 'translate-x-7' : ''
                  }`}
              />
            </button>
          </div>

          {/* Main Store dropdown with safe map */}
          <select
            value={store1Id}
            onChange={(e) => setStore1Id(Number(e.target.value))}
            className="border rounded-lg p-3 col-span-2 outline-none focus:ring-2 focus:ring-indigo-500"
            style={{
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              borderColor: 'var(--border-soft)',
            }}
            disabled={loadingMainStores}
          >
            <option value="">Select Main Store *</option>
            {mainStores.map((ms) => (
              <option key={ms.id} value={ms.id}>
                {ms.name}
              </option>
            ))}
          </select>
        </div>

        <label
          className="block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition hover:opacity-80 mb-4"
          style={{ borderColor: 'var(--highlight-color)' }}
        >
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }
            }}
          />
          <p className="font-medium" style={{ color: 'var(--highlight-color)' }}>
            Click to Upload Image
          </p>
        </label>

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-lg border mb-6"
          />
        )}

        <div
          className="flex justify-end gap-4 mt-6 pt-4 border-t"
          style={{ borderColor: 'var(--border-soft)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg transition hover:opacity-75"
            style={{ borderColor: 'var(--border-soft)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-white rounded-lg shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: 'var(--highlight-color)' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
