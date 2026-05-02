'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';

export default function GestorSolicitacoesPage() {
	return (
		<div>
			<PageHeader title="Aprovar Anexos" description="Lista de solicitações pendentes de aprovação de anexos" />

			<Card>
				<div className="p-8 text-center text-gray-500">
					<p>Página em construção</p>
					<p className="text-sm mt-2">Lista de solicitações para aprovação será implementada aqui</p>
				</div>
			</Card>
		</div>
	);
}
