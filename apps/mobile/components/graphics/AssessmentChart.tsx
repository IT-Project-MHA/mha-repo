/**
 * Assessment chart: line graph of a patient's weekly scores over time.
 * - choose an assessment area (eg pain, movement), and for pain a body location
 * - choose a time range (only ranges the data can fill are offered)
 * - pain also shows a table of the weekly values below the chart
 */
import { LineChart } from "react-native-gifted-charts";
import {
  View,
  ActivityIndicator,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  StyleSheet
} from "react-native";
import SegmentedPill from "../atomicUI/SegmentedControlPill";
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { themeColours } from "../../constants/theme";
import {
  apiScoreHistory,
  apiPainDetailHistory,
  apiPainLocations
} from "../../src/api/my_health_api_helpers.js";
import { ComponentRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { captureRef } from "react-native-view-shot";
import PainSummaryTable from "./PainTable";
import {
  parseApiDate,
  formatDate,
  formatShortDate,
  daysAgoCutoff,
  daysBetween
} from "../../constants/date";

/**
 * Type for one point on the chart with a number and an optional label
 */
type ChartPoint = {
  value: number;
  label?: string;
};

/**
 * One week of data retrieved with the api helpers
 */
type HistoryPoint = {
  completedAt: string; // 'YYYY-MM-DD', the Monday the week starts
  score: number; // weekly score plotted on the chart
  // pain only
  worst?: number | null;
  mildest?: number | null;
};

/**
 * What the chart card is currently showing, for exporting
 */
export type ChartSnapshot = {
  title: string;
  periodLabel: string;
  points: HistoryPoint[];
  stats: { average: number | null; worst: number | null; mildest: number | null } | null;
  loading: boolean;
  captureChart: () => Promise<string | null>; // screenshot of the line chart as base64 png
};

/**
 * Selectable time range
 */
type Range = {
  key: string;
  label: string;
  days: number | null; // null = all time
};

/**
 * Areas of assessment
 */
type Area = {
  key: string;
  label: string; // chip label
  title: string; // chart heading
  max: number; // y-axis cap
};

/**
 * assessment areas- key must match HISTORY_FIELDS in my_health_api_helpers.js
 * max is the top of the y-axis: CHECK the scale of each section's `score` on the server
 */
const AREAS: Area[] = [
  { key: "pain", label: "Pain", title: "Your average pain", max: 10 },
  { key: "movement", label: "Movement", title: "Impact to movement", max: 10 },
  {
    key: "personalCare",
    label: "Personal care",
    title: "Impact to personal care",
    max: 10
  },
  {
    key: "socialHealth",
    label: "Social health",
    title: "Impact to social health",
    max: 10
  },
  {
    key: "management",
    label: "Management",
    title: "Your pain management",
    max: 10
  }
];

// selectable timeframes, shortest first. 'All' is always available
const RANGES: Range[] = [
  { key: "1m", label: "1M", days: 30 },
  { key: "3m", label: "3M", days: 91 },
  { key: "6m", label: "6M", days: 182 },
  { key: "1y", label: "1Y", days: 365 }
];
const ALL: Range = { key: "all", label: "All", days: null };
const LABEL_WIDTH = 48; // prevents labels from getting compressed
const OPTIONS: Range[] = [...RANGES, ALL];

// placeholder so empty graph renders with no data yet
const EMPTY_DATA: ChartPoint[] = [
  { value: 0, label: "" },
  { value: 0, label: "" }
];

/**
 * Rounds a number to 1 dp
 */
const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 *  pill button used for the area and location selectors.
 */
function Chip({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { theme, colours } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: active ? colours.ex3 : colours.tertiary
      }}
    >
      <Text style={[theme.small, theme.fontOnBackground]}>{label}</Text>
    </Pressable>
  );
}

/**
 * Renders the line chart card.
 * - patientProfileId: whose data to show. Leave out to show the logged-in user's own,
 *   pass a patient's id when a supporter is viewing it
 * - onSnapshotChange: optional, calls the function when data changes
 *
 * Data flow:
 * history (from server) -> filtered by range and location -> points 
 */
