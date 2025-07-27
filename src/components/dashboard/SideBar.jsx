"use client";

import React, { useState } from "react";
import { FiBarChart, FiChevronDown, FiChevronsLeft, FiChevronsRight, FiDollarSign, FiHome, FiMonitor, FiShoppingCart, FiTag, FiUsers } from "react-icons/fi";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export const DashboardLayout = ({ children }) => {
    return (
        <div className="flex bg-indigo-50">
            <Sidebar />
            <div className="w-full">{children}</div>
        </div>
    );
};

const navOptions = [
    { Icon: FiHome, title: "لوحة تحكم", href: "/dashboard" },
    { Icon: FiDollarSign, title: "الفواتير", href: "/dashboard/invoices" },
    { Icon: FiShoppingCart, title: "المنتجات / الخدمات", href: "/dashboard/products" },
    { Icon: FiUsers, title: "العملاء", href: "/dashboard/customers" },
    { Icon: FiBarChart, title: "الاحصائيات", href: "/dashboard/stats" },
];

const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState("لوحة تحكم");

    return (
        <motion.nav
            layout
            className="sticky top-0 h-screen shrink-0 border-r border-slate-300 bg-white p-2 shadow-xl"
            style={{
                width: open ? "225px" : "fit-content",
            }}
        >
            <TitleSection open={open} />

            <div className="space-y-3.5">
                {navOptions.map(({ Icon, title, href }) => (
                    <Option
                        key={title}
                        Icon={Icon}
                        title={title}
                        selected={selected}
                        setSelected={setSelected}
                        open={open}
                        href={href}
                    />
                ))}
            </div>

            <ToggleClose open={open} setOpen={setOpen} />
        </motion.nav>
    );
};

const Option = ({ Icon, title, selected, setSelected, open, notifs, href }) => {
    return (
        <Link href={href} passHref legacyBehavior>
            <motion.a
                layout
                onClick={() => setSelected(title)}
                className={`relative flex h-10 w-full items-center rounded-md transition-colors ${selected === title ? "bg-indigo-100 text-indigo-800" : "text-slate-500 hover:bg-slate-100"}`}
            >
                <motion.div layout className="grid h-full w-10 place-content-center text-lg">
                    <Icon />
                </motion.div>
                {open && (
                    <motion.span layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.125 }} className="text-sm font-medium text-gray-800 hover:text-gray-900 transition-colors ">
                        {title}
                    </motion.span>
                )}

                {notifs && open && (
                    <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        style={{ y: "-50%" }}
                        transition={{ delay: 0.5 }}
                        className="absolute right-2 top-1/2 size-4 rounded bg-indigo-500 text-xs text-white"
                    >
                        {notifs}
                    </motion.span>
                )}
            </motion.a>
        </Link>
    );
};

const TitleSection = ({ open }) => {
    return (
        <div className="mb-3 border-b border-slate-300 pb-3">
            <div className="flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-slate-100">
                <div className="flex items-center gap-2">
                    <Logo />
                    {open && (
                        <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.125 }}>
                            <span className="block text-xs font-semibold">صدّيق موسى</span>
                            <span className="block text-xs text-slate-500">نسخة تجريبية</span>
                        </motion.div>
                    )}
                </div>
                {open && <FiChevronDown className="mr-2" />}
            </div>
        </div>
    );
};

const Logo = () => {
    return (
        <motion.div layout className="grid size-10 shrink-0 place-content-center rounded-md bg-[#7f2dfb]">
            <span className="text-white text-bold text-xl">ب</span>
        </motion.div>
    );
};

const ToggleClose = ({ open, setOpen }) => {
    return (
        <motion.button layout onClick={() => setOpen(pv => !pv)} className="absolute bottom-0 left-0 right-0 border-t border-slate-300 transition-colors hover:bg-slate-100">
            <div className="flex items-center p-2">
                <motion.div layout className="grid size-10 place-content-center text-lg">
                    <FiChevronsLeft className={`transition-transform ${open && "rotate-180"}`} />
                </motion.div>
                {open && (
                    <motion.span layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.125 }} className="text-xs font-medium">
                        إخفاء
                    </motion.span>
                )}
            </div>
        </motion.button>
    );
};

const ExampleContent = () => <div className="h-[200vh] w-full"></div>;
