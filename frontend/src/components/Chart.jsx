import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

function Chart({ type = "line", data = null }) {
    const isEmpty = !data || (Array.isArray(data) && data.length === 0);

    if (isEmpty) {
        return (
            <div style={{ padding: "20px", textAlign: "center", color: "#6B7280" }}>
                No data available
            </div>
        );
    }

    if (type === "bar") {
        return (
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    }

    if (type === "pie") {
        return (
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" outerRadius={70} fill="#8884d8" dataKey="value" label>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
                </PieChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6" }} />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default Chart;