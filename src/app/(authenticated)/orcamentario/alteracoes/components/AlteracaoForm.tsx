'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { TipoAto, TipoCredito, TipoRecurso } from '@/types/enums';
import type { AlteracaoOrcamentaria } from '@/types/models';
import {
	listarLeisAtos,
	criarAlteracao,
	atualizarAlteracao,
	type CriarAlteracaoPayload,
} from '@/services/orcamentario.service';

interface AlteracaoFormProps {
	alteracao?: AlteracaoOrcamentaria | null;
	onClose: () => void;
}

const TIPO_ATO_LABELS = {
	[TipoAto.DECRETO]: 'Decreto',
	[TipoAto.RESOLUCAO]: 'Resolução',
	[TipoAto.ATO_GESTOR]: 'Ato do Gestor',
};

const TIPO_CREDITO_LABELS = {
	[TipoCredito.ESPECIAL]: 'Especial',
	[TipoCredito.SUPLEMENTAR]: 'Suplementar',
	[TipoCredito.EXTRAORDINARIO]: 'Extraordinário',
};

const TIPO_RECURSO_LABELS = {
	[TipoRecurso.SUPERAVIT]: 'Superávit',
	[TipoRecurso.EXCESSO_ARRECADACAO]: 'Excesso de Arrecadação',
	[TipoRecurso.VALOR_CREDITO]: 'Valor do Crédito',
};

