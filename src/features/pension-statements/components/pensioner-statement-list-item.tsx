import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { PensionerStatement } from '../types';

/** Maps display labels to PensionerStatement fields for the expanded detail view. */
const DETAIL_FIELDS: [string, keyof PensionerStatement][] = [
  ['Dearness Pay', 'dp'],
  ['Medical Allowance', 'ma'],
  ['Age Bonus', 'age_bonus'],
  ['Wash Allowance', 'wa'],
  ['DRA', 'dra'],
  ['Other', 'oth'],
  ['Arrears Gross', 'arr_gross'],
  ['Gratuity Gross', 'gra_gross'],
  ['Commuted Gross', 'comm_gross'],
  ['Total Deduction', 'deduction'],
  ['DDO Bill Date', 'ddo_bill_date'],
];

interface PensionerStatementListItemProps {
  statement: PensionerStatement;
}

/**
 * Expandable card displaying a single pensioner statement.
 *
 * Shows a collapsed summary (date range + basic pension, DA, net amount)
 * by default. Tapping "View Details" expands to reveal all fields.
 * All text is text-sm or larger per project convention.
 *
 * @param props.statement - The pensioner statement data to display.
 */
export function PensionerStatementListItem({ statement }: PensionerStatementListItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setExpanded((prev) => !prev)}
      className="gap-3 rounded-md border border-border bg-card p-4">
      {/* Header: Date range */}
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-foreground">
          {statement.date_frm} — {statement.date_to}
        </Text>
        <View className="bg-primary/10 rounded-md px-2 py-0.5">
          <Text className="text-sm font-semibold capitalize text-primary">
            {statement.no_of_months} month{Number(statement.no_of_months) !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Key amounts summary */}
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium text-muted-foreground">Basic Pension</Text>
          <Text className="text-sm font-bold text-foreground">₹{statement.bp}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium text-muted-foreground">Dearness Allowance</Text>
          <Text className="text-sm font-bold text-foreground">₹{statement.da}</Text>
        </View>
        <View className="flex-row items-center justify-between border-t border-border pt-2">
          <Text className="text-sm font-bold text-foreground">Net Amount</Text>
          <Text className="text-sm font-bold text-primary">₹{statement.net_amt}</Text>
        </View>
      </View>

      {/* Expandable details */}
      {expanded && (
        <View className="gap-2 border-t border-border pt-3">
          {DETAIL_FIELDS.filter(([, key]) => statement[key]).map(([label, key]) => (
            <View key={label} className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-muted-foreground">{label}</Text>
              <Text className="text-sm font-bold text-foreground">
                {key === 'ddo_bill_date' ? `${statement[key]}` : `₹${statement[key]}`}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Toggle */}
      <Text className="text-center text-sm font-semibold text-primary">
        {expanded ? 'View Less' : 'View Details'}
      </Text>
    </TouchableOpacity>
  );
}
