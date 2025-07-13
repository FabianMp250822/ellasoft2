"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import type { Organization } from "@/lib/data";


const chartConfig = {
    userCount: {
      label: "Users",
      color: "hsl(var(--primary))",
    },
};

export function OrganizationsChart({data}: {data: Organization[]}) {

    const chartData = data.map(org => ({
        name: org.name,
        userCount: org.userCount,
    }))

    return (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                />
                <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                />
                <Tooltip
                    cursor={{fill: 'hsl(var(--muted))'}}
                    content={<ChartTooltipContent />}
                />
                <Bar dataKey="userCount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}
