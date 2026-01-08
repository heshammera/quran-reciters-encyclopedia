
import UserRow from "@/components/admin/UserRow";
import { getUsersList } from "@/app/actions/users";
import AddUserButton from "@/components/admin/AddUserButton";
import { AdminUser } from "@/types/admin";

export default async function UsersPage() {
    // Check if current user is admin strictly, otherwise 404/redirect
    // The Layout already checks isAdmin(), but let's be double sure or just rely on layout.

    let users: AdminUser[] = [];
    try {
        users = await getUsersList();
    } catch (e) {
        console.error(e);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>👥</span>
                إدارة المستخدمين
                <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                    {users.length}
                </span>
            </h1>

            <div className="flex justify-end">
                <AddUserButton />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right min-w-[600px] md:min-w-0">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium">
                            <tr>
                                <th className="p-4">البريد الإلكتروني</th>
                                <th className="p-4 hidden md:table-cell">تاريخ التسجيل</th>
                                <th className="p-4 hidden md:table-cell">آخر دخول</th>
                                <th className="p-4">الدور والصلاحيات</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {users.map((user: AdminUser) => (
                                <UserRow key={user.id} user={user} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
