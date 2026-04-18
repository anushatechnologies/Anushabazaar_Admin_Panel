import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  useGetMarqueeAllQuery,
  useCreateMarqueeMutation,
  useUpdateMarqueeMutation,
  useDeleteMarqueeMutation,
  MarqueeAnnouncement,
} from '../api/marqueeApi';
import toast from 'react-hot-toast';

const emptyForm = { text: '', active: true, displayOrder: 0 };

export default function MarqueePage() {
  const { data: items = [], isLoading } = useGetMarqueeAllQuery();
  const [create] = useCreateMarqueeMutation();
  const [update] = useUpdateMarqueeMutation();
  const [remove] = useDeleteMarqueeMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MarqueeAnnouncement | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item: MarqueeAnnouncement) => {
    setEditing(item);
    setForm({ text: item.text, active: item.active, displayOrder: item.displayOrder });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.text.trim()) {
      toast.error('Text is required');
      return;
    }
    try {
      if (editing) {
        await update({ id: editing.id, ...form }).unwrap();
        toast.success('Updated');
      } else {
        await create(form).unwrap();
        toast.success('Created');
      }
      setOpen(false);
    } catch {
      toast.error('Save failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await remove(id).unwrap();
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Marquee Announcements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Scrolling ticker shown above banners in the customer app
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Announcement
        </Button>
      </Stack>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={60}>#</TableCell>
                    <TableCell>Text</TableCell>
                    <TableCell width={100}>Status</TableCell>
                    <TableCell width={80}>Order</TableCell>
                    <TableCell width={120}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No announcements yet. Click "Add Announcement" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell sx={{ maxWidth: 400, wordBreak: 'break-word' }}>
                          {item.text}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.active ? 'Active' : 'Hidden'}
                            color={item.active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{item.displayOrder}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => openEdit(item)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(item.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Announcement Text"
              multiline
              rows={3}
              fullWidth
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="e.g. కిరాణా స్టోర్ ఫ్రాంచైజీ అవకాశం! నెలకు 20-30వేల ఆదాయం. 6309981444"
              inputProps={{ maxLength: 500 }}
              helperText={`${form.text.length}/500`}
            />
            <TextField
              label="Display Order"
              type="number"
              value={form.displayOrder}
              onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
              sx={{ width: 160 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  color="success"
                />
              }
              label="Active (visible in app)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
