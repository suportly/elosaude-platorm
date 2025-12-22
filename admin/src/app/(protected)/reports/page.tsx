'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { reportsApi } from '@/lib/api/endpoints';
import { downloadBlob, formatCurrency, formatDate } from '@/lib/utils';
import type { ReportResponse } from '@/types/api';
import {
  FileText,
  Download,
  Loader2,
  Users,
  Building2,
  Receipt,
} from 'lucide-react';
import { toast } from 'sonner';

type ReportType = 'users' | 'providers' | 'reimbursements';

const reportTypes = [
  {
    id: 'users' as ReportType,
    name: 'Usuários',
    description: 'Relatório de beneficiários cadastrados',
    icon: Users,
  },
  {
    id: 'providers' as ReportType,
    name: 'Prestadores',
    description: 'Relatório de prestadores credenciados',
    icon: Building2,
  },
  {
    id: 'reimbursements' as ReportType,
    name: 'Reembolsos',
    description: 'Relatório de solicitações de reembolso',
    icon: Receipt,
  },
];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<ReportType>('users');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportData, setReportData] = useState<ReportResponse | null>(null);

  const generateMutation = useMutation({
    mutationFn: () =>
      reportsApi.generate({
        report_type: selectedType,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }),
    onSuccess: (data) => {
      setReportData(data);
      toast.success(`Relatório gerado: ${data.total_records} registros`);
    },
    onError: () => {
      toast.error('Erro ao gerar relatório');
    },
  });

  const exportCsvMutation = useMutation({
    mutationFn: () =>
      reportsApi.exportCsv({
        report_type: selectedType,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }),
    onSuccess: (blob) => {
      downloadBlob(blob, `${selectedType}_report.csv`);
      toast.success('Relatório exportado');
    },
    onError: () => {
      toast.error('Erro ao exportar relatório');
    },
  });

  const exportPdfMutation = useMutation({
    mutationFn: () =>
      reportsApi.exportPdf({
        report_type: selectedType,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }),
    onSuccess: (blob) => {
      downloadBlob(blob, `${selectedType}_report.pdf`);
      toast.success('Relatório exportado');
    },
    onError: () => {
      toast.error('Erro ao exportar relatório');
    },
  });

  const isLoading =
    generateMutation.isPending ||
    exportCsvMutation.isPending ||
    exportPdfMutation.isPending;

  return (
    <div className="h-full">
      <Header
        title="Relatórios"
        description="Gere e exporte relatórios do sistema"
      />

      <div className="p-6 space-y-6">
        <Breadcrumb items={[{ label: 'Relatórios' }]} />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Report Types */}
          <div className="space-y-4">
            <h3 className="font-semibold">Tipo de Relatório</h3>
            <div className="space-y-2">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                    setReportData(null);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                    selectedType === type.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                  }`}
                >
                  <type.icon
                    className={`h-5 w-5 ${
                      selectedType === type.id
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <div>
                    <p className="font-medium">{type.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters and Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 font-semibold">Filtros</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Inicial</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Final</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  onClick={() => generateMutation.mutate()}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Gerar Prévia
                </button>
                <button
                  onClick={() => exportCsvMutation.mutate()}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  {exportCsvMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Exportar CSV
                </button>
                <button
                  onClick={() => exportPdfMutation.mutate()}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  {exportPdfMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Exportar PDF
                </button>
              </div>
            </div>

            {/* Preview */}
            {reportData && (
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">
                    Prévia do Relatório ({reportData.total_records} registros)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Exibindo primeiros 100 registros
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        {reportData.data.length > 0 &&
                          Object.keys(reportData.data[0]).map((key) => (
                            <th
                              key={key}
                              className="px-3 py-2 text-left font-medium text-muted-foreground"
                            >
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {reportData.data.map((row, index) => (
                        <tr key={index} className="hover:bg-muted/50">
                          {Object.entries(row).map(([key, value], i) => (
                            <td key={i} className="px-3 py-2">
                              {typeof value === 'number' &&
                              key.includes('amount')
                                ? formatCurrency(value)
                                : typeof value === 'string' &&
                                  value.match(/^\d{4}-\d{2}-\d{2}/)
                                ? formatDate(value)
                                : String(value ?? '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
