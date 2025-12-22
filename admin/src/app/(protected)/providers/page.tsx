'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { providersApi } from '@/lib/api/endpoints';
import { formatCnpj } from '@/lib/utils';
import type { Provider } from '@/types/api';
import { Eye, Edit, Check, X, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function ProvidersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [approveModal, setApproveModal] = useState<Provider | null>(null);
  const [rejectModal, setRejectModal] = useState<Provider | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['providers', page, search, typeFilter, activeFilter],
    queryFn: () =>
      providersApi.list({
        page,
        search: search || undefined,
        provider_type: typeFilter || undefined,
        is_active: activeFilter ? activeFilter === 'true' : undefined,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => providersApi.approve(id),
    onSuccess: () => {
      toast.success('Prestador aprovado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      setApproveModal(null);
    },
    onError: () => {
      toast.error('Erro ao aprovar prestador');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      providersApi.reject(id, reason),
    onSuccess: () => {
      toast.success('Prestador rejeitado');
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      setRejectModal(null);
      setRejectReason('');
    },
    onError: () => {
      toast.error('Erro ao rejeitar prestador');
    },
  });

  const columns: Column<Provider>[] = [
    {
      key: 'name',
      header: 'Nome',
      sortable: true,
      render: (provider) => (
        <div>
          <p className="font-medium">{provider.name}</p>
          <p className="text-xs text-muted-foreground">{provider.email}</p>
        </div>
      ),
    },
    {
      key: 'provider_type',
      header: 'Tipo',
      render: (provider) => {
        const types: Record<string, string> = {
          CLINIC: 'Clínica',
          HOSPITAL: 'Hospital',
          LABORATORY: 'Laboratório',
          DOCTOR: 'Médico',
          PHARMACY: 'Farmácia',
        };
        return types[provider.provider_type] || provider.provider_type;
      },
    },
    {
      key: 'cnpj',
      header: 'CNPJ',
      render: (provider) => formatCnpj(provider.cnpj),
    },
    {
      key: 'city',
      header: 'Cidade',
      render: (provider) => `${provider.city}/${provider.state}`,
    },
    {
      key: 'rating',
      header: 'Avaliação',
      render: (provider) =>
        provider.rating ? (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{provider.rating.toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (provider) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            provider.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {provider.is_active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  return (
    <div className="h-full">
      <Header
        title="Prestadores"
        description="Gerenciamento de prestadores credenciados"
      />

      <div className="p-6 space-y-6">
        <Breadcrumb items={[{ label: 'Prestadores' }]} />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos os tipos</option>
            <option value="CLINIC">Clínica</option>
            <option value="HOSPITAL">Hospital</option>
            <option value="LABORATORY">Laboratório</option>
            <option value="DOCTOR">Médico</option>
            <option value="PHARMACY">Farmácia</option>
          </select>

          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos os status</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data?.results ?? []}
          isLoading={isLoading}
          totalItems={data?.count ?? 0}
          currentPage={page}
          pageSize={10}
          onPageChange={setPage}
          onSearch={handleSearch}
          searchPlaceholder="Buscar por nome..."
          emptyMessage="Nenhum prestador encontrado"
          actions={(provider) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => router.push(`/providers/${provider.id}`)}
                className="rounded p-1 hover:bg-muted"
                title="Ver detalhes"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push(`/providers/${provider.id}/edit`)}
                className="rounded p-1 hover:bg-muted"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </button>
              {!provider.is_active && (
                <button
                  onClick={() => setApproveModal(provider)}
                  className="rounded p-1 hover:bg-green-100 text-green-600"
                  title="Aprovar"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              {provider.is_active && (
                <button
                  onClick={() => setRejectModal(provider)}
                  className="rounded p-1 hover:bg-destructive/10 text-destructive"
                  title="Desativar"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        />
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={!!approveModal}
        onClose={() => setApproveModal(null)}
        title="Aprovar Prestador"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Confirma a aprovação do prestador{' '}
            <strong>{approveModal?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setApproveModal(null)}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              onClick={() => approveModal && approveMutation.mutate(approveModal.id)}
              disabled={approveMutation.isPending}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {approveMutation.isPending ? 'Aprovando...' : 'Aprovar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => {
          setRejectModal(null);
          setRejectReason('');
        }}
        title="Desativar Prestador"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Informe o motivo para desativar o prestador{' '}
            <strong>{rejectModal?.name}</strong>:
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motivo da desativação..."
            className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setRejectModal(null);
                setRejectReason('');
              }}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              onClick={() =>
                rejectModal &&
                rejectMutation.mutate({ id: rejectModal.id, reason: rejectReason })
              }
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {rejectMutation.isPending ? 'Desativando...' : 'Desativar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
