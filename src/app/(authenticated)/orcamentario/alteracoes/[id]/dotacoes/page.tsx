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
					Voltar para Alterações
				</Button>

				<PageHeader
					title={`Dotações - Ato ${alteracao.decreto_autorizador}`}
					description={`Lei/Ato: ${getLeiAtoDisplay(alteracao.lei_ato)} | Tipo: ${TIPO_ATO_LABELS[alteracao.tipo_ato] || alteracao.tipo_ato} | Crédito: ${TIPO_CREDITO_LABELS[alteracao.tipo_credito] || alteracao.tipo_credito} | Recurso: ${TIPO_RECURSO_LABELS[alteracao.tipo_recurso] || alteracao.tipo_recurso} | Data: ${formatDate(alteracao.data_ato)}`}
					action={
						<div className="flex gap-2">
							<Button variant="outline" onClick={handleMinimizar}>
								<Minimize2 className="w-4 h-4 mr-2" />
								Minimizar
							</Button>
							<Button onClick={() => setDialogOpen(true)}>
								<Plus className="w-4 h-4 mr-2" />
								Adicionar Dotação
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

			<div className="grid grid-cols-3 gap-4">
				<Card className="p-6">
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Total Suprimido</p>
						<p className="text-2xl font-bold text-red-600">{formatCurrency(totalSuprimido)}</p>
					</div>
				</Card>
				<Card className="p-6">
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Total Suplementado</p>
						<p className="text-2xl font-bold text-green-600">{formatCurrency(totalSuplementado)}</p>
					</div>
				</Card>
				<Card className="p-6">
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Diferença</p>
						<p
							className={`text-2xl font-bold ${
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
				<Card>
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
									<TableCell className="font-medium">{dotacao.dotacao_orcamentaria}</TableCell>
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
				</Card>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Nova Dotação</DialogTitle>
					</DialogHeader>
					<DotacaoForm
						alteracaoId={alteracaoId}
						dotacao={null}
						tipoRecurso={alteracao.tipo_recurso}
						onClose={handleCloseDialog}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
