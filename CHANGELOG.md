# Changelog

Notable changes to `vectis-ui`. The package follows [Semantic Versioning](https://semver.org/): while the major version is 0, a minor release may change the public API.

## [0.8.0] - 2026-09-16

This release follows a consistency audit of all 66 components. The result is one vocabulary across the library: every prop union has an exported name, no boolean prop defaults to `true`, composed components declare the props, events and methods they used to leave to attribute fallthrough, and names that meant the same thing in two families now match.

Renames ship **without aliases**. Read [Upgrading](#upgrading-from-01x) before you bump.

0.1.0 (`latest`) and 0.1.1-rc.0 (`next`) contain the same library code, so everything below applies to both.

### Upgrading from 0.1.x

Renamed **types** fail `vue-tsc`. Renamed **props** usually do not: Vue passes an unknown prop through as an HTML attribute, so a template that still writes `:closable="false"` compiles, renders, and does nothing. Search your templates for every old name in the tables below. Several booleans also change polarity, so the fix is not always a find-and-replace.

These changes need attention even where the code still compiles:

- **The clear cross is opt-in on every field.** VCombobox, VDateInput, VTimeInput and VFileInput render it only when `clearable` is set, as VInput and VTextarea already did.
- **VPagination is joined by default.** `attached` (off by default) becomes `detached` (off by default), so a bare `<VPagination>` renders one segmented row. Add `detached` to keep separate pills.
- **VCalendar `creatable` defaults to `false`**, and `event-create` now carries `CalendarEventTimes` (the drawn slot) instead of a draft `CalendarEvent`. Build the event yourself from the times.
- **`mode="readonly"` is `mode="picker"`** on VDateInput and VTimeInput. The old value falls back to `input` with a development warning.
- **VSlider forwards its attributes to the range input** (the end thumb) instead of its root, `class` and `style` excepted. `name`, `id`, `required` and `aria-*` now reach a form and a `<label for>`. A `name` on a range slider warns, since two thumbs have no single value to submit.
- **VCarousel `effect="cover"` is removed.** Use `scale`.

### Breaking changes

#### Renamed props

"Inverted" means the new prop turns on what the old one turned off: `:closable="false"` becomes `hide-close`, and the old default needs no attribute at all.

| Component                  | Before                            | After                                             | Note                                           |
| -------------------------- | --------------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| VAccordion                 | `exclusive`                       | `multiple`                                        | Inverted                                       |
| VAccordionItem             | `iconStart`                       | `icon`                                            |                                                |
| VBreadcrumb                | `separator`                       | `separatorIcon`                                   |                                                |
| `BreadcrumbItem`           | `iconStart`                       | `icon`                                            |                                                |
| VCalendar                  | `hourFormat`                      | `format`                                          |                                                |
| VCalendar                  | `showCurrentTime`                 | `hideCurrentTime`                                 | Inverted                                       |
| VCalendar                  | `editable`                        | `readonly`                                        | Inverted                                       |
| VCalendar                  | `autoScroll`                      | `noEdgeScroll`                                    | Inverted                                       |
| VDataTable                 | `perPageLabel`                    | `perPageText`                                     | `*Text` is visible text                        |
| VDataTable                 | `rangeLabel`                      | `rangeText`                                       |                                                |
| VDataTable                 | `selectionLabel`                  | `selectionText`                                   |                                                |
| VDialog                    | `closable`                        | `hideClose`                                       | Inverted                                       |
| VDialog                    | `closeOnBackdrop`                 | `persistentBackdrop`                              | Inverted                                       |
| VDialog                    | `closeOnEscape`                   | `persistentEscape`                                | Inverted                                       |
| VFileInput                 | `attachIcon`                      | `pickerIcon`                                      |                                                |
| VFileInput                 | `droppable`                       | `noDrop`                                          | Inverted                                       |
| VFilePicker                | `showBrowse`                      | `hideBrowse`                                      | Inverted                                       |
| VFilePicker                | `thumbnails`                      | `hideThumbnails`                                  | Inverted                                       |
| VHotkeys                   | `preventDefault`                  | `allowDefault`                                    | Inverted                                       |
| VMenuItem                  | `danger`                          | `tone="danger"`                                   |                                                |
| VPagination                | `attached`                        | `detached`                                        | Inverted, and the default look changes         |
| VPagination                | `variant`                         | `itemVariant`                                     |                                                |
| VPagination                | `showControls`, `controlsDisplay` | `controls`: `false \| 'icon' \| 'text' \| 'both'` | `:show-controls="false"` → `:controls="false"` |
| VPopover                   | `surface`                         | `bare`                                            | Inverted                                       |
| VSideNavigationItem        | `active`                          | `current`                                         | `data-active` → `data-current`                 |
| VTab, VToggleItem          | `icon`                            | `iconStart`                                       | `iconEnd` is new                               |
| VToggle                    | `attached`                        | `detached`                                        | Inverted, same default look                    |
| VToggle                    | `variant`                         | `itemVariant`                                     |                                                |
| `ToastOptions` (`toast()`) | `closable`                        | `hideClose`                                       | Inverted                                       |

#### Changed values and defaults

- `clearable` defaults to `false` on VCombobox, VDateInput, VTimeInput and VFileInput.
- VCalendar `creatable` defaults to `false`.
- `DateInputMode` and `TimeInputMode`: `'readonly'` → `'picker'`.
- `HotkeysVariant`: `'flat'` → `'soft'`, which is also the default.
- `CarouselEffect`: `'cover'` is removed.

#### Slots, events and methods

| Component           | Before                                  | After                                    |
| ------------------- | --------------------------------------- | ---------------------------------------- |
| VAccordionItem      | `#start`                                | `#icon`                                  |
| VSideNavigationItem | `#start`, `#items`                      | `#icon`, `#children`                     |
| VDataTable          | `#header`                               | `#title`                                 |
| VDialog             | `#headerActions`                        | `#header-actions`                        |
| VCalendar           | `#day-header` prop `day`                | `dayText`                                |
| VFileInput          | `#counter` prop `size`                  | `bytes`                                  |
| VFilePicker         | `#remove` prop `label`                  | `removeLabel`                            |
| VCalendar           | `@slot-activate`                        | `@cell-activate`, payload `CalendarCell` |
| VCalendar           | `@event-create` payload `CalendarEvent` | `CalendarEventTimes`                     |
| VPopover            | exposed `hide()`                        | `close()`                                |

#### Types

| Before                                               | After                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------------- |
| `VectisMessages`, `VectisMessagesInput`              | `Messages`, `MessagesInput`                                            |
| `VectisIconName`                                     | `IconName`                                                             |
| `DateRange`, `DateMatcher`                           | `DatePickerRange`, `DatePickerMatcher`                                 |
| `SkeletonShape`, `SkeletonAnimation`, `SkeletonSize` | `SkeletonLoaderShape`, `SkeletonLoaderAnimation`, `SkeletonLoaderSize` |
| `ToggleVariant`                                      | `ToggleItemVariant`                                                    |
| `FileInputRejection`, `FilePickerRejection`          | `FileRejection`                                                        |
| `FileInputRejectReason`, `FilePickerRejectReason`    | `FileRejectReason`                                                     |
| `TimePickerStep`                                     | Removed                                                                |

#### Dictionary keys

Only relevant if you override messages with `registerMessages`.

| Before                                                                | After                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------------- |
| `combobox.remove`, `fileInput.remove`, `filePicker.remove`            | `common.remove(name)`                                   |
| `dateInput.open`, `dateInput.label`                                   | `dateInput.openPicker`, `dateInput.pickerLabel`         |
| `fileInput.attach`                                                    | `fileInput.openPicker`                                  |
| `timePicker.selectMinute`                                             | `timePicker.selectMinutes`                              |
| `timePicker.hourStep`, `timePicker.minuteStep`                        | `timePicker.choosingHour`, `timePicker.choosingMinutes` |
| `timePicker.hoursValue`                                               | `timePicker.hourValue`                                  |
| `calendar.newEvent(index)`                                            | `calendar.untitled`                                     |
| `pagination.hiddenPages`, `timeInput.openList`, `timeInput.listLabel` | Removed                                                 |

New keys: `datePicker.label`, `timePicker.label`, `timeInput.meridiemValue`, `timeInput.unavailable`.

#### Tokens and CSS hooks

- Token removed: `--vectis-control-size-time-input-list-max-block`.
- VDataTable classes move from `.v-table-*` to the `.v-data-table-*` prefix (root `.v-data-table`, the `<table>` itself `.v-data-table-table`).
- VInputOTP classes move from `.v-otp*` to `.v-input-otp*`, and `--otp-font-size` to `--input-otp-font-size`.
- VChip: `.v-chip-remove` → `.v-chip-dismiss`.
- VAccordionItem: `.v-accordion-icon` and `.v-accordion-icon-open` → `.v-accordion-chevron` and `.v-accordion-chevron-open`; `.v-accordion-icon-start` → `.v-accordion-icon`.

### Added

#### New component

- **VInputGroup** joins fields and buttons side by side into one bordered object. It carries the row's `label` and `hint`, and its `size`, `compact` and `disabled` reach every segment.

#### Buttons and segmented rows

- VButton: `fullWidth`.
- VButtonGroup sets the row's appearance with `variant`, `tone`, `size`, `compact`, `elevated` and `disabled`. A button keeps its own `tone`, so one segment can still be the destructive one. Also `detached`, `seamless`, `fullWidth` and `label`. An elevated row now rises as one object.
- VToggle: `selectedVariant` (`solid`, `soft`, `ghost`), `seamless`, `fullWidth`, `elevated`.
- VPagination: `elevated`, `seamless`.
- VIconButton: `href`.
- VTab and VToggleItem: `iconEnd`, `iconFilled`. VChip: `iconFilled`, `checkIcon`.
- VTabs: `disabled`.

#### Fields

- VCombobox: `label`, `hint`, `readonly`, `iconStart`, `expandIcon`, `placement`. `display="text"` shows multiple values as one comma-separated line. `max`, `overflowText` and the `#overflow` slot sum up folded values as `+N`. Clicking the chevron closes an open list.
- VDateInput, VTimeInput and VFileInput: `readonly`, `loading`, `iconStart`, `pickerIconLabel`, `clearLabel`, `loadingLabel`.
- VTimeInput: an AM/PM button inside the field on a 12-hour clock, a searchable `list` mode (typing `930` finds 9:30), `min`, `max`, `allowedHours`, `allowedMinutes`, and a `#footer` slot.
- VTimePicker: `min`, `max`, `allowedHours`, `allowedMinutes`, `disabled`, `readonly`, `label`.
- VDatePicker: `disabled`, `readonly`, `label`, and an exposed `reset()`.
- VInput and VTextarea: a `#value-end` slot for a control acting on the value, rendered before the clear cross. VTextarea: `clearVisible`.
- VInputOTP: `readonly`, `hint`.
- All six text fields declare `@clear` and `@click:icon-start` and expose `focus()`, `select()` and `el`. VFileInput emits `remove`.

#### Choice controls, slider and progress

- VCheckbox, VRadio and VSwitch: `label`, `hint`, `readonly`. VSwitch: `invalid`.
- VSlider: `readonly`, `invalid`, `size`, and a declared `change` event fired by either thumb with the whole value.
- VProgressLinear and VProgressCircular: `label`.
- VCheckbox, VRadio, VSwitch, VSlider, VTabs and VToggle expose `focus(options)` and `el`.

#### Overlays, navigation and display

- VPopover: `matchTrigger`, a floor that keeps the panel at least as wide as its anchor.
- VMenu and VDialogAlert expose `show()`, `close()` and `el`. VMenuGroup takes a `#label` slot. VDialogAlert relays `#header-actions`.
- VDialog's `show()` returns a promise that settles once the dialog is open.
- VAccordionItem: `v-model:open`. VSideNavigationItem: `label`.
- VIcon: `mirrored`, which flips a directional glyph in right-to-left pages.
- VBadge: `variant="soft"`, and `ringColor` for the colour behind a `bordered` badge.
- VDataTable: `loadingText`, the `#loading` slot, the `#empty` slot (which receives `search`), and a muted background on the header row.
- VCarousel: a move of more than one page lands at once and plays the effect on arrival. `noJump` restores the full scroll. The `scale` effect is deeper.
- VCalendar: `firstDayOfWeek`, `format`, `disabled`. Events running past midnight for less than a day stay in the time grid. Clicking an event opens it; Space takes hold of it for a keyboard move.
- `width` on VDialog, VDialogAlert and VMenu, and `size` on VIcon and VSpinner, accept a number (pixels).

#### Types and tokens

- Every prop union has an exported name, one per component: `ButtonVariant`, `ChipTone`, `InputSize`, `MenuPlacement`, `ProgressLinearTone` and so on.
- Also exported: `ItemValue`, `CalendarCell`, `CalendarEventLayout`, `CalendarEventSlotProps`, `CalendarFormat`, `DataTableSortDirection`, `DatePickerDaySlotProps`, `PaginationMatcher`, `SliderValue`, `TimePickerAllowed`, `ToastVariant`, and the trigger slot props `DialogTriggerProps`, `MenuTriggerProps`, `TooltipTriggerProps`.
- New tokens: `--vectis-radius-chip` (chips can be rounded apart from other controls), `--vectis-control-size-dialog-width`, `--vectis-control-size-switch-pad`, `--vectis-control-size-badge-ring`, `--vectis-control-size-date-picker-day`.

### Fixed

- A closed popover could keep an invisible box that swallowed clicks, depending on the order your bundler emitted the stylesheets. Seen with VTimeInput beside other controls.
- VBreadcrumb, VDatePicker and VCalendar now mirror their chevrons in right-to-left pages.
- VCombobox, VDateInput and VTimeInput anchor their panel to the field box instead of the whole component, so a hint or label no longer offsets it.
- A VMenu opened through `v-model:open` or `show()` opens under its trigger instead of the viewport corner.
- A VTooltip sharing a button with a VMenu no longer opens when the menu closes, and no longer throws when a command is chosen.
- VCombobox shows the label of the value `0` and removes it on Backspace. A disabled VCombobox shows no dismiss cross on its chips.
- VDatePicker's `select` carries the new value under a parent `v-model`.
- VAvatarGroup with `max: 0` shows every avatar.
- VTabs tab and panel ids no longer collide (`'a b'` and `'a_b'`, `1` and `'1'`).
- VToaster no longer leaves a toast stuck after a placement change, and holds its countdown while a toast has focus.
- VDataTable selects rows keyed by numbers and runs the initial server-side search.
- VIconButton's loading spinner replaces the icon instead of sitting beside it.
- VButtonGroup draws its seams at full length, and nothing paints over them on hover.
- An overlaid VBadge stays above the neighbouring segment of a button group.
- VHotkeys caps stay readable on inverse surfaces such as a tooltip.
- VCheckbox and VRadio let the surface behind an unchecked box show through.
- VSwitch and VSlider thumbs stay white in the dark theme.
- VFilePicker keeps the same height while loading.
- VTextarea, VCalendar and VSkeletonLoader cap the interactive radius on boxes taller than a control.
- VCarousel keeps tracking slides that were replaced.

### Build note

If your build lowers CSS below the supported browsers, `:dir(rtl)` rules are rewritten into a `:lang()` list and stop applying on a page whose `dir` and `lang` disagree. Set `build.cssTarget` to the floor the README documents. See [Browser support](packages/ui/README.md) in the package README.

### Documentation

The documentation site at <https://vectis-ui.com> covers every component in English and French, with live examples and generated API tables.

**Full diff:** [v0.1.1-rc.0...v0.8.0](https://github.com/Jypyx/vectis-ui/compare/v0.1.1-rc.0...v0.8.0)

[0.8.0]: https://github.com/Jypyx/vectis-ui/releases/tag/v0.8.0
