import { useState } from 'react';
import { toast } from '../../../components/toast/ToastContainer';

type Props = {
  initialData?: any;
  onSave: (data: any, imageFile?: File) => void;
  onClose: () => void;
};

export default function AddForm({ initialData, onSave, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('general');

  const [form, setForm] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    priceRange: initialData?.priceRange || '',
    phoneNumber: initialData?.phoneNumber || '',
    pincode: initialData?.pincode || '',
    city: initialData?.city || '',
    announcement: initialData?.announcement || '',
    delivery: initialData?.delivery || '',
    packageCost: initialData?.packageCost || '',
    active: initialData?.active ?? true,
    rating: initialData?.rating || 0,
    preferredOrder: initialData?.preferredOrder || 0,
    timings: initialData?.timings || '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialData?.imageUrl);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!form.name || !form.phoneNumber || !form.address) {
      toast.error('Please fill required fields: Name, Phone, Address');
      return;
    }
    onSave(form, imageFile || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 overflow-y-auto backdrop-blur-sm">
      <div
        className="w-[1200px] rounded-xl shadow-2xl p-8 my-10 max-h-[95vh] overflow-y-auto border"
        style={{
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-color)',
          borderColor: 'var(--border-soft)',
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">{initialData ? 'Edit Main Store' : 'Add Main Store'}</h2>
          <button
            onClick={onClose}
            className="text-xl transition hover:opacity-75"
            style={{ color: 'var(--text-color)' }}
          >
            ✕
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          {['general', 'delivery', 'geo'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition`}
              style={{
                backgroundColor:
                  activeTab === tab ? 'var(--highlight-color)' : 'var(--border-soft)',
                color: activeTab === tab ? '#fff' : 'var(--text-color)',
              }}
            >
              {tab === 'geo' ? 'Geo-Fence' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'general' && (
          <div className="grid grid-cols-2 gap-6">
            <input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Main Store Name *"
              className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
            />

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => handleChange('active', e.target.checked)}
              />
              Active
            </label>

            <input
              value={form.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="Phone Number *"
              className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
            />

            <input
              value={form.priceRange}
              onChange={(e) => handleChange('priceRange', e.target.value)}
              placeholder="Price Range (e.g., $$, 1000-5000)"
              className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
            />

            <textarea
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Address *"
              className="border p-3 rounded-lg col-span-2 outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
            />

            <input
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="City"
              className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
            />

            <input
              value={form.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              placeholder="Pincode"
              className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
            />

            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating}
              onChange={(e) => handleChange('rating', Number(e.target.value))}
              placeholder="Rating (0-5)"
              className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
            />

            <input
              type="number"
              value={form.preferredOrder}
              onChange={(e) => handleChange('preferredOrder', Number(e.target.value))}
              placeholder="Preferred Order (integer)"
              className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
            />

            <input
              value={form.timings}
              onChange={(e) => handleChange('timings', e.target.value)}
              placeholder="Timings (e.g., 9:00 AM - 9:00 PM)"
              className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
            />

            <textarea
              value={form.announcement}
              onChange={(e) => handleChange('announcement', e.target.value)}
              placeholder="Announcement (store note)"
              className="border p-3 rounded-lg col-span-2 outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
            />

            <div
              className="col-span-2 border-2 border-dashed p-6 text-center rounded-lg cursor-pointer transition hover:opacity-80 mt-2"
              style={{ borderColor: 'var(--highlight-color)' }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <p className="font-medium" style={{ color: 'var(--highlight-color)' }}>
                  Click to Upload Main Store Image
                </p>
              </label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-4 w-32 h-32 object-cover rounded-lg mx-auto"
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="grid grid-cols-2 gap-6">
            <input
              value={form.delivery}
              onChange={(e) => handleChange('delivery', e.target.value)}
              placeholder="Delivery (e.g., free, paid)"
              className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
            />

            <input
              value={form.packageCost}
              onChange={(e) => handleChange('packageCost', e.target.value)}
              placeholder="Package Cost (e.g., 5000)"
              className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
            />
          </div>
        )}

        {activeTab === 'geo' && (
          <div
            className="h-[400px] border rounded-lg flex items-center justify-center font-medium"
            style={{
              backgroundColor: 'var(--bg-color)',
              borderColor: 'var(--border-soft)',
              color: 'var(--text-color)',
            }}
          >
            Map / Geo‑fence integration will go here
          </div>
        )}

        <div
          className="flex justify-end gap-4 mt-8 border-t pt-6"
          style={{ borderColor: 'var(--border-soft)' }}
        >
          <button
            onClick={onClose}
            className="border px-6 py-2 rounded-lg transition hover:opacity-75"
            style={{ borderColor: 'var(--border-soft)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="text-white px-6 py-2 rounded-lg shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: 'var(--highlight-color)' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
