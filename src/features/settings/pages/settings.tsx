import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { AutoAwesome, Construction, SettingsSuggest } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

import {
  GlassCard,
  GlassPageHeader,
  GradientText,
} from '../../../components/glassmorphism/GlassComponents';

export default function SettingsPage() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, display: 'grid', gap: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <GlassPageHeader>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                <GradientText>Settings</GradientText>
              </Typography>
              <Typography color="text.secondary">
                Platform-level admin preferences and workspace tools will be added here soon.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                icon={<Construction fontSize="small" />}
                label="Update Soon"
                color="warning"
                variant="filled"
              />
              <Chip
                icon={<AutoAwesome fontSize="small" />}
                label="UI refresh applied"
                variant="outlined"
              />
            </Stack>
          </Stack>
        </GlassPageHeader>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
      >
        <GlassCard
          sx={{
            minHeight: 380,
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(238,246,255,0.96) 100%)',
          }}
        >
          <Stack spacing={2.5} alignItems="center" sx={{ maxWidth: 560 }}>
            <Box
              sx={{
                width: 88,
                height: 88,
                borderRadius: 28,
                display: 'grid',
                placeItems: 'center',
                background:
                  'linear-gradient(135deg, rgba(37,99,235,0.14) 0%, rgba(124,58,237,0.14) 100%)',
                color: '#4f46e5',
                boxShadow: '0 18px 40px rgba(79,70,229,0.16)',
              }}
            >
              <SettingsSuggest sx={{ fontSize: 40 }} />
            </Box>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Settings Update Coming Soon
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 16, lineHeight: 1.7 }}>
                The generic admin settings page is being redesigned. Delivery fare configuration is
                still available from the dedicated
                <strong> Fare Settings </strong>
                menu under the Delivery section.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                component={RouterLink}
                to="/delivery/fare-settings"
                variant="contained"
                sx={{
                  borderRadius: 999,
                  px: 3,
                  py: 1.2,
                  textTransform: 'none',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #2563eb 0%, #14b8a6 100%)',
                }}
              >
                Open Fare Settings
              </Button>
              <Button
                component={RouterLink}
                to="/"
                variant="outlined"
                sx={{ borderRadius: 999, px: 3, py: 1.2, textTransform: 'none', fontWeight: 700 }}
              >
                Back to Dashboard
              </Button>
            </Stack>
          </Stack>
        </GlassCard>
      </motion.div>
    </Box>
  );
}
