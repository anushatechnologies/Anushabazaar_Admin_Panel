import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Stack,
  Chip,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  TwoWheeler,
  ElectricBike,
  LocalShipping as TruckIcon,
  Umbrella,
  Info as InfoIcon,
  Save as SaveIcon,
  CloudQueue,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  useGetFareRulesQuery,
  useUpdateFareRuleMutation,
  useToggleRainMutation,
  FareRule,
  VehicleType,
} from '../api/deliveryApi';
import {
  GlassPageHeader,
  GlassCard,
  GradientText,
} from '../../../components/glassmorphism/GlassComponents';
import { useAppTheme } from '@contexts/ThemeContext';

// ── Vehicle metadata ──────────────────────────────────────────────────────────

interface VehicleGroup {
  label: string;
  vehicles: VehicleType[];
  icon: React.ReactNode;
  color: string;
  hasLoadingFees: boolean;
  rainGroupLabel: string;
  evGroup?: boolean;
}

const VEHICLE_GROUPS: VehicleGroup[] = [
  {
    label: 'Light Vehicles',
    vehicles: ['BIKE', 'SCOOTY', 'EV'],
    icon: <TwoWheeler />,
    color: '#22c55e',
    hasLoadingFees: false,
    rainGroupLabel: 'Rain surcharge (shared across Bike, Scooty, EV)',
    evGroup: true,
  },
  {
    label: 'Auto',
    vehicles: ['AUTO'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z" />
        <circle cx="7.5" cy="14.5" r="1.5" />
        <circle cx="16.5" cy="14.5" r="1.5" />
      </svg>
    ),
    color: '#f59e0b',
    hasLoadingFees: true,
    rainGroupLabel: 'Rain surcharge (Auto only)',
  },
  {
    label: 'Heavy Vehicle',
    vehicles: ['HEAVY'],
    icon: <TruckIcon />,
    color: '#ef4444',
    hasLoadingFees: true,
    rainGroupLabel: 'Rain surcharge (Heavy only)',
  },
];

