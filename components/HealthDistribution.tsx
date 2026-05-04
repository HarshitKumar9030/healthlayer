'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ObservationData {
  flag?: string;
}

interface DistributionProps {
  data: ObservationData[];
}

export default function HealthDistribution({ data }: DistributionProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    let normal = 0;
    let high = 0;
    let low = 0;
    let critical = 0;

    data.forEach(obs => {
      const flag = obs.flag?.toLowerCase();
      if (flag === 'high') high++;
      else if (flag === 'low') low++;
      else if (flag === 'critical') critical++;
      else normal++; // assuming undefined or 'normal'
    });

    const result = [];
    if (normal > 0) result.push({ name: 'Normal', value: normal, color: '#A1D9A7' }); // Pastel Green
    if (high > 0) result.push({ name: 'High', value: high, color: '#E8A3A3' }); // Pastel Red
    if (low > 0) result.push({ name: 'Low', value: low, color: '#FADBA3' }); // Pastel Yellow/Orange
    if (critical > 0) result.push({ name: 'Critical', value: critical, color: '#D35D5D' }); // Darker Red for critical

    return result;
  }, [data]);

  if (!mounted || chartData.length === 0) return null;

  return (
    <div className="bg-[#FFFFFF] p-6 rounded-2xl w-full h-[400px] flex flex-col">
      <div className="mb-2">
        <h3 className="text-[#2C2C2C] font-semibold text-[20px] leading-[1.2] tracking-[-0.4px] mb-1">Metrics Distribution</h3>
        <p className="text-[#8B8B8B] text-[14px] leading-[1.4]">Breakdown of all your health metric statuses.</p>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#FFFFFF', color: '#2C2C2C', padding: '12px' }}
              itemStyle={{ color: '#2C2C2C', fontSize: '14px', fontWeight: '500' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '14px', color: '#8B8B8B', marginTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}