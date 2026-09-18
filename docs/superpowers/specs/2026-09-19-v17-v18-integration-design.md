# v1.7 / v1.8 Integration Design

## Goal

Integrate the delivered v1.7 and v1.8 experiment snapshots into the existing official `MA-Playground` Git history, retain the current v1.6 experiment guides and repository configuration, publish both releases to `main`, and leave one formal local project directory.

## Source and merge boundary

- The formal project is the existing Git checkout based on the remote `main` history. Do not replace it with either source snapshot and do not force-push.
- The v1.7 snapshot adds “导数，是局部线性机器” (Derivative as a Linear Map).
- The v1.8 snapshot includes v1.7 and adds “保持约束，读出变化” (Implicit Functions as Constraint Correction).
- Use the v1.8 snapshot as the cumulative source of the two new experiments and their assets/tests/docs, while reconciling shared application files against the official v1.6 checkout. Preserve the existing `src/page-guide.js`, its state persistence/event handling, current guide CSS, and v1.6 documentation/release history.
- Create a v1.7 feature commit followed by a v1.8 feature commit, then push the resulting history without rewriting remote commits.

## Page-guide behavior

Each new experiment has three screens: explore, proof, and challenge. Place the existing shared `pageGuide` card directly below the experiment heading on each screen. The card remains expanded on first visit, retains the existing collapse/restore behavior, and includes:

1. one-sentence core question;
2. three concrete starting actions;
3. what to observe in the visual or proof;
4. a concise learning conclusion;
5. source-grounded common misconceptions;
6. a link to the experiment's detailed guide in `docs`.

Use screen-specific copy and target selectors so “开始第 1 步” points to a useful control/content area for that screen. Do not alter the labs' existing internal journey controls or imply that plotted samples replace proof.

## Validation and release

- Run the project checks and each new lab's Chromium suite against the actual production build where the environment permits; retain the documented offline-harness limitation where browser navigation is blocked.
- Verify the existing experiment navigation, old page guides, new screens, deep links, offline builds, root/subpath resources, and the Pages workflow.
- Push the v1.7 then v1.8 commits to `main`; report GitHub Actions and Pages status based on observed remote results only.
- After the formal checkout is verified and published, remove the two redundant source snapshot directories so only `MA-Playground` remains under the project root. Keep unrelated media untouched.

## Out of scope

- No redesign of either experiment's mathematical content or navigation.
- No force push, remote history replacement, repository setting changes, or unrelated deletion.
- No claim of Safari/Firefox, physical-device, full screen-reader, or browser HTTP-module end-to-end coverage unless actually run.