const VEHICLE_DISPLAY: Record<VehicleType, { label: string; description: string }> = {
  BIKE: { label: 'Bike', description: 'Petrol/CNG motorbike' },
  SCOOTY: { label: 'Scooty', description: 'Petrol/CNG scooter' },
  EV: { label: 'Electric Bike', description: 'No RC / Insurance required' },
  AUTO: { label: 'Auto', description: 'Auto-rickshaw + loading fees' },
  HEAVY: { label: 'Heavy Vehicle', description: 'Truck / large vehicle' },
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FareSettingsPage() {
  const { currentTheme, isDark } = useAppTheme();
  const { data, isLoading, refetch } = useGetFareRulesQuery();
  const [updateFareRule, { isLoading: isSaving }] = useUpdateFareRuleMutation();
  const [toggleRain] = useToggleRainMutation();

  // Local editable copy keyed by vehicleType
  const [localRules, setLocalRules] = useState<Record<VehicleType, FareRule | null>>({
    BIKE: null,
    SCOOTY: null,
    EV: null,
    AUTO: null,
    HEAVY: null,
  });
  const [dirtyIds, setDirtyIds] = useState<Set<number>>(new Set());

  // Sync server data into local editable state whenever the query result changes.
  // This is the canonical React pattern for "external data → editable local copy".

  useEffect(() => {
    if (data?.fareRules) {
      const map: Record<VehicleType, FareRule | null> = {
        BIKE: null,
        SCOOTY: null,
        EV: null,
        AUTO: null,
        HEAVY: null,
      };
      data.fareRules.forEach((r) => {
        map[r.vehicleType] = { ...r };
      });
      setLocalRules(map);
    }
  }, [data]);

  const handleChange = (vehicleType: VehicleType, field: keyof FareRule, value: number) => {
    setLocalRules((prev) => {
      const rule = prev[vehicleType];
      if (!rule) return prev;
      const updated = { ...rule, [field]: value };
      setDirtyIds((d) => new Set(d).add(rule.id));
      return { ...prev, [vehicleType]: updated };
    });
  };

  const handleSaveVehicle = async (vehicleType: VehicleType) => {
    const rule = localRules[vehicleType];
    if (!rule) return;
    try {
      await updateFareRule({ id: rule.id, rule }).unwrap();
      setDirtyIds((d) => {
        const nd = new Set(d);
        nd.delete(rule.id);
        return nd;
      });
      toast.success(`${VEHICLE_DISPLAY[vehicleType].label} fare saved!`);
    } catch {
      toast.error(`Failed to save ${VEHICLE_DISPLAY[vehicleType].label} fare`);
    }
  };

  const handleSaveGroup = async (group: VehicleGroup) => {
    for (const vt of group.vehicles) {
      const rule = localRules[vt];
      if (!rule) continue;
      await updateFareRule({ id: rule.id, rule })
        .unwrap()
        .catch(() => null);
    }
    setDirtyIds((d) => {
      const nd = new Set(d);
      group.vehicles.forEach((vt) => {
        const r = localRules[vt];
        if (r) nd.delete(r.id);
      });
      return nd;
    });
    toast.success(`${group.label} fares saved!`);
  };

  const handleRainToggle = async (vehicleType: VehicleType, rainActive: boolean) => {
    try {
      await toggleRain({ vehicleType, rainActive }).unwrap();
      // Optimistically update all vehicles in the same rain group
      setLocalRules((prev) => {
        const nd = { ...prev };
        const isLight = ['BIKE', 'SCOOTY', 'EV'].includes(vehicleType);
        const targets: VehicleType[] = isLight ? ['BIKE', 'SCOOTY', 'EV'] : [vehicleType];
        targets.forEach((vt) => {
          if (nd[vt]) nd[vt] = { ...nd[vt]!, rainActive };
        });
        return nd;
      });
      const label = rainActive ? 'ON' : 'OFF';
      toast.success(`Rain surcharge turned ${label}!`);
    } catch {
      toast.error('Failed to toggle rain surcharge');
    }
    refetch();
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={24} />
        <Typography>Loading fare settings…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: currentTheme.bg, minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassPageHeader>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={800}>
                <GradientText>Delivery Fare Settings</GradientText>
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Set fares per vehicle type. Rain toggle applies instantly to live deliveries.
              </Typography>
            </Box>
          </Box>
        </GlassPageHeader>
      </motion.div>

      {/* Formula banner */}
      <Alert icon={<InfoIcon />} severity="info" sx={{ mb: 3, borderRadius: 3, fontWeight: 500 }}>
        <strong>Fare formula:</strong> Base Fare (₹25 for 0–2 km) + floor(km − 2) × Per-km Rate +
        Rain Surcharge (if ON) + Loading + Unloading. Example: 9.7 km Bike = ₹25 + floor(7.7) × ₹7 =
        ₹25 + ₹49 = <strong>₹74</strong>. With rain ₹30 → <strong>₹104</strong>.
      </Alert>

      <Stack spacing={4}>
        {VEHICLE_GROUPS.map((group) => (
          <VehicleGroupCard
            key={group.label}
            group={group}
            localRules={localRules}
            dirtyIds={dirtyIds}
            isSaving={isSaving}
            isDark={isDark}
            currentTheme={currentTheme}
            onChange={handleChange}
            onSaveGroup={handleSaveGroup}
            onSaveVehicle={handleSaveVehicle}
            onRainToggle={handleRainToggle}
          />
        ))}
      </Stack>
    </Box>
  );
}

// ── Vehicle group card ────────────────────────────────────────────────────────

interface GroupCardProps {
  group: VehicleGroup;
  localRules: Record<VehicleType, FareRule | null>;
  dirtyIds: Set<number>;
  isSaving: boolean;
  isDark: boolean;
  currentTheme: any;
  onChange: (vt: VehicleType, field: keyof FareRule, value: number) => void;
  onSaveGroup: (group: VehicleGroup) => Promise<void>;
  onSaveVehicle: (vt: VehicleType) => Promise<void>;
  onRainToggle: (vt: VehicleType, rainActive: boolean) => Promise<void>;
}

function VehicleGroupCard({
  group,
  localRules,
  dirtyIds,
  isSaving,
  isDark,
  currentTheme,
  onChange,
  onSaveGroup,
  onSaveVehicle,
  onRainToggle,
}: GroupCardProps) {
  const primaryRule = localRules[group.vehicles[0]];
  const groupHasChanges = group.vehicles.some((vt) => {
    const r = localRules[vt];
    return r && dirtyIds.has(r.id);
  });
  const rainActive = primaryRule?.rainActive ?? false;

  // For the light-vehicle group (BIKE/SCOOTY/EV) we display ONE set of fare inputs
  // because they share the same fare. Only the EV sub-card shows "No RC / Insurance" info.
  const isLightGroup = group.evGroup;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard>
        {/* Group header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ color: group.color, display: 'flex' }}>{group.icon}</Box>
            <Typography variant="h6" fontWeight={800}>
              {group.label}
            </Typography>
            {group.vehicles.map((vt) => (
              <Chip
                key={vt}
                label={VEHICLE_DISPLAY[vt].label}
                size="small"
                sx={{
                  bgcolor: `${group.color}20`,
                  color: group.color,
                  fontWeight: 700,
                  border: `1px solid ${group.color}40`,
                }}
              />
            ))}
          </Stack>

          {groupHasChanges && (
            <Button
              variant="contained"
              size="small"
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              disabled={isSaving}
              onClick={() => onSaveGroup(group)}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                background: `linear-gradient(135deg, ${group.color}, ${group.color}cc)`,
                boxShadow: `0 4px 15px ${group.color}40`,
              }}
            >
              Save {group.label}
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Left: Fare inputs — for light group, only one set (all share same fare) */}
          <Grid size={{ xs: 12, md: 8 }}>
            {isLightGroup ? (
              // Light group: show shared fare inputs + EV info
              <Stack spacing={3}>
                <FareInputRow
                  label="Flat base fare (0 → 2 km)"
                  helperText="Charged for any delivery within 2 km"
                  value={primaryRule?.baseFare ?? 25}
                  onChange={(v) => {
                    group.vehicles.forEach((vt) => onChange(vt, 'baseFare', v));
                  }}
                  isDark={isDark}
                  currentTheme={currentTheme}
                />
                <FareInputRow
                  label="Base distance (km)"
                  helperText="Distance covered by base fare (default 2 km)"
                  value={primaryRule?.baseKm ?? 2}
                  step={0.5}
                  onChange={(v) => {
                    group.vehicles.forEach((vt) => onChange(vt, 'baseKm', v));
                  }}
                  isDark={isDark}
                  currentTheme={currentTheme}
                  unit="km"
                />
                <FareInputRow
                  label="Per-km rate (after base)"
                  helperText="Floor(extra km) × this rate added on top"
                  value={primaryRule?.perKmRate ?? 7}
                  onChange={(v) => {
                    group.vehicles.forEach((vt) => onChange(vt, 'perKmRate', v));
                  }}
                  isDark={isDark}
                  currentTheme={currentTheme}
                />
                {/* EV info banner */}
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.06)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                  }}
                >
                  <ElectricBike sx={{ color: '#22c55e', mt: 0.2 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#22c55e">
                      Electric Bike (EV) — Document Exemptions
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      EV partners are <strong>not required</strong> to upload RC Book or Insurance.
                      Aadhaar, PAN, Driving License, and Profile Photo are still required. Same fare
                      applies as Bike and Scooty.
                    </Typography>
                  </Box>
                </Paper>
              </Stack>
            ) : (
              // AUTO / HEAVY: individual fare inputs
              <Stack spacing={3}>
                <FareInputRow
                  label="Flat base fare (0 → 2 km)"
                  helperText="Charged for any delivery within 2 km"
                  value={primaryRule?.baseFare ?? 30}
                  onChange={(v) => onChange(group.vehicles[0], 'baseFare', v)}
                  isDark={isDark}
                  currentTheme={currentTheme}
                />
                <FareInputRow
                  label="Base distance (km)"
                  helperText="Distance covered by base fare"
                  value={primaryRule?.baseKm ?? 2}
                  step={0.5}
                  onChange={(v) => onChange(group.vehicles[0], 'baseKm', v)}
                  isDark={isDark}
                  currentTheme={currentTheme}
                  unit="km"
                />
                <FareInputRow
                  label="Per-km rate (after base)"
                  helperText="Floor(extra km) × this rate added on top"
                  value={primaryRule?.perKmRate ?? 10}
                  onChange={(v) => onChange(group.vehicles[0], 'perKmRate', v)}
                  isDark={isDark}
                  currentTheme={currentTheme}
                />
                {/* Loading / Unloading — AUTO and HEAVY only */}
                {group.hasLoadingFees && (
                  <>
                    <Divider sx={{ my: 1 }}>
                      <Chip label="Loading & Unloading Charges" size="small" />
                    </Divider>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FareInputRow
                          label="Loading charge"
                          helperText="Added for every delivery (loading at store)"
                          value={primaryRule?.loadingCharge ?? 0}
                          onChange={(v) => onChange(group.vehicles[0], 'loadingCharge', v)}
                          isDark={isDark}
                          currentTheme={currentTheme}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FareInputRow
                          label="Unloading charge"
                          helperText="Added for every delivery (unloading at customer)"
                          value={primaryRule?.unloadingCharge ?? 0}
                          onChange={(v) => onChange(group.vehicles[0], 'unloadingCharge', v)}
                          isDark={isDark}
                          currentTheme={currentTheme}
                        />
                      </Grid>
                    </Grid>
                  </>
                )}
              </Stack>
            )}
          </Grid>

          {/* Right: Rain toggle + preview */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3} height="100%">
              {/* Rain surcharge card */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: rainActive
                    ? isDark
                      ? 'rgba(59,130,246,0.15)'
                      : 'rgba(59,130,246,0.06)'
                    : isDark
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${rainActive ? 'rgba(59,130,246,0.4)' : currentTheme.border}`,
                  transition: 'all 0.3s ease',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Umbrella sx={{ color: rainActive ? '#3b82f6' : 'text.disabled' }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Rain Surcharge
                  </Typography>
                  {rainActive && (
                    <Chip
                      label="ACTIVE"
                      size="small"
                      sx={{ bgcolor: '#3b82f6', color: '#fff', fontWeight: 800, fontSize: 10 }}
                    />
                  )}
                </Stack>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 2 }}
                >
                  {group.rainGroupLabel}
                </Typography>

                <FareInputRow
                  label="Surcharge amount"
                  helperText="Added on top when rain is ON"
                  value={primaryRule?.rainSurcharge ?? 0}
                  onChange={(v) => {
                    group.vehicles.forEach((vt) => onChange(vt, 'rainSurcharge', v));
                  }}
                  isDark={isDark}
                  currentTheme={currentTheme}
                />

                <Box sx={{ mt: 2.5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={rainActive}
                        onChange={(e) => onRainToggle(group.vehicles[0], e.target.checked)}
                        sx={{
                          '& .MuiSwitch-thumb': { bgcolor: rainActive ? '#3b82f6' : undefined },
                          '& .MuiSwitch-track': { bgcolor: rainActive ? '#3b82f6' : undefined },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={700}>
                        {rainActive ? 'Rain mode ON — live now' : 'Rain mode OFF'}
                      </Typography>
                    }
                  />
                </Box>
              </Paper>

              {/* Live fare preview */}
              {primaryRule && (
                <FarePreview rule={primaryRule} isDark={isDark} color={group.color} />
              )}

              {/* Per-vehicle save button */}
              {!isLightGroup && dirtyIds.has(primaryRule?.id ?? -1) && (
                <Button
                  variant="contained"
                  startIcon={
                    isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
                  }
                  disabled={isSaving}
                  onClick={() => onSaveVehicle(group.vehicles[0])}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${group.color}, ${group.color}cc)`,
                  }}
                >
                  Save {group.label}
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </GlassCard>
    </motion.div>
  );
}

