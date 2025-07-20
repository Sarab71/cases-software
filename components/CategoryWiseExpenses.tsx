'use client';

import { useEffect, useState } from 'react';

interface Expense {
    _id: string;
    description: string;
    amount: number;
    date: string;
}

interface Category {
    _id: string;
    category: string;
    expenses: Expense[];
}

export default function ExpensesList() {
    const [categories, setCategories] = useState<Category[]>([]);

    const fetchExpenses = async () => {
        const res = await fetch('/api/expenses');
        if (res.ok) {
            const data = await res.json();
            setCategories(data);
        }
    };

    const handleDelete = async (expenseId: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        const res = await fetch(`/api/expenses/${expenseId}`, { method: 'DELETE' });
        if (res.ok) {
            fetchExpenses();  // Refresh list after delete
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Expenses</h2>
            {categories.map(category => (
                <div key={category._id} className="mb-6">
                    <h3 className="text-lg font-semibold">{category.category}</h3>
                    <ul>
                        {category.expenses.map(expense => (
                            <li key={expense._id} className="flex justify-between items-center border-b py-1">
                                <div>
                                    <p>{expense.description} - ₹{expense.amount}</p>
                                    <small>{new Date(expense.date).toLocaleDateString()}</small>
                                </div>
                                <button
                                    onClick={() => handleDelete(expense._id)}
                                    className="text-red-500 hover:underline text-sm cursor-pointer"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
