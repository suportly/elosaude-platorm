'use client';

import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { StatsCard, StatsCardSkeleton } from '@/components/ui/stats-card';
import { dashboardApi } from '@/lib/api/endpoints';
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/utils';
import {
  Users,
  Building2,
  Receipt,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

// Mock chart data (will be replaced with real API data)
const chartData = [
  { name: 'Jan', users: 40, providers: 24 },
  { name: 'Fev', users: 30, providers: 28 },
  { name: 'Mar', users: 45, providers: 32 },
  { name: 'Abr', users: 50, providers: 35 },
  { name: 'Mai', users: 65, providers: 40 },
  { name: 'Jun', users: 80, providers: 48 },
];

export default function DashboardPage() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: dashboardApi.getMetrics,
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => dashboardApi.getRecentActivity(5),
  });

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Erro ao carregar dados do dashboard</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Header
        title="Dashboard"
        description="Visão geral do sistema EloSaúde"
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Usuários Ativos"
                value={`${metrics?.active_users ?? 0} / ${metrics?.total_users ?? 0}`}
                icon={Users}
                trend={
                  metrics?.users_growth !== undefined
                    ? { value: metrics.users_growth, isPositive: metrics.users_growth >= 0 }
                    : undefined
                }
              />
              <StatsCard
                title="Prestadores Ativos"
                value={`${metrics?.active_providers ?? 0} / ${metrics?.total_providers ?? 0}`}
                icon={Building2}
                trend={
                  metrics?.providers_growth !== undefined
                    ? { value: metrics.providers_growth, isPositive: metrics.providers_growth >= 0 }
                    : undefined
                }
              />
              <StatsCard
                title="Reembolsos Pendentes"
                value={metrics?.pending_reimbursements ?? 0}
                icon={Receipt}
                description="Aguardando análise"
              />
              <StatsCard
                title="Valor Total Reembolsos"
                value={formatCurrency(metrics?.total_reimbursement_value ?? 0)}
                icon={TrendingUp}
                description="Este mês"
              />
            </>
          )}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart */}
          <div className="lg:col-span-2 rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Crescimento Mensal</h3>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    name="Usuários"
                  />
                  <Area
                    type="monotone"
                    dataKey="providers"
                    stackId="2"
                    stroke="hsl(var(--secondary))"
                    fill="hsl(var(--secondary))"
                    fillOpacity={0.3}
                    name="Prestadores"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Atividade Recente</h3>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 border-b pb-3 last:border-0">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              ) : recentActivity?.length ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 border-b pb-3 last:border-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {activity.user_name?.charAt(0) || 'A'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {activity.user_name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {activity.action} - {activity.entity_description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma atividade recente
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Users and Providers */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Users */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b p-4">
              <h3 className="font-semibold">Últimos Usuários</h3>
            </div>
            <div className="divide-y">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))
              ) : metrics?.recent_users?.length ? (
                metrics.recent_users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {getStatusLabel(user.status)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  Nenhum usuário recente
                </p>
              )}
            </div>
          </div>

          {/* Recent Providers */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b p-4">
              <h3 className="font-semibold">Últimos Prestadores</h3>
            </div>
            <div className="divide-y">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))
              ) : metrics?.recent_providers?.length ? (
                metrics.recent_providers.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {provider.provider_type}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        provider.is_active
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {provider.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  Nenhum prestador recente
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
