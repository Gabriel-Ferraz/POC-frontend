import AuthenticatedLayout from '@/layout/AuthenticatedLayout';
import ProtectedPage from '@/components/auth/ProtectedPage';
import { ADMIN } from '@/app/features/admin/permissions';

export default function AuditLogsPage() {
	return (
		<AuthenticatedLayout>
			<ProtectedPage permission={ADMIN.auditLogsTab}>
				<div className="space-y-4">
					<h1 className="text-2xl font-bold">Logs de Auditoria</h1>
					<p className="text-muted-foreground">TODO: Implementar visualizacao de logs.</p>
				</div>
			</ProtectedPage>
		</AuthenticatedLayout>
	);
}
