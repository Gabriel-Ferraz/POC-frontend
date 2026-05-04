'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, CheckCircle, FileText, Minimize2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { toast } from 'sonner';
import { useFormMinimize } from '@/hooks/useFormMinimize';
import { obterAlteracao } from '@/services/orcamentario.service';
import type { DotacaoAlteracao } from '@/types/models';
import { DotacaoForm } from './components/DotacaoForm';

interface FormData {
	dialogOpen: boolean;
}

const TIPO_ATO_LABELS: Record<string, string> = {
	decreto: 'Decreto',
	resolucao: 'Resolução',
	ato_gestor: 'Ato do Gestor',
};

const TIPO_CREDITO_LABELS: Record<string, string> = {
	especial: 'Especial',
	suplementar: 'Suplementar',
	extraordinario: 'Extraordinário',
};

const TIPO_RECURSO_LABELS: Record<string, string> = {
	superavit: 'Superávit',
	excesso_arrecadacao: 'Excesso de Arrecadação',
};

export default function DotacoesPage() {
	const router = useRouter();
	const params = useParams();
	const queryClient = useQueryClient();
	const alteracaoId = Number(params.id);

	const [dialogOpen, setDialogOpen] = useState(false);

	// Sistema de minimização
	const { minimizar, isMinimizado, temDadosRestaurados } = useFormMinimize<FormData>({
		titulo: 'Dotações Orçamentárias',
		icone: <FileText className="w-4 h-4" />,
		onRestore: (dados) => {
			setDialogOpen(dados.dialogOpen);
			toast.success('Dados restaurados com sucesso!');
		},
	});

	const { data, isLoading } = useQuery({
		queryKey: ['alteracao', alteracaoId],
		queryFn: () => obterAlteracao(alteracaoId),
		enabled: !!alteracaoId,
	});

	const handleCloseDialog = () => {
		setDialogOpen(false);
	};

	const handleMinimizar = () => {
		const formData: FormData = {
			dialogOpen,
		};
		minimizar(formData);
	};

	const getLeiAtoDisplay = (leiAto: any) => {
		if (typeof leiAto === 'string') {
			return leiAto;
		}
		if (leiAto && typeof leiAto === 'object') {
			return `${leiAto.numero} - ${TIPO_ATO_LABELS[leiAto.tipo] || leiAto.tipo}`;
		}
		return '-';
	};

	if (isLoading) {
		return <Loading text="Carregando dotações..." />;
	}

	if (!data) {
		return (
			<div>
				<EmptyState
					icon={<FileText className="w-12 h-12" />}
					title="Alteração não encontrada"
					description="A alteração orçamentária solicitada não existe"
				/>
			</div>
		);
	}

	const { alteracao, dotacoes } = data;
	const dotacoesList = dotacoes || [];
	const totalSuprimido = dotacoesList.reduce((acc, d) => acc + Number(d.valor_suprimido || 0), 0);
	const totalSuplementado = dotacoesList.reduce((acc, d) => acc + Number(d.valor_suplementado || 0), 0);
	const diferenca = totalSuplementado - totalSuprimido;

	// Se está minimizado
	if (isMinimizado) {
		return (
			<div className="flex items-center justify-center h-[60vh]">
				<div className="text-center space-y-3">
					<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
						<Minimize2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
					</div>
					<h3 className="text-lg font-semibold">Tela Minimizada</h3>
					<p className="text-sm text-gray-500">Clique na miniatura na barra inferior para restaurar</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<Button variant="ghost" onClick={() => router.push('/orcamentario/alteracoes')} className="mb-4">
					<ArrowLeft className="w-4 h-4 mr-2" />
					<span className="hidden sm:inline">Voltar para Alterações</span>
					<span className="sm:hidden">Voltar</span>
				</Button>

				<PageHeader
					title={`Dotações - Ato ${alteracao.decreto_autorizador}`}
					description={`Lei/Ato: ${getLeiAtoDisplay(alteracao.lei_ato)} | Tipo: ${TIPO_ATO_LABELS[alteracao.tipo_ato] || alteracao.tipo_ato} | Crédito: ${TIPO_CREDITO_LABELS[alteracao.tipo_credito] || alteracao.tipo_credito} | Recurso: ${TIPO_RECURSO_LABELS[alteracao.tipo_recurso] || alteracao.tipo_recurso} | Data: ${formatDate(alteracao.data_ato)}`}
					action={
						<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
							<Button variant="outline" onClick={handleMinimizar} className="w-full sm:w-auto">
								<Minimize2 className="w-4 h-4 sm:mr-2" />
								<span className="hidden sm:inline">Minimizar</span>
							</Button>
							<Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
								<Plus className="w-4 h-4 sm:mr-2" />
								<span className="hidden sm:inline">Adicionar Dotação</span>
								<span className="sm:hidden">Adicionar</span>
							</Button>
						</div>
					}
				/>
			</div>

			{temDadosRestaurados && (
				<Alert>
					<CheckCircle className="w-4 h-4" />
					<AlertDescription>Dados restaurados com sucesso</AlertDescription>
				</Alert>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
				<Card className="p-4 sm:p-6">
					<div className="space-y-1 sm:space-y-2">
						<p className="text-xs sm:text-sm text-muted-foreground">Total Suprimido</p>
						<p className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(totalSuprimido)}</p>
					</div>
				</Card>
				<Card className="p-4 sm:p-6">
					<div className="space-y-1 sm:space-y-2">
						<p className="text-xs sm:text-sm text-muted-foreground">Total Suplementado</p>
						<p className="text-xl sm:text-2xl font-bold text-green-600">
							{formatCurrency(totalSuplementado)}
						</p>
					</div>
				</Card>
				<Card className="p-4 sm:p-6">
					<div className="space-y-1 sm:space-y-2">
						<p className="text-xs sm:text-sm text-muted-foreground">Diferença</p>
						<p
							className={`text-xl sm:text-2xl font-bold ${
								diferenca === 0 ? 'text-blue-600' : diferenca > 0 ? 'text-green-600' : 'text-red-600'
							}`}>
							{formatCurrency(diferenca)}
						</p>
					</div>
				</Card>
			</div>

			{dotacoesList.length === 0 ? (
				<Card>
					<EmptyState
						icon={<FileText className="w-12 h-12" />}
						title="Nenhuma dotação cadastrada"
						description="Clique em 'Adicionar Dotação' para começar"
					/>
				</Card>
			) : (
				<>
					{/* Desktop */}
					<Card className="hidden lg:block">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Dotação Orçamentária</TableHead>
										<TableHead>Conta Receita</TableHead>
										<TableHead>Saldo Atual</TableHead>
										<TableHead>Valor Suprimido</TableHead>
										<TableHead>Valor Suplementado</TableHead>
										<TableHead>Novo Saldo</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{dotacoesList.map((dotacao) => (
										<TableRow key={dotacao.id}>
											<TableCell className="font-medium">
												{dotacao.dotacao_orcamentaria}
											</TableCell>
											<TableCell>{dotacao.conta_receita || '-'}</TableCell>
											<TableCell className="font-semibold">
												{formatCurrency(Number(dotacao.saldo_atual))}
											</TableCell>
											<TableCell className="text-red-600">
												{formatCurrency(Number(dotacao.valor_suprimido))}
											</TableCell>
											<TableCell className="text-green-600">
												{formatCurrency(Number(dotacao.valor_suplementado))}
											</TableCell>
											<TableCell className="font-semibold">
												{formatCurrency(Number(dotacao.novo_saldo))}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</Card>

					{/* Mobile */}
					<div className="lg:hidden space-y-3">
						{dotacoesList.map((dotacao) => (
							<Card key={dotacao.id} className="p-4">
								<div className="space-y-3">
									<div>
										<p className="text-xs text-muted-foreground">Dotação Orçamentária</p>
										<p className="font-medium text-sm break-words">
											{dotacao.dotacao_orcamentaria}
										</p>
									</div>

									{dotacao.conta_receita && (
										<div>
											<p className="text-xs text-muted-foreground">Conta Receita</p>
											<p className="text-sm break-words">{dotacao.conta_receita}</p>
										</div>
									)}

									<div className="grid grid-cols-2 gap-3 pt-2 border-t">
										<div>
											<p className="text-xs text-muted-foreground">Saldo Atual</p>
											<p className="font-semibold text-sm">
												{formatCurrency(Number(dotacao.saldo_atual))}
											</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Novo Saldo</p>
											<p className="font-semibold text-sm">
												{formatCurrency(Number(dotacao.novo_saldo))}
											</p>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<p className="text-xs text-muted-foreground">Valor Suprimido</p>
											<p className="text-red-600 font-medium text-sm">
												{formatCurrency(Number(dotacao.valor_suprimido))}
											</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Valor Suplementado</p>
											<p className="text-green-600 font-medium text-sm">
												{formatCurrency(Number(dotacao.valor_suplementado))}
											</p>
										</div>
									</div>
								</div>
							</Card>
						))}
					</div>
				</>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
					<DialogHeader>
						<DialogTitle className="text-base sm:text-lg">Nova Dotação</DialogTitle>
					</DialogHeader>
					<div className="overflow-y-auto flex-1">
						<DotacaoForm
							alteracaoId={alteracaoId}
							dotacao={null}
							tipoRecurso={alteracao.tipo_recurso}
							onClose={handleCloseDialog}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
