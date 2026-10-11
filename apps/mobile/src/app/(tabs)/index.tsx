import { StyleSheet, Text, View} from "react-native";
import { useUser } from "../../../context/AuthorisationContext";
import Button from "../../../components/atomicUI/Button";
import { UserType } from "../../../constants/userType";


export default function Tab() {
  const {setUserType} = useUser();

  return (
    <View style={styles.container}>
        <Text>INDEX</Text>
        <Button
	        label="support person mode"
	        onPress={() => setUserType(UserType.supportPerson)}
          buttonType="primaryButton"
        />
        <Text> </Text>
        <Button
	        label="patient mode"
	        onPress={() => setUserType(UserType.patient)}
          buttonType="primaryButton"
        />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});