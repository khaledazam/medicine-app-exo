import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DayData {
  label: string;
  value: number; // 0-100
}

interface WeeklyBarChartProps {
  data: DayData[];
  height?: number;
  barColor?: string;
}

export default function WeeklyBarChart({
  data,
  height = 180,
  barColor,
}: WeeklyBarChartProps) {
  const chartWidth = SCREEN_WIDTH - 80;
  const chartHeight = height - 40;
  const barWidth = (chartWidth / data.length) * 0.6;
  const barGap = (chartWidth / data.length) * 0.4;

  const getBarColor = (value: number) => {
    if (barColor) return barColor;
    if (value >= 80) return '#1a8e2d';
    if (value >= 50) return '#FF9800';
    return '#E53935';
  };

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={chartWidth} height={height}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = chartHeight - (tick / 100) * chartHeight + 10;
          return (
            <React.Fragment key={tick}>
              <Line
                x1={0}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#f0f0f0"
                strokeWidth={1}
              />
              <SvgText
                x={-2}
                y={y + 4}
                fill="#bbb"
                fontSize={10}
                textAnchor="end"
              >
                {/* {tick}% */}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / 100) * chartHeight;
          const x = index * (barWidth + barGap) + barGap / 2;
          const y = chartHeight - barHeight + 10;

          return (
            <React.Fragment key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={barWidth / 2}
                fill={getBarColor(item.value)}
                opacity={0.85}
              />
              <SvgText
                x={x + barWidth / 2}
                y={y - 6}
                fill={getBarColor(item.value)}
                fontSize={10}
                fontWeight="600"
                textAnchor="middle"
              >
                {item.value > 0 ? `${item.value}%` : ''}
              </SvgText>
              <SvgText
                x={x + barWidth / 2}
                y={height - 4}
                fill="#888"
                fontSize={11}
                fontWeight="500"
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});
