# Changelog

All notable changes to luci-theme-proton2025. Source of truth: GitHub Releases.

## Unreleased

---

## [1.4.2] - 2026-09-23

## Changes in version 1.4.2

## Features

- **WebGL Fluid animation** (PR #85 — author: @frenzydrive)
  - Added a new login background option based on Pavel Dobryakov's WebGL Fluid Simulation (MIT license)
  - Available alongside the existing Canvas 2D particle modes; selectable in the theme settings
  - Lazy-loads `login-fluid.js` only when Fluid is chosen, so other modes pay no runtime cost
  - Falls back to the static background image if WebGL is unavailable or fails to initialize
  - Integrated with the smoothness fix so Fluid runs at full frame rate on capable devices

- **Configurable temperature thresholds** (PR #82 — author: @DoubleThePsycho)
  - Warm / Hot / Critical thresholds are now tunable instead of hardcoded 50 / 70 / 85 °C (defaults unchanged)
  - Stored in `proton2025.settings`, validated as whole numbers with `0 <= warm < hot < critical <= 150`
  - Compact controls at the bottom of Status → Realtime → Temperature with dirty-state Save and Reset-to-defaults
  - Badges, chart threshold lines and summaries update live after saving, no reload needed
  - Exposed via `luci.proton-temp` `getThresholds` / `setThresholds` as a shared source for the future dashboard widget

## Fixes

- **Login animation smoothness**
  - Restored smoother motion after the previous optimization had reduced the login background animation to a less fluid, overly throttled state

  - Kept a reduced-frame fallback for low-power devices, but raised the target frame rate for modern hardware to recover visual smoothness

  - Preserved the lightweight performance profile so weaker routers and older browsers still remain stable

  - Adjusted the animation timing logic to balance responsiveness with the original fluid visual feel

- **White flash on login page and on submit**
  - Added inline critical `background-color` style in `<head>` of `sysauth.ut` so the browser paints the correct dark/light background immediately, before external CSS loads

  - Eliminates the intermittent white flash of the login card when the Fluid animation is active and the user clicks login

  - Uses server-side `serverTheme` value so the inline style matches the resolved theme without waiting for JavaScript

  - On form submit the login page now dispatches a `proton-login-freeze` event that stops both Canvas 2D particles and WebGL Fluid loops, keeping the last frame and freeing the GPU for the next page paint

  - Covers keyboard/Enter/button submits plus a click backup for programmatic `form.submit()` (e.g. password-manager autofill), which skips the `submit` event

- **Port status cards with multiple networks** (fixes #81, #83)
  - Constrained multi-network zone color segments to the narrow status stripe instead of allowing them to overflow the port card

  - Stacked segments within the stripe on desktop hover and mobile layouts

- **Settings synchronization without HTTP ubus** (fixes #70 — reported and diagnosed by @ang3el7z)
  - Added `uhttpd-mod-ubus` as a runtime dependency and configure the standard `/ubus` endpoint during installation only when it is missing

  - Settings sync now checks HTTP status and response content type before parsing JSON, reporting a clear error instead of a misleading `Unexpected token "<"` message when a router returns an HTML 404 page

## Build

- **Theme asset versioning**
  - Increased the cache-busting asset version so updated UI scripts are reloaded by browsers after the animation adjustment

## Authors

- @ChesterGoodiny — smoothness restore, white flash fix, asset versioning

- @frenzydrive — WebGL Fluid animation (PR #85)

- @DoubleThePsycho — configurable temperature thresholds (PR #82)

- @ang3el7z — HTTP ubus gateway diagnosis and fix for settings synchronization (issue #70)

## Pull Requests

- #85 — Add WebGL fluid animation to login page

- #82 — Add configurable temperature thresholds

---

## [1.4.1] - 2026-09-07

## Changes in version 1.4.1

## Build

- **OpenWrt 25.12.5 package installation** (PR #79 — author: @fildunsky)
  - Fixed package installation and update failure on OpenWrt snapshot 25.12.5 and later

  - OpenWrt snapshots added `.ut` template precompilation to bytecode (format 0x02), which created incompatible bytecode that could not be loaded by the runtime

  - The `luci.mk` from snapshot-SDK was adding a dependency on `ucode (>=2026.02.27)`, but the bytecode format remained incompatible

  - Disabled template bytecode precompilation via build flag to ensure the package installs and updates correctly on all OpenWrt versions

---

## Authors

- @fildunsky — OpenWrt 25.12.5 installation fix

## Pull Requests

- #79 — Fix 1.4.x install/update on OpenWrt snapshot 25.12.5

---

## [1.4.0] - 2026-09-06

## Changes in version 1.4.0

## Features

- **Mobile navigation icons**
  - Replaced platform-dependent Unicode menu and close glyphs with consistent inline SVG icons

  - The menu trigger now switches between hamburger and close states while preserving accessibility labels and touch target

- **Mobile search layout**
  - Added a stable 44px search target that remains available without opening the menu

  - The focused search field expands into a separate header row without covering the mobile menu button

  - Preserved keyboard navigation, Escape handling, result roles and focus behavior

- **Wireless radio loading stability**
  - Added an atomic pending/ready phase for wireless radio classification

  - Prevented intermediate colored radio areas from flashing while LuCI builds the table

  - Limited reclassification to mutations that add or remove the Wireless container, table or radio rows; image `src` updates and internal cell redraws no longer restart classification

- **Selectable LuCI tab style**
  - Added the `modern` / `classic` / `proton` tab style setting with `modern` as the default

  - Classic mode restores an underline-based LuCI tab appearance without changing navigation or page URLs

  - Proton mode restores the earlier Proton tab design from the upstream repository, including the shared bottom rule, rounded tab tops and accent-highlighted active tab

  - The selected style is also applied to the tabs inside the Proton theme settings panel

  - Persisted the choice through localStorage and UCI, including early bootstrap, login synchronization, reset-to-defaults and localization

- **Desktop action dropdowns**
  - Network-page action menus now open on hover for mouse/trackpad users while retaining click behavior on touch devices

- **5G modem widget update** (PR #66 — author: @fildunsky)
  - Added support for a second modem when two modems are present in the system

## Fixes

- **Slower page loads**
  - `luci.js` was fetched twice per page: the theme header emitted its own tag, and LuCI core appends another one — about 30 KB of redundant transfer on every navigation

  - The theme tag is now `type="text/plain"`, so the browser neither downloads nor executes it, while `LuCI.__init__` still reads `?v=` from it

  - `xhr.js` is a 0-byte file in current LuCI builds and is no longer requested

  - `login-animation-settings.js` is now emitted only on System → Administration, the single page where its target block exists

  - `inter-cyrillic-ext.woff2` is no longer preloaded: fetched lazily via `unicode-range` with `font-display: swap` only when needed

  - Result: 5 network requests / 26 from cache instead of 22 full downloads

- **Floating notification drifting during page load**
  - `#maincontent` has a `fadeIn` animation with a `transform`, which made it the containing block for `position: fixed` notifications

  - Server-rendered floating alerts are now emitted before `#maincontainer`, so they are positioned against the viewport and stay put from the first frame

- **Mobile slide-out menu icons**
  - Section icons were sized only in the desktop media query, so on phones the SVG expanded to its viewBox (347×347px) and broke the menu layout

  - Menu rows are now 54px tall with 20×20px icons, and the label sits next to the icon instead of below it

- **Logout item in the collapsed side menu**
  - The collapsed-rail `margin` shorthand reset `margin-top: auto`, so "Logout" jumped up under the last section instead of staying pinned to the bottom

- **Text reflow while collapsing/expanding the side menu**
  - Menu labels wrapped on every frame of the 72↔240px width animation

  - Labels are now single-line with ellipsis clipping

- **Top menu flashing for a second on the first login**
  - The menu layout was read only from `localStorage`, which a fresh browser does not have yet

  - `header.ut` now reads `menu_mode`/`menu_collapsed` from UCI over ubus server-side and embeds them into the pre-paint inline script

  - Result: 3 ms instead of 1261 ms, with no relocation afterwards

- **Dark strip drawn over the page content during load in side-menu mode**
  - The server renders `#mainmenu` empty inside the header, and `menu-proton2025.js` relocates it only after `ui.menu.load()` resolves

  - `header.ut` now relocates the column at parse time: an inline script moves `#mainmenu` while the HTML is still streaming

  - `#maincontainer > #mainmenu:empty` keeps the normal width so `#maincontent` never reflows when the items appear

- **/admin/status/ rendered with unstyled tables**
  - Both `/admin/status/` and `/admin/status/overview` serve the same Overview view, but the theme derived the page identifier from `ctx.request_path` instead of `ctx.path`

  - `header.ut` now uses `ctx.path` for both the per-page `<link>` list and `body[data-page]`

  - Verified: `/admin/status/`, `/admin/` and `/admin/status/overview` now all emit `cascade-overview.css` + `cascade-status.css`

- **Login page in light theme**
  - The password eye button rendered as a solid accent-filled circle with a glow

  - The accent gradient was painted twice (on `body` and again on the particles layer above it)

  - Raised contrast of the card, inputs and labels, replaced accent-tinted borders with neutral ones, and restored the card border on narrow screens

- **Mobile login page** (fixes #63)
  - Restored the rounded card corners and softened the shadow while keeping the glassmorphism effect

- **Pending changes indicator** (fixes #69)
  - Header indicators are now compact icon badges with a counter instead of long text labels

  - "Unsaved changes" indicator is no longer clipped

- **Processes page table** (fixes #73)
  - The Actions column with three long buttons no longer overflows the table: buttons wrap and use compact padding

- **luci-app-filemanager dark mode** (fixes #72)
  - Header and status bars in `luci-app-filemanager` now follow the Proton dark theme

  - Text boxes no longer render white text on a white background

- **Port status card tooltip** (fixes #30)
  - The interface tooltip on hover is now anchored inside the card and clamped to the viewport width, so it is no longer clipped

- **Mobile text overflow** (fixes #30)
  - Long values (versions, package names, MAC/IP addresses) now wrap instead of overflowing their cells on narrow screens

- **Temperature graph** (fixes #30)
  - Sensor labels with close temperatures no longer overlap each other

- **Package Manager progress bar**
  - The storage usage label no longer gets clipped on narrow bars: a short adaptive summary is shown, the full text stays in the tooltip

- **Package Manager table header** (fixes #6)
  - The title row now renders as one consistent header with a single font instead of inheriting per-column data-cell styles

- **Chinese localization** (fixes #6)
  - Completed the `zh` dictionary for the theme settings panel; all 9 locales now fully translated

- **Dropdown corners** (fixes #6)
  - `select` and `.cbi-dropdown` now use the theme radius variable, including the open list

- **OpenClash dropdowns** (refs #61)
  - Long option labels no longer overflow the dropdown: items wrap and the list width adapts

- **Theme asset caching**
  - Added a version query to theme CSS/JS and `luci.js` so browsers pick up updated files after a theme upgrade without a manual cache reset

- **Tab strip baseline** (PR #68 — author: @fildunsky)
  - Reduced the gap between tab baseline and page content from 24px to 12px so the line reads as the tabs' baseline

- **Progress bar** (PR #67 — author: @fildunsky)
  - Improved progress bar track tint for better visual consistency

## Changed

- Swapped the CBI button styles: "Apply" is now the solid accent button, "Save" is neutral

- Increased the default page width from 990px to 1200px

- Redesigned the "Port status" cards on the Overview page (zone stripe, LED status indicator, compact traffic row)

- Reworked the theme settings panel into a tabbed card inside the LuCI section

- Removed the "Wrap table text" and "Modem temperature" options

- Separated notifications from dialogs: LuCI core reuses `.alert-message` inside modals (session expiry, Save & Apply, rollback), so those are no longer treated as floating notifications

- Alerts inside `#modal_overlay` no longer render their own card (background, blur, shadow) on top of the dialog

- `displayStatus()` modals lost the phantom 18px indent from the inherited flex layout and accent stripe

- Managed floating alerts drop the duplicate core "Dismiss" button and keep the compact close control

- Added styling for the core `notice` and `error` alert types and for `.btn.primary` in dialogs

- Empty `<h4>` headings in `showModal('', '')` dialogs no longer draw a bare divider line

- Inline system alerts now actually disappear when dismissed: the theme styled `.fade-out` so the core `transitionend` remover now fires

- Moved the theme's own toasts onto the shared floating notification surface

- Every migrated toast now carries a context heading (`Login Page Animation` for the animation switch, `Custom login branding` for the logo controls)

- The two "logo is too large" guards are now `warning` cards rather than looking like successful saves

- Notifications may opt into auto-closing with `data-proton-timeout`; auto-closed cards are not remembered in `sessionStorage`

- The keyboard shortcut echo in the log viewer keeps its own compact look but now reads its styling from the theme tokens instead of inline styles

---

## Authors

- @ChesterGoodiny — mobile navigation, search layout, wireless radio stability, tab styles, desktop dropdowns, performance improvements, notification system, login page fixes, page width, settings panel rework

- @fildunsky — 5G modem widget update, tab baseline fix, progress bar tweak

## Pull Requests

- #68 — Tabs: tighten the gap under tab strips

- #67 — Progress bar track tint

- #66 — 5G modem widget: support for second modem

---

## [1.3.0] - 2026-07-09

## Changes in version 1.3.0

## Features

- **Background patterns customization** (PR #51 — author: @fildunsky)
  - Added background pattern option with three test patterns

  - Added a slider to adjust pattern scale

  - Changed "noise" effect to "stars" — they regenerate differently each time the scale is changed

  - Moved hardcoded design values (light pattern colors, grid/dots/noise sizes, SVG noise alpha, card RGB) to CSS variables (`--proton-pattern-grid-size`, `--proton-pattern-dots-size`, `--proton-pattern-light-line`, `--proton-pattern-light-dot`, `--proton-pattern-noise-size`)

## Fixes

- **Wi-Fi styling** (PR #52 — author: @fildunsky)
  - Network - Wireless: removed the middle element between radio0 and radio1

  - Status - Overview: fixed wireless tables alignment

  - Wi-Fi History page: fixed table layout

- **Custom accent color on initial startup** (PR #53 — author: @fildunsky)
  - Fixed a bug where the router used a fallback blue accent color on initial startup even if a custom color was set in settings

- **Zerotier table layout** (PR #54 — author: @fildunsky)
  - Fixed table rendering in `luci-app-zerotier`

- **Opkg update settings save** (PR #55 — author: @fildunsky)
  - Fixed settings save issue during opkg update

- **Login screen password focus** (PR #57 — author: @fildunsky)
  - Fixed password field focus behavior on the login screen (fixes #56)

- **Bottom spacing** (PR #59 — author: @fildunsky)
  - Fixed excessive bottom space in page layout

- **Dropdown width in OpenClash** (PR #60 — author: @fildunsky)
  - Fixed dropdown menus not displaying fully in OpenClash (fixes #58)

---

## Authors

- @fildunsky — background patterns customization, Wi-Fi styling fixes, custom accent color startup fix, Zerotier table fix, login password focus fix, bottom spacing fix, dropdown width fix

## Pull Requests

- #51 — Background patterns customization with slider and CSS variables

- #52 — Wi-Fi styling fixes (wireless page, overview tables, history page)

- #53 — Fix custom accent color fallback on initial startup

- #54 — Table fix for luci-app-zerotier

- #55 — Opkg update save settings fix

- #57 — Login screen password focus fix

- #59 — Bottom space fix

- #60 — Dropdown width fix for OpenClash

---

## [1.2.9] - 2026-07-02

## Changes in version 1.2.9

## Features

- **Custom login logo** (PR #50 — author: @fildunsky)
  - Added the ability to customize the logo on the LuCI login screen

  - Added support for a custom router nameplate on the login screen

  - Added display mode for logo only (when only the uploaded logo should be displayed)

  - Login corporate identity settings are saved in the Proton2025 settings stream via UCI

  - This feature helps to visually distinguish between different routers and branded installations on the login page

- **Visual refinement of the login page** (author: @ChesterGoodiny)
  - Added built-in SVG icons for the username and password fields (self-drawn)

  - Added a password visibility switch without dependencies on external icons

  - Added a login icon inside the `Log in` button

  - Added a compact separator and a simple "Powered by OpenWRT" footer under the login button

  - The icons are embedded directly as inline SVG, without depending on third-party icon fonts

## Fixes

- **Initial account transparency** (author: @ChesterGoodiny)
  - Fixed a bug that caused the authorization card to become transparent for a short time when displaying the first page

  - The animation of the login container `fadeInUp` was replaced with `loginSlideIn`

  - Opacity animation has been removed from the login effect

  - The login card is now visible from the first frame, while maintaining a short slide transition

  - This prevents the animated background from being visible in the authorization window for a split second

- **Translation of the login logo** (author: @ChesterGoodiny)
  - The hard-coded EN/RU translation pairs have been removed from `login-animation-settings.js`

  - Changed the login animation and user interface lines to create a corporate identity for the general translation helper `protonT()`

  - Replaced the mapping of localized headlines in `login-animation-settings.js` with stable string definition based on the control ID

  - The remaining debug `console.log()` has been removed from the login animation injector

  - Added translations of login animations and custom branding controls for RU, ZH, DE, UK, ES, PT, PL, FR, and IT

---

## Authors

- @fildunsky — custom login logo and router nameplate

- @ChesterGoodiny — visual refinement of the login page, initial transparency fix, translation cleanup

## Pull Requests

- #50 — Custom logo for the login page

---

## [1.2.8] - 2026-06-30

## Changes in version 1.2.8

## Features

- **Optional tab outline setting** (PR #45 - author: @fildunsky)
  - Added an optional `Tab outline` setting

  - The option is disabled by default and can be enabled to outline inactive tabs

## Fixes

- **Temperature sensor detection rework** (commit 1dbc96e - author: @ChesterGoodiny)
  - Reworked the temperature detection logic after the previous temperature fix

  - Detection now prefers `/sys/class/hwmon` sensors and adds `/sys/class/thermal` sensors only when they are not already represented by `hwmon`

  - CPU/SoC sensors are no longer duplicated when exposed both through `thermal_zone` and `hwmon`

  - Wi-Fi radio sensors, including `mt7915_phy0` and `mt7915_phy1`, are no longer hidden when their temperatures are identical or close

  - Removed temperature-value based deduplication in favor of stable sysfs path/device identity checks

- **Visual and layout fixes** (PR #45 - author: @fildunsky)
  - Aligned Network → Interfaces icons and device names inside interface cards

  - Improved bridge-member icon alignment inside brackets

  - Fixed Status → Overview active DHCP leases table layout so long hostnames wrap without stretching the table

  - Kept IPv4, MAC and lease-time values on one line while allowing the hostname column to wrap

  - Fixed action column width and overflow in 5-column and 7-column lease table variants

  - Improved Network → Interfaces mobile action buttons: Edit is blue, Delete is red

  - Fixed white button-block background in the light theme on mobile

  - Fixed Software page table styling, hover behavior and colored button hover states

  - Fixed port status card headers overflowing rounded corners

  - Fixed custom accent color fallback when navigating between pages

- **GitHub stars badges in README** (PR #46 - author: @cergo666)
  - Fixed GitHub stars display in `README.md`

  - Fixed GitHub stars display in `README_ru.md`

- **Modal table overflow** (PR #47 - author: @frenzydrive)
  - Fixed wide LuCI CBI tables overflowing outside modal dialogs

  - Modal dialogs containing CBI tables now adapt to the available viewport width

  - Table overflow stays inside the modal and becomes horizontally scrollable when needed

  - Row action buttons in modal tables stay on one line

  - The issue was visible, for example, in WireGuard/AmneziaWG peer tables under Network → Interfaces

## Build

- **OpenWrt SDK version update** (PR #47 - author: @frenzydrive)
  - Updated the OpenWrt snapshot SDK reference used by the build workflow

  - Updated APK build workflow SDK from `gcc-14.3.0` to `gcc-14.4.0`

## Notes

- The final v1.2.8 temperature detection behavior prefers `hwmon` first and adds `thermal_zone` sensors only when they are not already represented by `hwmon`.

- Verified with `ubus call luci.proton-temp getSensors '{}'`: CPU and both MT7915 PHY sensors are detected correctly without duplicates.

---

## Authors

- @fildunsky - visual fixes, active leases layout, Software page fixes, custom accent color follow-up fixes, tab outline option

- @cergo666 - GitHub stars badges in README files

- @frenzydrive - modal CBI table overflow fix, OpenWrt SDK version update in build workflow

- @ChesterGoodiny - v1.2.8 temperature detection rework

## Pull Requests

- #45 - Visual fixes, active leases layout, Software page fixes, tab outline option and custom accent color fixes

- #46 - Fix GitHub stars badges in README files

- #47 - Fix modal CBI table overflow and update OpenWrt SDK version in build workflow

## Commits

- `1dbc96e` - Temperature detection now prefers hwmon sensors and adds thermal_zone sensors only when not already represented by hwmon

---

## [1.2.7] - 2026-06-29

## Changes in version 1.2.7

## Features

- **Custom accent color** (PR #42 — author: @fildunsky)
  - Added custom accent option with slider and HEX label to choose any color

  - Relocated the accent block to a more appropriate position in the theme settings

## Fixes

- **Phy1 temperature flickering** (PR #44 — author: @fildunsky)
  - Fixed flickering of the Phy1 (5 GHz) temperature reading on mt7915-based routers

  - Replaced value-based deduplication of hwmon sensors with device-identity deduplication via `realpath(.../device)`, so both Wi-Fi radios now display their temperatures consistently

---

## Authors

- @fildunsky — custom accent color, Phy1 temperature flickering fix

## Pull Requests

- #42 - Custom accent color with slider and HEX label

- #44 - Fix Phy1 temperature flickering on mt7915

---

## [1.2.6] - 2026-06-28

## Changes in version 1.2.6

## Fixes

- **luci-app-pw2 transparent pop-up windows** (PR #40 — author: @fildunsky)
  - Fixed transparent pop-up window issues in `luci-app-pw2`

  - Aligned pw2 styling with the Proton2025 theme

- **Status overview port status pop-up** (PR #40 — author: @fildunsky)
  - Fixed layout and transparency issues in the port status pop-up on the status overview page

## Build

- **Legacy csstidy minifier skipped** (PR #41 — author: @fildunsky)
  - Skipped the legacy `csstidy` minifier — it only understands the CSS 3.0 draft and floods the build log with "Invalid property" warnings for every modern rule (custom properties, gap, transform, grid, backdrop-filter, etc.)

  - Prevents potential corruption of `calc()` and custom property values

  - Stylesheet is now shipped as-is; JS/Lua minification remains unaffected

---

## Authors

- @fildunsky — pw2 and port status pop-up fixes, legacy csstidy minifier skip

## Pull Requests

- #40 - Fixes for luci-app-pw2 and status overview port status

- #41 - Skip legacy csstidy minifier

---

## [1.2.5] - 2026-06-16

# Changelog v1.2.5

## Fixes

- Fixed mobile tooltip layout where text could collapse into a one-letter-per-line column.

- Fixed tooltip clipping and stacking issues on status overview port cards.

- Fixed long DHCPv6 identifiers overflowing into neighbouring form rows.

- Adjusted page width fallback handling to avoid layout jumps.

## Translations

- Added missing update checker and installer translations for `zh`, `de`, `uk`, `es`, `pt`, `pl`, `fr`, `it`.

- Added missing search indexing translations, including `Cancel Indexing` and indexing canceled messages.

- Synchronized translation keys across all supported languages.

## Tested On

- Desktop viewport

- Mobile/narrow viewport through browser developer tools

- Status overview tooltips

- Translation dictionaries

---

## [1.2.4] - 2026-06-10

# Changes in version 1.2.4

## Fixes

- **Navigation panel width jumping** — fixed issue where panel changed width before and after page load
  - ~~Changes from PR #32 (fildunsky): default width from `990px` to `80%`~~ — reverted, caused interface jumping

  - Restored stable value `--proton-page-max-width: 990px`

  - Added `!important` flag for inline styles — prevents override from cascade.css

  - Width is now set once on load and no longer changes

  - **Note:** Users can adjust width via "Page Width" slider in theme settings (e.g., set to 80% if needed)

- **Login page with changed zoom** (PR #33 — author: [@frenzydrive](https://github.com/frenzydrive))
  - Fixed issue where entire page shrunk when interface zoom < 100%

  - Login page always remains fullscreen

  - Zoom applied separately to login card and animation layer

  - Tested with values: 75%, 80%, 85%, 90%, 95%, 100%

## New Features

- **Automatic update check and install** (PR #34 — author: [@frenzydrive](https://github.com/frenzydrive))
  - New update section in Proton2025 theme settings

  - Display currently installed package version

  - Automatic check for latest version via GitHub Releases

  - Install button shown only when newer version available

  - Direct installation of latest package from GitHub Releases

  - Support for OpenWrt 24.x/opkg and OpenWrt 25.x/apk

  - Automatic LuCI cache clearing after installation

  - Added rpcd ACL permissions

  - Russian translations for update interface

  - **Note:** Login may be required again after installation

- **"Auto" theme mode (default)** (PR #32 — author: [@fildunsky](https://github.com/fildunsky))
  - Theme now follows system settings instead of always dark

  - Changed in all modules: `settings-sync.js`, `menu-proton2025.js`, UCI configs, rpcd, templates

  - Login page now has live system theme tracking via `matchMedia`

  - In "auto" mode, page switches between light/dark without reload

- **Login page improvements** (PR #32 — author: [@fildunsky](https://github.com/fildunsky))
  - Particles become brighter (~×2.25) in light theme — better visible on light background

  - Hardcoded blue colors replaced with accent CSS variables (`--proton-accent`)

  - Login page now follows selected accent color

  - Added `--proton-accent-rgb` variable for `rgba()` colors

  - Background color set before loading `cascade.css` — eliminated flash

  - Added animation name translations

- **Theme settings and UI** (PR #32 — author: [@fildunsky](https://github.com/fildunsky))
  - Slider fill bar (zoom, width) now updates when theme or accent changes

  - Previously, fill color could get "stuck"

- **Services widget** (PR #32 — author: [@fildunsky](https://github.com/fildunsky))
  - Added SmartDNS support in ad blocking category

- **Translations** (PR #32 — author: [@fildunsky](https://github.com/fildunsky))
  - Added translations for "Auto" and theme mode description

  - Languages: `zh`, `de`, `uk`, `es`, `pt`, `pl`, `fr`, `it`

- **Additional CSS improvements** (PR #32 — author: [@fildunsky](https://github.com/fildunsky))
  - Compact tables

  - Overflow fixes

  - Dark theme for SSClash/Mihomo

  - Light palette for Ace editor

  - Dashboard fixes

  - Inline styles patcher for LuCI dashboard and SSClash/Mihomo

---

## Authors

- [@frenzydrive](https://github.com/frenzydrive) — automatic update checker, login page zoom fix

- [@fildunsky](https://github.com/fildunsky) — "Auto" mode, animations and styling improvements

- [@ChesterGoodiny](https://github.com/ChesterGoodiny) — navigation panel width jumping fix

## Pull Requests

- [#34 - Add Proton2025 update checker and installer](https://github.com/ChesterGoodiny/luci-theme-proton2025/pull/34)

- [#33 - Keep login page fullscreen when UI zoom changes](https://github.com/ChesterGoodiny/luci-theme-proton2025/pull/33)

- [#32 - Auto theme mode, login page improvements, and more](https://github.com/ChesterGoodiny/luci-theme-proton2025/pull/32)

---

## [1.2.2] - 2026-06-05

# Changelog v1.2.2

## New Features

- **Login Screen Animations** - Added multiple animated login page presets that follow the selected Proton accent color:
  - Particle animation support

  - Underwater Depths animation preset with cached background layer

  - Accent-aware color system for lightweight animations

  - Lightweight with accent color matching

- **Light Mode Support for Animated Login** - The login page now dynamically applies Light/Dark theme mode:
  - Light-mode styling for login form

  - Canvas background switches between dark and light gradients based on active theme

  - Improved contrast for field labels and input text on light backgrounds

## Fixes

- **Theme Settings Sync on Mobile** - Fixed theme settings not being persisted on mobile browsers:
  - Added `mobile-settings-fallback.js` to listen for theme setting changes and persist them through `luci.proton-settings setSettings`

  - Settings now correctly write to UCI on mobile devices

- **Cross-Device Theme Settings on Login Page** - Updated login page to read current Proton2025 settings from UCI before applying localStorage values:
  - Another browser/device can now see the latest theme settings on the login page before authentication

  - Improved cross-device behavior

- **Login Animation Selector** - Fixed missing login animation option that could fail to appear in theme settings

- **Form Persistence** - Fixed Proton2025 settings block disappearing after Save/Apply on system settings pages:
  - Added MutationObserver to keep settings visible when LuCI re-renders the form

  - No page refresh required after changing system settings

- **Login Form Contrast** - Fixed input field contrast in light mode for better readability:
  - Field borders, typed text, placeholders, and labels now readable on light animated login page

- **Login Background Scaling** - Fixed login page background animation scaling on different screen sizes:
  - Canvas now properly handles viewport sizes with `visualViewport.resize` support

  - Correct behavior on wide screens and browsers with non-standard viewports

- **Theme Version** - Updated display version from 1.2.1 to 1.2.2 in footer and Makefile

## Tested On

- OpenWrt 24.10.5

- Multiple browsers (Chrome, Firefox, Safari)

- Mobile and desktop viewports

- Light and dark theme modes

---

## [1.2.0] - 2026-05-30

## Proton2025 Theme v1.2.0

## New Features

- **Header search** - Added a built-in search bar that indexes LuCI pages for semantic matching, keyboard-layout/transliteration tolerance, and quick navigation across pages and settings.

- **Package Architecture widget** - Added a package/feed architecture badge on Status -> Overview. The badge shows the router package architecture and opens the detected package feed URL when available.

- **Realtime Temperature page** - Added a dedicated Status -> Realtime Graphs -> Temperature page with live sensor history, per-sensor focus, multi-sensor overview, mobile-friendly layout, and hover details on the chart.

## Improvements

- **Mobile layout improvements** - Reworked the page for small screens, including responsive sensor chips, stacked summary cards, and a mobile-friendly sensor statistics layout.

- **Notification system hardening** - Added theme-managed floating alerts with close controls and responsive styling, split them from native LuCI warnings, preserved original button handlers during alert normalization, and restored the password warning correctly after re-login.

- **Wireless mobile actions menu** - Fixed clipping of the three-dot actions dropdown on small screens by opening it upward when there is not enough space below the toggle.

- **Global Name column fix** - Restored LuCI named-table rendering for the first `Name` / `Название` column across services and other CBI tables that use `data-title` pseudo-cells instead of real header cells.

- **Theme consistency fixes** - Improved light theme rendering for chart tooltips and removed inconsistent hostname hover coloring.

- **Internal view naming cleanup** - Renamed the realtime temperature view file to a Proton-specific path to avoid conflicts with third-party LuCI packages.

---

## [1.1.2] - 2026-04-12

# Changelog v1.1.2

## Bug Fixes

- **Login Page** — Fixed login page localization by replacing `{{ _('Login') }}` with the standard LuCI string `{{ _('Log in') }}`, allowing the correct translation to load.

- **Dynamic List Fields** — Fixed horizontal overflow in LuCI dynamic list widgets (`.cbi-dynlist`) so long values now wrap correctly instead of stretching the form layout. Thanks to `@DrStorey` for the report and the original CSS override example.

- **Light Theme Transparency** — Fixed light mode transparency by correcting the header selector and using a denser top bar background for better readability.

- **Mobile Sidebar Shadow** — Removed the unwanted edge darkening caused by the hidden mobile sidebar in both light and dark themes, while keeping a softer shadow when the menu is open.

- **Firewall Rules Table** — Restored the missing `Name` column on the Firewall → Traffic Rules page by re-enabling the LuCI pseudo-column rendered from each row’s `data-title` attribute.

- **Language & Style Layout** — Updated the Proton2025 settings insertion logic so the built-in `Table Filters` option stays in its native position on newer LuCI versions, while older LuCI builds without that option keep the previous layout.

- **APK Package Build** — Reworked the CI packaging flow so `.apk` releases are built by the official OpenWrt SDK instead of being manually repacked as `tar.gz`, fixed artifact detection for the native APK filename format used by OpenWrt, and aligned CI versioning between APK and IPK packages. Thanks to `@inteliboy` for the original report, `@RoVRy` for confirming the issue on newer OpenWrt builds, and `@fildunsky` for sharing a working APK build example.

---

## [1.1.1] - 2026-03-04

# Changelog v1.1.1

## Bug Fixes

- **Backup/Restore buttons on mobile** — Fixed overlapping buttons on screens ≤600px; buttons now stack vertically and span full width

- **Port Status cards (Overview)** — Reduced card min-width for better fit on medium screens; cards wrap earlier without overflow

- **Reboot confirmation modal — single language** — Fixed `tr()` helper using wrong variable; modal now correctly translates to all 10 supported languages

- **MTK WiFi icons (issue #11)** — Fixed `remapIcon()` failing for proprietary MTK device names, added 3-level detection: ① `data-radio-device` attribute, ② exact badge text match, ③ substring search; fixed MutationObserver race condition

- **Background gradient flash (FOUC)** — Fixed brief flash of default gradient on reload/navigation; inline `<head>` script now sets `--proton-accent-rgb` and critical inline CSS includes the full body gradient for both themes

- **Mobile burger menu tap highlight** — Fixed browser-default tap highlight color on mobile; added `-webkit-tap-highlight-color: transparent` and proper `:active` states

## Refactoring

- **Wireless frequency pipeline** — Replaced regex-based text parsing and per-frequency CSS hardcode with server-side ubus data pipeline (`network.wireless status` → `header.ut` → `data-band` attribute → CSS); JS sets only structural `data-band="2g|5g|6g|60g"`, CSS defines all colors via `tr[data-band]` selectors; works with any device names; reduced ~90 lines of hardcoded CSS to ~30 universal lines

- **Removed duplicate MutationObserver** — `markRadioDevicesAndFreq()` now runs only from `header.ut` inline observer; removed redundant calls from `menu-proton2025.js` (was triggering twice per mutation)

- **Cleaned dead code** — Removed `isWirelessDevice()` regex fallback (`/^radio\d+$/`), `BAND_COLORS` JS object, `applyFreqStyle()`, and 3 `window._proton*` exports that are no longer needed

## Proton2025 Theme v1.1.1

### 📦 Packages

- **`.ipk`** — для OpenWrt с opkg (версии до 24.x)

- **`.apk`** — для OpenWrt с apk (версии 24.10+)

### 🔧 Установка

**opkg (IPK):**

```bash

opkg install luci-theme-proton2025_*.ipk

```

**apk (APK):**

```bash

luci-theme-proton2025_1.0.4_all.apk deleted 6.03.2026

```

---

## [1.1.0] - 2026-02-28

# Changelog v1.1.0

## New Features

- **Page Width setting** - Slider (50%–100%) for ultrawide monitors, syncs via UCI

- **Log Viewer with syntax highlighting** - Severity detection, line numbers, colored gutter, toolbar with stats/filters, keyboard shortcuts (Ctrl+C/S, Home/End, F11, W, T, Esc)

- **Settings Backup & Restore** - Export/import theme settings as JSON with validation

- **Reset to Defaults button** - Elegant red button with confirmation dialog, resets both localStorage and UCI settings

- **Reboot confirmation modal** - Warning dialog before system reboot with multi-level interception

- **Services monitoring widget** - Status visualization with "Not installed" state, deep check, custom services

- **Temperature widget** - Thermal sensors monitoring

## Bug Fixes

- **WiFi overview cards** - Fixed clipping on 3+ radios, proper wrapping

- **Service monitoring** - Fixed incorrect status for ubus/rpcd, added pidof fallback

- **DHCPv6 leases table** - Added missing mobile styles

- **Log viewer** - Fixed FOUC, horizontal scroll on mobile, keyboard jumping on login

- **Zoom/Page Width sliders** - Fixed accent color, light theme contrast

- **Login button** - Fixed hover shadow ignoring accent, added active feedback

- **System time sync buttons** - Fixed escaping the field on wide screens

- **Mobile typography** - Unified font sizes (4-level scale), 16px inputs to prevent iOS zoom

- **Range inputs** - Fixed visibility on light theme with proper contrast

- **Log keyboard shortcuts** - Fixed Ctrl+C conflict with text selection

- **Log Escape handler** - Fixed memory leak on modal close

- **Reboot double-submit** - Fixed rapid double-click triggering twice

- **Interface zone badges** - Fixed contrast for light gray zones (238, 238, 238), added darker gradient

## Improvements

- **Font loading optimization** - Added `<link rel="preload">` for Inter fonts, eliminates FOUT

- **Port Status cards (Overview)** - Compact desktop layout (140-160px width, centered, max-width 800px), larger icons (32px), improved spacing

- **Inter font licensing** - Added LICENSE.txt (SIL OFL 1.1), proper attribution in README

- **Log Viewer performance** - Diff-based polling, O(1) keyword lookup, event delegation, CSS `content-visibility`

- **Log Viewer mobile** - Enlarged buttons (36×36px), vertical toolbar, horizontal scroll stats

- **Log Viewer light theme** - Complete color palette with WCAG contrast compliance

- **Login button** - Ghost style on hover (transparent bg, accent border)

- **Repo Public Keys page** - Scoped styles, full-width textarea, proper wrapping

- **RPC settings module** - Added `page_width`, `table_wrap`, `log_highlight` validation

- **Pre-installed Inter font** - Embedded variable font, decoupled from OS, forced on all form elements

## Localization

- All features translated to 10 languages: EN, RU, ZH, DE, UK, ES, PT, PL, FR, IT

- Log viewer UI, backup/restore, reboot modal, reset button fully localized

## Proton2025 Theme v1.1.0

### 📦 Packages

- **`.ipk`** — для OpenWrt с opkg (версии до 24.x)

- **`.apk`** — для OpenWrt с apk (версии 24.10+)

### 🔧 Установка

**opkg (IPK):**

```bash

opkg install luci-theme-proton2025_*.ipk

```

**apk (APK):**

```bash

apk add --allow-untrusted luci-theme-proton2025_*.apk

```

---

## [1.0.4] - 2026-02-05

# Changelog v1.0.4

## Bug Fixes

- **Fixed theme not registering after IPK/APK installation**
  - Corrected file copying in GitHub Actions workflow

  - UCI defaults file now installs properly

- **Fixed missing action buttons on Network > Devices page (desktop)**
  - Added multiple initialization attempts for dynamic tab content

  - Three-dot menu (⋮) now appears correctly on desktop view

- **Fixed APK package format validation error** (#9)
  - Changed to proper gzip compression with reproducible build flags

  - APK packages now install without format errors on OpenWrt 24.10+

- **Fixed text overflow with 3 WiFi radios on Overview page** (#9)
  - Changed service widget text from nowrap to word-break

  - Long WiFi radio names now wrap properly instead of being cut off

- **Fixed zoom/scaling setting not persisting** (#9)
  - Added event trigger to sync zoom changes to UCI

  - Zoom setting now saves correctly and persists after reboot

- **Fixed inconsistent Overview styling depending on entry URL**
  - Normalized page detection for `/cgi-bin/luci/`, `/admin/`, and `/admin/status/` aliases

  - Load Average (System load) enhancement now applies reliably across all Overview entrypoints

  - Mode menu active state no longer depends on `requestpath` being present

- **Fixed loading spinner text jumping/flickering**
  - Removed fade-in animation from spinner text

  - Loading text now appears instantly without layout shifts

---

### 📦 Packages

- **`.ipk`** — для OpenWrt с opkg (версии до 24.x)

### 🔧 Установка

**opkg (IPK):**

```bash

opkg install luci-theme-proton2025_*.ipk

```

**apk (APK):**

luci-theme-proton2025_1.0.4_all.apk deleted 06.02.2026

---

## [1.0.3] - 2026-01-31

# Changelog 1.0.3

## Fixes

- Fixed Load Average widget disappearing in Chinese and other languages

- Fixed table header border-radius (rounding now only on the first and last th)

- Fixed table style conflicts with custom packages

- Fixed table width measurement with overflow:hidden/text-overflow:ellipsis

- Removed 35 incorrect CSS selectors `body[data-page=""]` that did not match real pages

- Fixed Overview page detection logic in services-widget.js (removed fallbacks to empty data-page)

- Fixed Overview style application — they no longer affect the Realtime Graphs page (/admin/status)

- Removed invalid CSS selector `:contains()` from cascade.css (not standard CSS)

- Removed 7 `console.log` calls from production code (settings-sync.js, custom-pages.js)

- Added explanatory comments to 7 empty catch blocks in services-widget.js

- Fixed duplicated event listeners in dropdown menus (WiFi, Interfaces, Devices)

- Fixed dropdown positioning for Devices (top: 100% instead of 65%)

- Fixed action button lookup in Devices dropdown — now works with different DOM structures

## Improvements

- Rewrote Load Average lookup: now by position (9th row) with value pattern validation instead of 29 keywords

- Optimized custom-pages.js: replaced setTimeout chains with a debounced MutationObserver

- Added automatic custom page detection (custom-pages.js)

- Applied Bootstrap-compatible table styles for custom pages

- Dynamically expands the container to the right if content is wider than 990px

- Reduced table font-size on custom pages (12px)

- Synchronized page width (990px) between header.ut and cascade.css

- Added L.poll subscription to restore the widget after data updates

- Unified styles for #tabmenu and .cbi-tabmenu (same look for navigation tabs)

- Disabled custom-page styles on mobile screens (< 800px)

- Improved measurement of the table "natural" width (temporarily removing CSS constraints)

## New Features

- Added a dropdown (⋮) for action buttons on the Network → Devices page
  - Works only on desktop (≥800px); on mobile it uses regular buttons

  - Styling matches the WiFi and Interfaces dropdown

- Created a single global handler `setupGlobalDropdownHandlers()` for all dropdown menus

- Added initialization flags to prevent duplicated event handlers

## New Files

- `custom-pages.js` — automatic detection and styling for custom pages

### 📦 Packages

- **`.ipk`** — для OpenWrt с opkg (версии до 24.x)

- **`.apk`** — для OpenWrt с apk (версии 24.10+)

### 🔧 Установка

**opkg (IPK):**

```bash

opkg install luci-theme-proton2025_*.ipk

```

**apk (APK):**

```bash

apk add --allow-untrusted luci-theme-proton2025_*.apk

```

---

## [1.0.2] - 2026-01-11

# Changes in Version 1.0.2

## Fixes

- Dark/light mode is now correctly detected across different LuCI sections

- Third-party pages and plugins adapt better to the theme

- IPK installation: custom theme icons are now installed correctly

- Minor styling issues resolved (icons, labels, and colors now appear more consistently)

- Icon centering in the Port Status Grid now works on all Status pages

- Clicking a parent menu item now correctly navigates to the first page of its submenu

- Diagnostics page: dropdown buttons (IPv4 Ping, Traceroute) are now compact, and the dropdown menu correctly appears above the container

- Wireless page: the Access Point (AP) name in the Associated Stations table is now fully displayed with text wrapping instead of being truncated

## New Features

- **"Table Text Wrap" Setting**:
  - Enabled by default—long AP names now wrap to a new line

  - Can be disabled to revert to ellipsis truncation

  - Available at **System → System → Proton2025 Theme Settings**

- **Extended Language Support**:
  - Added translations for 9 languages: English, Русский, 中文, Deutsch, Українська, Español, Português, Polski, Français, Italiano

  - Automatic detection of the LuCI interface language

  - Full translations for all theme settings and widgets

- **Updated Theme Logo**—new design with a diagonal split:
  - OpenWrt WiFi arcs in the top half

  - Proton atom with orbitals in the bottom half

  - Diagonal gradient split: dark gradient (#0f1419 → #1a1f2e) / accent blue (#5e9eff → #7db2ff)

  - Accent-colored atomic core matching the theme’s primary color

- **Hybrid Theme Settings Storage (localStorage + UCI)**:
  - Settings now sync across browsers and devices

  - Included in router backups (`sysupgrade -b`)

  - Instant application without flicker (localStorage used as cache)

  - UCI serves as the source of truth—settings persist on the router

  - New RPC module `luci.proton-settings` for managing settings

  - Automatic synchronization when switching browser tabs

### Technical Details: Settings Synchronization

**New Files:**

- `/etc/config/proton2025` — UCI configuration file for theme settings

- `/usr/share/rpcd/ucode/luci.proton-settings` — RPC module for reading/writing settings

- `/www/luci-static/proton2025/settings-sync.js` — JavaScript synchronization module

**Supported Settings:**

| Setting | UCI Option | Values |

|--------|------------|--------|

| Theme Mode | `mode` | `dark`, `light` |

| Accent Color | `accent` | `default`, `blue`, `purple`, `green`, `orange`, `red` |

| Zoom Level | `zoom` | `50`–`150` |

| Transparency | `transparency` | `0`, `1` |

| Border Radius | `border_radius` | `default`, `sharp`, `extra` |

| Animations | `animations` | `0`, `1` |

| Services Widget | `services_widget` | `0`, `1` |

| Temperature Widget | `temp_widget` | `0`, `1` |

| Services Log | `services_log` | `0`, `1` |

| Table Text Wrap | `table_wrap` | `0`, `1` |

**Synchronization Logic:**

```plaintext

Page Load:

1. [sync]   localStorage → apply instantly (no flicker)

2. [async]  UCI → compare → update localStorage if different



Setting Change:

1. [sync]   localStorage → apply instantly

2. [async]  UCI → save (debounced, 500ms delay)

```

---

## [1.0.1] - 2026-01-09

## What's new in v1.0.1:

### 🔧 Bug Fixes

- **Dropdown menus** now open correctly in modal windows (Interfaces, Routing)

- **Removed extra scrollbar** when modal windows are open

- **Mobile dropdown menus** no longer shift off-screen

- **Port status icon** is now properly centered

- **Widget tooltips** no longer hidden behind other elements

- **WiFi action buttons** now use correct accent color on hover

### ✨ Improvements

- **Login page** now fully supports theme settings (colors, corners, zoom)

- **Logo** changes color with selected accent color

- **All UI elements** now correctly adapt when changing color scheme

- **Realtime graphs** (load, bandwidth) adapt to dark/light theme

### 🆕 New Features

- **Info tooltip "?"** in Services Monitor widget with status legend

- **Settings icon** for widgets changed to "sliders" style

- **Version number** displayed in footer

---

## [1.0.0] - 2026-01-04

### Первый стабильный релиз

**Особенности:**

- 🌙 Современная тёмная тема для OpenWrt 23+/24.x

- 📊 Виджет статуса системы с Load Average

- 🌍 Русская локализация

- ⚡ Поддержка ucode (без Lua)

- 📱 Адаптивный дизайн

**Установка:**

```bash

wget -O /tmp/theme.ipk https://github.com/ChesterGoodiny/luci-theme-proton2025/releases/download/v1.0.0/luci-theme-proton2025_1.0.0_all.ipk

opkg install /tmp/theme.ipk

```

---
