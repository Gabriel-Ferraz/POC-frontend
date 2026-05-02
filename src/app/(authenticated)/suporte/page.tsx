'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { suporteApi } from '@/app/features/suporte/api/suporte-api';
import { HelpCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/formatters';

export default function SuportePage() {
	const router = useRouter();

	const {
		data: chamados,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['chamados'],
		queryFn: suporteApi.getChamados,
	});

	if (isLoading) {
		return <Loading text="Carregando chamados..." />;
	}

	if (error) {
		console.error('Erro ao carregar chamados:', error);
		return (
			<div>
				<PageHeader
					title="Meus Chamados"
					description="Lista de chamados de suporte abertos"
					action={<Button onClick={() => router.push('/suporte/novo')}>Novo Chamado</Button>}
				/>
				<Card>
					<div className="p-8 text-center text-red-500">
						<p>Erro ao carregar chamados</p>
						<p className="text-sm mt-2">{(error as any)?.message || 'Tente novamente'}</p>
					</div>
				</Card>
			</div>
		);
	}

	const chamadosList = Array.isArray(chamados) ? chamados : [];

	console.log('Chamados carregados:', chamadosList);

	return (
		<div>
			<PageHeader
				title="Meus Chamados"
				description="Lista de chamados de suporte abertos"
				action={<Button onClick={() => router.push('/suporte/novo')}>Novo Chamado</Button>}
			/>

			{chamadosList.length === 0 ? (
				<Card>
					<EmptyState
						icon={<HelpCircle className="w-12 h-12" />}
						title="Nenhum chamado encontrado"
						description="Você ainda não abriu nenhum chamado de suporte"
					/>
				</Card>
			) : (
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Protocolo</TableHead>
								<TableHead>Módulo</TableHead>
								<TableHead>Assunto</TableHead>
								<TableHead>Data Abertura</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{chamadosList.map((chamado) => (
								<TableRow key={chamado.id}>
									<TableCell className="font-medium">#{chamado.id}</TableCell>
									<TableCell>{chamado.modulo}</TableCell>
									<TableCell>{chamado.assunto}</TableCell>
									<TableCell>{formatDateTime(chamado.created_at)}</TableCell>
									<TableCell>
										<StatusBadge status={chamado.status} />
									</TableCell>
									<TableCell className="text-right">
										<Button
											size="sm"
											onClick={() => router.push(`/suporte/chamados/${chamado.id}`)}>
											Ver Detalhes
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			)}
		</div>
	);
}