export function AlteracaoForm({ alteracao, onClose }: AlteracaoFormProps) {
	const queryClient = useQueryClient();
	const isEditing = !!alteracao;

	const [leiAtoId, setLeiAtoId] = useState(alteracao?.lei_ato_id ? String(alteracao.lei_ato_id) : '');
	const [decretoAutorizador, setDecretoAutorizador] = useState(alteracao?.decreto_autorizador || '');
	const [tipoAto, setTipoAto] = useState(alteracao?.tipo_ato || '');
	const [tipoCredito, setTipoCredito] = useState(alteracao?.tipo_credito || '');
	const [tipoRecurso, setTipoRecurso] = useState(alteracao?.tipo_recurso || '');
	const [valorCredito, setValorCredito] = useState(alteracao?.valor_credito ? String(alteracao.valor_credito) : '');
	const [dataAto, setDataAto] = useState(alteracao?.data_ato || '');
	const [dataPublicacao, setDataPublicacao] = useState(alteracao?.data_publicacao || '');

	const { data: leisAtos, isLoading: loadingLeis } = useQuery({
		queryKey: ['leis-atos'],
		queryFn: listarLeisAtos,
	});

	const createMutation = useMutation({
		mutationFn: criarAlteracao,
		onSuccess: () => {
			toast.success('Alteração orçamentária criada com sucesso');
			queryClient.invalidateQueries({ queryKey: ['alteracoes-orcamentarias'] });
			onClose();
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao criar alteração orçamentária');
		},
	});

	const updateMutation = useMutation({
		mutationFn: (payload: CriarAlteracaoPayload) => atualizarAlteracao(alteracao!.id, payload),
		onSuccess: () => {
			toast.success('Alteração orçamentária atualizada com sucesso');
			queryClient.invalidateQueries({ queryKey: ['alteracoes-orcamentarias'] });
			onClose();
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao atualizar alteração orçamentária');
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!leiAtoId ||
			!decretoAutorizador ||
			!tipoAto ||
			!tipoCredito ||
			!tipoRecurso ||
			!valorCredito ||
			!dataAto ||
			!dataPublicacao
		) {
			toast.error('Por favor, preencha todos os campos obrigatórios');
			return;
		}

		const payload: CriarAlteracaoPayload = {
			lei_ato_id: Number(leiAtoId),
			decreto_autorizador: decretoAutorizador,
			tipo_ato: tipoAto,
			tipo_credito: tipoCredito,
			tipo_recurso: tipoRecurso,
			valor_credito: Number(valorCredito),
			data_ato: dataAto,
			data_publicacao: dataPublicacao,
		};

		if (isEditing) {
			updateMutation.mutate(payload);
		} else {
			createMutation.mutate(payload);
		}
	};

	const isLoading = createMutation.isPending || updateMutation.isPending;

	return (
		<form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto pr-2">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
				<div className="space-y-1.5 sm:space-y-2 md:col-span-2">
					<Label htmlFor="lei_ato_id" className="text-xs sm:text-sm">
						Lei/Ato *
					</Label>
					<Select value={leiAtoId} onValueChange={setLeiAtoId} disabled={loadingLeis || isLoading}>
						<SelectTrigger className="text-xs sm:text-sm">
							<SelectValue placeholder="Selecione uma lei ou ato" />
						</SelectTrigger>
						<SelectContent>
							{leisAtos?.map((lei) => (
								<SelectItem key={lei.id} value={String(lei.id)}>
									{lei.numero} - {lei.tipo}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5 sm:space-y-2 md:col-span-2">
					<Label htmlFor="decreto_autorizador" className="text-xs sm:text-sm">
						Decreto Autorizador *
					</Label>
					<Input
						id="decreto_autorizador"
						value={decretoAutorizador}
						onChange={(e) => setDecretoAutorizador(e.target.value)}
						placeholder="Ex: 001/2024"
						disabled={isLoading}
						className="text-xs sm:text-sm"
					/>
				</div>

				<div className="space-y-1.5 sm:space-y-2">
					<Label htmlFor="tipo_ato" className="text-xs sm:text-sm">
						Tipo de Ato *
					</Label>
					<Select value={tipoAto} onValueChange={setTipoAto} disabled={isLoading}>
						<SelectTrigger className="text-xs sm:text-sm">
							<SelectValue placeholder="Selecione o tipo de ato" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={TipoAto.DECRETO}>{TIPO_ATO_LABELS[TipoAto.DECRETO]}</SelectItem>
							<SelectItem value={TipoAto.RESOLUCAO}>{TIPO_ATO_LABELS[TipoAto.RESOLUCAO]}</SelectItem>
							<SelectItem value={TipoAto.ATO_GESTOR}>{TIPO_ATO_LABELS[TipoAto.ATO_GESTOR]}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5 sm:space-y-2">
					<Label htmlFor="tipo_credito" className="text-xs sm:text-sm">
						Tipo de Crédito *
					</Label>
					<Select value={tipoCredito} onValueChange={setTipoCredito} disabled={isLoading}>
						<SelectTrigger className="text-xs sm:text-sm">
							<SelectValue placeholder="Selecione o tipo de crédito" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={TipoCredito.ESPECIAL}>
								{TIPO_CREDITO_LABELS[TipoCredito.ESPECIAL]}
							</SelectItem>
							<SelectItem value={TipoCredito.SUPLEMENTAR}>
								{TIPO_CREDITO_LABELS[TipoCredito.SUPLEMENTAR]}
							</SelectItem>
							<SelectItem value={TipoCredito.EXTRAORDINARIO}>
								{TIPO_CREDITO_LABELS[TipoCredito.EXTRAORDINARIO]}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5 sm:space-y-2">
					<Label htmlFor="tipo_recurso" className="text-xs sm:text-sm">
						Tipo de Recurso *
					</Label>
					<Select value={tipoRecurso} onValueChange={setTipoRecurso} disabled={isLoading}>
						<SelectTrigger className="text-xs sm:text-sm">
							<SelectValue placeholder="Selecione o tipo de recurso" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={TipoRecurso.SUPERAVIT}>
								{TIPO_RECURSO_LABELS[TipoRecurso.SUPERAVIT]}
							</SelectItem>
							<SelectItem value={TipoRecurso.EXCESSO_ARRECADACAO}>
								{TIPO_RECURSO_LABELS[TipoRecurso.EXCESSO_ARRECADACAO]}
							</SelectItem>
							<SelectItem value={TipoRecurso.VALOR_CREDITO}>
								{TIPO_RECURSO_LABELS[TipoRecurso.VALOR_CREDITO]}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5 sm:space-y-2">
					<Label htmlFor="valor_credito" className="text-xs sm:text-sm">
						Valor do Crédito *
					</Label>
					<Input
						id="valor_credito"
						type="number"
						step="0.01"
						min="0"
						value={valorCredito}
						onChange={(e) => setValorCredito(e.target.value)}
						placeholder="0.00"
						disabled={isLoading}
						className="text-xs sm:text-sm"
					/>
				</div>

				<div className="space-y-1.5 sm:space-y-2">
					<Label htmlFor="data_ato" className="text-xs sm:text-sm">
						Data do Ato *
					</Label>
					<Input
						id="data_ato"
						type="date"
						value={dataAto}
						onChange={(e) => setDataAto(e.target.value)}
						disabled={isLoading}
						className="text-xs sm:text-sm"
					/>
				</div>

				<div className="space-y-1.5 sm:space-y-2">
					<Label htmlFor="data_publicacao" className="text-xs sm:text-sm">
						Data da Publicação *
					</Label>
					<Input
						id="data_publicacao"
						type="date"
						value={dataPublicacao}
						onChange={(e) => setDataPublicacao(e.target.value)}
						disabled={isLoading}
						className="text-xs sm:text-sm"
					/>
				</div>
			</div>

			<div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 sm:pt-4 border-t">
				<Button
					type="button"
					variant="outline"
					onClick={onClose}
					disabled={isLoading}
					className="w-full sm:w-auto">
					Cancelar
				</Button>
				<Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
					{isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
				</Button>
			</div>
		</form>
	);
}
