'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CancelarSolicitacaoModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (motivo: string, dataCancelamento: string) => void;
	isPending?: boolean;
}

export function CancelarSolicitacaoModal({ open, onClose, onConfirm, isPending }: CancelarSolicitacaoModalProps) {
	const today = new Date().toISOString().split('T')[0];
	const [motivo, setMotivo] = useState('');
	const [dataCancelamento, setDataCancelamento] = useState(today);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (motivo.trim().length < 10) return;
		if (!dataCancelamento) return;
		onConfirm(motivo.trim(), dataCancelamento);
	};

	const handleClose = () => {
		setMotivo('');
		setDataCancelamento(today);
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Cancelar Solicitação de Pagamento</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="data_cancelamento">Data de Cancelamento *</Label>
						<Input
							id="data_cancelamento"
							type="date"
							value={dataCancelamento}
							onChange={(e) => setDataCancelamento(e.target.value)}
							disabled={isPending}
							required
						/>
					</div>

					<div>
						<div className="flex items-center justify-between mb-2">
							<Label htmlFor="motivo">Motivo *</Label>
							<span
								className={`text-sm ${
									motivo.length < 10
										? 'text-red-600'
										: motivo.length < 500
											? 'text-green-600'
											: 'text-orange-600'
								}`}>
								{motivo.length}/500 caracteres {motivo.length < 10 && '(mínimo 10)'}
							</span>
						</div>
						<Textarea
							id="motivo"
							placeholder="Descreva o motivo do cancelamento (mínimo 10 caracteres)..."
							value={motivo}
							onChange={(e) => setMotivo(e.target.value)}
							disabled={isPending}
							rows={5}
							maxLength={500}
							required
							className={motivo.length > 0 && motivo.length < 10 ? 'border-red-500' : ''}
						/>
					</div>

					<div className="flex gap-3 justify-end">
						<Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
							Voltar
						</Button>
						<Button
							variant="destructive"
							type="submit"
							disabled={isPending || motivo.trim().length < 10 || !dataCancelamento}>
							{isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
