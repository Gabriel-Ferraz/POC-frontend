'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { suporteApi } from '@/app/features/suporte/api/suporte-api';
import { toast } from 'sonner';

export default function NovoChamadoPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [modulo, setModulo] = useState('');
	const [assunto, setAssunto] = useState('');
	const [mensagem, setMensagem] = useState('');

	const { mutate: criarChamado, isPending } = useMutation({
		mutationFn: suporteApi.criarChamado,
		onSuccess: () => {
			toast.success('Chamado aberto com sucesso!');
			// Invalida o cache para forçar reload da lista
			queryClient.invalidateQueries({ queryKey: ['chamados'] });
			router.push('/suporte');
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao abrir chamado');
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!modulo || !assunto || !mensagem) {
			toast.error('Preencha todos os campos');
			return;
		}

		criarChamado({ modulo, assunto, mensagem });
	};

	return (
		<div>
			<PageHeader title="Novo Chamado" description="Abrir um novo chamado de suporte" />

			<Card>
				<div className="p-6">
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div>
							<Label htmlFor="modulo">Módulo</Label>
							<Input
								id="modulo"
								placeholder="Ex: Portal do Fornecedor"
								value={modulo}
								onChange={(e) => setModulo(e.target.value)}
								disabled={isPending}
							/>
						</div>

						<div>
							<Label htmlFor="assunto">Assunto</Label>
							<Input
								id="assunto"
								placeholder="Descreva brevemente o problema"
								value={assunto}
								onChange={(e) => setAssunto(e.target.value)}
								disabled={isPending}
							/>
						</div>

						<div>
							<Label htmlFor="mensagem">Mensagem</Label>
							<Textarea
								id="mensagem"
								placeholder="Descreva detalhadamente o problema..."
								rows={6}
								value={mensagem}
								onChange={(e) => setMensagem(e.target.value)}
								disabled={isPending}
							/>
						</div>

						<div className="flex gap-3 justify-end">
							<Button variant="outline" onClick={() => router.back()} type="button" disabled={isPending}>
								Cancelar
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? 'Abrindo...' : 'Abrir Chamado'}
							</Button>
						</div>
					</form>
				</div>
			</Card>
		</div>
	);
}
