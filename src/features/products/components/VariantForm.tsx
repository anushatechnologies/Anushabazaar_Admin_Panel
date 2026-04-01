import React from 'react';
import {
  TextField,
  Button,
  Stack,
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { VariantRequest } from '../types';

interface VariantFormProps {
  variants: VariantRequest[];
  onChange: (variants: VariantRequest[]) => void;
}

export default function VariantForm({ variants, onChange }: VariantFormProps) {
  const addVariant = () => {
    const newVariant: VariantRequest = {
      name: '',
      sku: '',
      price: 0,
      discountPrice: undefined,
      stock: 0,
      isActive: true,
      displayOrder: variants.length + 1,
    };
    onChange([...variants, newVariant]);
  };

  const updateVariant = (index: number, field: keyof VariantRequest, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Variants
      </Typography>
      {variants.map((variant, index) => (
        <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Variant Name *"
                value={variant.name}
                onChange={(e) => updateVariant(index, 'name', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="SKU *"
                value={variant.sku}
                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                fullWidth
                required
              />
              <IconButton color="error" onClick={() => removeVariant(index)}>
                <Delete />
              </IconButton>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Price (₹) *"
                type="number"
                value={variant.price}
                onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
                fullWidth
              />
              <TextField
                label="Discount Price (₹)"
                type="number"
                value={variant.discountPrice || ''}
                onChange={(e) =>
                  updateVariant(index, 'discountPrice', e.target.value ? Number(e.target.value) : undefined)
                }
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Stock *"
                type="number"
                value={variant.stock}
                onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                fullWidth
              />
              <TextField
                label="Display Order"
                type="number"
                value={variant.displayOrder}
                onChange={(e) => updateVariant(index, 'displayOrder', Number(e.target.value))}
                fullWidth
              />
            </Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={variant.isActive}
                  onChange={(e) => updateVariant(index, 'isActive', e.target.checked)}
                />
              }
              label="Active"
            />
          </Stack>
        </Paper>
      ))}
      <Button variant="outlined" onClick={addVariant} sx={{ mt: 2 }}>
        Add Variant
      </Button>
    </Box>
  );
}  
