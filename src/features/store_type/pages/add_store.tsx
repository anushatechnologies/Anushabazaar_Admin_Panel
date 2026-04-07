import { useState } from 'react';
import { toast } from '../../../components/toast/ToastContainer';
import { StoreRequest, StoreType } from '../api/storeapi';

type Props = {
  initialData?: StoreType | null;
  onSave: (data: StoreRequest, imageFile?: File) => void;
  onClose: () => void;
};

export default function AddStoreType({ initialData, onSave, onClose }: Props) {
  const [name, setName] = useState(initialData?.name || '');
  const [label, setLabel] = useState(initialData?.label || '');
  const [displayOrder, setDisplayOrder] = useState(initialData?.displayOrder ?? 1);
  const [active, setActive] = useState(initialData?.active ?? true);
  const [address, setAddress] = useState(initialData?.address || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [pincode, setPincode] = useState(initialData?.pincode || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [priceRange, setPriceRange] = useState(initialData?.priceRange || '');
  const [timings, setTimings] = useState(initialData?.timings || '');
  const [announcement, setAnnouncement] = useState(initialData?.announcement || '');
  const [delivery, setDelivery] = useState(initialData?.delivery || '');
  const [packageCost, setPackageCost] = useState(initialData?.packageCost || '');
  const [rating, setRating] = useState<number | ''>(initialData?.rating ?? '');
  const [preferredOrder, setPreferredOrder] = useState(initialData?.preferredOrder ?? 0);
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialData?.imageUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (Number(displayOrder) < 0 || Number(preferredOrder) < 0) {
      toast.error('Display order and preferred order cannot be negative');
      return;
    }
    if (!initialData && !imageFile) {
      toast.error('Image is required');
      return;
    }

    onSave(
      {
        name: name.trim(),
        label: label.trim() || undefined,
        displayOrder: Number(displayOrder),
        active,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        pincode: pincode.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        priceRange: priceRange.trim() || undefined,
        timings: timings.trim() || undefined,
        announcement: announcement.trim() || undefined,
        delivery: delivery.trim() || undefined,
        packageCost: packageCost.trim() || undefined,
        rating: rating !== '' ? Number(rating) : undefined,
        preferredOrder: Number(preferredOrder),
      },
      imageFile || undefined,
    );
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-color)',
    borderColor: 'var(--border-soft)',
  };
  const inputClass =
    'w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-indigo-500';
  const sectionTitleClass = 'text-sm font-semibold uppercase tracking-[0.16em] opacity-65';
  const formTitle = initialData ? 'Edit Store Type' : 'Add Store Type';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-3 py-6 backdrop-blur-sm sm:items-center sm:px-6 sm:py-8">
      <div
        className="flex max-h-[92vh] w-[min(980px,100%)] flex-col overflow-hidden rounded-3xl border shadow-2xl"
        style={{
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-color)',
          borderColor: 'var(--border-soft)',
        }}
      >
        <div className="border-b px-6 py-5 sm:px-8" style={{ borderColor: 'var(--border-soft)' }}>
          <h2 className="text-2xl font-semibold">{formTitle}</h2>
          <p className="mt-1 text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
            Keep the card layout balanced by filling the main customer-facing details here. The save
            button will create or update the store type immediately.
          </p>
        </div>

        <div className="space-y-8 overflow-y-auto px-6 py-6 sm:px-8">
          <div className="space-y-4">
            <p className={sectionTitleClass}>Basic details</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium opacity-75">Name *</label>
                <input
                  placeholder="Store name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium opacity-75">Label</label>
                <input
                  placeholder="Short label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium opacity-75">Phone Number</label>
                <input
                  placeholder="+91XXXXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium opacity-75">Address</label>
                <input
                  placeholder="Street address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium opacity-75">City</label>
                <input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium opacity-75">Pincode</label>
                <input
                  placeholder="500001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className={sectionTitleClass}>Store settings</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium opacity-75">Timings</label>
                <input
                  placeholder="9 AM - 10 PM"
                  value={timings}
                  onChange={(e) => setTimings(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium opacity-75">Price Range</label>
                <input
                  placeholder="Rs 100 - Rs 500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium opacity-75">Delivery Info</label>
                <input
                  placeholder="Free above Rs 299"
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium opacity-75">Package Cost</label>
                <input
                  placeholder="Rs 10"
                  value={packageCost}
                  onChange={(e) => setPackageCost(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium opacity-75">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium opacity-75">Preferred Order</label>
                <input
                  type="number"
                  value={preferredOrder}
                  onChange={(e) => setPreferredOrder(Number(e.target.value))}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium opacity-75">Rating (0-5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="4.5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value === '' ? '' : Number(e.target.value))}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div
                className="flex items-center justify-between rounded-2xl border px-4 py-3 md:col-span-2"
                style={inputStyle}
              >
                <div>
                  <p className="text-sm font-medium">Active status</p>
                  <p className="text-xs opacity-65">
                    Inactive store types stay saved but won't show as active in the list.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className="flex h-8 w-16 items-center rounded-full p-1 transition-colors"
                  style={{ backgroundColor: active ? '#2563eb' : 'var(--border-soft)' }}
                >
                  <div
                    className={`h-6 w-6 rounded-full bg-white shadow-md transition ${active ? 'translate-x-8' : ''}`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className={sectionTitleClass}>Announcement and media</p>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_280px]">
              <div>
                <label className="mb-2 block text-sm font-medium opacity-75">Announcement</label>
                <textarea
                  placeholder="Store announcement or notice..."
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border p-4 outline-none transition focus:ring-2 focus:ring-indigo-500"
                  style={inputStyle}
                />
              </div>

              <div className="space-y-3">
                <label
                  className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 text-center transition hover:opacity-90"
                  style={{ borderColor: '#2563eb' }}
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
                  <p className="text-sm font-semibold" style={{ color: '#2563eb' }}>
                    {imagePreview ? 'Change store image' : 'Upload store image *'}
                  </p>
                  <p className="mt-2 text-xs opacity-60" style={{ color: 'var(--text-color)' }}>
                    Recommended: square cover image with good contrast.
                  </p>
                </label>

                {imagePreview && (
                  <div
                    className="rounded-2xl border p-3"
                    style={{ borderColor: 'var(--border-soft)' }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-40 w-full rounded-xl object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col-reverse gap-3 border-t px-6 py-5 sm:flex-row sm:justify-end sm:px-8"
          style={{ borderColor: 'var(--border-soft)' }}
        >
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border px-6 py-3 text-sm font-semibold transition hover:opacity-80"
            style={{ borderColor: 'var(--border-soft)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:opacity-95"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 16px 30px rgba(37, 99, 235, 0.22)',
            }}
          >
            {initialData ? 'Update Store Type' : 'Create Store Type'}
          </button>
        </div>
      </div>
    </div>
  );
}
