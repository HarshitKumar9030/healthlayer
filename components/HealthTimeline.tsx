'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ObservationData {
  _id: string;
  name: string;
  value: string;
  unit: string;
  date: string;
  flag?: string;
  referenceRange?: string;
}

interface TimelineProps {
  data: ObservationData[];
  title: string;
}

export default function HealthTimeline({ data, title }: TimelineProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!data || data.length === 0 || !mounted) return null;

  // Parse and sort dates
  const parsedData = data
    .map(item => ({
      ...item,
      numericValue: parseFloat(item.value),
      timestamp: item.date ? new Date(item.date).getTime() : 0,
      formattedDate: item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : 'Unknown'
    }))
    .filter(item => !isNaN(item.numericValue))
    .sort((a, b) => a.timestamp - b.timestamp);

  if (parsedData.length < 2) return null;

  const unit = parsedData[0].unit || '';

  // Basic trend analysis
  const firstValue = parsedData[0].numericValue;
  const lastValue = parsedData[parsedData.length - 1].numericValue;
  
  let insight = '';
  if (lastValue > firstValue * 1.05) insight = `Your ${title.toLowerCase()} is increasing over time.`;
  else if (lastValue < firstValue * 0.95) insight = `Your ${title.toLowerCase()} is decreasing over time.`;
  else insight = `Your ${title.toLowerCase()} has remained stable.`;

  return (
    <div className="bg-[#FFFFFF] p-6 rounded-2xl w-full">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-[#2C2C2C] font-semibold text-[20px] leading-[1.2] tracking-[-0.4px] mb-1">{title}</h3>
          <p className="text-[#8B8B8B] text-[14px] leading-[1.4]">{insight}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[#2C2C2C] font-bold text-[24px] leading-[1.2] tracking-[-0.4px]">
            {lastValue} <span className="text-[16px] font-medium">{unit}</span>
          </span>
          <span className="text-[#8B8B8B] text-[13px] leading-[1.4]">Latest value</span>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={parsedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F0FE" />
            <XAxis 
              dataKey="formattedDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#8B8B8B' }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#8B8B8B' }} 
              dx={-10} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '12px' }}
              labelStyle={{ color: '#8B8B8B', fontSize: '13px', marginBottom: '4px' }}
              itemStyle={{ color: '#2C2C2C', fontSize: '16px', fontWeight: 'bold' }}
              formatter={(value: any, name: any, props: any) => [`${value} ${unit}`, 'Value']}
            />
            <Line 
              type="monotone" 
              dataKey="numericValue" 
              stroke="#6B85A8" 
              strokeWidth={3} 
              dot={{ fill: '#FFFFFF', stroke: '#6B85A8', strokeWidth: 2, r: 4 }} 
              activeDot={{ r: 6, fill: '#6B85A8', stroke: '#FFFFFF', strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}