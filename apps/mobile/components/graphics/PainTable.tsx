/**
 * Pain table: shows the pain figures for the weeks currently on AssessmentChart.
 * - the first row after the header is a summary of the whole period
 * - below it is one row per week, newest first
 * - long histories are collapsed to a few rows with a "Show all" toggle
 * This component only displays data. It makes no api calls and calculates nothing, 
 * 'weeks' and 'stats' are passed in
 */
import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme, ColourSet } from "../../context/ThemeContext";


export type PainWeek = {
    completedAt: string; // 'YYYY-MM-DD'
    score: number;
    worst?: number | null;
    mildest?: number | null;
};

export type PainStats = {
    average: number | null;
    worst: number | null;
    mildest: number | null;
};

type Props = {
    weeks: PainWeek[]; // oldest first, as the chart uses them
    stats: PainStats; // period summary, calculated by the chart
    periodLabel: string; // e.g. "Last 3M · Upper Back"
    collapsedRows?: number; // weekly rows shown before "Show all"
    radius?: number; // corner radius of the table
    formatDate: (iso: string) => string;  // how to display each week's date
};

/**
 * Formats a number for a cell, showing '-' when a value is missing.
 */
const fmt = (v: number | null | undefined) => (v == null ? "–" : String(v));

/**
 * Renders each row of the table
 * 
 * Columns: week, average, worst, mildest
 * - every cell has a left border except the first, and every row a top border except the first,
    so lines only appear between cells and never double up with the outer border 
 */
function TableRow({cells, bold = false, isFirst = false }: {cells: string[], bold?: boolean, isFirst?: boolean }) {
    const { theme, colours } = useTheme();
    const styles = createStyles(colours);

    return (
        <View
            style={{
                flexDirection: "row",
                borderTopWidth: isFirst ? 0 : 1,
                borderTopColor: colours.tertiary,
            }}
        >
            {cells.map((cell, i) => (
                <View
                    key={i}
                    style={[styles.cells, {
                        flex: i === 0 ? 1.5 : 1, // date column is wider than the number columns
                        borderLeftWidth: i === 0 ? 0 : 1,
                    }]}
                >
                    <Text
                        style={[
                            theme.small,
                            theme.fontOnBackground,
                            {
                                textAlign: i === 0 ? "left" : "center",
                                fontWeight: bold ? "700" : "400",
                            },
                        ]}
                    >
                        {cell}
                    </Text>
                </View>
            ))}
        </View>
    );
}


export default function PainSummaryTable({weeks, stats, collapsedRows = 5, radius = 12, formatDate,}: Props) {
    const { theme, colours } = useTheme();
    const [showAll, setShowAll] = useState(false); // whether the full list of weeks is expanded
    const rows = useMemo(() => [...weeks].reverse(), [weeks]); // newest week first
    const visible = showAll ? rows : rows.slice(0, collapsedRows);

    return (
        <View style={{ width: "90%", marginTop: 12 }}>
            {/* 
            * outer border with rounded corners. overflow hidden clips the inner lines to the curve 
            */}
            <View
                style={{
                    borderRadius: radius,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: colours.tertiary,
                }}
            >
                {/* 
                * header 
                */}
                <TableRow cells={["Week", "Average", "Worst", "Mildest"]} bold isFirst />

                {/* 
                * whole-period summary
                */}
                <TableRow cells={["Overall", fmt(stats.average), fmt(stats.worst), fmt(stats.mildest)]} bold/>

                {/* 
                * one row per week 
                */}
                {visible.map((w) => (
                    <TableRow
                        key={w.completedAt}
                        cells={[
                            formatDate(w.completedAt),
                            fmt(w.score),
                            fmt(w.worst),
                            fmt(w.mildest),
                        ]}
                    />
                ))}
            </View>

            {/**
             * Toggle for when there's more weeks than the limit 
             */}
            {rows.length > collapsedRows && (
                <Pressable
                    onPress={() => setShowAll((v) => !v)}
                    accessibilityRole="button"
                    style={{ paddingVertical: 25 }}
                >
                    <Text style={[theme.small, theme.centerText, theme.fontOnBackground, theme.fontUnderlined]}>
                        {showAll ? "Show fewer" : `Show all ${rows.length} weeks`}
                    </Text>
                </Pressable>
            )}

        </View>
    );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
      cells: {
        paddingVertical: 10,
        paddingHorizontal: 6,
        justifyContent: "center",
        borderLeftColor: colours.tertiary,
      }
})
};