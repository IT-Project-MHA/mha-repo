import Assessment from "../../components/baseComponents/Assessment";
import { GenerateAssessmentProps } from "@/testSupport/AssessmentTestHelpers";

export default function Destination() {
    return(
        <Assessment title="This is a title" questions={GenerateAssessmentProps()}></Assessment>
    );
}