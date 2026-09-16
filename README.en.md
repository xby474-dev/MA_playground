# MA Playground · v1.5

**Mathematical intuition, accountable to proof.** Six complete experiments. No backend, account, CDN, external fonts, or runtime API. Main interface and proof pages are Chinese; this README does not imply a translated UI.

[中文](README.md) · [Series guide](docs/SERIES-GUIDE.md) · [Mathematics](docs/SERIES-MATHEMATICS.md) · [Actual verification](docs/VERIFICATION-v1.5.md)

![Actual condition-map screenshot](docs/images/series-map-desktop.png)

## New: convergence-test conditions, not a leaderboard

Follow **condition map → investigate the same series → prove the relationship → check understanding**.

Nine nodes, eight valid implications, eight failed-converse/incomparability investigations. Green arrows express fixed general implications; node status changes with the selected series. A failed sufficient condition is not labeled divergence. Each investigation retains parameters and has examples, counterexamples and a four-step authored proof. Eight explained questions complete the route.

Eight term families: geometric, p-series, telescoping, jagged geometric, oscillatory bounded coefficients, logarithmic boundary, sparse nonnegative, and nonmonotone cancellation. Change p/q, alternating signs, a fixed comparison reference, finite window and playback position. Views include finite ratios/roots, logarithmic comparison quotients, justified integral rectangles and two separate accounts S_N=Σa_n and A_N=Σ|a_n|. Analytic conclusions never read finite samples.

### Scope matters

- Ordinary ratio limit L<1 versus root limsup ρ<1 (including undefined ordinary root limits).
- Standard two-sided limit comparison 0<c<∞, with valid one-sided 0/∞ extensions separately retained.
- Comparisons use the same **fixed** independently known reference, not a hidden existential choice.
- The integral route requires a positive, continuous, eventually nonincreasing interpolation. Jagged terms do not receive a fictitious monotone interpolation.
- Divergence of Σ|a_n| does not by itself imply divergence of Σa_n. Alternating form is not conditional convergence.
- Incomparability has witnesses in both directions and a compatible intersection. All results concern explicit parameter ranges and tails.

See [the independent derivations and cited textbooks](docs/SERIES-MATHEMATICS.md). This is a proved catalogue, not an arbitrary-series solver or a formal proof assistant.

## Run all six labs

Double-click `dist/series-lab.html` in the delivery archive. Every offline entry contains the whole application:

| Entry | Initial experiment |
|---|---|
| `standalone.html` | Multivariable limits |
| `relations-lab.html` | Continuity / partial derivatives / differentiability |
| `field-lab.html` | Green–Gauss–Stokes |
| `completeness-lab.html` | Real completeness and ℝ/ℚ |
| `taylor-lab.html` | Progressive Taylor growth |
| `series-lab.html` | Convergence-test condition graph |

The old two-function view remains at `#lab=differentiability&mode=classic`. No prior mathematical or interaction tests were removed.

For source development (Node.js 22+, no npm runtime/build dependencies):

```bash
npm run dev
npm run verify
npm run preview
```

Serve modular `index.html` over HTTP; use a built inlined HTML for offline files. Source-only Git clones need `npm run build` first. Sharing a local URL does not upload a file.

## Test

```bash
npm test
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
npm run test:ui
npm run test:ui:series
```

Actual v1.5 results: **267 Node checks; 203 Chromium checks** (29+37+27+38+37+35). Browser scripts default to the production HTTP build. Managed policy blocked URL navigation in this environment; explicit `--offline-harness` injected the real fully built offline HTML. No browser policies were changed or bypassed. HTTP resources/subpaths were independently exercised through a real Node server.
The new completeness, Taylor and series pages include stage-aware “Start here” guide cards. This is not browser HTTP-module-loading E2E, OS file-policy validation, public deployment, Safari/Firefox coverage, or a complete screen-reader audit. Numerical tests are not proofs. See [verification](docs/VERIFICATION-v1.5.md).

The usual explicit animation takes about 1.2 seconds per order. Reduced-motion preference uses completed-step playback instead. Navigation, hidden-page events and reset clean up animation and local handlers. Mobile layouts retain controls and textual alternatives.

Not claimed: browser HTTP-module-loading E2E, operating-system file policy validation, public deployment, Safari/Firefox coverage, or a full screen-reader audit. Numerical tests are not proofs. Detailed limits and actual reports: [verification](docs/VERIFICATION-v1.5.md).

## Engineering / delivery

The new `series-math`, `series-state`, `series-content`, `series-plots` and `series-lab` preserve the existing separation of analytic models, whitelist state, authored explanations, SVG and lifecycle-managed interaction. User-started animation stops on navigation/hidden pages; mobile layouts reflow the map and support keyboard controls.
The no-dependency bundler inlines the same modules, not a separate demo. `npm run build` emits static dist for both root and repository subpaths. The existing Pages workflow runs all six UI suites. Patch, full local-history bundle and reports are in `delivery/`. Read the real remote before merging; do not force-overwrite its history. See [status](docs/STATUS.md).

MIT. No tracking, arbitrary-expression evaluator, distributed system fonts or embedded credentials. New material needs explicit hypotheses, proof/counterexample, pedagogical purpose and tests.
