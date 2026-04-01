import { useState, useEffect } from 'react';
import { toast } from '../../../components/toast/ToastContainer';
import AddForm from './add_store';
import {
  useGetStoreTypesQuery,
  useCreateStoreTypeMutation,
  useUpdateStoreTypeMutation,
  useDeleteStoreTypeMutation,
  StoreRequest as StoreTypeRequest,
} from '../api/storeapi';
import { useGetSubStoresQuery } from '../../store/api/subStoreApi';
import ReusableTable from '../../../components/common/ReusableTable';
import ConfirmDialog from '../../../components/ConfirmDialog';

type StoreType = {
  id: number;
  name: string;
  label: string;
  displayOrder: number;
  active: boolean;
  image?: string;
  store1Id: number;
};

const ITEMS_PER_PAGE = 5;

export default function StoreTypePage() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<StoreType | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mainStoresMap, setMainStoresMap] = useState<Map<number, string>>(new Map());
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading: loading, error } = useGetStoreTypesQuery({
    name: debouncedSearch || undefined,
    page: currentPage - 1,
    size: ITEMS_PER_PAGE,
  });
  const { data: mainStoresData } = useGetSubStoresQuery({ name: undefined, page: 0, size: 100 });
  const [createStoreType, { isLoading: isCreating }] = useCreateStoreTypeMutation();
  const [updateStoreType, { isLoading: isUpdating }] = useUpdateStoreTypeMutation();
  const [deleteStoreType, { isLoading: isDeleting }] = useDeleteStoreTypeMutation();

  useEffect(() => {
    if (error) {
      toast.error('Failed to load store types');
    }
  }, [error]);

  useEffect(() => {
    const storesArray = (((data as any)?.content || data || []) as any[]);
    setStores(
      storesArray.map((item: any) => ({
        ...item,
        image: item.imageUrl,
      }))
    );
  }, [data]);

  useEffect(() => {
    const storesArray = (((mainStoresData as any)?.content || mainStoresData || []) as any[]);
    if (storesArray.length > 0) {
      setMainStoresMap(new Map(storesArray.map((ms: any) => [ms.id, ms.name])));
    }
  }, [mainStoresData]);

  const totalPages = (data as any)?.totalPages || Math.max(1, Math.ceil(stores.length / ITEMS_PER_PAGE));

  const handleCreate = async (storeData: StoreTypeRequest, imageFile?: File) => {
    if (!imageFile) {
      toast.error('Image is required');
      return;
    }
    try {
      await createStoreType({ data: storeData, image: imageFile }).unwrap();
      setShowModal(false);
      setEditData(null);
      toast.success('Store type created successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || error.message || 'Failed to create store type');
    }
  };

  const handleUpdate = async (id: number, storeData: StoreTypeRequest, imageFile?: File) => {
    try {
      await updateStoreType({ id, data: storeData, image: imageFile }).unwrap();
      setShowModal(false);
      setEditData(null);
      toast.success('Store type updated successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || error.message || 'Failed to update store type');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteStoreType(id).unwrap();
      setConfirmId(null);
      toast.success('Store type deleted successfully');
      if (stores.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || error.message || 'Failed to delete store type');
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
            Store Type
          </h1>
          <div className="flex gap-3">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search store types..."
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
              + Add Store Type
            </button>
          </div>
        </div>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
          Backend mapping: `stores` = Store Type, linked to a Main Store from `stores1`.
        </p>

        <ReusableTable
          columns={[
            { header: 'Name', key: 'name' },
            { header: 'Label', key: 'label' },
            { header: 'Display Order', key: 'displayOrder' },
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
              header: 'Main Store',
              key: 'store1Id',
              render: (item: StoreType) => mainStoresMap.get(item.store1Id) || item.store1Id || '-',
            },
            {
              header: 'Image',
              key: 'image',
              render: (item: StoreType) =>
                item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg shadow-sm border"
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
                    className="text-white px-3 py-1 rounded text-xs shadow-sm transition hover:opacity-80"
                    style={{ backgroundColor: 'var(--highlight-color)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmId(item.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-xs shadow-sm transition hover:opacity-80"
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          data={stores}
          loading={loading || isCreating || isUpdating || isDeleting}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {showModal && (
          <AddForm
            initialData={editData ? { ...editData, image: editData.image } : null}
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
        title="Delete Store Type"
        message="Are you sure you want to delete this store type?"
        onConfirm={() => {
          if (confirmId !== null) handleDelete(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