// ── Fare preview ──────────────────────────────────────────────────────────────

function FarePreview({ rule, isDark, color }: { rule: FareRule; isDark: boolean; color: string }) {
  const calcFare = (km: number): number => {
    const base = rule.baseFare;
    const extra = Math.max(0, km - rule.baseKm);
    const extraFull = Math.floor(extra);
    const fare =
      base +
      extraFull * rule.perKmRate +
      (rule.rainActive ? rule.rainSurcharge : 0) +
      rule.loadingCharge +
      rule.unloadingCharge;
    return Math.round(fare * 100) / 100;
  };

  const examples = [
    { km: 1, label: '1 km' },
    { km: 2, label: '2 km (base)' },
    { km: 5, label: '5 km' },
    { km: 9.7, label: '9.7 km' },
    { km: 15, label: '15 km' },
  ];

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        border: `1px solid ${color}30`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <CloudQueue sx={{ color, fontSize: 18 }} />
        <Typography variant="subtitle2" fontWeight={700}>
          Live Preview
        </Typography>
        {rule.rainActive && (
          <Chip
            label="+ Rain"
            size="small"
            sx={{ bgcolor: '#3b82f620', color: '#3b82f6', fontWeight: 700, fontSize: 10 }}
          />
        )}
      </Stack>
      <Stack spacing={1}>
        {examples.map(({ km, label }) => (
          <Box
            key={km}
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="body2" fontWeight={700} sx={{ color }}>
              ₹{calcFare(km)}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="caption" color="text.secondary">
        Formula: ₹{rule.baseFare} base + floor(km−{rule.baseKm})×₹{rule.perKmRate}/km
        {rule.rainActive ? ` + ₹${rule.rainSurcharge} rain` : ''}
        {rule.loadingCharge > 0 ? ` + ₹${rule.loadingCharge} load` : ''}
        {rule.unloadingCharge > 0 ? ` + ₹${rule.unloadingCharge} unload` : ''}
      </Typography>
    </Paper>
  );
}

// ── Fare input row ────────────────────────────────────────────────────────────

interface FareInputRowProps {
  label: string;
  helperText: string;
  value: number;
  onChange: (v: number) => void;
  isDark: boolean;
  currentTheme: any;
  step?: number;
  unit?: string;
}

function FareInputRow({
  label,
  helperText,
  value,
  onChange,
  isDark,
  currentTheme,
  step = 1,
  unit,
}: FareInputRowProps) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary">
          {label}
        </Typography>
        <Tooltip title={helperText} arrow>
          <InfoIcon sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help' }} />
        </Tooltip>
      </Stack>
      <TextField
        fullWidth
        type="number"
        size="small"
        value={value}
        inputProps={{ step }}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        InputProps={{
          startAdornment: !unit ? (
            <InputAdornment position="start">
              <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: 14 }}>
                ₹
              </Typography>
            </InputAdornment>
          ) : undefined,
          endAdornment: unit ? (
            <InputAdornment position="end">
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {unit}
              </Typography>
            </InputAdornment>
          ) : undefined,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            color: currentTheme.text,
            '& fieldset': { borderColor: currentTheme.border },
            '&:hover fieldset': { borderColor: currentTheme.accent },
            '&.Mui-focused fieldset': { borderColor: currentTheme.accent },
          },
        }}
      />
      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.3, display: 'block' }}>
        {helperText}
      </Typography>
    </Box>
  );
}
