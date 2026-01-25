"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend } from "recharts";
import React from "react";

// --- MOCK DATA ---
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MOCK_DATA = {
    monthlyHours: MONTHS.map((month) => ({ month, hours: Math.round(Math.random() * 10 + 2) })),
    aircraftDist: [
        { type: "Cessna", value: 14 },
        { type: "Piper", value: 7 },
        { type: "Diamond", value: 3 },
        { type: "Other", value: 2 },
    ],
    recency: {
        landings: 4, // e.g. 4 landings in last 90 days
        goal: 3,
    },
};

// --- COLORS ---
const COLORS = ["#6366f1", "#06b6d4", "#f59e42", "#10b981", "#f43f5e", "#a21caf"];

// --- CHART COMPONENTS ---

export function MonthlyHoursChart() {
    return (
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 shadow w-full max-w-xl mx-auto">
            <h3 className="font-semibold mb-2 text-center">Monthly Hours</h3>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MOCK_DATA.monthlyHours}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function AircraftDistChart() {
    return (
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 shadow w-full max-w-xs mx-auto">
            <h3 className="font-semibold mb-2 text-center">Aircraft Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={MOCK_DATA.aircraftDist}
                        dataKey="value"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={2}
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    >
                        {MOCK_DATA.aircraftDist.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function RecencyRing() {
    const { landings, goal } = MOCK_DATA.recency;
    const percent = Math.min((landings / goal) * 100, 100);
    return (
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 shadow w-full max-w-xs mx-auto flex flex-col items-center">
            <h3 className="font-semibold mb-2 text-center">90-Day Recency</h3>
            <ResponsiveContainer width={180} height={180}>
                <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    barSize={18}
                    data={[{ name: "Landings", value: percent }]}
                    startAngle={90}
                    endAngle={-270}
                >
                    <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={10}
                        fill={percent >= 100 ? "#10b981" : "#6366f1"}
                    />
                    <Legend
                        iconSize={0}
                        layout="vertical"
                        verticalAlign="middle"
                        align="center"
                        content={() => (
                            <div className="text-center">
                                <div className="text-3xl font-bold">
                                    {landings} / {goal}
                                </div>
                                <div className="text-xs text-zinc-500">Landings in 90 days</div>
                                <div className={percent >= 100 ? "text-green-600 font-semibold" : "text-yellow-600 font-semibold"}>
                                    {percent >= 100 ? "Current" : "Not Current"}
                                </div>
                            </div>
                        )}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
        </div>
    );
}

// --- MAIN EXPORT ---
export default function AnalyticsCharts() {
    return (
        <div className="flex flex-wrap gap-6 justify-center mt-6">
            <MonthlyHoursChart />
            <AircraftDistChart />
            <RecencyRing />
        </div>
    );
}
