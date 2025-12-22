'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/header';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Modal } from '@/components/ui/modal';
import { settingsApi } from '@/lib/api/endpoints';
import { formatDateTime } from '@/lib/utils';
import type { SystemConfiguration } from '@/types/api';
import {
  Settings,
  Shield,
  Bell,
  Link,
  Loader2,
  AlertCircle,
  Edit,
  Eye,
  EyeOff,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  GENERAL: Settings,
  SECURITY: Shield,
  NOTIFICATIONS: Bell,
  INTEGRATION: Link,
};

const categoryLabels: Record<string, string> = {
  GENERAL: 'Geral',
  SECURITY: 'Segurança',
  NOTIFICATIONS: 'Notificações',
  INTEGRATION: 'Integrações',
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editModal, setEditModal] = useState<SystemConfiguration | null>(null);
  const [newValue, setNewValue] = useState('');
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});

  // Redirect non-super admins
  if (session?.user?.role !== 'SUPER_ADMIN') {
    router.push('/dashboard');
    return null;
  }

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings', selectedCategory],
    queryFn: () => settingsApi.list(selectedCategory || undefined),
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      settingsApi.update(key, { value }),
    onSuccess: () => {
      toast.success('Configuração atualizada');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setEditModal(null);
      setNewValue('');
    },
    onError: () => {
      toast.error('Erro ao atualizar configuração');
    },
  });

  const openEditModal = (setting: SystemConfiguration) => {
    setEditModal(setting);
    setNewValue(setting.value);
  };

  const toggleSensitive = (key: string) => {
    setShowSensitive((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const settingsArray = Array.isArray(settings) ? settings : [];
  const groupedSettings = settingsArray.reduce((acc, setting) => {
    const category = setting.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, SystemConfiguration[]>);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Erro ao carregar configurações</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Header
        title="Configurações"
        description="Configurações do sistema (apenas Super Admin)"
      />

      <div className="p-6 space-y-6">
        <Breadcrumb items={[{ label: 'Configurações' }]} />

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Todas
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const Icon = categoryIcons[key];
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Settings List */}
        <div className="space-y-6">
          {groupedSettings &&
            Object.entries(groupedSettings).map(([category, categorySettings]) => {
              const Icon = categoryIcons[category] || Settings;
              return (
                <div key={category} className="rounded-lg border bg-card">
                  <div className="flex items-center gap-2 border-b p-4">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">
                      {categoryLabels[category] || category}
                    </h3>
                  </div>
                  <div className="divide-y">
                    {categorySettings.map((setting) => (
                      <div
                        key={setting.id}
                        className="flex items-center justify-between p-4"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{setting.key}</p>
                          <p className="text-sm text-muted-foreground">
                            {setting.description}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            {setting.is_sensitive ? (
                              <div className="flex items-center gap-1">
                                <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                                  {showSensitive[setting.key]
                                    ? setting.value
                                    : '••••••••'}
                                </code>
                                <button
                                  onClick={() => toggleSensitive(setting.key)}
                                  className="rounded p-1 hover:bg-muted"
                                >
                                  {showSensitive[setting.key] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                                {setting.value}
                              </code>
                            )}
                          </div>
                          {setting.last_modified_by && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Última alteração por {setting.last_modified_by} em{' '}
                              {formatDateTime(setting.last_modified_at)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => openEditModal(setting)}
                          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>

        {/* History Link */}
        <div className="flex justify-end">
          <button
            onClick={() => router.push('/settings/history')}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <History className="h-4 w-4" />
            Ver histórico de alterações
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => {
          setEditModal(null);
          setNewValue('');
        }}
        title={`Editar: ${editModal?.key}`}
        description={editModal?.description}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Novo Valor</label>
            <input
              type={editModal?.is_sensitive ? 'password' : 'text'}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setEditModal(null);
                setNewValue('');
              }}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              onClick={() =>
                editModal &&
                updateMutation.mutate({ key: editModal.key, value: newValue })
              }
              disabled={!newValue || updateMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
