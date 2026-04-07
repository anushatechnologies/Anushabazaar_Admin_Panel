import { useState, useEffect, useMemo } from 'react';
import { toast } from '../../../components/toast/ToastContainer';
import AddForm from './add_store';
import {
  useGetStoreTypesQuery,
  useCreateStoreTypeMutation,
  useUpdateStoreTypeMutation,
  useDeleteStoreTypeMutation,
  StoreRequest as StoreTypeRequest,
  StoreType,
} from '../api/storeapi';
import ReusableTable from '../../../components/common/ReusableTable';
import ConfirmDialog from '../../../components/ConfirmDialog';

const ITEMS_PER_PAGE = 5;

export default function StoreTypePage() {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<StoreType | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    isLoading: loading,
    error,
  } = useGetStoreTypesQuery({
    name: debouncedSearch || undefined,
    page: currentPage - 1,
    size: ITEMS_PER_PAGE,
  });
  const [createStoreType, { isLoading: isCreating }] = useCreateStoreTypeMutation();
  const [updateStoreType, { isLoading: isUpdating }] = useUpdateStoreTypeMutation();
  const [deleteStoreType, { isLoading: isDeleting }] = useDeleteStoreTypeMutation();

  useEffect(() => {
    if (error) {
      toast.error('Failed to load store types');
    }
  }, [error]);

  const stores = useMemo(() => ((data as any)?.content || data || []) as StoreType[], [data]);

  const totalPages =
    (data as any)?.totalPages || Math.max(1, Math.ceil(stores.length / ITEMS_PER_PAGE));

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
      <div className="mx-auto max-w-7xl space-y-6">
        <div
          className="rounded-3xl border p-6 shadow-sm"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-soft)',
          }}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] opacity-60">
                Store setup
              </p>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                Store Type
              </h1>
              <p className="max-w-2xl text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                Manage the storefront cards shown to customers. Add, edit, or retire store types
                with clearer content, contact info, and stronger visual hierarchy.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search store types..."
                className="w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-indigo-500 sm:min-w-[260px]"
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
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:opacity-95"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 16px 30px rgba(37, 99, 235, 0.22)',
                }}
              >
                + Add Store Type
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div
            className="rounded-2xl border px-5 py-4"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-soft)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
              Visible entries
            </p>
            <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
              {(data as any)?.totalElements ?? stores.length}
            </p>
          </div>
          <div
            className="rounded-2xl border px-5 py-4"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-soft)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
              Current page
            </p>
            <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
              {currentPage}
            </p>
          </div>
          <div
            className="rounded-2xl border px-5 py-4"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-soft)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
              Total pages
            </p>
            <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
              {totalPages}
            </p>
          </div>
        </div>

        <ReusableTable
          columns={[
            {
              header: 'Image',
              key: 'imageUrl',
              render: (item: StoreType) =>
                item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-14 w-14 rounded-xl border object-cover shadow-sm"
                    style={{ borderColor: 'var(--border-soft)' }}
                  />
                ) : (
                  <span className="text-xs text-gray-400">No image</span>
                ),
            },
            {
              header: 'Store',
              key: 'name',
              render: (item: StoreType) => (
                <div className="space-y-1">
                  <div className="font-semibold" style={{ color: 'var(--text-color)' }}>
                    {item.name}
                  </div>
                  <div className="text-xs opacity-60" style={{ color: 'var(--text-color)' }}>
                    {item.label || 'No short label'}
                  </div>
                </div>
              ),
            },
            {
              header: 'Contact',
              key: 'phoneNumber',
              render: (item: StoreType) => (
                <div className="space-y-1">
                  <div>{item.phoneNumber || 'Not added'}</div>
                  <div className="text-xs opacity-60" style={{ color: 'var(--text-color)' }}>
                    {item.timings || 'Timing not added'}
                  </div>
                </div>
              ),
            },
            {
              header: 'Location',
              key: 'address',
              render: (item: StoreType) =>
                item.address ? `${item.address}${item.city ? ', ' + item.city : ''}` : 'Not added',
            },
            {
              header: 'Order',
              key: 'displayOrder',
              render: (item: StoreType) => item.displayOrder ?? '-',
            },
            {
              header: 'Status',
              key: 'active',
              render: (item: StoreType) => (
                <span
                  className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: item.active
                      ? 'rgba(22, 163, 74, 0.12)'
                      : 'rgba(220, 38, 38, 0.1)',
                    color: item.active ? '#16a34a' : '#dc2626',
                  }}
                >
                  {item.active ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            {
              header: 'Actions',
              key: 'id',
              render: (item: StoreType) => (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setEditData(item);
                      setShowModal(true);
                    }}
                    className="inline-flex min-w-[82px] items-center justify-center rounded-lg border px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
                    style={{
                      borderColor: 'rgba(37, 99, 235, 0.3)',
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%)',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmId(item.id)}
                    className="inline-flex min-w-[82px] items-center justify-center rounded-lg border border-red-200 bg-red-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-600"
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
          emptyMessage="No store types match the current filters."
        />

        {showModal && (
          <AddForm
            initialData={editData || null}
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
