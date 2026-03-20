import AuthenticatedLayout from '@/layout/AuthenticatedLayout';
import ProtectedPage from '@/components/auth/ProtectedPage';
import { ADMIN } from '@/app/features/admin/permissions';

export default function PermissoesPage() {
	return (
		<AuthenticatedLayout>
			<ProtectedPage permission={ADMIN.permissionsTab}>
				<div className="space-y-4">
					<h1 className="text-2xl font-bold">Permissoes</h1>
					<p className="text-muted-foreground">TODO: Implementar visualizacao de permissoes.</p>
				</div>
			</ProtectedPage>
		</AuthenticatedLayout>
	);
}
