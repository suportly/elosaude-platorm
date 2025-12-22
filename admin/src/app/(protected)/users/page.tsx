'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { usersApi } from '@/lib/api/endpoints';
import { formatCpf, formatDate } from '@/lib/utils';
import type { Beneficiary } from '@/types/api';
import { Eye, Edit, UserX, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deactivateModal, setDeactivateModal] = useState<Beneficiary | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search, statusFilter],
    queryFn: () =>
      usersApi.list({
        page,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => usersApi.deactivate(id),
    onSuccess: () => {
      toast.success('Usuário desativado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeactivateModal(null);
    },
    onError: () => {
      toast.error('Erro ao desativar usuário');
    },
  });

  const columns: Column<Beneficiary>[] = [
    {
      key: 'registration_number',
      header: 'Matrícula',
      render: (user) => user.registration_number,
    },
    {
      key: 'full_name',
      header: 'Nome',
      sortable: true,
      render: (user) => (
        <div>
          <p className="font-medium">{user.full_name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'cpf',
      header: 'CPF',
      render: (user) => formatCpf(user.cpf),
    },
    {
      key: 'beneficiary_type',
      header: 'Tipo',
      render: (user) =>
        user.beneficiary_type === 'TITULAR' ? 'Titular' : 'Dependente',
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: 'created_at',
      header: 'Cadastro',
      sortable: true,
      render: (user) => formatDate(user.created_at),
    },
  ];

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  return (
    <div className="h-full">
      <Header
        title="Usuários"
        description="Gerenciamento de beneficiários"
      />

      <div className="p-6 space-y-6">
        <Breadcrumb items={[{ label: 'Usuários' }]} />

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos os status</option>
              <option value="ACTIVE">Ativo</option>
              <option value="SUSPENDED">Suspenso</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="PENDING">Pendente</option>
            </select>
          </div>

          <button
            onClick={() => router.push('/users/new')}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Novo Usuário
          </button>
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
          searchPlaceholder="Buscar por nome, CPF ou email..."
          emptyMessage="Nenhum usuário encontrado"
          actions={(user) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => router.push(`/users/${user.id}`)}
                className="rounded p-1 hover:bg-muted"
                title="Ver detalhes"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push(`/users/${user.id}/edit`)}
                className="rounded p-1 hover:bg-muted"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </button>
              {user.status !== 'CANCELLED' && (
                <button
                  onClick={() => setDeactivateModal(user)}
                  className="rounded p-1 hover:bg-destructive/10 text-destructive"
                  title="Desativar"
                >
                  <UserX className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        />
      </div>

      {/* Deactivate Modal */}
      <Modal
        isOpen={!!deactivateModal}
        onClose={() => setDeactivateModal(null)}
        title="Desativar Usuário"
        description="Esta ação não pode ser desfeita"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja desativar o usuário{' '}
            <strong>{deactivateModal?.full_name}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeactivateModal(null)}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              onClick={() =>
                deactivateModal && deactivateMutation.mutate(deactivateModal.id)
              }
              disabled={deactivateMutation.isPending}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {deactivateMutation.isPending ? 'Desativando...' : 'Desativar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
