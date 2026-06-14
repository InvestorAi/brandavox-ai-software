'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { generateActivityData, clientHealthData } from '@/lib/utils/mockData';

export function OverviewCharts() {
  const [mounted, setMounted] = useState(false);
  const chartData = generateActivityData();

  // Avoid hydration mismatch by waiting until component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[350px]">
        <div className="lg:col-span-2 bg-surface border border-border-custom rounded-card p-6 animate-pulse" />
        <div className="bg-surface border border-border-custom rounded-card p-6 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 30-Day Activity Line Chart (60% width) */}
      <div className="lg:col-span-2 bg-surface border border-border-custom rounded-card p-6 flex flex-col justify-between neumorphism-card-dark">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider">
            Workspace Activity (30 Days)
          </h3>
          <p className="text-xs text-text-muted font-sans mt-0.5">
            Content generations and campaign operations over time.
          </p>
        </div>

        <div className="h-64 w-full text-xs font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="date"
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
              <Line
                type="monotone"
                dataKey="generations"
                stroke="#ea580c"
                strokeWidth={2}
                dot={false}
                name="AI Generations"
              />
              <Line
                type="monotone"
                dataKey="campaigns"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={false}
                name="Campaign Posts"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Client Health Donut Chart (40% width) */}
      <div className="bg-surface border border-border-custom rounded-card p-6 flex flex-col justify-between neumorphism-card-dark">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider">
            Client Portfolio Health
          </h3>
          <p className="text-xs text-text-muted font-sans mt-0.5">
            Distribution of clients across performance health tiers.
          </p>
        </div>

        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={clientHealthData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {clientHealthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Total Client Count Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold font-mono text-text-primary">38</span>
            <span className="text-[10px] text-text-muted font-sans font-medium uppercase tracking-wider">
              Total Clients
            </span>
          </div>
        </div>

        {/* Legend listing */}
        <div className="flex flex-col gap-1 text-[10px] font-mono mt-4">
          {clientHealthData.map((item, index) => (
            <div key={index} className="flex justify-between items-center px-1">
              <span className="flex items-center gap-2 text-text-muted">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </span>
              <span className="font-bold text-text-primary">{item.value} clients</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default OverviewCharts;
