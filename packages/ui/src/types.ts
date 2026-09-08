/**
 * The types the design system's components pass BETWEEN them and that belong to none of them.
 *
 * A type is normally named after whatever owns it — `ButtonTone` for VButton,
 * `DatePickerRange` for the component that defines its shape, `FileRejection` for the module
 * that produces it. This file is for the case where nothing does: an item's value is shared
 * by a tab, a toggle item and a combobox option, and naming it after any one of the three
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
 * VRadio is the ONE deliberate exception and stays `string`: the `value` of a native radio is
 * always text, so widening it would only move the conversion into the component and hand the
 * consumer back a different type from the one they put in.
 */
export type ItemValue = string | number