const AssessmentChart = ({
  patientProfileId,
  onSnapshotChange
}: {
  patientProfileId?: number | string | null;
  onSnapshotChange?: (snapshot: ChartSnapshot) => void;
}) => {
  const { theme, colours, isDark, isHC } = useTheme();
  const styles = createStyles(colours);
  const { width } = useWindowDimensions();
  // true while the chart is screenshotted for the PDF, so it's drawn in light colours
  const [capturing, setCapturing] = useState(false);
  const chartColours = capturing ? themeColours[isHC ? "lightHC" : "light"] : colours;
  const [areaKey, setAreaKey] = useState<string>(AREAS[0].key);
  const [locations, setLocations] = useState<{ id: string; label: string }[]>([]);
  const [locationFilter, setLocationFilter] = useState<string | null>(null); // option id, null = all
  const [rangeKey, setRangeKey] = useState<string>(ALL.key);
  const [history, setHistory] = useState<HistoryPoint[] | null>(null);
  const area = AREAS.find((a) => a.key === areaKey) ?? AREAS[0];
  const isPain = areaKey === "pain";

  const selected = OPTIONS.find((o) => o.key === rangeKey) ?? ALL;
  const selectedIndex = OPTIONS.indexOf(selected);
  const activeLocation =
    locations.find((l) => l.id === locationFilter)?.label ?? null; // for text

  // location chips: load once
  useEffect(() => {
    apiPainLocations()
      .then(setLocations)
      .catch(() => setLocations([]));
  }, []);

  // reload whenever the area, patient, range or location changes
  useEffect(() => {
    let cancelled = false;
    setHistory(null);
    (isPain
      ? apiPainDetailHistory(patientProfileId, selected.days, locationFilter)
      : apiScoreHistory(areaKey, patientProfileId)
    )
      .then((result: HistoryPoint[]) => !cancelled && setHistory(result))
      .catch(() => !cancelled && setHistory([]));
    return () => {
      cancelled = true;
    };
  }, [areaKey, patientProfileId, selected.days, locationFilter]);

  const points = useMemo<HistoryPoint[]>(() => {
    if (!history) return [];
    if (isPain || selected.days === null) return history;
    const cutoff = daysAgoCutoff(selected.days);
    return history.filter(
      (p) => parseApiDate(p.completedAt).getTime() >= cutoff
    );
  }, [history, selected, isPain]);

  /**
   * Summary of the weeks shown (pain only, null otherwise or when there are no weeks):
   * - average: mean of the weekly averages
   * - worst: the highest weekly worst
   * - mildest: the lowest weekly mildest
   */
  const stats = useMemo(() => {
    if (!isPain || points.length === 0) return null;
    const worsts = points
      .map((p) => p.worst)
      .filter((v): v is number => v != null);
    const mildests = points
      .map((p) => p.mildest)
      .filter((v): v is number => v != null);
    return {
      average: round1(
        points.reduce((sum, p) => sum + p.score, 0) / points.length
      ),
      worst: worsts.length ? Math.max(...worsts) : null,
      mildest: mildests.length ? Math.min(...mildests) : null
    };
  }, [points, isPain]);

  // fits all points in the width; if there are too many, the chart scrolls horizontally
  const chartWidth = Math.max(200, width - 110);
  const initialSpacing = LABEL_WIDTH / 2; // room for the first label
  const endSpacing = LABEL_WIDTH / 2; // room for the last label
  const spacing =
    points.length > 1
      ? Math.max(
          8,
          (chartWidth - initialSpacing - endSpacing) / (points.length - 1)
        )
      : chartWidth / 2;

  /**
   * Converts `points` into the format gifted-charts draws.
   * - each point gets the weekly score as its value
   * - x-axis date labels are only added to every Nth point, where N is however many fit in
   *   LABEL_WIDTH
   * - year is added to labels when the data spans more than a year
   */
  const data = useMemo<ChartPoint[]>(() => {
    // include the year in labels if the visible data spans more than a year
    // include the year in labels if the visible data spans more than a year
    const spansYears =
      points.length > 1 &&
      daysBetween(
        points[0].completedAt,
        points[points.length - 1].completedAt
      ) > 365;

    // show a label only every N points, where N is however many fit in LABEL_WIDTH
    const labelEvery = Math.max(1, Math.ceil((LABEL_WIDTH + 4) / spacing));

    return points.map((p, i) => ({
      value: p.score,
      labelComponent:
        i % labelEvery === 0
          ? () => (
              <View
                style={{
                  width: LABEL_WIDTH,
                  marginLeft: (spacing - LABEL_WIDTH) / 2
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: chartColours.onBackground,
                    fontSize: 10,
                    textAlign: "center"
                  }}
                >
                  {formatShortDate(p.completedAt, spansYears)}
                </Text>
              </View>
            )
          : undefined
    }));
  }, [points, spacing, chartColours]);

    const isFiltered = selected.days !== null || locationFilter !== null;
    const noHistory = history !== null && history.length === 0 && !isFiltered;

  const noDataInRange = history !== null && !noHistory && points.length === 0;
  // draws empty chart if no history
  const showEmpty = noHistory || noDataInRange;

  // y-axis: 5 even sections from 0 to area.max
  const step = area.max / 5;
  const yLabels = Array.from({ length: 6 }, (_, i) =>
    String(Math.round(i * step * 10) / 10)
  );
  const axisTextStyle = { color: chartColours.onBackground, fontSize: 10 };

  const title = `${area.title}${activeLocation ? ` (${activeLocation})` : ""} over time`;
  const periodLabel = `${selected.days === null ? "All time" : `Last ${selected.label}`}${
    activeLocation ? ` · ${activeLocation}` : ""
  }`;
  const loading = history === null;

  const chartRef = useRef<ComponentRef<typeof View>>(null);
  const captureChart = useCallback(async () => {
    if (!chartRef.current) return null;
    if (!isDark) return captureRef(chartRef, { format: "png", result: "base64" });
    setCapturing(true);
    // in dark mode, redraws the chart in light colours for the screenshot then switches back
    try {
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );
      return await captureRef(chartRef, { format: "png", result: "base64" });
    } finally {
      setCapturing(false);
    }
  }, [isDark]);

  useEffect(() => {
    onSnapshotChange?.({ title, periodLabel, points, stats, loading, captureChart });
  }, [onSnapshotChange, title, periodLabel, points, stats, loading, captureChart]);

  return (
    <View style={[styles.container, { marginVertical: 30 }]}>
      <Text
        style={[
          theme.h5,
          { color: colours.onBackground },
          theme.leftText,
          { marginVertical: 15 }
        ]}
      >
        {title}
      </Text>
      <View style={[theme.line, { marginBottom: 20 }]} />

      <View style={[theme.centerItems]}>
        {/**
         * Buttons for each 'area' (of questions) with horizontal scroll
         */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRowStyle}
        >
          {AREAS.map((a) => (
            <Chip
              key={a.key}
              label={a.label}
              active={a.key === areaKey}
              onPress={() => { setAreaKey(a.key); setLocationFilter(null); }}
            />
          ))}
        </ScrollView>

        {/**
         * Location chips for pain with horizontal scroll
         */}
        {isPain && locations.length > 0 && (
    <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRowStyle}
    >
        <Chip
            label="All locations"
            active={locationFilter === null}
            onPress={() => setLocationFilter(null)}
        />
        {locations.map((loc) => (
            <Chip
                key={loc.id}
                label={loc.label}
                active={locationFilter === loc.id}
                onPress={() => setLocationFilter(loc.id)}
            />
        ))}
    </ScrollView>
)}

        {/**
         * Spinner while loading, otherwise line chart
         */}
        {history === null ? (
          <ActivityIndicator style={{ height: 160 }} />
        ) : (
          // Renders Line chart
          <View
            ref={chartRef}
            collapsable={false} // Android: keep this View so it can be captured
            style={{
              width: "100%",
              overflow: "hidden",
              marginEnd: 18,
              marginTop: 40,
              marginBottom: 10,
              backgroundColor: capturing ? chartColours.background : undefined
            }}
          >
            <LineChart
              data={showEmpty ? EMPTY_DATA : data}
              maxValue={area.max}
              height={120}
              width={chartWidth}
              noOfSections={5}
              stepValue={step}
              yAxisLabelTexts={yLabels}
              initialSpacing={initialSpacing}
              endSpacing={endSpacing}
              spacing={showEmpty ? 100 : spacing}
              scrollToEnd
              curved
              thickness={showEmpty ? 0 : 3}
              color={showEmpty ? "transparent" : chartColours.secondary}
              hideDataPoints={showEmpty || points.length > 30}
              xAxisColor={chartColours.tertiary}
              yAxisColor={chartColours.tertiary}
              dataPointsColor={chartColours.primary}
              yAxisTextStyle={axisTextStyle}
              xAxisLabelTextStyle={axisTextStyle}
            />
          </View>
        )}

        {/**
         * Segmented control pill for selecting the time frame represented over the chart
         */}
        <View style={{ marginBottom: 20 }}>
            <SegmentedPill
                values={OPTIONS.map((o) => o.label)}
                selectedIndex={selectedIndex}
                onChange={(i) => setRangeKey(OPTIONS[i].key)}
                radius={100}
                style={{ width: "90%", marginVertical: 8 }}
                />
            </View>

        {/**
         * Error message if no history in total/over specific periods
         */}
        {noHistory && (
          <Text style={[theme.small, theme.fontOnBackground, { margin: 10 }]}>
            Complete assessments to see your {area.label.toLowerCase()} over
            time
          </Text>
        )}
        {noDataInRange && (
          <Text style={[theme.small, theme.fontOnBackground]}>
            {activeLocation
              ? `No assessments with pain in ${activeLocation.toLowerCase()} in this period`
              : "No assessments in this period"}
          </Text>
        )}

        {/**
         * Pain summary table for the period shown
         */}
        {stats && (
          <PainSummaryTable
            weeks={points}
            stats={stats}
            periodLabel={periodLabel}
            formatDate={formatDate}
          />
        )}
      </View>
    </View>
  );
};

export default AssessmentChart;

function createStyles(colours: ColourSet) {
  return StyleSheet.create({
    container: {
      width: "90%",
      alignSelf: "center",
      backgroundColor: colours.surface,
      paddingHorizontal: 10,
      paddingVertical: 20,
      borderRadius: 28
    },
    chipRowStyle: {
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 6
    }
  });
}
