"use client";

import { PermissionSchema, DEFAULT_PERMISSIONS, PermissionAction } from "@/types/admin";
import { useState, useEffect } from "react";

interface PermissionMatrixProps {
    permissions: PermissionSchema;
    onChange: (newPermissions: PermissionSchema) => void;
    disabled?: boolean;
}

const SECTIONS = [
    { key: "reciters", label: "القراء" },
    { key: "recordings", label: "التسجيلات" },
    { key: "sections", label: "الأقسام" },
    { key: "collections", label: "المجموعات" },
    { key: "pages", label: "الصفحات" },
    { key: "users", label: "المستخدمين" },
] as const;

const ACTIONS: { key: PermissionAction; label: string }[] = [
    { key: "view", label: "عرض" },
    { key: "create", label: "إضافة" },
    { key: "edit", label: "تعديل" },
    { key: "delete", label: "حذف" },
];

export default function PermissionMatrix({ permissions, onChange, disabled }: PermissionMatrixProps) {

    // Helper to toggle a specific permission
    const toggle = (section: keyof PermissionSchema, action: string) => {
        if (disabled) return;

        const currentSection = permissions[section] as any;
        const newValue = !currentSection[action];

        onChange({
            ...permissions,
            [section]: {
                ...currentSection,
                [action]: newValue
            }
        });
    };

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-xs md:text-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-right bg-white dark:bg-slate-900 min-w-[450px]">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium">
                        <tr>
                            <th className="p-3 w-1/4">القسم</th>
                            {ACTIONS.map(action => (
                                <th key={action.key} className="p-3 text-center w-1/6">{action.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {SECTIONS.map((section) => (
                            <tr key={section.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="p-3 font-medium text-slate-700 dark:text-slate-200">
                                    {section.label}
                                </td>
                                {ACTIONS.map((action) => (
                                    <td key={action.key} className="p-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={(permissions[section.key as keyof PermissionSchema] as any)?.[action.key] || false}
                                            onChange={() => toggle(section.key as keyof PermissionSchema, action.key)}
                                            disabled={disabled}
                                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {/* Special Sections */}
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
                            <td className="p-3 font-medium text-slate-700 dark:text-slate-200">النواقص</td>
                            <td colSpan={4} className="p-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions?.incomplete?.view ?? false}
                                        onChange={() => onChange({ ...permissions, incomplete: { view: !(permissions?.incomplete?.view ?? false) } })}
                                        disabled={disabled}
                                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-slate-600 dark:text-slate-400">عرض صفحة النواقص</span>
                                </label>
                            </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
                            <td className="p-3 font-medium text-slate-700 dark:text-slate-200">التحليلات والمراقبة</td>
                            <td colSpan={4} className="p-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions?.analytics?.view ?? false}
                                        onChange={() => onChange({ ...permissions, analytics: { view: !(permissions?.analytics?.view ?? false) } })}
                                        disabled={disabled}
                                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-slate-600 dark:text-slate-400">عرض لوحة التحكم المباشرة</span>
                                </label>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
