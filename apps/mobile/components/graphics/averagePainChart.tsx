/**
 * Line chart of the user's weekly average pain, across all assessments.
 */
import { LineChart } from "react-native-gifted-charts";
import { View, ActivityIndicator, Text, StyleSheet, useWindowDimensions } from "react-native";
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { apiPainDetailHistory } from "../../src/api/my_health_api_helpers.js";
import { useEffect, useMemo, useState } from "react";
import { formatShortDate } from "../../constants/date";

// one week of data from the api helper
type HistoryPoint = {
    completedAt: string; // 'YYYY-MM-DD', the Monday the week starts
    score: number; // the week's average pain
};

const MAX_PAIN = 10; // top of the y-axis
const LABEL_WIDTH = 48; // pixels reserved per x-axis label
const SAME_THRESHOLD = 0.3; // changes smaller than this count as "about the same"
const MIN_WEEKS_PER_MONTH = 2; // a month needs at least this many weeks to be compared
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// returns the average score of a list of weeks
const average = (points: HistoryPoint[]) =>
    points.reduce((sum, p) => sum + p.score, 0) / points.length;

// builds a sentence describing how pain changed between two periods
const describeChange = (diff: number, subject: string, comparedTo: string) => {
    if (Math.abs(diff) < SAME_THRESHOLD) {
        return `${subject} stayed about the same ${comparedTo}.`;
    }
    const direction = diff > 0 ? "increased" : "decreased";
    return `${subject} ${direction} by ${Math.abs(diff).toFixed(1)} ${comparedTo}.`;
};

// "2026-10-05" -> "2026-10"
const monthKey = (date: string) => date.slice(0, 7);

// "2026-10" -> "October"
const monthName = (key: string) => MONTH_NAMES[Number(key.slice(5, 7)) - 1];

// groups weekly points into calendar months and averages each one (history is oldest -> newest)
const groupByMonth = (history: HistoryPoint[]) => {
    const groups = new Map<string, HistoryPoint[]>();
    history.forEach((p) => {
        const key = monthKey(p.completedAt);
        groups.set(key, [...(groups.get(key) ?? []), p]);
    });
    return [...groups.entries()].map(([key, points]) => ({ key, weeks: points.length, avg: average(points) }));
};

// compares the latest month with the one before it
const buildMonthlyInsight = (months: ReturnType<typeof groupByMonth>): string => {
    const last = months[months.length - 1];
    const prev = months[months.length - 2];
    const isCurrentMonth = last.key === monthKey(new Date().toISOString());

    const subject = isCurrentMonth
        ? "So far this month, your average pain"
        : `Your average pain in ${monthName(last.key)}`;

    return describeChange(last.avg - prev.avg, subject, `compared with ${monthName(prev.key)}`);
};

// compares the latest week with the one before it
const buildWeeklyInsight = (history: HistoryPoint[]): string => {
    const n = history.length;
    if (n < 2) return "Complete another week of assessments to see how your pain is changing.";

    return describeChange(
        history[n - 1].score - history[n - 2].score,
        "Your average pain",
        "compared with last week"
    );
};

// picks monthly comparison when the last two months both have enough weeks, otherwise weekly
const buildInsight = (history: HistoryPoint[]): string => {
    if (history.length === 0) return "Complete assessments to see your pain over time."; //text jsx already rendered where buildInsignt is called
    const months = groupByMonth(history);
    const hasEnoughForMonthly =
        months.length >= 2 &&
        months[months.length - 1].weeks >= MIN_WEEKS_PER_MONTH &&
        months[months.length - 2].weeks >= MIN_WEEKS_PER_MONTH;

    return hasEnoughForMonthly ? buildMonthlyInsight(months) : buildWeeklyInsight(history);
};

/**
 * Renders the pain chart
 */
const AssessmentChart = ({ patientProfileId }: { patientProfileId?: number | string | null }) => {
    const { theme, colours } = useTheme();
    const styles = useMemo(() => createStyles(colours), [colours]);
    const { width } = useWindowDimensions();
    const [history, setHistory] = useState<HistoryPoint[] | null>(null); // null while loading

    // load the weekly pain history once (and again if the patient changes)
    useEffect(() => {
        let cancelled = false;
        apiPainDetailHistory(patientProfileId)
            .then((result: HistoryPoint[]) => !cancelled && setHistory(result))
            .catch(() => !cancelled && setHistory([]));
        return () => {
            cancelled = true;
        };
    }, [patientProfileId]);

    // fit all points in the width; the chart scrolls sideways if there are too many
    const chartWidth = Math.max(200, width - 110);
    const edge = LABEL_WIDTH / 2; // room for the first and last labels
    const count = history?.length ?? 0;
    const spacing = count > 1 ? Math.max(8, (chartWidth - edge * 2) / (count - 1)) : chartWidth / 2;

    // the summary sentence shown above the chart
    const insight = useMemo(() => buildInsight(history ?? []), [history]);

    // convert weeks into chart points, labelling only every Nth so labels don't overlap
    const data = useMemo(() => {
        const labelEvery = Math.max(1, Math.ceil((LABEL_WIDTH + 4) / spacing));
        return (history ?? []).map((p, i) => ({
            value: p.score,
            labelComponent:
                i % labelEvery === 0
                    ? () => (
                          <View style={[styles.labelBox, { marginLeft: (spacing - LABEL_WIDTH) / 2 }]}>
                              <Text numberOfLines={1} style={styles.labelText}>
                                  {formatShortDate(p.completedAt)}
                              </Text>
                          </View>
                      )
                    : undefined,
        }));
    }, [history, spacing, styles]);

    // still loading
    if (history === null) return <ActivityIndicator style={styles.loader} />;

    return (
        <View style={styles.container}>
            <Text style={[theme.small, styles.insight]}>{insight}</Text>
            <LineChart
                data={data}
                maxValue={MAX_PAIN}
                height={120}
                width={chartWidth}
                noOfSections={5}
                stepValue={MAX_PAIN / 5}
                yAxisLabelTexts={["0", "2", "4", "6", "8", "10"]}
                initialSpacing={edge}
                endSpacing={edge}
                spacing={spacing}
                scrollToEnd
                curved
                thickness={3}
                color={colours.secondary}
                hideDataPoints={count > 30}
                xAxisColor={colours.tertiary}
                yAxisColor={colours.tertiary}
                dataPointsColor={colours.primary}
                yAxisTextStyle={styles.axisText}
            />
            <Text style={[theme.xSmall, theme.centerText, {margin : 30, color: colours.onBackground}]}>See more and print as PDF in My Pain Profile</Text>
        </View>
    );
};

export default AssessmentChart;


function createStyles(colours: ColourSet) {
    return StyleSheet.create({
        loader: {
            height: 160,
        },
        container: {
            width: "100%",
            overflow: "hidden",
        },
        insight: {
            marginBottom: 15,
            color: colours.onBackground,
        },
        message: {
            color: colours.onBackground,
        },
        labelBox: {
            width: LABEL_WIDTH,
        },
        labelText: {
            fontSize: 10,
            textAlign: "center",
            color: colours.onBackground,
        },
        axisText: {
            color: colours.onBackground,
        },
    });
}
