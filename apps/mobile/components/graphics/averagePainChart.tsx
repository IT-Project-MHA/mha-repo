import { BarChart, LineChart } from "react-native-gifted-charts";
import { View, ActivityIndicator, Text} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import {apiPainHistory} from "../../src/api/my_health_api_helpers.js";
import { useEffect, useState } from "react";

//types
type PainPoints = {value: number; label: string};
type PainHistoryPoint = {completedAt: string; score: number};

//placeholder so empty graph renders with no data yet
const EMPTY_DATA: PainPoints[] = [
    {value: 0, label: ""},
    {value: 0, label: ""},
]

const AveragePainChart = ({patientProfileId}:{patientProfileId ?: number|null }) => {
    const { theme, colours } = useTheme();
    const [data, setData] = useState<PainPoints[] | null>(null); // data is null when loading
    
    useEffect(()=>{
        let cancelled = false;
        apiPainHistory(patientProfileId).then((history: PainHistoryPoint[]) => {
            if (cancelled) return;
            setData(
                history.map((point)=> ({
                    value: point.score,
                    label: point.completedAt,
                })),
            );
        })
        .catch(()=> !cancelled && setData([]));

        return () => {
            cancelled = true;
        };
    }, [patientProfileId]);
     
    if (data ===null) {
        return <ActivityIndicator/>;
    }

    const noData = data.length === 0;

    return (
        <View style={[theme.clearContainer, theme.centerItems]}>
            <Text>Your Pain over time</Text>
            <LineChart 
                data = {noData? EMPTY_DATA : data} 
                maxValue={10}
                height={100}
                width={200}
                noOfSections={5}
                stepValue={2}
                initialSpacing={20}
                curved={true}
                thickness={3}
                xAxisColor={colours.tertiary}
                yAxisColor={colours.tertiary}
                color={colours.secondary}
                dataPointsColor={colours.primary}
                yAxisTextStyle={[theme.body, {textDecorationColor: colours.onBackground}]}
                yAxisLabelTexts={[]}
                xAxisLabelTextStyle={[theme.body, {textDecorationColor: colours.onBackground}]}
            />
            {noData && (
                <View>
                    <Text style={[theme.small, theme.fontOnBackground]}>Complete assessments to see your pain over time</Text>
                </View>
            )}
        </View>
    );
    }; 

export default AveragePainChart;
