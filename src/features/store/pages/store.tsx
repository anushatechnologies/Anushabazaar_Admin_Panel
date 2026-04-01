import { useState, useEffect } from 'react';
import { toast } from '../../../components/toast/ToastContainer';
import AddForm from './add_store';
import {
  useGetSubStoresQuery,
  useCreateSubStoreMutation,
  useUpdateSubStoreMutation,
  useDeleteSubStoreMutation,
  SubStoreRequest,
} from '../api/subStoreApi';
import ReusableTable from '../../../components/common/ReusableTable';
import ConfirmDialog from '../../../components/ConfirmDialog';

const ITEMS_PER_PAGE = 5;

type StoreType = {
  id: number;
  name: string;
  address: string;
  priceRange: string;
  phoneNumber: string;
  pincode: string;
  city: string;
  announcement: string;
  delivery: string;
  packageCost: string;
  active: boolean;
  rating: number;
  image?: string;
  preferredOrder: number;
  timings: string;
};

export default function StoreList() {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<StoreType | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading: loading, error } = useGetSubStoresQuery({
    name: debouncedSearch || undefined,
    page: 0,
    size: 100,
  });
  const [createSubStore, { isLoading: isCreating }] = useCreateSubStoreMutation();
  const [updateSubStore, { isLoading: isUpdating }] = useUpdateSubStoreMutation();
  const [deleteSubStore, { isLoading: isDeleting }] = useDeleteSubStoreMutation();

  useEffect(() => {
    if (error) {
      toast.error('Failed to load main stores');
    }
  }, [error]);

  const stores: StoreType[] = (((data as any)?.content || data || []) as any[]).map((item: any) => ({
    ...item,
    image: item.imageUrl,
  }));

  const totalPages = Math.max(1, Math.ceil(stores.length / ITEMS_PER_PAGE));
  const paginatedData = stores.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleCreate = async (storeData: SubStoreRequest, imageFile?: File) => {
    try {
      await createSubStore({ data: storeData, image: imageFile }).unwrap();
      setShowModal(false);
      setEditData(null);
      toast.success('Main store created successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || error.message || 'Failed to create main store');
    }
  };

  const handleUpdate = async (id: number, storeData: SubStoreRequest, imageFile?: File) => {
    try {
      await updateSubStore({ id, data: storeData, image: imageFile }).unwrap();
      setShowModal(false);
      setEditData(null);
      toast.success('Main store updated successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || error.message || 'Failed to update main store');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSubStore(id).unwrap();
      setConfirmId(null);
      toast.success('Main store deleted successfully');
      if (stores.length % ITEMS_PER_PAGE === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || error.message || 'Failed to delete main store');
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
            Main Store
          </h1>
          <div className="flex gap-3">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search main stores..."
              className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-soft)',
              }}
            />
            <button
              onClick={() => {
                setEditData(null);
                setShowModal(true);
              }}
              className="text-white px-6 py-2 rounded-lg shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: 'var(--highlight-color)' }}
            >
              + Add Main Store
            </button>
          </div>
        </div>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
          Backend mapping: `stores1` = Main Store, supports JSON create/update and multipart when an image is uploaded.
        </p>

        <ReusableTable
          columns={[
            { header: 'Main Store', key: 'name' },
            { header: 'Address', key: 'address' },
            { header: 'Price Range', key: 'priceRange' },
            { header: 'Phone', key: 'phoneNumber' },
            { header: 'Pincode', key: 'pincode' },
            { header: 'City', key: 'city' },
            { header: 'Announcement', key: 'announcement' },
            { header: 'Delivery', key: 'delivery' },
            { header: 'Package', key: 'packageCost' },
            {
              header: 'Active',
              key: 'active',
              render: (item: StoreType) =>
                item.active ? (
                  <span className="text-green-500 font-medium">Active</span>
                ) : (
                  <span className="text-red-500 font-medium">Inactive</span>
                ),
            },
            {
              header: 'Rating',
              key: 'rating',
              render: (item: StoreType) => `? ${item.rating || 0}`,
            },
            {
              header: 'Image',
              key: 'image',
              render: (item: StoreType) =>
                item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg border shadow-sm"
                    style={{ borderColor: 'var(--border-soft)' }}
                  />
                ) : (
                  '-'
                ),
            },
            {
              header: 'Action',
              key: 'id',
              render: (item: StoreType) => (
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setEditData(item);
                      setShowModal(true);
                    }}
                    className="text-white px-3 py-1 rounded text-xs transition hover:opacity-80 shadow-sm"
                    style={{ backgroundColor: 'var(--highlight-color)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmId(item.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-xs transition hover:opacity-80 shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          data={paginatedData}
          loading={loading || isCreating || isUpdating || isDeleting}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {showModal && (
          <AddForm
            initialData={editData ? { ...editData, imageUrl: editData.image } : null}
            onSave={(storeData, imageFile) => {
              if (editData) {
                handleUpdate(editData.id, storeData, imageFile);
              } else {
                handleCreate(storeData, imageFile);
              }
            }}
            onClose={() => {
              setShowModal(false);
              setEditData(null);
            }}
          />
        )}
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete Main Store"
        message="Are you sure you want to delete this main store?"
        onConfirm={() => {
          if (confirmId !== null) handleDelete(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
