'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { reimbursementsApi } from '@/lib/api/endpoints';
import { formatCurrency, formatDate, formatCpf } from '@/lib/utils';
import type { Reimbursement } from '@/types/api';
import { Eye, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ReimbursementsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [approveModal, setApproveModal] = useState<Reimbursement | null>(null);
  const [rejectModal, setRejectModal] = useState<Reimbursement | null>(null);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [denialReason, setDenialReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reimbursements', page, search, statusFilter, typeFilter],
    queryFn: () =>
      reimbursementsApi.list({
        page,
        search: search || undefined,
        status: statusFilter || undefined,
        expense_type: typeFilter || undefined,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, amount, notes }: { id: number; amount: number; notes: string }) =>
      reimbursementsApi.approve(id, { approved_amount: amount, notes }),
    onSuccess: () => {
      toast.success('Reembolso aprovado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      setApproveModal(null);
      setApprovedAmount('');
      setNotes('');
    },
    onError: () => {
      toast.error('Erro ao aprovar reembolso');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      reimbursementsApi.reject(id, { denial_reason: reason }),
    onSuccess: () => {
      toast.success('Reembolso negado');
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      setRejectModal(null);
      setDenialReason('');
    },
    onError: () => {
      toast.error('Erro ao negar reembolso');
    },
  });

  const expenseTypes: Record<string, string> = {
    MEDICAL_CONSULTATION: 'Consulta Médica',
    EXAM: 'Exame',
    HOSPITALIZATION: 'Internação',
    MEDICATION: 'Medicamento',
    THERAPY: 'Terapia',
    OTHER: 'Outros',
  };

  const columns: Column<Reimbursement>[] = [
    {
      key: 'protocol_number',
      header: 'Protocolo',
      render: (r) => <span className="font-mono">{r.protocol_number}</span>,
    },
    {
      key: 'beneficiary_name',
      header: 'Beneficiário',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-medium">{r.beneficiary_name}</p>
          <p className="text-xs text-muted-foreground">{formatCpf(r.beneficiary_cpf)}</p>
        </div>
      ),
    },
    {
      key: 'expense_type',
      header: 'Tipo',
      render: (r) => expenseTypes[r.expense_type] || r.expense_type,
    },
    {
      key: 'requested_amount',
      header: 'Valor Solicitado',
      render: (r) => formatCurrency(r.requested_amount),
    },
    {
      key: 'approved_amount',
      header: 'Valor Aprovado',
      render: (r) =>
        r.approved_amount ? formatCurrency(r.approved_amount) : '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'request_date',
      header: 'Data',
      sortable: true,
      render: (r) => formatDate(r.request_date),
    },
  ];

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const openApproveModal = (reimbursement: Reimbursement) => {
    setApproveModal(reimbursement);
    setApprovedAmount(reimbursement.requested_amount);
  };

  return (
    <div className="h-full">
      <Header
        title="Reembolsos"
        description="Gerenciamento de solicitações de reembolso"
      />

      <div className="p-6 space-y-6">
        <Breadcrumb items={[{ label: 'Reembolsos' }]} />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos os status</option>
            <option value="IN_ANALYSIS">Em Análise</option>
            <option value="APPROVED">Aprovado</option>
            <option value="PARTIALLY_APPROVED">Parcialmente Aprovado</option>
            <option value="DENIED">Negado</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos os tipos</option>
            {Object.entries(expenseTypes).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
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
          searchPlaceholder="Buscar por protocolo ou beneficiário..."
          emptyMessage="Nenhum reembolso encontrado"
          actions={(reimbursement) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => router.push(`/reimbursements/${reimbursement.id}`)}
                className="rounded p-1 hover:bg-muted"
                title="Ver detalhes"
              >
                <Eye className="h-4 w-4" />
              </button>
              {reimbursement.status === 'IN_ANALYSIS' && (
                <>
                  <button
                    onClick={() => openApproveModal(reimbursement)}
                    className="rounded p-1 hover:bg-green-100 text-green-600"
                    title="Aprovar"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setRejectModal(reimbursement)}
                    className="rounded p-1 hover:bg-destructive/10 text-destructive"
                    title="Negar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          )}
        />
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={!!approveModal}
        onClose={() => {
          setApproveModal(null);
          setApprovedAmount('');
          setNotes('');
        }}
        title="Aprovar Reembolso"
        size="lg"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Protocolo: <strong>{approveModal?.protocol_number}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Beneficiário: <strong>{approveModal?.beneficiary_name}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Valor Solicitado:{' '}
              <strong>
                {approveModal && formatCurrency(approveModal.requested_amount)}
              </strong>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Valor Aprovado</label>
            <input
              type="number"
              step="0.01"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observações (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre a aprovação..."
              className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setApproveModal(null);
                setApprovedAmount('');
                setNotes('');
              }}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              onClick={() =>
                approveModal &&
                approveMutation.mutate({
                  id: approveModal.id,
                  amount: parseFloat(approvedAmount),
                  notes,
                })
              }
              disabled={!approvedAmount || approveMutation.isPending}
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
          setDenialReason('');
        }}
        title="Negar Reembolso"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Informe o motivo para negar o reembolso{' '}
            <strong>{rejectModal?.protocol_number}</strong>:
          </p>
          <textarea
            value={denialReason}
            onChange={(e) => setDenialReason(e.target.value)}
            placeholder="Motivo da negativa..."
            className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setRejectModal(null);
                setDenialReason('');
              }}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              onClick={() =>
                rejectModal &&
                rejectMutation.mutate({ id: rejectModal.id, reason: denialReason })
              }
              disabled={!denialReason.trim() || rejectMutation.isPending}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {rejectMutation.isPending ? 'Negando...' : 'Negar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
