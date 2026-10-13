/**
 * page with a drop-down for conditions in figma design
 * I'm thinking I can re-use the multi-select though, as there is no search functionality in the figma to my understanding, and the
 * list is maybe just short enough to get away with that. Thinking it would be good to go through and cut particularly rare conditions, 
 * but MHA may specialize in those conditions so talk to client about this.
 * From https://www.aihw.gov.au/reports/musculoskeletal-conditions/chronic-musculoskeletal-conditions
 * 
 * 4.0 million (15.7%) people were living with a back problem
 * 3.7 million (14.5%) were living with arthritis (includes osteoarthritis, rheumatoid arthritis, and other types of arthritis)
 * 854,000 (3.4%) were living with osteoporosis or osteopenia
 * 224,000 (0.9%) were living with gout.
 * Fibromyalgia is also quite common ~3%
 * 
 * Figma list:
 * ["Arthritis", "Ankylosing spondylitis", "Back pain", "Baker’s cyst", "Bursitis", "Foot related conditions", "Fibromyalgia", "Gout", "Juvenile idiopathic arthritis", "Hand conditions", "Lupus", "Neck pain", "Osteoarthritis", "Osteoporosis", "Paget’s disease", "Perthes’ disease", "Polymyalgia rheumatica", "Psoriatic arthritis", "Raynaud’s phenomenon", "Reactive arthritis", "Rheumatoid arthritis", "Scleroderma", "Shoulder pain", "Sjogren’s disease"]
 */


import { View, Text, ScrollView } from 'react-native';
import { useTheme } from "../../../context/ThemeContext";
import { useRouter } from 'expo-router';
import { MultiSelect } from '../../../components/answerFields/MultiSelect';
import Button from '../../../components/atomicUI/Button';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const user = "user"

  const CONDITIONS = ["Arthritis", "Ankylosing spondylitis", "Back pain", "Baker's cyst", "Bursitis", "Foot related conditions", "Fibromyalgia", "Gout", "Juvenile idiopathic arthritis", "Hand conditions", "Lupus", "Neck pain", "Osteoarthritis", "Osteoporosis", "Paget's disease", "Perthes' disease", "Polymyalgia rheumatica", "Psoriatic arthritis", "Raynaud's phenomenon", "Reactive arthritis", "Rheumatoid arthritis", "Scleroderma", "Shoulder pain", "Sjogren's disease"];


  return (
    <View style={theme.screen}>
      
      <Text style={theme.text}>I think I need to import something for this</Text>
      <ScrollView
      showsVerticalScrollIndicator={false}
      >
        <MultiSelect
        questionOptions={CONDITIONS}
        onSubmit={()=>{router.navigate('/(onboarding)/additionalConditionsTextEntry')}}
        MIN_SELECTIONS={0}
        MAX_SELECTIONS={CONDITIONS.length}
        />
      </ScrollView>
    </View>
  );
}

