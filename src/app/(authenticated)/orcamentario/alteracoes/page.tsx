'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FileText, Download, Eye, Plus, Minimize2, CheckCircle } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';
import { useFormMinimize } from '@/hooks/useFormMinimize';
import { listarAlteracoes, getPdfUrl } from '@/services/orcamentario.service';
import type { AlteracaoOrcamentaria } from '@/types/models';
import { AlteracaoForm } from './components/AlteracaoForm';

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

export default function AlteracoesOrcamentariasPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [dialogOpen, setDialogOpen] = useState(false);

	// Sistema de minimização
	const { minimizar, isMinimizado, temDadosRestaurados } = useFormMinimize<FormData>({
		titulo: 'Alterações Orçamentárias',
		icone: <FileText className="w-4 h-4" />,
		onRestore: (dados) => {
			setDialogOpen(dados.dialogOpen);
			toast.success('Dados restaurados com sucesso!');
		},
	});

	const { data: alteracoes, isLoading } = useQuery({
		queryKey: ['alteracoes-orcamentarias'],
		queryFn: listarAlteracoes,
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
		return <Loading text="Carregando alterações orçamentárias..." />;
	}

	const alteracoesList = alteracoes || [];

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
		<div>
			<PageHeader
				title="Alterações Orçamentárias"
				description="Gerencie as alterações orçamentárias e suas dotações"
				action={
					<div className="flex gap-2">
						<Button variant="outline" onClick={handleMinimizar}>
							<Minimize2 className="w-4 h-4 mr-2" />
							Minimizar
						</Button>
						<Button onClick={() => setDialogOpen(true)}>
							<Plus className="w-4 h-4 mr-2" />
							Nova Alteração
						</Button>
					</div>
				}
			/>

			{temDadosRestaurados && (
				<Alert className="mb-4">
					<CheckCircle className="w-4 h-4" />
					<AlertDescription>Dados restaurados com sucesso</AlertDescription>
				</Alert>
			)}

			{alteracoesList.length === 0 ? (
				<Card>
					<EmptyState
						icon={<FileText className="w-12 h-12" />}
						title="Nenhuma alteração cadastrada"
						description="Clique em 'Nova Alteração' para começar"
					/>
				</Card>
			) : (
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Decreto Autorizador</TableHead>
								<TableHead>Lei/Ato</TableHead>
								<TableHead>Tipo de Ato</TableHead>
								<TableHead>Tipo de Crédito</TableHead>
								<TableHead>Valor do Crédito</TableHead>
								<TableHead>Data do Ato</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{alteracoesList.map((alteracao) => (
								<TableRow key={alteracao.id}>
									<TableCell className="font-medium">{alteracao.decreto_autorizador}</TableCell>
									<TableCell>{getLeiAtoDisplay(alteracao.lei_ato)}</TableCell>
									<TableCell>{TIPO_ATO_LABELS[alteracao.tipo_ato] || alteracao.tipo_ato}</TableCell>
									<TableCell>
										{TIPO_CREDITO_LABELS[alteracao.tipo_credito] || alteracao.tipo_credito}
									</TableCell>
									<TableCell>{formatCurrency(Number(alteracao.valor_credito || 0))}</TableCell>
									<TableCell>{formatDate(alteracao.data_ato)}</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() =>
													router.push(`/orcamentario/alteracoes/${alteracao.id}/dotacoes`)
												}>
												<Eye className="w-4 h-4 mr-1" />
												Dotações
											</Button>
											<a href={getPdfUrl(alteracao.id)} target="_blank" rel="noopener noreferrer">
												<Button size="sm" variant="outline">
													<Download className="w-4 h-4 mr-1" />
													PDF
												</Button>
											</a>
										</div>
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
						<DialogTitle>Nova Alteração Orçamentária</DialogTitle>
					</DialogHeader>
					<AlteracaoForm alteracao={null} onClose={handleCloseDialog} />
				</DialogContent>
			</Dialog>
		</div>
	);
}
