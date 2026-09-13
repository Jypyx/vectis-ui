/**
 * The types the design system's components pass BETWEEN them and that belong to none of them.
 *
 * A type is normally named after whatever owns it — `ButtonTone` for VButton,
 * `DatePickerRange` for the component that defines its shape, `FileRejection` for the module
 * that produces it. This file is for the case where nothing does: an item's value is shared
 * by a tab, a toggle item, a radio button and a combobox option, and naming it after any one of the three
 * would say something untrue about the other two.
 *
 * It stays small on purpose. A type reaching for it should first be asked whether a component
 * or a module really does own it.
 */

/**
 * What identifies one item among several: a tab, a toggle item, an option in a list.
 *
 * A number is admitted because that is what a row from a database is keyed by, and a
 * consumer whose options come from an API should not have to convert on the way in and back
 * on the way out. Where the value reaches the DOM the component converts it itself.
 *
 * VRadio takes it too, and needs no conversion for it: the `value` ATTRIBUTE of a native radio
 * is text, but Vue's radio v-model reads back the value exactly as it was bound rather than
 * the attribute, so a number put in is the number handed back.
 */
export type ItemValue = string | number
