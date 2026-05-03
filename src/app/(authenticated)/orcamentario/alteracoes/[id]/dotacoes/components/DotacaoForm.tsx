'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatters';
import type { DotacaoAlteracao } from '@/types/models';
import { criarDotacao, type CriarDotacaoPayload } from '@/services/orcamentario.service';

interface DotacaoFormProps {
	alteracaoId: number;
	dotacao?: DotacaoAlteracao | null;
	tipoRecurso: string;
	onClose: () => void;
}

export function DotacaoForm({ alteracaoId, dotacao, tipoRecurso, onClose }: DotacaoFormProps) {
	const queryClient = useQueryClient();

	const [dotacaoOrcamentaria, setDotacaoOrcamentaria] = useState(dotacao?.dotacao_orcamentaria || '');
	const [contaReceita, setContaReceita] = useState(dotacao?.conta_receita || '');
	const [valorSuprimido, setValorSuprimido] = useState(dotacao ? String(dotacao.valor_suprimido) : '0');
	const [valorSuplementado, setValorSuplementado] = useState(dotacao ? String(dotacao.valor_suplementado) : '0');
	const [saldoAtual, setSaldoAtual] = useState(dotacao ? String(dotacao.saldo_atual) : '');

	// Calcular novo saldo em tempo real
	const novoSaldo = Number(saldoAtual || 0) - Number(valorSuprimido || 0) + Number(valorSuplementado || 0);

	const mostrarContaReceita = tipoRecurso === 'excesso_arrecadacao';

	const createMutation = useMutation({
		mutationFn: (payload: CriarDotacaoPayload) => criarDotacao(alteracaoId, payload),
		onSuccess: () => {
			toast.success('Dotação criada com sucesso');
			queryClient.invalidateQueries({ queryKey: ['alteracao', alteracaoId] });
			onClose();
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao criar dotação');
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!dotacaoOrcamentaria || !valorSuprimido || !valorSuplementado || !saldoAtual) {
			toast.error('Por favor, preencha todos os campos obrigatórios');
			return;
		}

		// Validar saldo
		const suprimido = Number(valorSuprimido || 0);
		const atual = Number(saldoAtual || 0);
		if (suprimido > atual) {
			toast.error('Valor suprimido não pode ser maior que o saldo atual');
			return;
		}

		if (novoSaldo < 0) {
			toast.error('O novo saldo não pode ser negativo');
			return;
		}

		const payload: CriarDotacaoPayload = {
			dotacao_orcamentaria: dotacaoOrcamentaria,
			valor_suprimido: Number(valorSuprimido),
			valor_suplementado: Number(valorSuplementado),
			saldo_atual: Number(saldoAtual),
		};

		if (mostrarContaReceita && contaReceita) {
			payload.conta_receita = contaReceita;
		}

		createMutation.mutate(payload);
	};

	const isLoading = createMutation.isPending;

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="dotacao_orcamentaria">Dotação Orçamentária *</Label>
				<Input
					id="dotacao_orcamentaria"
					value={dotacaoOrcamentaria}
					onChange={(e) => setDotacaoOrcamentaria(e.target.value)}
					placeholder="Ex: 1.2.3.4.5.6.7"
					disabled={isLoading || !!dotacao}
				/>
			</div>

			{mostrarContaReceita && (
				<div className="space-y-2">
					<Label htmlFor="conta_receita">Conta Receita</Label>
					<Input
						id="conta_receita"
						value={contaReceita}
						onChange={(e) => setContaReceita(e.target.value)}
						placeholder="Ex: 4.1.1.2.8.01.1.0"
						disabled={isLoading}
					/>
				</div>
			)}

			<div className="space-y-2">
				<Label htmlFor="saldo_atual">Saldo Atual *</Label>
				<Input
					id="saldo_atual"
					type="number"
					step="0.01"
					min="0"
					value={saldoAtual}
					onChange={(e) => setSaldoAtual(e.target.value)}
					placeholder="0.00"
					disabled={isLoading}
				/>
				<p className="text-sm text-gray-500">Informe o saldo atual da dotação orçamentária</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="valor_suprimido">Valor Suprimido *</Label>
					<Input
						id="valor_suprimido"
						type="number"
						step="0.01"
						min="0"
						value={valorSuprimido}
						onChange={(e) => setValorSuprimido(e.target.value)}
						placeholder="0.00"
						disabled={isLoading}
					/>
					{saldoAtual && Number(valorSuprimido || 0) > Number(saldoAtual) && (
						<p className="text-sm text-red-500">Valor maior que o saldo atual</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="valor_suplementado">Valor Suplementado *</Label>
					<Input
						id="valor_suplementado"
						type="number"
						step="0.01"
						min="0"
						value={valorSuplementado}
						onChange={(e) => setValorSuplementado(e.target.value)}
						placeholder="0.00"
						disabled={isLoading}
					/>
				</div>
			</div>

			{saldoAtual && (
				<Card className="p-4 bg-green-50 border-green-200">
					<div className="flex justify-between items-center">
						<span className="text-green-700 font-medium">Novo Saldo:</span>
						<span className={`text-xl font-bold ${novoSaldo < 0 ? 'text-red-600' : 'text-green-600'}`}>
							{formatCurrency(novoSaldo)}
						</span>
					</div>
					{novoSaldo < 0 && (
						<p className="text-sm text-red-600 mt-2">Atenção: O novo saldo não pode ser negativo</p>
					)}
				</Card>
			)}

			<div className="flex justify-end gap-2 pt-4">
				<Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
					Cancelar
				</Button>
				<Button type="submit" disabled={isLoading || novoSaldo < 0}>
					{isLoading ? 'Salvando...' : 'Salvar'}
				</Button>
			</div>
		</form>
	);
}
