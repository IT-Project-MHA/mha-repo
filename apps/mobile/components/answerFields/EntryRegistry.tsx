import { EmojiSelect } from "./EmojiSelect";
import { MultipleChoice } from "./MultipleChoice";
import { MultiSelect } from "./MultiSelect";
import { NumberEntry } from "./NumberEntry";
import { SliderEntry } from "./SliderEntry";
import { TextEntry } from "./TextEntry";

const ENTRY_COMPONENTS = {
  EmojiSelect: EmojiSelect,
  MultipleChoiceltipleChoice: MultipleChoice,
  MultiSelect: MultiSelect,
  NumberEntry: NumberEntry,
  SliderEntry: SliderEntry,
  TextEntry: TextEntry
};


export type ENTRY_TYPE = "EmojiSelect" | "MultipleChoiceltipleChoice" | "MultiSelect" | "NumberEntry" | "SliderEntry" | "TextEntry";
export default ENTRY_COMPONENTS;
