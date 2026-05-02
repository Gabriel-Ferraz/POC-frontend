'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loading } from '@/components/ui/loading';
import { useQuery } from '@tanstack/react-query';
import { orcamentarioApi } from '@/app/features/orcamentario/api/orcamentario-api';
import { formatCurrency } from '@/lib/formatters';

export default function AlteracaoDetalhePage() {
	const params = useParams();
	const alteracaoId = parseInt(params.id as string);

	const { data: alteracao, isLoading } = useQuery({
		queryKey: ['alteracao', alteracaoId],
		queryFn: () => orcamentarioApi.getAlteracao(alteracaoId),
	});

	if (isLoading) {
		return <Loading text="Carregando alteração orçamentária..." />;
	}

	if (!alteracao) {
		return (
			<div>
				<PageHeader title="Alteração não encontrada" description="A alteração solicitada não existe" />
			</div>
		);
	}

	const dotacoes = alteracao.dotacoes || [];

	return (
		<div className="space-y-6">
			<PageHeader
				title={`Alteração Orçamentária - ${alteracao.decreto}`}
				description={`${alteracao.tipo_ato} - ${alteracao.tipo_credito}`}
			/>

			<Card>
				<div className="p-6 space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-500">Lei/Ato Base</p>
							<p className="font-medium">
								{alteracao.lei_ato?.numero} - {alteracao.lei_ato?.tipo}
							</p>
						</div>

						<div>
							<p className="text-sm text-gray-500">Tipo de Recurso</p>
							<p className="font-medium">{alteracao.tipo_recurso}</p>
						</div>

						<div>
							<p className="text-sm text-gray-500">Valor Total</p>
							<p className="font-medium text-lg">
								{formatCurrency(parseFloat(String(alteracao.valor || 0)))}
							</p>
						</div>

						<div>
							<p className="text-sm text-gray-500">Data do Ato</p>
							<p className="font-medium">{new Date(alteracao.data_ato).toLocaleDateString('pt-BR')}</p>
						</div>

						<div>
							<p className="text-sm text-gray-500">Data de Publicação</p>
							<p className="font-medium">
								{new Date(alteracao.data_publicacao).toLocaleDateString('pt-BR')}
							</p>
						</div>
					</div>
				</div>
			</Card>

			<Card>
				<div className="p-6">
					<h3 className="font-semibold text-lg mb-4">Dotações Alteradas</h3>

					{dotacoes.length === 0 ? (
						<p className="text-center text-gray-500 py-8">Nenhuma dotação cadastrada</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Dotação</TableHead>
									<TableHead>Conta Receita</TableHead>
									<TableHead>Suprimido</TableHead>
									<TableHead>Suplementado</TableHead>
									<TableHead>Saldo Atual</TableHead>
									<TableHead>Novo Saldo</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{dotacoes.map((dotacao) => (
									<TableRow key={dotacao.id}>
										<TableCell className="font-medium">{dotacao.dotacao}</TableCell>
										<TableCell>{dotacao.conta_receita}</TableCell>
										<TableCell className="text-red-600">
											{formatCurrency(parseFloat(String(dotacao.valor_suprimido || 0)))}
										</TableCell>
										<TableCell className="text-green-600">
											{formatCurrency(parseFloat(String(dotacao.valor_suplementado || 0)))}
										</TableCell>
										<TableCell>
											{formatCurrency(parseFloat(String(dotacao.saldo_atual || 0)))}
										</TableCell>
										<TableCell className="font-semibold">
											{formatCurrency(parseFloat(String(dotacao.novo_saldo || 0)))}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>
			</Card>
		</div>
	);
}
