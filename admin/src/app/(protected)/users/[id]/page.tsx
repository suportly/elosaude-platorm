'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { StatusBadge } from '@/components/ui/status-badge';
import { usersApi } from '@/lib/api/endpoints';
import { formatCpf, formatPhone, formatDate } from '@/lib/utils';
import { ArrowLeft, Edit, Loader2, AlertCircle } from 'lucide-react';

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.get(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Usuário não encontrado</p>
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Header
        title={user.full_name}
        description={`Matrícula: ${user.registration_number}`}
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: 'Usuários', href: '/users' },
              { label: user.full_name },
            ]}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <button
              onClick={() => router.push(`/users/${id}/edit`)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Edit className="h-4 w-4" />
              Editar
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 font-semibold">Informações Pessoais</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Nome Completo</dt>
                  <dd className="font-medium">{user.full_name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">CPF</dt>
                  <dd className="font-medium">{formatCpf(user.cpf)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Email</dt>
                  <dd className="font-medium">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Telefone</dt>
                  <dd className="font-medium">{formatPhone(user.phone)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Data de Nascimento
                  </dt>
                  <dd className="font-medium">{formatDate(user.birth_date)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Tipo</dt>
                  <dd className="font-medium">
                    {user.beneficiary_type === 'TITULAR' ? 'Titular' : 'Dependente'}
                  </dd>
                </div>
              </dl>
            </div>

            {user.address && (
              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-4 font-semibold">Endereço</h3>
                <p className="text-sm">
                  {user.address.street}, {user.address.number}
                  {user.address.complement && ` - ${user.address.complement}`}
                  <br />
                  {user.address.neighborhood} - {user.address.city}/{user.address.state}
                  <br />
                  CEP: {user.address.zip_code}
                </p>
              </div>
            )}

            {/* Dependents */}
            {user.dependents && user.dependents.length > 0 && (
              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-4 font-semibold">
                  Dependentes ({user.dependents.length})
                </h3>
                <div className="divide-y">
                  {user.dependents.map((dependent) => (
                    <div
                      key={dependent.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{dependent.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCpf(dependent.cpf)}
                        </p>
                      </div>
                      <StatusBadge status={dependent.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 font-semibold">Status</h3>
              <StatusBadge status={user.status} />
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 font-semibold">Plano e Empresa</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-muted-foreground">Empresa</dt>
                  <dd className="font-medium">{user.company_name || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Plano</dt>
                  <dd className="font-medium">{user.health_plan_name || '-'}</dd>
                </div>
                {user.titular_name && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Titular</dt>
                    <dd className="font-medium">{user.titular_name}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 font-semibold">Datas</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-muted-foreground">Cadastro</dt>
                  <dd className="font-medium">{formatDate(user.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Última Atualização
                  </dt>
                  <dd className="font-medium">{formatDate(user.updated_at)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
